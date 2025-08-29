import { faker } from '@faker-js/faker';
import TenantApplication from '../../models/TenantApplication.js';
import User from '../../models/User.js';
import Property from '../../models/Property.js';
import Landlord from '../../models/Landlord.js';
import { connectDB } from './dbConnection.js';

// Generate fake tenant application data
const generateTenantApplicationData = (user, property, landlord) => {
    const employmentStatuses = ['full_time', 'part_time', 'self_employed', 'student', 'employed', 'unemployed'];
    const creditScoreRanges = ['excellent', 'good', 'fair', 'poor'];
    
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    const email = faker.internet.email({ firstName, lastName });
    
    const monthlyIncome = faker.number.int({ min: 50000, max: 500000 });
    const creditScore = faker.number.int({ min: 300, max: 850 });
    
    // Determine credit score range based on score
    let creditScoreRange = 'fair';
    if (creditScore >= 750) creditScoreRange = 'excellent';
    else if (creditScore >= 700) creditScoreRange = 'good';
    else if (creditScore >= 650) creditScoreRange = 'fair';
    else creditScoreRange = 'poor';

    return {
        tenant: user._id,
        property: property._id,
        landlord: landlord._id,
        status: faker.helpers.arrayElement(['pending', 'approved', 'cancelled']),
        applicantInfo: {
            firstName,
            lastName,
            email,
            phoneNumber: `+234${faker.string.numeric(10)}`,
            address: faker.location.streetAddress({ useFullAddress: true }),
            country: faker.location.country(),
            city: faker.location.city(),
            profilePicture: faker.image.avatar(),
            desiredMoveInDate: faker.date.future({ years: 1 })
        },
        employerInfo: {
            employerName: faker.company.name(),
            occupation: faker.person.jobTitle(),
            monthlyIncome,
            employmentDuration: `${faker.number.int({ min: 1, max: 10 })} years`,
            employmentStatus: faker.helpers.arrayElement(employmentStatuses)
        },
        backgroundCheck: {
            criminalRecords: faker.datatype.boolean({ probability: 0.1 }),
            evictionHistory: faker.datatype.boolean({ probability: 0.05 }),
            creditScore,
            creditScoreRange
        },
        submittedDocuments: {
            validId: faker.internet.url(),
            utilityBill: faker.internet.url(),
            bankStatement: faker.internet.url()
        }
    };
};

// Seed tenant applications
const seedTenantApplications = async () => {
    try {
        console.log('Starting tenant application seeding...');

        // Get existing users, properties, and landlords
        const users = await User.find({ role: 'tenant' });
        const properties = await Property.find({});
        const landlords = await Landlord.find({});

        if (users.length === 0 || properties.length === 0 || landlords.length === 0) {
            console.log('No users, properties, or landlords found. Please run their seeding first.');
            return [];
        }

        console.log(`Found ${users.length} users, ${properties.length} properties, and ${landlords.length} landlords`);

        // Clear existing tenant applications
        await TenantApplication.deleteMany({});
        console.log('Cleared existing tenant applications');

        const applications = [];

        // Generate applications
        for (const user of users) {
            const applicationCount = faker.number.int({ min: 0, max: 2 });
            
            for (let i = 0; i < applicationCount; i++) {
                const property = faker.helpers.arrayElement(properties);
                const landlord = faker.helpers.arrayElement(landlords);
                
                const applicationData = generateTenantApplicationData(user, property, landlord);
                applications.push(applicationData);
            }
        }

        // Insert applications
        const createdApplications = await TenantApplication.insertMany(applications);
        console.log(`✅ Successfully seeded ${createdApplications.length} tenant applications`);

        // Display statistics
        const statusCounts = {};
        createdApplications.forEach(app => {
            statusCounts[app.status] = (statusCounts[app.status] || 0) + 1;
        });

        console.log('\n📊 Application Status Distribution:');
        Object.entries(statusCounts).forEach(([status, count]) => {
            console.log(`   ${status}: ${count} applications`);
        });

        return createdApplications;

    } catch (error) {
        console.error('Error seeding tenant applications:', error);
        throw error;
    }
};

// Main execution
const main = async () => {
    try {
        await connectDB();
        const applications = await seedTenantApplications();
        console.log('\n🎉 Tenant application seeding completed successfully!');
        console.log(`Created ${applications.length} applications`);
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

export { seedTenantApplications };
