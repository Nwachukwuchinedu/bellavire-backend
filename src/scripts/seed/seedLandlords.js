import { faker } from '@faker-js/faker';
import User from '../../models/User.js';
import Landlord from '../../models/Landlord.js';
import { connectDB } from './dbConnection.js';

// Generate fake landlord data
const generateLandlordData = (user) => {
    const notifyOptions = ['instantly', '2min', '5min', '10min', 'never'];
    const leaseNotifyOptions = ['60days_before', '30days_before', 'day_of_expiration', 'never'];

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
        address: faker.location.streetAddress({ useFullAddress: true }),
        description: faker.lorem.paragraph(),
        governmentIssuedId: faker.string.alphanumeric(10).toUpperCase(),
        notificationSettings: {
            security: {
                feed: faker.datatype.boolean(),
                email: faker.datatype.boolean()
            },
            newLease: {
                feed: faker.datatype.boolean(),
                email: faker.datatype.boolean(),
                notify: faker.helpers.arrayElement(notifyOptions)
            },
            rentalApplication: {
                feed: faker.datatype.boolean(),
                email: faker.datatype.boolean(),
                notify: faker.helpers.arrayElement(notifyOptions)
            },
            onlinePaymentMade: {
                feed: faker.datatype.boolean(),
                email: faker.datatype.boolean()
            },
            onlinePaymentInitiate: {
                feed: faker.datatype.boolean(),
                email: faker.datatype.boolean()
            },
            onlinePaymentFailed: {
                feed: faker.datatype.boolean(),
                email: faker.datatype.boolean()
            },
            onlinePaymentSuccessful: {
                feed: faker.datatype.boolean(),
                email: faker.datatype.boolean()
            },
            taskAssigned: {
                feed: faker.datatype.boolean(),
                email: faker.datatype.boolean()
            },
            connectionUpdate: {
                feed: faker.datatype.boolean(),
                email: faker.datatype.boolean()
            },
            listingsInquiries: {
                feed: faker.datatype.boolean(),
                email: faker.datatype.boolean()
            },
            newMessages: {
                feed: faker.datatype.boolean(),
                email: faker.datatype.boolean()
            },
            screeningReportSend: {
                feed: faker.datatype.boolean(),
                email: faker.datatype.boolean()
            },
            screeningReportUpdate: {
                feed: faker.datatype.boolean(),
                email: faker.datatype.boolean()
            },
            screeningReportCancelled: {
                feed: faker.datatype.boolean(),
                email: faker.datatype.boolean()
            },
            screeningReportReady: {
                feed: faker.datatype.boolean(),
                email: faker.datatype.boolean()
            },
            invoicePosted: {
                feed: faker.datatype.boolean(),
                email: faker.datatype.boolean()
            },
            invoiceOverdue: {
                feed: faker.datatype.boolean(),
                email: faker.datatype.boolean(),
                notify: faker.helpers.arrayElement(notifyOptions)
            },
            invoiceDue: {
                feed: faker.datatype.boolean(),
                email: faker.datatype.boolean()
            },
            lease: {
                feed: faker.datatype.boolean(),
                email: faker.datatype.boolean(),
                notify: faker.helpers.arrayElement(leaseNotifyOptions)
            },
            maintenanceNewRequest: {
                feed: faker.datatype.boolean(),
                email: faker.datatype.boolean()
            },
            maintenanceChange: {
                feed: faker.datatype.boolean(),
                email: faker.datatype.boolean()
            },
            maintenanceMessage: {
                feed: faker.datatype.boolean(),
                email: faker.datatype.boolean()
            },
            maintenanceResolve: {
                feed: faker.datatype.boolean(),
                email: faker.datatype.boolean()
            },
            textMessage: {
                feed: faker.datatype.boolean(),
                email: faker.datatype.boolean()
            }
        },
        leaseTemplate: faker.datatype.boolean() ? `templates/lease_template_${faker.string.alphanumeric(8)}.pdf` : null
    };
};

// Main seeding function
export const seedLandlords = async () => {
    try {
        console.log('🌱 Starting landlord seeding...');

        // Connect to database
        await connectDB();

        // Clear existing landlords
        await Landlord.deleteMany({});
        console.log('✅ Cleared existing landlords');

        // Get users with landlord role
        const landlordUsers = await User.find({ role: 'landlord' }).limit(10);
        console.log(`📊 Found ${landlordUsers.length} landlord users`);

        if (landlordUsers.length === 0) {
            console.log('⚠️ No landlord users found. Creating landlord users first...');

            // Create landlord users if none exist
            const landlordUserData = [];
            for (let i = 0; i < 10; i++) {
                const userData = {
                    firstName: faker.person.firstName(),
                    lastName: faker.person.lastName(),
                    email: faker.internet.email(),
                    phoneNumber: faker.phone.number(),
                    password: 'Password123!',
                    role: 'landlord',
                    isEmailVerified: true,
                    isActive: true,
                    profileImage: faker.image.avatar(),
                    dateOfBirth: faker.date.between({ from: '1960-01-01', to: '1990-12-31' }),
                    gender: faker.helpers.arrayElement(['male', 'female', 'other', 'prefer_not_to_say'])
                };
                landlordUserData.push(userData);
            }

            const createdUsers = await User.insertMany(landlordUserData);
            console.log(`✅ Created ${createdUsers.length} landlord users`);

            // Use the created users for landlord seeding
            landlordUsers.push(...createdUsers);
        }

        // Generate landlord data
        const landlordData = landlordUsers.map(user => generateLandlordData(user));

        // Insert landlords
        const createdLandlords = await Landlord.insertMany(landlordData);

        console.log(`✅ Successfully seeded ${createdLandlords.length} landlords`);
        console.log('📋 Landlord seeding completed!');

        return createdLandlords;

    } catch (error) {
        console.error('❌ Error seeding landlords:', error);
        throw error;
    }
};

// Run directly if this file is executed
if (import.meta.url === `file://${process.argv[1]}`) {
    seedLandlords()
        .then(() => {
            console.log('🎉 Landlord seeding completed successfully!');
            process.exit(0);
        })
        .catch((error) => {
            console.error('💥 Landlord seeding failed:', error);
            process.exit(1);
        });
}
