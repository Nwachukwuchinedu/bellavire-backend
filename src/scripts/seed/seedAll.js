import { seedUsers } from './seedUsers.js';
import { seedTenants } from './seedTenants.js';
import { seedProperties } from './seedProperties.js';
import { seedPayments } from './seedPayments.js';
import { seedLeases } from './seedLeases.js';
import { connectDB, disconnectDB } from './dbConnection.js';

// Main seeding function
const seedAll = async () => {
    try {
        console.log('🚀 Starting complete database seeding...\n');

        // Step 1: Seed Users
        console.log('📝 Step 1: Seeding Users...');
        const users = await seedUsers();
        console.log(`✅ Created ${users.length} users\n`);

        // Step 2: Seed Tenants
        console.log('🏠 Step 2: Seeding Tenants...');
        const tenants = await seedTenants();
        console.log(`✅ Created ${tenants.length} tenants\n`);

        // Step 3: Seed Properties
        console.log('🏢 Step 3: Seeding Properties...');
        const properties = await seedProperties();
        console.log(`✅ Created ${properties.length} properties\n`);

        // Step 4: Seed Payments
        console.log('💳 Step 4: Seeding Payments...');
        const payments = await seedPayments();
        console.log(`✅ Created ${payments.length} payments\n`);

        // Step 5: Seed Leases
        console.log('📄 Step 5: Seeding Leases...');
        const leases = await seedLeases();
        console.log(`✅ Created ${leases.length} leases\n`);

        console.log('🎉 All seeding completed successfully!');
        console.log('\n📊 Final Summary:');
        console.log(`   Users: ${users.length}`);
        console.log(`   Tenants: ${tenants.length}`);
        console.log(`   Properties: ${properties.length}`);
        console.log(`   Payments: ${payments.length}`);
        console.log(`   Leases: ${leases.length}`);

        // Display sample login credentials
        console.log('\n🔑 Sample Login Credentials:');
        users.slice(0, 3).forEach((user, index) => {
            console.log(`   ${index + 1}. Email: ${user.email} | Password: password123`);
        });

        console.log('\n✨ Your database is now populated with realistic test data!');

    } catch (error) {
        console.error('❌ Seeding failed:', error);
        throw error;
    }
};

// Main execution
const main = async () => {
    try {
        await connectDB();
        await seedAll();
        await disconnectDB();
        console.log('\n🎉 All seeding completed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Seeding failed:', error);
        await disconnectDB();
        process.exit(1);
    }
};

main().then(() => {
    console.log('Seeding completed successfully');
}).catch((error) => {
    console.error('Seeding failed:', error);
});

export { seedAll };
