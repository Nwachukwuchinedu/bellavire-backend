import { faker } from '@faker-js/faker';
import Maintenance from '../../models/Maintenance.js';
import Tenant from '../../models/Tenant.js';
import Landlord from '../../models/Landlord.js';
import Property from '../../models/Property.js';
import { connectDB } from './dbConnection.js';

// Generate fake maintenance data
const generateMaintenanceData = (tenant, landlord, property) => {
    const categories = [
        'plumbing', 'electrical', 'hvac', 'appliance', 'structural', 
        'pest_control', 'cleaning', 'security', 'internet', 'furniture'
    ];
    
    const issues = {
        plumbing: ['Leaking faucet', 'Clogged drain', 'Running toilet', 'Low water pressure', 'Hot water not working'],
        electrical: ['Power outage', 'Faulty outlet', 'Light not working', 'Circuit breaker tripping', 'Electrical shock'],
        hvac: ['AC not cooling', 'Heater not working', 'Strange noises', 'Poor air flow', 'Thermostat issues'],
        appliance: ['Refrigerator not cooling', 'Washing machine broken', 'Dishwasher not working', 'Oven not heating'],
        structural: ['Cracked wall', 'Leaking roof', 'Broken window', 'Door not closing', 'Floor damage'],
        pest_control: ['Ants infestation', 'Cockroaches', 'Mice', 'Bed bugs', 'Termites'],
        cleaning: ['Deep cleaning needed', 'Carpet cleaning', 'Window cleaning', 'Kitchen deep clean'],
        security: ['Lock broken', 'Security system down', 'Intercom not working', 'Key card issues'],
        internet: ['WiFi not working', 'Slow internet', 'Connection drops', 'Router issues'],
        furniture: ['Broken chair', 'Damaged table', 'Bed frame broken', 'Cabinet door loose']
    };

    const statuses = ['pending', 'in progress', 'resolved'];
    const category = faker.helpers.arrayElement(categories);
    const issue = faker.helpers.arrayElement(issues[category]);

    return {
        issue,
        category,
        description: faker.lorem.paragraph({ min: 2, max: 4 }),
        status: faker.helpers.arrayElement(statuses),
        images: Array.from({ length: faker.number.int({ min: 0, max: 3 }) }, () => 
            faker.image.urlLoremFlickr({ category: 'house' })
        ),
        tenant: tenant._id,
        landlord: landlord._id,
        property: property._id
    };
};

// Seed maintenance requests
const seedMaintenance = async () => {
    try {
        console.log('Starting maintenance seeding...');

        // Get existing tenants, landlords, and properties
        const tenants = await Tenant.find({});
        const landlords = await Landlord.find({});
        const properties = await Property.find({});

        if (tenants.length === 0 || landlords.length === 0 || properties.length === 0) {
            console.log('No tenants, landlords, or properties found. Please run their seeding first.');
            return [];
        }

        console.log(`Found ${tenants.length} tenants, ${landlords.length} landlords, and ${properties.length} properties`);

        // Clear existing maintenance requests
        await Maintenance.deleteMany({});
        console.log('Cleared existing maintenance requests');

        const maintenanceRequests = [];

        // Generate maintenance requests
        // Each tenant can have 0-3 maintenance requests
        for (const tenant of tenants) {
            const requestCount = faker.number.int({ min: 0, max: 3 });
            
            for (let i = 0; i < requestCount; i++) {
                // Randomly select landlord and property
                const landlord = faker.helpers.arrayElement(landlords);
                const property = faker.helpers.arrayElement(properties);
                
                const maintenanceData = generateMaintenanceData(tenant, landlord, property);
                maintenanceRequests.push(maintenanceData);
            }
        }

        // Insert maintenance requests
        const createdMaintenance = await Maintenance.insertMany(maintenanceRequests);
        console.log(`✅ Successfully seeded ${createdMaintenance.length} maintenance requests`);

        // Display maintenance statistics
        const statusCounts = {};
        const categoryCounts = {};
        
        createdMaintenance.forEach(maintenance => {
            statusCounts[maintenance.status] = (statusCounts[maintenance.status] || 0) + 1;
            categoryCounts[maintenance.category] = (categoryCounts[maintenance.category] || 0) + 1;
        });

        console.log('\n📊 Maintenance Status Distribution:');
        Object.entries(statusCounts).forEach(([status, count]) => {
            console.log(`   ${status}: ${count} requests`);
        });

        console.log('\n📊 Maintenance Category Distribution:');
        Object.entries(categoryCounts).forEach(([category, count]) => {
            console.log(`   ${category}: ${count} requests`);
        });

        // Display sample maintenance requests
        console.log('\n🔧 Sample Maintenance Requests:');
        createdMaintenance.slice(0, 5).forEach((maintenance, index) => {
            console.log(`${index + 1}. ${maintenance.issue} (${maintenance.category}) - ${maintenance.status}`);
        });

        return createdMaintenance;

    } catch (error) {
        console.error('Error seeding maintenance:', error);
        throw error;
    }
};

// Main execution
const main = async () => {
    try {
        await connectDB();
        const maintenance = await seedMaintenance();
        console.log('\n🎉 Maintenance seeding completed successfully!');
        console.log(`Created ${maintenance.length} maintenance requests`);
        process.exit(0);
    } catch (error) {
        console.error('❌ Seeding failed:', error);
        process.exit(1);
    }
};

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
    main();
}

export { seedMaintenance };
