import { faker } from '@faker-js/faker';
import Payment from '../../models/Payment.js';
import Tenant from '../../models/Tenant.js';
import Property from '../../models/Property.js';
import { connectDB } from './dbConnection.js';

// Generate fake payment data
const generatePaymentData = (tenant, property) => {
    const statuses = ['pending', 'successful', 'failed'];
    const status = faker.helpers.arrayElement(statuses);

    // Generate transaction ID
    const transactionId = `TXN_${faker.string.alphanumeric(8).toUpperCase()}_${Date.now()}`;

    // Generate payment date based on status
    let paymentDate = null;
    if (status === 'successful') {
        paymentDate = faker.date.recent({ days: 30 });
    }

    // Generate amount (usually close to monthly rent)
    const baseAmount = property.monthlyRent;
    const amount = faker.number.int({
        min: Math.floor(baseAmount * 0.8),
        max: Math.floor(baseAmount * 1.2)
    });

    return {
        transactionId,
        tenant: tenant._id,
        property: property._id,
        amount,
        status,
        paymentMethod: 'paystack',
        paymentDate,
        gatewayResponse: {
            reference: transactionId,
            status: status,
            gateway: 'paystack',
            channel: faker.helpers.arrayElement(['card', 'bank', 'ussd', 'qr', 'mobile_money', 'bank_transfer']),
            paidAt: paymentDate,
            metadata: {
                description: `Rent payment for ${property.propertyName}`,
                propertyId: property._id.toString(),
                tenantId: tenant._id.toString()
            }
        }
    };
};

// Seed payments
const seedPayments = async () => {
    try {
        console.log('Starting payment seeding...');

        // Get existing tenants and properties
        const tenants = await Tenant.find({});
        const properties = await Property.find({ tenant: { $exists: true, $ne: null } });

        if (tenants.length === 0) {
            console.log('No tenants found. Please run tenant seeding first.');
            return [];
        }

        if (properties.length === 0) {
            console.log('No properties with tenants found. Please run property seeding first.');
            return [];
        }

        console.log(`Found ${tenants.length} tenants and ${properties.length} properties with tenants`);

        // Clear existing payments
        await Payment.deleteMany({});
        console.log('Cleared existing payments');

        const payments = [];

        // Generate multiple payments for each tenant-property combination
        for (const tenant of tenants) {
            // Find property for this tenant
            const property = properties.find(p => p.tenant && p.tenant.toString() === tenant._id.toString());

            if (property) {
                // Generate 1-3 payments per tenant (some successful, some pending, some failed)
                const numPayments = faker.number.int({ min: 1, max: 3 });

                for (let i = 0; i < numPayments; i++) {
                    const paymentData = generatePaymentData(tenant, property);
                    payments.push(paymentData);
                }
            }
        }

        // Add some additional payments for variety
        for (let i = 0; i < 15; i++) {
            const randomTenant = faker.helpers.arrayElement(tenants);
            const randomProperty = faker.helpers.arrayElement(properties);
            const paymentData = generatePaymentData(randomTenant, randomProperty);
            payments.push(paymentData);
        }

        // Insert payments
        const createdPayments = await Payment.insertMany(payments);
        console.log(`✅ Successfully seeded ${createdPayments.length} payments`);

        // Display payment statistics
        const statusCounts = createdPayments.reduce((acc, payment) => {
            acc[payment.status] = (acc[payment.status] || 0) + 1;
            return acc;
        }, {});

        const totalAmount = createdPayments
            .filter(p => p.status === 'successful')
            .reduce((sum, p) => sum + p.amount, 0);

        console.log('\n📊 Payment Statistics:');
        console.log(`Total Payments: ${createdPayments.length}`);
        Object.entries(statusCounts).forEach(([status, count]) => {
            console.log(`${status.charAt(0).toUpperCase() + status.slice(1)}: ${count}`);
        });
        console.log(`Total Successful Amount: ₦${totalAmount.toLocaleString()}`);

        // Display sample payments
        console.log('\n📋 Sample Payments:');
        createdPayments.slice(0, 5).forEach((payment, index) => {
            console.log(`${index + 1}. ${payment.transactionId}`);
            console.log(`   Amount: ₦${payment.amount.toLocaleString()}`);
            console.log(`   Status: ${payment.status}`);
            console.log(`   Date: ${payment.paymentDate ? payment.paymentDate.toLocaleDateString() : 'Pending'}`);
        });

        return createdPayments;

    } catch (error) {
        console.error('Error seeding payments:', error);
        throw error;
    }
};

// Main execution
const main = async () => {
    try {
        await connectDB();
        const payments = await seedPayments();
        console.log('\n🎉 Payment seeding completed successfully!');
        console.log(`Created ${payments.length} payments`);
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

export { seedPayments };
