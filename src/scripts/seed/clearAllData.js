import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { connectDB, disconnectDB } from './dbConnection.js';

// Import all models
import User from '../../models/User.js';
import Tenant from '../../models/Tenant.js';
import Landlord from '../../models/Landlord.js';
import Property from '../../models/Property.js';
import Payment from '../../models/Payment.js';
import Lease from '../../models/Lease.js';
import Room from '../../models/Room.js';
import Maintenance from '../../models/Maintenance.js';
import TenantApplication from '../../models/TenantApplication.js';
import Notification from '../../models/Notification.js';
import Contractor from '../../models/Contractor.js';
import Tour from '../../models/Tour.js';

dotenv.config();

const models = [
    { name: 'Users', model: User },
    { name: 'Tenants', model: Tenant },
    { name: 'Landlords', model: Landlord },
    { name: 'Properties', model: Property },
    { name: 'Payments', model: Payment },
    { name: 'Leases', model: Lease },
    { name: 'Rooms', model: Room },
    { name: 'Maintenance', model: Maintenance },
    { name: 'Tenant Applications', model: TenantApplication },
    { name: 'Notifications', model: Notification },
    { name: 'Contractors', model: Contractor },
    { name: 'Tours', model: Tour }
];

const clearAllData = async () => {
    try {
        console.log('🗑️  Starting to clear all seeded data...\n');

        for (const { name, model } of models) {
            try {
                const result = await model.deleteMany({});
                console.log(`✅ Cleared ${result.deletedCount} ${name}`);
            } catch (error) {
                console.error(`❌ Failed to clear ${name}:`, error.message);
            }
        }

        console.log('\n🎉 All data cleared successfully!');
        console.log('💡 You can now run the seeding process again: npm run seed');

    } catch (error) {
        console.error('❌ Error clearing data:', error);
        throw error;
    }
};

// Main execution
const main = async () => {
    try {
        console.log('🔌 Connecting to database...');
        await connectDB();

        await clearAllData();

        console.log('\n🔌 Disconnecting from database...');
        await disconnectDB();
        console.log('✅ Process completed successfully!');

    } catch (error) {
        console.error('❌ Process failed:', error);
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

main().catch((error) => {
    console.error('❌ Main function failed:', error);
    process.exit(1);
});

export { clearAllData };
