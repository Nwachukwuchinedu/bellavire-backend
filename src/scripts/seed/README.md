# Database Seeding

This directory contains seed files to populate your database with realistic test data for development and testing purposes.

## 📁 Files Structure

```
src/scripts/seed/
├── README.md                    # This file
├── seedAll.js                  # Master seed file (runs all seeds)
├── seedUsers.js                # Seeds User model
├── seedTenants.js              # Seeds Tenant model
├── seedLandlords.js            # Seeds Landlord model
├── seedProperties.js           # Seeds Property model
├── seedPayments.js             # Seeds Payment model
├── seedLeases.js               # Seeds Lease model
├── seedRooms.js                # Seeds Room model
├── seedMaintenance.js          # Seeds Maintenance model
├── seedTenantApplications.js   # Seeds TenantApplication model
├── seedNotifications.js        # Seeds Notification model
├── seedContractors.js          # Seeds Contractor model
└── seedTours.js                # Seeds Tour model
```

## 🚀 Quick Start

### Run All Seeds (Recommended)
```bash
npm run seed
```

### Run Step-by-Step (Alternative)
If the full seeding process disconnects, you can run it step by step:

```bash
# Run all steps with better error handling
npm run seed:step

# Run a specific step
npm run seed:step users
npm run seed:step tenants
npm run seed:step properties
# etc.
```

This will run all seed files in the correct order:
1. Users (10 authenticated tenants + 10 landlords)
2. Tenants (complete tenant profiles)
3. Landlords (landlord profiles)
4. Properties (assigned to tenants + extra available)
5. Payments (multiple payments per tenant)
6. Leases (lease agreements)
7. Rooms (property rooms with status)
8. Maintenance (maintenance requests)
9. Tenant Applications (rental applications)
10. Notifications (system notifications)
11. Contractors (maintenance contractors)
12. Tours (property tours)

### Run Individual Seeds

```bash
# Seed only users
npm run seed:users

# Seed only tenants (requires users first)
npm run seed:tenants

# Seed only landlords (requires users first)
npm run seed:landlords

# Seed only properties (requires tenants and landlords first)
npm run seed:properties

# Seed only payments (requires tenants and properties first)
npm run seed:payments

# Seed only leases (requires tenants, landlords, and properties first)
npm run seed:leases

# Seed only rooms (requires properties and leases first)
npm run seed:rooms

# Seed only maintenance (requires tenants, landlords, and properties first)
npm run seed:maintenance

# Seed only tenant applications (requires users, properties, and landlords first)
npm run seed:applications

# Seed only notifications (requires admins and landlords first)
npm run seed:notifications

# Seed only contractors
npm run seed:contractors

# Seed only tours (requires tenants, landlords, and properties first)
npm run seed:tours
```

## 📊 Data Generated

### Users (10 records)
- **Role**: All tenants
- **Authentication**: Local with password `password123`
- **Status**: Active and email verified
- **Fields**: Complete personal details including profile images, dates of birth, gender

### Tenants (10 records)
- **Linked to**: Users created above
- **Employment**: Various statuses (full-time, part-time, self-employed, etc.)
- **Documents**: Valid ID, utility bill, bank statement URLs
- **Social Links**: Google, Microsoft, LinkedIn, Instagram connections
- **Notifications**: Customized preferences for different types

### Properties (15 records)
- **Assigned**: 10 properties linked to tenants
- **Available**: 5 additional properties without tenants
- **Details**: Complete property information including amenities, images, rent amounts
- **Landlord**: Auto-created landlord for all properties

### Payments (25-40 records)
- **Distribution**: Multiple payments per tenant (1-3 each)
- **Statuses**: Mix of pending, successful, and failed
- **Amounts**: Based on property monthly rent (80-120% range)
- **Gateway**: All Paystack with realistic transaction IDs

### Leases (10-15 records)
- **Statuses**: Active, inactive, pending, expired
- **Documents**: Complete lease documentation
- **Room Selection**: Floor and room assignments
- **Payment Status**: Various payment states

### Rooms (75-225 records)
- **Distribution**: 5-15 rooms per property
- **Statuses**: Available, occupied, reserved, maintenance
- **Room Types**: Various floor and room combinations
- **Lease Assignment**: Some rooms linked to active leases

### Maintenance (10-30 records)
- **Categories**: Plumbing, electrical, HVAC, appliance, structural, etc.
- **Statuses**: Pending, in progress, resolved
- **Images**: Random maintenance photos
- **Distribution**: Multiple requests per tenant

### Tenant Applications (5-20 records)
- **Statuses**: Pending, approved, cancelled
- **Background Checks**: Credit scores, criminal records, eviction history
- **Documents**: Valid ID, utility bills, bank statements
- **Employment**: Various employment statuses and income levels

### Notifications (20-50 records)
- **Recipients**: Admins and landlords
- **Types**: Rent payments, maintenance, lease renewals, etc.
- **Read Status**: Mix of read and unread notifications
- **Links**: URLs to related content

### Contractors (15-25 records)
- **Specialties**: Plumbing, electrical, HVAC, carpentry, painting, etc.
- **Availability**: Available, busy, unavailable
- **Contact Info**: Complete contact details
- **Distribution**: Various specialties represented

### Tours (10-30 records)
- **Types**: In-person and virtual tours
- **Time Slots**: 9 AM to 5 PM slots
- **Statuses**: Pending, confirmed, declined, cancelled, completed
- **Scheduling**: Future and past tour dates

## 🔑 Sample Login Credentials

After running the seeds, you can use these sample accounts to test:

```
Email: [generated email]
Password: password123
```

The actual emails will be displayed in the console after seeding.

## 🛠️ Customization

### Modify Data Generation

Each seed file contains a `generate[Model]Data()` function that you can modify to:

- Change the number of records generated
- Adjust data ranges (e.g., rent amounts, income levels)
- Modify field values or add new fields
- Change the distribution of statuses

### Environment Variables

Make sure your `.env` file contains:
```
MONGODB_URI=your_mongodb_connection_string
```

## 🔄 Resetting Data

Each seed file automatically clears existing data before inserting new records. If you want to keep existing data, comment out the `deleteMany()` calls in each seed file.

## 📈 Data Relationships

The seeding process maintains proper relationships:

1. **Users** → **Tenants**: Each user has a corresponding tenant profile
2. **Tenants** → **Properties**: Each tenant is assigned to a property
3. **Tenants + Properties** → **Payments**: Payments link tenants to their properties

## 🎯 Testing Your API

With the seeded data, you can now test:

- **Admin Transaction Analytics**: `/api/admin/transactions/analytics`
- **Admin Transaction List**: `/api/admin/transactions`
- **User Management**: `/api/admin/users/tenants/:id/properties/:id`
- **Payment Processing**: Use the tenant credentials to test payment flows

## 🐛 Troubleshooting

### Common Issues

1. **MongoDB Connection Error**: Check your `MONGODB_URI` in `.env`
2. **Validation Errors**: Ensure all required fields are being generated
3. **Duplicate Key Errors**: Seeds automatically clear existing data
4. **Missing Dependencies**: Run `npm install` to ensure faker is installed
5. **Connection Timeout**: If seeding disconnects, try the step-by-step approach:
   ```bash
   npm run seed:step
   ```
6. **Memory Issues**: If you encounter memory problems, try running individual seeds:
   ```bash
   npm run seed:users
   npm run seed:tenants
   # etc.
   ```

### Debug Mode

Add console.log statements in the generate functions to see what data is being created:

```javascript
const userData = generateUserData();
console.log('Generated user:', userData);
```

## 📝 Notes

- All passwords are set to `password123` for easy testing
- Dates are generated within the last 30 days for realistic testing
- Amounts are in Nigerian Naira (₦) as per your payment system
- Transaction IDs follow the pattern: `TXN_[ALPHANUMERIC]_[TIMESTAMP]`
