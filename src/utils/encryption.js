import CryptoJS from 'crypto-js';

// Get encryption key from environment variable
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'your-fallback-encryption-key-32-chars-long';

/**
 * Encrypt data using AES-256-CBC
 * @param {any} data - Data to encrypt
 * @returns {string} - Encrypted data as base64 string
 */
export const encrypt = (data) => {
    try {
        console.log('🔍 Server encrypt: Input data type:', typeof data);
        console.log('🔍 Server encrypt: Input data:', JSON.stringify(data, null, 2));
        
        // Convert data to JSON string if it's an object
        const jsonString = typeof data === 'string' ? data : JSON.stringify(data);
        console.log('🔍 Server encrypt: JSON string:', jsonString);
        
        // Encrypt the data
        const encrypted = CryptoJS.AES.encrypt(jsonString, ENCRYPTION_KEY);
        const result = encrypted.toString();
        
        console.log('🔍 Server encrypt: Encryption key length:', ENCRYPTION_KEY.length);
        console.log('🔍 Server encrypt: Result length:', result.length);
        console.log('🔍 Server encrypt: Result preview:', result.substring(0, 50) + '...');
        
        // Return as base64 string
        return result;
    } catch (error) {
        console.error('❌ Server encryption error:', error);
        console.error('❌ Error stack:', error.stack);
        throw new Error('Failed to encrypt data');
    }
};

/**
 * Decrypt data using AES-256-CBC
 * @param {string} encryptedData - Encrypted data as base64 string
 * @returns {any} - Decrypted data (parsed JSON if it was an object)
 */
export const decrypt = (encryptedData) => {
    try {
        console.log('🔍 Server decrypt: Input data length:', encryptedData.length);
        console.log('🔍 Server decrypt: Input data preview:', encryptedData.substring(0, 50) + '...');
        console.log('🔍 Server decrypt: Encryption key length:', ENCRYPTION_KEY.length);
        
        // Decrypt the data directly
        const decrypted = CryptoJS.AES.decrypt(encryptedData, ENCRYPTION_KEY);
        
        // Convert to string
        const decryptedString = decrypted.toString(CryptoJS.enc.Utf8);
        console.log('🔍 Server decrypt: Decrypted string length:', decryptedString.length);
        console.log('🔍 Server decrypt: Decrypted string:', decryptedString);
        
        // Try to parse as JSON, return as string if it fails
        try {
            const result = JSON.parse(decryptedString);
            console.log('🔍 Server decrypt: Parsed JSON result:', JSON.stringify(result, null, 2));
            return result;
        } catch {
            console.log('🔍 Server decrypt: Not JSON, returning as string');
            return decryptedString;
        }
    } catch (error) {
        console.error('❌ Server decryption error:', error);
        console.error('❌ Error stack:', error.stack);
        throw new Error('Failed to decrypt data');
    }
};

/**
 * Check if a string is encrypted (base64 format)
 * @param {string} data - Data to check
 * @returns {boolean} - True if data appears to be encrypted
 */
export const isEncrypted = (data) => {
    if (typeof data !== 'string') return false;
    
    try {
        // Check if it's valid base64
        const decoded = CryptoJS.enc.Base64.parse(data);
        // Check if it has enough bytes for IV + some encrypted data
        return decoded.words.length >= 5; // 4 words for IV + at least 1 word for data
    } catch {
        return false;
    }
};

/**
 * Generate a secure encryption key
 * @returns {string} - 32-character encryption key
 */
export const generateEncryptionKey = () => {
    return CryptoJS.lib.WordArray.random(32).toString();
};
