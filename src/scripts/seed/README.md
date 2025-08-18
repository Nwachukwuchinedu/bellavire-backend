# Database Seeding

This directory contains seed files to populate your database with realistic test data for development and testing purposes.

## 📁 Files Structure

```
src/scripts/seed/
├── README.md           # This file
├── seedAll.js         # Master seed file (runs all seeds)
├── seedUsers.js       # Seeds User model
├── seedTenants.js     # Seeds Tenant model
├── seedProperties.js  # Seeds Property model
└── seedPayments.js    # Seeds Payment model
```

## 🚀 Quick Start

### Run All Seeds (Recommended)
```bash
npm run seed
```

This will run all seed files in the correct order:
1. Users (10 authenticated tenants)
2. Tenants (complete tenant profiles)
3. Properties (assigned to tenants + extra available)
4. Payments (multiple payments per tenant)

### Run Individual Seeds

```bash
# Seed only users
npm run seed:users

# Seed only tenants (requires users first)
npm run seed:tenants

# Seed only properties (requires tenants first)
npm run seed:properties

# Seed only payments (requires tenants and properties first)
npm run seed:payments
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
