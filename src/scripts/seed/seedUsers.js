import { faker } from '@faker-js/faker';
import User from '../../models/User.js';
import { connectDB } from './dbConnection.js';

// Generate fake user data
const generateUserData = (role = 'tenant') => {
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    const email = faker.internet.email({ firstName, lastName });

    return {
        firstName,
        lastName,
        email,
        phoneNumber: `+234${faker.string.numeric(10)}`,
        password: 'Password123', // Will be hashed by the model
        authProvider: 'local',
        role: role,
        isEmailVerified: true,
        isActive: true,
        lastLogin: faker.date.recent({ days: 30 }),

        profileImage: faker.image.avatar(),
        dateOfBirth: faker.date.birthdate({ min: 18, max: 65, mode: 'age' }),
        gender: faker.helpers.arrayElement(['male', 'female', 'other', 'prefer_not_to_say'])
    };
};

// Seed users
const seedUsers = async () => {
    try {
        console.log('Starting user seeding...');

        // Clear existing users
        await User.deleteMany({ role: { $in: ['tenant', 'landlord'] } });
        console.log('Cleared existing tenant and landlord users');

        const users = [];

        // Generate 10 tenant users
        for (let i = 0; i < 10; i++) {
            const userData = generateUserData('tenant');
            users.push(userData);
        }

        // Generate 10 landlord users
        for (let i = 0; i < 10; i++) {
            const userData = generateUserData('landlord');
            users.push(userData);
        }

        // Insert users (using save() to trigger password hashing)
        const createdUsers = [];
        for (const userData of users) {
            const user = new User(userData);
            const savedUser = await user.save();
            createdUsers.push(savedUser);
        }
        console.log(`✅ Successfully seeded ${createdUsers.length} users`);

        // Display created users
        const tenants = createdUsers.filter(user => user.role === 'tenant');
        const landlords = createdUsers.filter(user => user.role === 'landlord');

        console.log(`\n📋 Tenants (${tenants.length}):`);
        tenants.forEach((user, index) => {
            console.log(`${index + 1}. ${user.firstName} ${user.lastName} - ${user.email}`);
        });

        console.log(`\n📋 Landlords (${landlords.length}):`);
        landlords.forEach((user, index) => {
            console.log(`${index + 1}. ${user.firstName} ${user.lastName} - ${user.email}`);
        });

        return createdUsers;

    } catch (error) {
        console.error('Error seeding users:', error);
        throw error;
    }
};

// Main execution
const main = async () => {
    try {
        await connectDB();
        const users = await seedUsers();
        console.log('\n🎉 User seeding completed successfully!');
        console.log(`Created ${users.length} users (${users.filter(u => u.role === 'tenant').length} tenants, ${users.filter(u => u.role === 'landlord').length} landlords)`);
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


export { seedUsers };
