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
import { connectDB, disconnectDB } from './dbConnection.js';

// Helper function to run seed with error handling
const runSeedWithErrorHandling = async (seedFunction, stepName, stepNumber) => {
    try {
        console.log(`📝 Step ${stepNumber}: ${stepName}...`);
        const result = await seedFunction();
        console.log(`✅ Created ${result.length} ${stepName.toLowerCase()}\n`);
        return result;
    } catch (error) {
        console.error(`❌ Failed to seed ${stepName.toLowerCase()}:`, error.message);
        console.error('Continuing with next step...\n');
        return [];
    }
};

// Main seeding function
const seedAll = async () => {
    try {
        console.log('🚀 Starting complete database seeding...\n');

        const results = {};

        // Step 1: Seed Users
        results.users = await runSeedWithErrorHandling(seedUsers, 'Seeding Users', 1);

        // Step 2: Seed Tenants
        results.tenants = await runSeedWithErrorHandling(seedTenants, 'Seeding Tenants', 2);

        // Step 3: Seed Landlords
        results.landlords = await runSeedWithErrorHandling(seedLandlords, 'Seeding Landlords', 3);

        // Step 4: Seed Properties
        results.properties = await runSeedWithErrorHandling(seedProperties, 'Seeding Properties', 4);

        // Step 5: Seed Payments
        results.payments = await runSeedWithErrorHandling(seedPayments, 'Seeding Payments', 5);

        // Step 6: Seed Leases
        results.leases = await runSeedWithErrorHandling(seedLeases, 'Seeding Leases', 6);

        // Step 7: Seed Rooms
        results.rooms = await runSeedWithErrorHandling(seedRooms, 'Seeding Rooms', 7);

        // Step 8: Seed Maintenance
        results.maintenance = await runSeedWithErrorHandling(seedMaintenance, 'Seeding Maintenance', 8);

        // Step 9: Seed Tenant Applications
        results.applications = await runSeedWithErrorHandling(seedTenantApplications, 'Seeding Tenant Applications', 9);

        // Step 10: Seed Notifications
        results.notifications = await runSeedWithErrorHandling(seedNotifications, 'Seeding Notifications', 10);

        // Step 11: Seed Contractors
        results.contractors = await runSeedWithErrorHandling(seedContractors, 'Seeding Contractors', 11);

        // Step 12: Seed Tours
        results.tours = await runSeedWithErrorHandling(seedTours, 'Seeding Tours', 12);

        console.log('🎉 All seeding completed successfully!');
        console.log('\n📊 Final Summary:');
        console.log(`   Users: ${results.users.length}`);
        console.log(`   Tenants: ${results.tenants.length}`);
        console.log(`   Landlords: ${results.landlords.length}`);
        console.log(`   Properties: ${results.properties.length}`);
        console.log(`   Payments: ${results.payments.length}`);
        console.log(`   Leases: ${results.leases.length}`);
        console.log(`   Rooms: ${results.rooms.length}`);
        console.log(`   Maintenance: ${results.maintenance.length}`);
        console.log(`   Applications: ${results.applications.length}`);
        console.log(`   Notifications: ${results.notifications.length}`);
        console.log(`   Contractors: ${results.contractors.length}`);
        console.log(`   Tours: ${results.tours.length}`);

        // Display sample login credentials if users were created
        if (results.users.length > 0) {
            console.log('\n🔑 Sample Login Credentials:');
            results.users.slice(0, 3).forEach((user, index) => {
                console.log(`   ${index + 1}. Email: ${user.email} | Password: Password123`);
            });
        }

        console.log('\n✨ Your database is now populated with realistic test data!');

    } catch (error) {
        console.error('❌ Seeding failed:', error);
        throw error;
    }
};

// Main execution
const main = async () => {
    try {
        console.log('🔌 Connecting to database...');
        await connectDB();

        console.log('🚀 Starting seeding process...');
        await seedAll();

        console.log('🔌 Disconnecting from database...');
        await disconnectDB();

        console.log('\n🎉 All seeding completed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Seeding failed:', error);
        console.error('Error details:', error.message);
        console.error('Stack trace:', error.stack);

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

process.on('SIGTERM', async () => {
    console.log('\n⚠️  Received SIGTERM, cleaning up...');
    try {
        await disconnectDB();
        console.log('✅ Cleanup completed');
        process.exit(0);
    } catch (error) {
        console.error('❌ Cleanup failed:', error);
        process.exit(1);
    }
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
    console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
    process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
    console.error('❌ Uncaught Exception:', error);
    process.exit(1);
});

main().catch((error) => {
    console.error('❌ Main function failed:', error);
    process.exit(1);
});

export { seedAll };
