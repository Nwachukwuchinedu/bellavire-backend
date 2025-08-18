# Database Seeding Guide

## Quick Start
```bash
npm run seed
```

## Individual Seeds
```bash
npm run seed:users      # Seed 10 users (tenants)
npm run seed:tenants    # Seed tenant profiles
npm run seed:properties # Seed properties
npm run seed:payments   # Seed payments
```

## Data Generated
- **10 Users**: Authenticated tenants with password `password123`
- **10 Tenants**: Complete profiles with employment, documents, social links
- **15 Properties**: 10 assigned to tenants + 5 available
- **25-40 Payments**: Mix of pending, successful, failed transactions

## Sample Login
After seeding, use any generated email with password: `password123`
