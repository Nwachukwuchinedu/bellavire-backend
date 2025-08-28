import { faker } from '@faker-js/faker';
import Property from '../../models/Property.js';
import Landlord from '../../models/Landlord.js';
import Agent from '../../models/Agent.js';
import Tenant from '../../models/Tenant.js';
import { connectDB } from './dbConnection.js';

// Create a landlord if none exists
const createLandlord = async () => {
    let landlord = await Landlord.findOne();

    if (!landlord) {
        landlord = new Landlord({
            firstName: faker.person.firstName(),
            lastName: faker.person.lastName(),
            email: faker.internet.email(),
            phoneNumber: `+234${faker.string.numeric(10)}`,
            address: faker.location.streetAddress({ useFullAddress: true }),
            description: faker.lorem.paragraph(),
            governmentIssuedId: faker.string.alphanumeric(10),
            notificationSettings: {
                rentPayment: { email: true, sms: true },
                maintenanceRequests: { email: true, sms: false },
                leaseRenewals: { email: true, sms: true },
                propertyUpdates: { email: true, sms: false }
            }
        });
        await landlord.save();
        console.log('Created landlord for properties');
    }

    return landlord;
};

// Create an agent if none exists
const createAgent = async () => {
    let agent = await Agent.findOne();

    if (!agent) {
        agent = new Agent({
            firstName: faker.person.firstName(),
            lastName: faker.person.lastName(),
            email: faker.internet.email(),
            phoneNumber: `+234${faker.string.numeric(10)}`,
            company: faker.company.name(),
            description: faker.lorem.paragraph(),
            governmentIssuedId: faker.string.alphanumeric(10)
        });
        await agent.save();
        console.log('Created agent for properties');
    }

    return agent;
};

// Generate fake property data
const generatePropertyData = (landlord, agent, tenant = null) => {
    const propertyTypes = ['flat', 'shared', 'detached-house', 'semi-detached'];
    const tenancyTypes = ['monthly', 'annually'];
    const paymentFrequencies = ['monthly', 'weekly', 'annually'];
    const sharedAreas = ['living room', 'bathroom', 'kitchen', 'dining room'];
    const statuses = ['occupied', 'vacant', 'pending'];

    // Determine status based on tenant assignment
    let status = 'vacant';
    if (tenant) {
        status = faker.helpers.arrayElement(['occupied', 'pending']);
    }

    return {
        landlord: landlord._id,
        agent: agent._id,
        tenant: tenant ? tenant._id : null,
        status,
        propertyName: faker.company.name() + ' ' + faker.helpers.arrayElement(['Apartments', 'Residence', 'Homes', 'Complex']),
        propertyType: faker.helpers.arrayElements(propertyTypes, { min: 1, max: 2 }),
        address: faker.location.streetAddress({ useFullAddress: true }),
        frontImage: faker.image.urlPicsumPhotos({ width: 800, height: 600 }),
        propertyImages: Array.from({ length: faker.number.int({ min: 3, max: 6 }) }, () =>
            faker.image.urlPicsumPhotos({ width: 800, height: 600 })
        ),
        description: faker.lorem.paragraph(),
        bedrooms: faker.number.int({ min: 1, max: 5 }),
        bathrooms: faker.number.int({ min: 1, max: 3 }),
        furnished: faker.datatype.boolean(),
        amenities: {
            wifi: faker.datatype.boolean(),
            electricity: faker.datatype.boolean(),
            furnishedKitchen: faker.datatype.boolean(),
            water: faker.datatype.boolean(),
            gym: faker.datatype.boolean()
        },
        sharedAreas: faker.helpers.arrayElements(sharedAreas, { min: 0, max: 3 }),
        billsIncluded: faker.helpers.arrayElements(['electricity', 'water', 'wifi'], { min: 0, max: 3 }),
        monthlyRent: faker.number.int({ min: 50000, max: 500000 }),
        depositAmount: faker.number.int({ min: 50000, max: 200000 }),
        tenancy: faker.helpers.arrayElement(tenancyTypes),
        availableFrom: faker.date.recent({ days: 30 }),
        paymentFrequency: faker.helpers.arrayElement(paymentFrequencies),
        addressLine1: faker.location.streetAddress(),
        addressLine2: faker.helpers.maybe(() => faker.location.secondaryAddress()),
        cityOrTown: faker.location.city(),
        postalCode: faker.location.zipCode(),
        regionOrCountry: faker.location.country()
    };
};

// Seed properties
const seedProperties = async () => {
    try {
        console.log('Starting property seeding...');

        // Get or create landlord
        const landlord = await createLandlord();

        // Get or create agent
        const agent = await createAgent();

        // Get existing tenants
        const tenants = await Tenant.find({});

        if (tenants.length === 0) {
            console.log('No tenants found. Please run tenant seeding first.');
            return [];
        }

        console.log(`Found ${tenants.length} tenants to assign properties to`);

        // Clear existing properties
        await Property.deleteMany({});
        console.log('Cleared existing properties');

        const properties = [];

        // Generate properties for each tenant
        for (let i = 0; i < tenants.length; i++) {
            const tenant = tenants[i];
            const propertyData = generatePropertyData(landlord, agent, tenant);
            properties.push(propertyData);
        }

        // Add a few extra properties without tenants
        for (let i = 0; i < 5; i++) {
            const propertyData = generatePropertyData(landlord, agent);
            properties.push(propertyData);
        }

        // Insert properties
        const createdProperties = await Property.insertMany(properties);
        console.log(`✅ Successfully seeded ${createdProperties.length} properties`);

        // Display created properties
        createdProperties.forEach((property, index) => {
            console.log(`${index + 1}. ${property.propertyName}`);
            console.log(`   Address: ${property.address}`);
            console.log(`   Rent: ₦${property.monthlyRent.toLocaleString()}/month`);
            console.log(`   Type: ${property.propertyType.join(', ')}`);
            console.log(`   Tenant: ${property.tenant ? 'Assigned' : 'Available'}`);
        });

        return createdProperties;

    } catch (error) {
        console.error('Error seeding properties:', error);
        throw error;
    }
};

// Main execution
const main = async () => {
    try {
        await connectDB();
        const properties = await seedProperties();
        console.log('\n🎉 Property seeding completed successfully!');
        console.log(`Created ${properties.length} properties`);
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

export { seedProperties };
