import mongoose from 'mongoose';

/**
 * Safely create a database index with error handling
 */
const createIndexSafely = async (collection, indexSpec, options) => {
    try {
        await collection.createIndex(indexSpec, options);
        console.log(`✅ Index created: ${options.name || 'unnamed'}`);
    } catch (error) {
        if (error.code === 85) { // IndexOptionsConflict
            console.log(`⚠️  Index already exists with different name: ${options.name || 'unnamed'}`);
        } else if (error.code === 48) { // Index already exists
            console.log(`ℹ️  Index already exists: ${options.name || 'unnamed'}`);
        } else {
            console.error(`❌ Error creating index ${options.name || 'unnamed'}:`, error.message);
        }
    }
};

/**
 * Database indexes for performance optimization
 * Run this function during application startup to ensure indexes exist
 */
export const createDatabaseIndexes = async () => {
    try {
        // Check if MongoDB is connected
        if (mongoose.connection.readyState !== 1) {
            console.log('MongoDB not connected yet, skipping index creation...');
            return;
        }

        console.log('Creating database indexes for performance...');

        // User collection indexes
        await createIndexSafely(
            mongoose.connection.db.collection('users'),
            { createdAt: -1 },
            { background: true, name: 'users_createdAt_desc' }
        );

        await createIndexSafely(
            mongoose.connection.db.collection('users'),
            { email: 1 },
            { background: true, name: 'users_email_asc', unique: true }
        );

        await createIndexSafely(
            mongoose.connection.db.collection('users'),
            { role: 1, isActive: 1 },
            { background: true, name: 'users_role_active' }
        );

        await createIndexSafely(
            mongoose.connection.db.collection('users'),
            { firstName: 1, lastName: 1 },
            { background: true, name: 'users_name_search' }
        );

        // Tenant collection indexes
        await createIndexSafely(
            mongoose.connection.db.collection('tenants'),
            { createdAt: -1 },
            { background: true, name: 'tenants_createdAt_desc' }
        );

        await createIndexSafely(
            mongoose.connection.db.collection('tenants'),
            { email: 1 },
            { background: true, name: 'tenants_email_asc' }
        );

        // Landlord collection indexes
        await createIndexSafely(
            mongoose.connection.db.collection('landlords'),
            { createdAt: -1 },
            { background: true, name: 'landlords_createdAt_desc' }
        );

        // Agent collection indexes
        await createIndexSafely(
            mongoose.connection.db.collection('agents'),
            { createdAt: -1 },
            { background: true, name: 'agents_createdAt_desc' }
        );

        // Property collection indexes
        await createIndexSafely(
            mongoose.connection.db.collection('properties'),
            { createdAt: -1 },
            { background: true, name: 'properties_createdAt_desc' }
        );

        await createIndexSafely(
            mongoose.connection.db.collection('properties'),
            { status: 1 },
            { background: true, name: 'properties_status' }
        );

        // Notification collection indexes
        await createIndexSafely(
            mongoose.connection.db.collection('notifications'),
            { admin: 1, createdAt: -1 },
            { background: true, name: 'notifications_admin_createdAt' }
        );

        await createIndexSafely(
            mongoose.connection.db.collection('notifications'),
            { isRead: 1 },
            { background: true, name: 'notifications_isRead' }
        );

        console.log('✅ Database index creation completed!');
    } catch (error) {
        console.error('❌ Error in database index creation process:', error.message);
        // Don't throw error as indexes might already exist
    }
};

/**
 * Wait for MongoDB connection and then create indexes
 * Use this function after establishing the database connection
 */
export const initializeDatabaseIndexes = async () => {
    // Wait for MongoDB to be connected
    if (mongoose.connection.readyState === 1) {
        await createDatabaseIndexes();
    } else {
        // Listen for the 'connected' event
        mongoose.connection.once('connected', async () => {
            console.log('MongoDB connected, creating indexes...');
            await createDatabaseIndexes();
        });
    }
}; 