import { Request, Response } from 'express';
import { prisma } from '../index';

export const getSettings = async (req: Request, res: Response) => {
    const settings = await prisma.systemSetting.findMany();
    // Convert to object for easier consumption
    const config: Record<string, string> = {};
    settings.forEach(s => config[s.key] = s.value);

    // Mask secrets if needed (for MVP return as is so user sees what they pasted)
    res.json(config);
};

export const updateSettings = async (req: Request, res: Response) => {
    const payload = req.body; // Expect { SMARTLEAD_API_KEY: "xyz" }

    const updates = Object.entries(payload).map(([key, value]) => {
        return prisma.systemSetting.upsert({
            where: { key },
            update: { value: String(value) },
            create: { key, value: String(value) }
        });
    });

    await prisma.$transaction(updates);
    res.json({ success: true });
};
