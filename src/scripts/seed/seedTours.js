import { faker } from '@faker-js/faker';
import Tour from '../../models/Tour.js';
import Landlord from '../../models/Landlord.js';
import Tenant from '../../models/Tenant.js';
import Property from '../../models/Property.js';
import { connectDB } from './dbConnection.js';

// Generate fake tour data
const generateTourData = (landlord, tenant, property) => {
    const timeSlots = ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'];
    const statuses = ['pending', 'confirmed', 'declined', 'cancelled', 'completed'];
    const tourTypes = ['in-person', 'virtual'];
    
    // Generate a date within the next 30 days
    const tourDate = faker.date.future({ years: 0.1 }); // Within next ~36 days
    const timeSlot = faker.helpers.arrayElement(timeSlots);
    
    // Determine status based on date (past tours are more likely to be completed)
    let status = 'pending';
    const now = new Date();
    if (tourDate < now) {
        status = faker.helpers.arrayElement(['completed', 'cancelled', 'declined']);
    } else {
        status = faker.helpers.arrayElement(['pending', 'confirmed', 'declined']);
    }

    return {
        landlord: landlord._id,
        tenant: tenant._id,
        property: property._id,
        date: tourDate,
        timeSlot,
        duration: faker.number.int({ min: 15, max: 60 }),
        status,
        tourType: faker.helpers.arrayElement(tourTypes),
        notes: faker.datatype.boolean({ probability: 0.7 }) ? faker.lorem.sentence() : '',
        landlordNotes: faker.datatype.boolean({ probability: 0.3 }) ? faker.lorem.sentence() : '',
        rescheduled: faker.datatype.boolean({ probability: 0.2 }),
        originalDate: faker.datatype.boolean({ probability: 0.2 }) ? faker.date.past() : null,
        notificationSent: faker.datatype.boolean({ probability: 0.8 })
    };
};

// Seed tours
const seedTours = async () => {
    try {
        console.log('Starting tour seeding...');

        // Get existing landlords, tenants, and properties
        const landlords = await Landlord.find({});
        const tenants = await Tenant.find({});
        const properties = await Property.find({});

        if (landlords.length === 0 || tenants.length === 0 || properties.length === 0) {
            console.log('No landlords, tenants, or properties found. Please run their seeding first.');
            return [];
        }

        console.log(`Found ${landlords.length} landlords, ${tenants.length} tenants, and ${properties.length} properties`);

        // Clear existing tours
        await Tour.deleteMany({});
        console.log('Cleared existing tours');

        const tours = [];

        // Generate tours
        // Each tenant can have 0-3 tour requests
        for (const tenant of tenants) {
            const tourCount = faker.number.int({ min: 0, max: 3 });
            
            for (let i = 0; i < tourCount; i++) {
                // Randomly select landlord and property
                const landlord = faker.helpers.arrayElement(landlords);
                const property = faker.helpers.arrayElement(properties);
                
                const tourData = generateTourData(landlord, tenant, property);
                tours.push(tourData);
            }
        }

        // Insert tours
        const createdTours = await Tour.insertMany(tours);
        console.log(`✅ Successfully seeded ${createdTours.length} tours`);

        // Display statistics
        const statusCounts = {};
        const tourTypeCounts = {};
        const timeSlotCounts = {};
        
        createdTours.forEach(tour => {
            statusCounts[tour.status] = (statusCounts[tour.status] || 0) + 1;
            tourTypeCounts[tour.tourType] = (tourTypeCounts[tour.tourType] || 0) + 1;
            timeSlotCounts[tour.timeSlot] = (timeSlotCounts[tour.timeSlot] || 0) + 1;
        });

        console.log('\n📊 Tour Status Distribution:');
        Object.entries(statusCounts).forEach(([status, count]) => {
            console.log(`   ${status}: ${count} tours`);
        });

        console.log('\n📊 Tour Type Distribution:');
        Object.entries(tourTypeCounts).forEach(([type, count]) => {
            console.log(`   ${type}: ${count} tours`);
        });

        console.log('\n📊 Popular Time Slots:');
        Object.entries(timeSlotCounts)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 5)
            .forEach(([timeSlot, count]) => {
                console.log(`   ${timeSlot}: ${count} tours`);
            });

        // Display sample tours
        console.log('\n🏠 Sample Tours:');
        createdTours.slice(0, 5).forEach((tour, index) => {
            const tourDate = new Date(tour.date).toLocaleDateString();
            console.log(`${index + 1}. ${tourDate} at ${tour.timeSlot} - ${tour.status} (${tour.tourType})`);
        });

        return createdTours;

    } catch (error) {
        console.error('Error seeding tours:', error);
        throw error;
    }
};

// Main execution
const main = async () => {
    try {
        await connectDB();
        const tours = await seedTours();
        console.log('\n🎉 Tour seeding completed successfully!');
        console.log(`Created ${tours.length} tours`);
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

export { seedTours };
