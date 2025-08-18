import { generateEncryptionKey } from '../utils/encryption.js';

/**
 * Generate a secure encryption key for your .env file
 */
const generateKey = () => {
    const key = generateEncryptionKey();
    
    console.log('🔐 Generated Encryption Key:');
    console.log('=====================================');
    console.log(key);
    console.log('=====================================');
    console.log('\n📝 Add this to your .env file:');
    console.log(`ENCRYPTION_KEY=${key}`);
    console.log('\n⚠️  Keep this key secure and never commit it to version control!');
    console.log('\n✅ Key length:', key.length, 'characters');
};

generateKey();
