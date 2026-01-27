import { prisma } from './index';
import * as leadService from './services/leadService';
import * as executionGateService from './services/executionGateService';

const run = async () => {
    console.log('--- START VERIFICATION ---');

    // 1. Clean DB
    console.log('Cleaning DB...');
    await prisma.auditLog.deleteMany();
    await prisma.lead.deleteMany();
    await prisma.routingRule.deleteMany();
    await prisma.mailbox.deleteMany();
    await prisma.domain.deleteMany();
    await prisma.campaign.deleteMany();

    // 2. Setup Infrastructure (Campaign, Domain, Mailbox)
    console.log('Setting up Infra...');

    const campaign = await prisma.campaign.create({
        data: {
            id: 'camp_1',
            name: 'CEO Outreach',
            status: 'active',
            channel: 'email',
        },
    });

    const domain = await prisma.domain.create({
        data: {
            domain: 'sender.com',
            status: 'healthy',
        },
    });

    await prisma.mailbox.create({
        data: {
            id: 'mb_1',
            email: 'alex@sender.com',
            domain_id: domain.id,
            status: 'active',
        },
    });

    // 3. Create Routing Rule
    console.log('Creating Routing Rule...');
    await prisma.routingRule.create({
        data: {
            persona: 'CEO',
            min_score: 80,
            target_campaign_id: 'camp_1',
            priority: 10,
        },
    });

    // 4. Ingest Lead (Should be Routed)
    console.log('Ingesting Lead...');
    const lead1 = await leadService.createLead({
        email: 'elon@tesla.com',
        persona: 'CEO',
        lead_score: 95,
    });

    console.log('Lead 1 created:', lead1);
    if (lead1.assigned_campaign_id === 'camp_1') {
        console.log('SUCCESS: Lead 1 routed to camp_1');
    } else {
        console.error('FAILURE: Lead 1 NOT routed to camp_1');
    }

    // 5. Ingest Non-Matching Lead
    console.log('Ingesting Non-Matching Lead...');
    const lead2 = await leadService.createLead({
        email: 'intern@tesla.com',
        persona: 'Intern',
        lead_score: 50,
    });

    console.log('Lead 2 created:', lead2);
    if (lead2.assigned_campaign_id === null) {
        console.log('SUCCESS: Lead 2 not routed');
    } else {
        console.error('FAILURE: Lead 2 incorrectly routed');
    }

    // 6. Test Gate Execution
    console.log('Testing Gate...');
    const canExec = await executionGateService.canExecuteLead('camp_1', lead1.id);
    if (canExec) {
        console.log('SUCCESS: Gate passed for valid campaign & healthy mailbox');
    } else {
        console.error('FAILURE: Gate failed unexpectedly');
    }

    // 7. Test Gate Block (Pause Domain)
    console.log('Pausing Domain and Testing Gate...');
    await prisma.domain.update({
        where: { id: domain.id },
        data: { status: 'paused' },
    });

    const canExec2 = await executionGateService.canExecuteLead('camp_1', lead1.id);
    if (!canExec2) {
        console.log('SUCCESS: Gate blocked for paused domain');
    } else {
        console.error('FAILURE: Gate passed despite paused domain');
    }

    console.log('--- END VERIFICATION ---');
};

run().then(() => prisma.$disconnect());
