import { faker } from '@faker-js/faker';
import Room from '../../models/Room.js';
import Property from '../../models/Property.js';
import Lease from '../../models/Lease.js';
import { connectDB } from './dbConnection.js';

// Generate fake room data
const generateRoomData = (property, lease = null, existingIdentifiers = new Set()) => {
    let floor, roomNumber, roomIdentifier;
    let attempts = 0;
    const maxAttempts = 100;

    // Keep trying until we get a unique room identifier
    do {
        floor = faker.number.int({ min: 1, max: 10 }).toString();
        roomNumber = faker.number.int({ min: 1, max: 50 }).toString();
        roomIdentifier = `Floor ${floor}/Rm ${roomNumber}`;
        attempts++;

        if (attempts > maxAttempts) {
            // If we can't find a unique identifier after many attempts, add a random suffix
            const suffix = faker.string.alphanumeric(4);
            roomIdentifier = `Floor ${floor}/Rm ${roomNumber}-${suffix}`;
            break;
        }
    } while (existingIdentifiers.has(roomIdentifier));

    // Add this identifier to the set to prevent future duplicates
    existingIdentifiers.add(roomIdentifier);

    const statuses = ['available', 'occupied', 'reserved', 'maintenance'];
    let status = 'available';

    if (lease) {
        status = faker.helpers.arrayElement(['occupied', 'reserved']);
    } else {
        status = faker.helpers.arrayElement(['available', 'maintenance']);
    }

    return {
        propertyId: property._id,
        floor,
        roomNumber,
        roomIdentifier,
        status,
        currentLeaseId: lease ? lease._id : null
    };
};

// Seed rooms
const seedRooms = async () => {
    try {
        console.log('Starting room seeding...');

        // Get existing properties
        const properties = await Property.find({});

        if (properties.length === 0) {
            console.log('No properties found. Please run property seeding first.');
            return [];
        }

        console.log(`Found ${properties.length} properties to create rooms for`);

        // Get existing leases for room assignment
        const leases = await Lease.find({ status: { $in: ['active', 'pending'] } });

        // Clear existing rooms
        await Room.deleteMany({});
        console.log('Cleared existing rooms');

        const rooms = [];
        let leaseIndex = 0;

        // Generate rooms for each property
        for (const property of properties) {
            // Generate 5-15 rooms per property
            const roomCount = faker.number.int({ min: 5, max: 15 });
            const existingIdentifiers = new Set(); // Track identifiers for this property

            for (let i = 0; i < roomCount; i++) {
                // Assign lease to some rooms if available
                let lease = null;
                if (leaseIndex < leases.length && faker.datatype.boolean({ probability: 0.3 })) {
                    lease = leases[leaseIndex];
                    leaseIndex++;
                }

                const roomData = generateRoomData(property, lease, existingIdentifiers);
                rooms.push(roomData);
            }
        }

        // Insert rooms with error handling
        let createdRooms = [];
        try {
            createdRooms = await Room.insertMany(rooms, { ordered: false });
            console.log(`✅ Successfully seeded ${createdRooms.length} rooms`);
        } catch (error) {
            if (error.code === 11000) {
                // Handle duplicate key errors
                console.log(`⚠️  Some rooms had duplicate identifiers. Successfully created ${error.insertedDocs?.length || 0} rooms`);
                createdRooms = error.insertedDocs || [];
            } else {
                throw error;
            }
        }

        // Display room statistics
        const statusCounts = {};
        createdRooms.forEach(room => {
            statusCounts[room.status] = (statusCounts[room.status] || 0) + 1;
        });

        console.log('\n📊 Room Status Distribution:');
        Object.entries(statusCounts).forEach(([status, count]) => {
            console.log(`   ${status}: ${count} rooms`);
        });

        // Display sample rooms
        console.log('\n🏠 Sample Rooms:');
        createdRooms.slice(0, 5).forEach((room, index) => {
            console.log(`${index + 1}. ${room.roomIdentifier} - ${room.status}`);
        });

        return createdRooms;

    } catch (error) {
        console.error('Error seeding rooms:', error);
        throw error;
    }
};

// Main execution
const main = async () => {
    try {
        await connectDB();
        const rooms = await seedRooms();
        console.log('\n🎉 Room seeding completed successfully!');
        console.log(`Created ${rooms.length} rooms`);
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

export { seedRooms };
