import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../index';
import { logger } from '../services/observabilityService';

const JWT_SECRET = process.env.JWT_SECRET || 'drason_secret_key_change_me_in_prod';

export const login = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

        const user = await prisma.user.findUnique({
            where: { email },
            include: { organization: true }
        });

        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const isValid = await bcrypt.compare(password, user.password_hash);
        if (!isValid) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Generate JWT
        const token = jwt.sign(
            {
                userId: user.id,
                email: user.email,
                role: user.role,
                orgId: user.organization_id
            },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        // Update last login
        await prisma.user.update({
            where: { id: user.id },
            data: { last_login_at: new Date() }
        });

        logger.info('User logged in', { userId: user.id, email: user.email });

        res.json({
            token,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
                organization: {
                    id: user.organization.id,
                    name: user.organization.name,
                    slug: user.organization.slug
                }
            }
        });
    } catch (error: any) {
        logger.error('Login error', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const register = async (req: Request, res: Response) => {
    try {
        const { name, email, password, organizationName } = req.body;

        if (!email || !password || !organizationName) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ error: 'Email already registered' });
        }

        // Slugify org name
        const slug = organizationName.toLowerCase().replace(/[^a-z0-9]/g, '-');

        // Check slug uniqueness
        const existingOrg = await prisma.organization.findUnique({ where: { slug } });
        if (existingOrg) {
            return res.status(400).json({ error: 'Organization name/slug already taken' });
        }

        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        // Transaction to create Org + User
        const result = await prisma.$transaction(async (tx) => {
            const org = await tx.organization.create({
                data: {
                    name: organizationName,
                    slug,
                    system_mode: 'observe'
                }
            });

            const user = await tx.user.create({
                data: {
                    email,
                    password_hash: passwordHash,
                    name,
                    role: 'admin', // First user is admin
                    organization_id: org.id
                }
            });

            return { org, user };
        });

        const token = jwt.sign(
            {
                userId: result.user.id,
                email: result.user.email,
                role: result.user.role,
                orgId: result.org.id
            },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        logger.info('User registered', { userId: result.user.id, email: result.user.email });

        res.status(201).json({
            token,
            user: {
                id: result.user.id,
                email: result.user.email,
                name: result.user.name,
                role: result.user.role,
                organization: {
                    id: result.org.id,
                    name: result.org.name,
                    slug: result.org.slug
                }
            }
        });

    } catch (error: any) {
        logger.error('Registration error', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
