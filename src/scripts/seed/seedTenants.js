import { faker } from '@faker-js/faker';
import User from '../../models/User.js';
import Tenant from '../../models/Tenant.js';
import { connectDB } from './dbConnection.js';

// Generate fake tenant data
const generateTenantData = (user) => {
    const employmentStatuses = ['full_time', 'part_time', 'self_employed', 'student', 'employed', 'unemployed'];
    const maritalStatuses = ['single', 'married', 'divorced', 'widowed', 'separated'];
    const preferredLanguages = ['english', 'french', 'german'];
    const religions = ['Christianity', 'Islam', 'Hinduism', 'Buddhism', 'Judaism', 'Atheism', 'Other'];

    return {
        user: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phoneNumber: user.phoneNumber,
        profileImage: user.profileImage,
        dateOfBirth: user.dateOfBirth,
        gender: user.gender,
        country: faker.location.country(),
        city: faker.location.city(),
        religion: faker.helpers.arrayElement(religions),
        maritalStatus: faker.helpers.arrayElement(maritalStatuses),
        numberOfChildren: faker.number.int({ min: 0, max: 4 }),
        employmentInfo: {
            employerName: faker.company.name(),
            monthlyIncome: faker.number.int({ min: 50000, max: 500000 }),
            employmentStatus: faker.helpers.arrayElement(employmentStatuses)
        },
        submittedDocuments: {
            validId: faker.internet.url(),
            utilityBill: faker.internet.url(),
            bankStatement: faker.internet.url()
        },
        address: faker.location.streetAddress({ useFullAddress: true }),
        preferredLanguage: faker.helpers.arrayElement(preferredLanguages),
        savedProperties: [],
        socialLinks: {
            google: {
                accountId: faker.internet.email(),
                connected: faker.datatype.boolean(),
                profileInfo: {
                    name: `${user.firstName} ${user.lastName}`,
                    email: user.email,
                    picture: user.profileImage
                },
                lastSync: faker.date.recent({ days: 30 }),
                accessToken: faker.string.alphanumeric(50),
                refreshToken: faker.string.alphanumeric(50)
            },
            microsoft: {
                accountId: faker.internet.email(),
                connected: faker.datatype.boolean(),
                profileInfo: {
                    name: `${user.firstName} ${user.lastName}`,
                    email: user.email,
                    picture: user.profileImage
                },
                lastSync: faker.date.recent({ days: 30 }),
                accessToken: faker.string.alphanumeric(50),
                refreshToken: faker.string.alphanumeric(50)
            },
            linkedin: {
                accountId: faker.internet.userName(),
                connected: faker.datatype.boolean(),
                profileInfo: {
                    name: `${user.firstName} ${user.lastName}`,
                    headline: faker.person.jobTitle(),
                    picture: user.profileImage,
                    company: faker.company.name()
                },
                lastSync: faker.date.recent({ days: 30 }),
                accessToken: faker.string.alphanumeric(50),
                refreshToken: faker.string.alphanumeric(50)
            },
            instagram: {
                accountId: faker.internet.userName(),
                connected: faker.datatype.boolean(),
                profileInfo: {
                    username: faker.internet.userName(),
                    fullName: `${user.firstName} ${user.lastName}`,
                    picture: user.profileImage,
                    bio: faker.lorem.sentence()
                },
                lastSync: faker.date.recent({ days: 30 }),
                accessToken: faker.string.alphanumeric(50),
                refreshToken: faker.string.alphanumeric(50)
            }
        },
        notifications: {
            rentDueReminder: {
                sms: faker.datatype.boolean(),
                email: faker.datatype.boolean()
            },
            maintenanceUpdates: {
                sms: faker.datatype.boolean(),
                email: faker.datatype.boolean()
            },
            leaseRenewalNotices: {
                sms: faker.datatype.boolean(),
                email: faker.datatype.boolean()
            },
            chatMessages: {
                sms: faker.datatype.boolean(),
                email: faker.datatype.boolean()
            }
        }
    };
};

// Seed tenants
const seedTenants = async () => {
    try {
        console.log('Starting tenant seeding...');

        // Get existing users with role 'tenant'
        const users = await User.find({ role: 'tenant' });

        if (users.length === 0) {
            console.log('No users found. Please run user seeding first.');
            return [];
        }

        console.log(`Found ${users.length} users to create tenants for`);

        // Clear existing tenants
        await Tenant.deleteMany({});
        console.log('Cleared existing tenants');

        const tenants = [];

        // Generate tenant data for each user
        for (const user of users) {
            const tenantData = generateTenantData(user);
            tenants.push(tenantData);
        }

        // Insert tenants
        const createdTenants = await Tenant.insertMany(tenants);
        console.log(`✅ Successfully seeded ${createdTenants.length} tenants`);

        // Display created tenants
        createdTenants.forEach((tenant, index) => {
            console.log(`${index + 1}. ${tenant.firstName} ${tenant.lastName} - ${tenant.email}`);
            console.log(`   Employment: ${tenant.employmentInfo.employmentStatus} at ${tenant.employmentInfo.employerName}`);
            console.log(`   Location: ${tenant.city}, ${tenant.country}`);
        });

        return createdTenants;

    } catch (error) {
        console.error('Error seeding tenants:', error);
        throw error;
    }
};

// Main execution
const main = async () => {
    try {
        await connectDB();
        const tenants = await seedTenants();
        console.log('\n🎉 Tenant seeding completed successfully!');
        console.log(`Created ${tenants.length} tenants`);
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

export { seedTenants };
