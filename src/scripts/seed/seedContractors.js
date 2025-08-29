import { faker } from '@faker-js/faker';
import Contractor from '../../models/Contractor.js';
import { connectDB } from './dbConnection.js';

// Generate fake contractor data
const generateContractorData = () => {
    const specialties = [
        'plumbing', 'electrical', 'hvac', 'carpentry', 'painting',
        'roofing', 'landscaping', 'cleaning', 'security', 'appliance_repair',
        'flooring', 'masonry', 'pest_control', 'pool_maintenance', 'general_contractor'
    ];

    const availabilityStatuses = ['available', 'busy', 'unavailable'];

    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    const email = faker.internet.email({ firstName, lastName });

    return {
        name: `${firstName} ${lastName}`,
        phone: `+234${faker.string.numeric(10)}`,
        email,
        specialty: faker.helpers.arrayElement(specialties),
        availability: faker.helpers.arrayElement(availabilityStatuses)
    };
};

// Seed contractors
const seedContractors = async () => {
    try {
        console.log('Starting contractor seeding...');

        // Clear existing contractors
        await Contractor.deleteMany({});
        console.log('Cleared existing contractors');

        const contractors = [];

        // Generate 15-25 contractors
        const contractorCount = faker.number.int({ min: 15, max: 25 });
        
        for (let i = 0; i < contractorCount; i++) {
            const contractorData = generateContractorData();
            contractors.push(contractorData);
        }

        // Insert contractors
        const createdContractors = await Contractor.insertMany(contractors);
        console.log(`✅ Successfully seeded ${createdContractors.length} contractors`);

        // Display statistics
        const specialtyCounts = {};
        const availabilityCounts = {};
        
        createdContractors.forEach(contractor => {
            specialtyCounts[contractor.specialty] = (specialtyCounts[contractor.specialty] || 0) + 1;
            availabilityCounts[contractor.availability] = (availabilityCounts[contractor.availability] || 0) + 1;
        });

        console.log('\n📊 Contractor Specialty Distribution:');
        Object.entries(specialtyCounts).forEach(([specialty, count]) => {
            console.log(`   ${specialty}: ${count} contractors`);
        });

        console.log('\n📊 Contractor Availability Distribution:');
        Object.entries(availabilityCounts).forEach(([availability, count]) => {
            console.log(`   ${availability}: ${count} contractors`);
        });

        // Display sample contractors
        console.log('\n👷 Sample Contractors:');
        createdContractors.slice(0, 5).forEach((contractor, index) => {
            console.log(`${index + 1}. ${contractor.name} - ${contractor.specialty} (${contractor.availability})`);
            console.log(`   Email: ${contractor.email} | Phone: ${contractor.phone}`);
        });

        return createdContractors;

    } catch (error) {
        console.error('Error seeding contractors:', error);
        throw error;
    }
};

// Main execution
const main = async () => {
    try {
        await connectDB();
        const contractors = await seedContractors();
        console.log('\n🎉 Contractor seeding completed successfully!');
        console.log(`Created ${contractors.length} contractors`);
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

export { seedContractors };
