import { connectDB } from './dbConnection.js';
import Lease from '../../models/Lease.js';
import Tenant from '../../models/Tenant.js';
import Landlord from '../../models/Landlord.js';
import Property from '../../models/Property.js';
import { faker } from '@faker-js/faker';

export const seedLeases = async () => {
    try {
        console.log('🌱 Starting lease seeding...');

        // Connect to database
        await connectDB();

        // Clear existing leases
        await Lease.deleteMany({});
        console.log('✅ Cleared existing leases');

        // Get existing tenants, landlords, and properties
        const tenants = await Tenant.find({});
        const landlords = await Landlord.find({});
        const properties = await Property.find({});

        if (tenants.length === 0) {
            throw new Error('No tenants found. Please seed tenants first.');
        }

        if (landlords.length === 0) {
            throw new Error('No landlords found. Please seed landlords first.');
        }

        if (properties.length === 0) {
            throw new Error('No properties found. Please seed properties first.');
        }

        console.log(`📊 Found ${tenants.length} tenants, ${landlords.length} landlords, ${properties.length} properties`);

        const leaseData = [];
        const leaseStatuses = ['active', 'inactive', 'pending', 'expired'];
        const paymentStatuses = ['pending', 'completed', 'failed'];
        const durations = ['6 months', '12 months', '18 months', '24 months'];

        // Create leases for each tenant (some tenants might have multiple leases)
        for (let i = 0; i < Math.min(tenants.length * 2, 20); i++) {
            const tenant = tenants[i % tenants.length];
            const landlord = landlords[i % landlords.length];
            const property = properties[i % properties.length];

            // Generate random dates
            const startDate = faker.date.between({ from: '2023-01-01', to: '2024-12-31' });
            const duration = faker.helpers.arrayElement(durations);
            const durationMonths = parseInt(duration.split(' ')[0]);
            const expirationDate = new Date(startDate);
            expirationDate.setMonth(expirationDate.getMonth() + durationMonths);

            // Determine if lease is expired based on expiration date
            const isExpired = expirationDate < new Date();
            const status = isExpired ? 'expired' : faker.helpers.arrayElement(leaseStatuses.filter(s => s !== 'expired'));

            // Generate room selection
            const floor = faker.number.int({ min: 1, max: 10 }).toString();
            const room = faker.number.int({ min: 1, max: 50 }).toString();
            const roomIdentifier = `Floor ${floor}/Rm ${room}`;

            // Generate payment details
            const paymentStatus = faker.helpers.arrayElement(paymentStatuses);
            const paymentDetails = {
                stripePaymentIntentId: paymentStatus === 'completed' ? `pi_${faker.string.alphanumeric(24)}` : null,
                amount: property.monthlyRent || faker.number.int({ min: 500, max: 3000 }),
                currency: 'usd',
                paidAt: paymentStatus === 'completed' ? faker.date.between({ from: startDate, to: new Date() }) : null
            };

            // Generate documents (simulate uploaded files)
            const documents = {
                passport: faker.datatype.boolean() ? `uploads/passports/passport_${faker.string.alphanumeric(8)}.pdf` : null,
                driverLicense: faker.datatype.boolean() ? `uploads/licenses/license_${faker.string.alphanumeric(8)}.pdf` : null,
                utilityBill: faker.datatype.boolean() ? `uploads/utilities/bill_${faker.string.alphanumeric(8)}.pdf` : null,
                bankLetter: faker.datatype.boolean() ? `uploads/bank/letter_${faker.string.alphanumeric(8)}.pdf` : null,
                digitalSignature: faker.datatype.boolean() ? `uploads/signatures/signature_${faker.string.alphanumeric(8)}.png` : null
            };

            const lease = {
                tenantId: tenant._id,
                landlordId: landlord._id,
                propertyId: property._id,
                startDate,
                expirationDate,
                duration,
                status,
                currentProperty: property.propertyName,
                streetName: property.address,
                rent: property.monthlyRent || faker.number.int({ min: 500, max: 3000 }),
                apartment: `Apt ${faker.number.int({ min: 1, max: 999 })}`,
                city: property.city || faker.location.city(),
                zipCode: property.zipCode || faker.location.zipCode(),
                roomSelection: {
                    floor,
                    room,
                    roomIdentifier
                },
                paymentStatus,
                paymentDetails,
                documents,
                leaseDocument: faker.datatype.boolean() ? `leases/lease_${faker.string.alphanumeric(8)}.pdf` : null,
                originalLeaseTemplate: faker.datatype.boolean() ? `templates/template_${faker.string.alphanumeric(8)}.pdf` : null,
                isTerminated: faker.datatype.boolean({ probability: 0.1 }), // 10% chance of being terminated
                termination: faker.datatype.boolean({ probability: 0.1 }) ? {
                    reason: faker.helpers.arrayElement([
                        'Tenant violation',
                        'Mutual agreement',
                        'Property sale',
                        'Renovation required',
                        'Tenant request'
                    ]),
                    comment: faker.lorem.sentence(),
                    terminatedAt: faker.date.between({ from: startDate, to: new Date() })
                } : null,
                isRenewal: faker.datatype.boolean({ probability: 0.2 }), // 20% chance of being a renewal
                originalLeaseId: null // Will be set if this is a renewal
            };

            leaseData.push(lease);
        }

        // Insert leases
        const createdLeases = await Lease.insertMany(leaseData);
        console.log(`✅ Successfully created ${createdLeases.length} leases`);

        // Update some leases to be renewals
        const activeLeases = createdLeases.filter(lease => lease.status === 'active' && !lease.isTerminated);
        for (let i = 0; i < Math.min(activeLeases.length, 3); i++) {
            const originalLease = activeLeases[i];
            const renewalLease = createdLeases.find(lease =>
                lease.tenantId.equals(originalLease.tenantId) &&
                lease.propertyId.equals(originalLease.propertyId) &&
                lease._id !== originalLease._id
            );

            if (renewalLease) {
                renewalLease.isRenewal = true;
                renewalLease.originalLeaseId = originalLease._id;
                await renewalLease.save();
            }
        }

        // Log some statistics
        const activeCount = createdLeases.filter(l => l.status === 'active').length;
        const pendingCount = createdLeases.filter(l => l.status === 'pending').length;
        const expiredCount = createdLeases.filter(l => l.status === 'expired').length;
        const terminatedCount = createdLeases.filter(l => l.isTerminated).length;

        console.log('📊 Lease Statistics:');
        console.log(`   Active: ${activeCount}`);
        console.log(`   Pending: ${pendingCount}`);
        console.log(`   Expired: ${expiredCount}`);
        console.log(`   Terminated: ${terminatedCount}`);

        console.log('🎉 Lease seeding completed successfully!');
        return createdLeases;

    } catch (error) {
        console.error('❌ Error seeding leases:', error);
        throw error;
    }
};

// Run the seeding function if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
    seedLeases().then(() => {
        process.exit(0);
    }).catch((error) => {
        console.error('❌ Error seeding leases:', error);
        process.exit(1);
    });
}
