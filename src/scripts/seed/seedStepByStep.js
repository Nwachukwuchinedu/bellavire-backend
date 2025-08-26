import { faker } from '@faker-js/faker';
import { connectDB, disconnectDB } from './dbConnection.js';

// Import all seed functions
import { seedUsers } from './seedUsers.js';
import { seedTenants } from './seedTenants.js';
import { seedLandlords } from './seedLandlords.js';
import { seedProperties } from './seedProperties.js';
import { seedPayments } from './seedPayments.js';
import { seedLeases } from './seedLeases.js';
import { seedRooms } from './seedRooms.js';
import { seedMaintenance } from './seedMaintenance.js';
import { seedTenantApplications } from './seedTenantApplications.js';
import { seedNotifications } from './seedNotifications.js';
import { seedContractors } from './seedContractors.js';
import { seedTours } from './seedTours.js';

const seedSteps = [
    { name: 'Users', function: seedUsers, required: [] },
    { name: 'Tenants', function: seedTenants, required: ['Users'] },
    { name: 'Landlords', function: seedLandlords, required: ['Users'] },
    { name: 'Properties', function: seedProperties, required: ['Tenants', 'Landlords'] },
    { name: 'Payments', function: seedPayments, required: ['Tenants', 'Properties'] },
    { name: 'Leases', function: seedLeases, required: ['Tenants', 'Landlords', 'Properties'] },
    { name: 'Rooms', function: seedRooms, required: ['Properties', 'Leases'] },
    { name: 'Maintenance', function: seedMaintenance, required: ['Tenants', 'Landlords', 'Properties'] },
    { name: 'Tenant Applications', function: seedTenantApplications, required: ['Users', 'Properties', 'Landlords'] },
    { name: 'Notifications', function: seedNotifications, required: ['Landlords'] },
    { name: 'Contractors', function: seedContractors, required: [] },
    { name: 'Tours', function: seedTours, required: ['Tenants', 'Landlords', 'Properties'] }
];

// Helper function to run a single seed step
const runSeedStep = async (step, stepNumber) => {
    try {
        console.log(`\n📝 Step ${stepNumber}: Seeding ${step.name}...`);
        const result = await step.function();
        console.log(`✅ Successfully created ${result.length} ${step.name.toLowerCase()}`);
        return { success: true, result, count: result.length };
    } catch (error) {
        console.error(`❌ Failed to seed ${step.name}:`, error.message);
        return { success: false, error: error.message, count: 0 };
    }
};

// Main function to run all steps
const runAllSteps = async () => {
    const results = {};

    for (let i = 0; i < seedSteps.length; i++) {
        const step = seedSteps[i];
        const stepNumber = i + 1;

        console.log(`\n🔄 Running step ${stepNumber}/${seedSteps.length}: ${step.name}`);

        const result = await runSeedStep(step, stepNumber);
        results[step.name] = result;

        if (!result.success) {
            console.log(`⚠️  Step ${step.name} failed, but continuing with next step...`);
        }

        // Add a small delay between steps to prevent overwhelming the database
        await new Promise(resolve => setTimeout(resolve, 1000));
    }

    return results;
};

// Function to run specific step
const runSpecificStep = async (stepName) => {
    const step = seedSteps.find(s => s.name.toLowerCase() === stepName.toLowerCase());
    if (!step) {
        console.error(`❌ Step "${stepName}" not found. Available steps:`);
        seedSteps.forEach((s, i) => console.log(`   ${i + 1}. ${s.name}`));
        return;
    }

    const stepNumber = seedSteps.findIndex(s => s.name === step.name) + 1;
    const result = await runSeedStep(step, stepNumber);

    if (result.success) {
        console.log(`\n🎉 Step "${step.name}" completed successfully!`);
    } else {
        console.log(`\n❌ Step "${step.name}" failed.`);
    }

    return result;
};

// Main execution
const main = async () => {
    const args = process.argv.slice(2);
    const stepName = args[0];

    try {
        console.log('🔌 Connecting to database...');
        await connectDB();

        if (stepName) {
            console.log(`🎯 Running specific step: ${stepName}`);
            await runSpecificStep(stepName);
        } else {
            console.log('🚀 Running all seeding steps...');
            const results = await runAllSteps();

            console.log('\n📊 Final Summary:');
            Object.entries(results).forEach(([name, result]) => {
                const status = result.success ? '✅' : '❌';
                console.log(`   ${status} ${name}: ${result.count} records`);
            });
        }

        console.log('\n🔌 Disconnecting from database...');
        await disconnectDB();
        console.log('🎉 Seeding process completed!');

    } catch (error) {
        console.error('❌ Seeding failed:', error);
        try {
            await disconnectDB();
        } catch (disconnectError) {
            console.error('Failed to disconnect:', disconnectError.message);
        }
        process.exit(1);
    }
};

// Handle process termination
process.on('SIGINT', async () => {
    console.log('\n⚠️  Received SIGINT, cleaning up...');
    try {
        await disconnectDB();
        console.log('✅ Cleanup completed');
        process.exit(0);
    } catch (error) {
        console.error('❌ Cleanup failed:', error);
        process.exit(1);
    }
});

// Run the script
main().catch((error) => {
    console.error('❌ Main function failed:', error);
    process.exit(1);
});

export { runAllSteps, runSpecificStep };
