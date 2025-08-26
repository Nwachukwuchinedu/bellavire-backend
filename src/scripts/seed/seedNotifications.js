import { faker } from '@faker-js/faker';
import Notification from '../../models/Notification.js';
import Admin from '../../models/Admin.js';
import Landlord from '../../models/Landlord.js';
import { connectDB } from './dbConnection.js';

// Generate fake notification data
const generateNotificationData = (recipient, userRole) => {
    const notificationTypes = [
        'rent_payment', 'maintenance_request', 'lease_renewal', 
        'property_update', 'tenant_application', 'payment_reminder',
        'maintenance_completed', 'tour_request', 'document_upload'
    ];
    
    const messages = {
        rent_payment: [
            'Rent payment received for your property',
            'Rent payment overdue - please check your account',
            'Rent payment scheduled for tomorrow'
        ],
        maintenance_request: [
            'New maintenance request submitted',
            'Maintenance request updated',
            'Maintenance work completed'
        ],
        lease_renewal: [
            'Lease renewal reminder - expires in 30 days',
            'Lease renewal request received',
            'Lease renewal approved'
        ],
        property_update: [
            'Property listing updated',
            'New property added to your portfolio',
            'Property status changed'
        ],
        tenant_application: [
            'New tenant application received',
            'Tenant application approved',
            'Tenant application requires review'
        ],
        payment_reminder: [
            'Payment reminder - due in 3 days',
            'Payment overdue - immediate action required',
            'Payment processed successfully'
        ],
        maintenance_completed: [
            'Maintenance work completed successfully',
            'Maintenance report submitted',
            'Maintenance cost updated'
        ],
        tour_request: [
            'New property tour request',
            'Tour request confirmed',
            'Tour request cancelled'
        ],
        document_upload: [
            'New document uploaded',
            'Document verification required',
            'Document approved'
        ]
    };

    const type = faker.helpers.arrayElement(notificationTypes);
    const message = faker.helpers.arrayElement(messages[type]);

    return {
        recipient: recipient._id,
        userRole,
        message,
        type,
        link: faker.internet.url(),
        read: faker.datatype.boolean({ probability: 0.3 }) // 30% chance of being read
    };
};

// Seed notifications
const seedNotifications = async () => {
    try {
        console.log('Starting notification seeding...');

        // Get existing admins and landlords
        const admins = await Admin.find({});
        const landlords = await Landlord.find({});

        if (admins.length === 0 && landlords.length === 0) {
            console.log('No admins or landlords found. Please run their seeding first.');
            return [];
        }

        console.log(`Found ${admins.length} admins and ${landlords.length} landlords`);

        // Clear existing notifications
        await Notification.deleteMany({});
        console.log('Cleared existing notifications');

        const notifications = [];

        // Generate notifications for admins
        for (const admin of admins) {
            const notificationCount = faker.number.int({ min: 5, max: 15 });
            
            for (let i = 0; i < notificationCount; i++) {
                const notificationData = generateNotificationData(admin, 'admin');
                notifications.push(notificationData);
            }
        }

        // Generate notifications for landlords
        for (const landlord of landlords) {
            const notificationCount = faker.number.int({ min: 3, max: 10 });
            
            for (let i = 0; i < notificationCount; i++) {
                const notificationData = generateNotificationData(landlord, 'landlord');
                notifications.push(notificationData);
            }
        }

        // Insert notifications
        const createdNotifications = await Notification.insertMany(notifications);
        console.log(`✅ Successfully seeded ${createdNotifications.length} notifications`);

        // Display statistics
        const roleCounts = {};
        const typeCounts = {};
        const readCounts = { read: 0, unread: 0 };
        
        createdNotifications.forEach(notification => {
            roleCounts[notification.userRole] = (roleCounts[notification.userRole] || 0) + 1;
            typeCounts[notification.type] = (typeCounts[notification.type] || 0) + 1;
            if (notification.read) readCounts.read++;
            else readCounts.unread++;
        });

        console.log('\n📊 Notification Distribution by Role:');
        Object.entries(roleCounts).forEach(([role, count]) => {
            console.log(`   ${role}: ${count} notifications`);
        });

        console.log('\n📊 Notification Distribution by Type:');
        Object.entries(typeCounts).forEach(([type, count]) => {
            console.log(`   ${type}: ${count} notifications`);
        });

        console.log('\n📊 Read Status:');
        console.log(`   Read: ${readCounts.read} notifications`);
        console.log(`   Unread: ${readCounts.unread} notifications`);

        return createdNotifications;

    } catch (error) {
        console.error('Error seeding notifications:', error);
        throw error;
    }
};

// Main execution
const main = async () => {
    try {
        await connectDB();
        const notifications = await seedNotifications();
        console.log('\n🎉 Notification seeding completed successfully!');
        console.log(`Created ${notifications.length} notifications`);
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

export { seedNotifications };
