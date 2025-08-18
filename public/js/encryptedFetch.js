/**
 * Encrypted Fetch Utility
 * Replaces the native fetch() function with encrypted communication
 */

// CryptoJS library must be included in your HTML
// <script src="https://cdnjs.cloudflare.com/ajax/libs/crypto-js/4.1.1/crypto-js.min.js"></script>

class EncryptedFetch {
    constructor(encryptionKey) {
        // Use the same key as the server or a fallback
        this.encryptionKey = encryptionKey;
        this.baseURL = window.location.origin + '/api';
    }

    /**
     * Encrypt data using AES-256-CBC
     */
    encrypt(data) {
        try {
            console.log('🔍 Client encrypt: Input data type:', typeof data);
            console.log('🔍 Client encrypt: Input data:', JSON.stringify(data, null, 2));

            const jsonString = typeof data === 'string' ? data : JSON.stringify(data);
            console.log('🔍 Client encrypt: JSON string:', jsonString);

            // Use the same simple encryption method as the server
            const encrypted = CryptoJS.AES.encrypt(jsonString, this.encryptionKey);
            const result = encrypted.toString();

            console.log('🔍 Client encrypt: Encryption key length:', this.encryptionKey.length);
            console.log('🔍 Client encrypt: Result length:', result.length);
            console.log('🔍 Client encrypt: Result preview:', result.substring(0, 50) + '...');

            return result;
        } catch (error) {
            console.error('❌ Client encryption error:', error);
            console.error('❌ Error stack:', error.stack);
            throw new Error('Failed to encrypt data');
        }
    }

    /**
     * Decrypt data using AES-256-CBC
     */
    decrypt(encryptedData) {
        try {
            console.log('🔍 Client decrypt: Input data length:', encryptedData.length);
            console.log('🔍 Client decrypt: Input data preview:', encryptedData.substring(0, 50) + '...');
            console.log('🔍 Client decrypt: Encryption key length:', this.encryptionKey.length);

            // Use the same simple decryption method as the server
            const decrypted = CryptoJS.AES.decrypt(encryptedData, this.encryptionKey);
            const decryptedString = decrypted.toString(CryptoJS.enc.Utf8);

            console.log('🔍 Client decrypt: Decrypted string length:', decryptedString.length);
            console.log('🔍 Client decrypt: Decrypted string:', decryptedString);

            try {
                const result = JSON.parse(decryptedString);
                console.log('🔍 Client decrypt: Parsed JSON result:', JSON.stringify(result, null, 2));
                return result;
            } catch {
                console.log('🔍 Client decrypt: Not JSON, returning as string');
                return decryptedString;
            }
        } catch (error) {
            console.error('❌ Client decryption error:', error);
            console.error('❌ Error stack:', error.stack);
            throw new Error('Failed to decrypt data');
        }
    }

    /**
     * Check if data is encrypted
     */
    isEncrypted(data) {
        if (typeof data !== 'string') return false;

        try {
            const decoded = CryptoJS.enc.Base64.parse(data);
            return decoded.words.length >= 5;
        } catch {
            return false;
        }
    }

    /**
     * Enhanced fetch with encryption/decryption
     */
    async fetch(url, options = {}) {
        const fullUrl = url.startsWith('http') ? url : `${this.baseURL}${url}`;
        console.log('🔍 EncryptedFetch: Making request to:', fullUrl);
        console.log('🔍 EncryptedFetch: Request method:', options.method || 'GET');

        // Clone options to avoid modifying the original
        const fetchOptions = { ...options };

        // Handle request body encryption
        console.log('🔍 EncryptedFetch: Checking body for encryption');
        console.log('🔍 EncryptedFetch: Body exists?', !!fetchOptions.body);
        console.log('🔍 EncryptedFetch: Body type:', typeof fetchOptions.body);
        console.log('🔍 EncryptedFetch: Body is FormData?', fetchOptions.body instanceof FormData);

        if (fetchOptions.body && typeof fetchOptions.body === 'object') {
            // Skip encryption for FormData (file uploads)
            if (!(fetchOptions.body instanceof FormData)) {
                console.log('🔍 EncryptedFetch: Encrypting request body');
                console.log('🔍 EncryptedFetch: Original body:', JSON.stringify(fetchOptions.body, null, 2));

                const encryptedBody = this.encrypt(fetchOptions.body);
                console.log('🔍 EncryptedFetch: Encrypted body length:', encryptedBody.length);
                console.log('🔍 EncryptedFetch: Encrypted body preview:', encryptedBody.substring(0, 50) + '...');

                fetchOptions.body = encryptedBody;
                fetchOptions.headers = {
                    ...fetchOptions.headers,
                    'Content-Type': 'text/plain' // Change content type for encrypted data
                };
            } else {
                console.log('🔍 EncryptedFetch: Skipping encryption for FormData');
            }
        } else {
            console.log('🔍 EncryptedFetch: No body to encrypt or body is not an object');
        }

        try {
            console.log('🔍 EncryptedFetch: Sending request...');
            const response = await fetch(fullUrl, fetchOptions);
            console.log('🔍 EncryptedFetch: Response status:', response.status);
            console.log('🔍 EncryptedFetch: Response headers:', Object.fromEntries(response.headers.entries()));

            // Check if response is encrypted
            const isEncryptedResponse = response.headers.get('X-Encrypted') === 'true';
            console.log('🔍 EncryptedFetch: Is response encrypted?', isEncryptedResponse);

            if (isEncryptedResponse) {
                console.log('🔍 EncryptedFetch: Decrypting response...');
                const encryptedText = await response.text();
                console.log('🔍 EncryptedFetch: Encrypted response length:', encryptedText.length);
                console.log('🔍 EncryptedFetch: Encrypted response preview:', encryptedText.substring(0, 50) + '...');

                const decryptedData = this.decrypt(encryptedText);
                console.log('🔍 EncryptedFetch: Decrypted data:', JSON.stringify(decryptedData, null, 2));

                // Create a new response with decrypted data
                return new Response(JSON.stringify(decryptedData), {
                    status: response.status,
                    statusText: response.statusText,
                    headers: {
                        'Content-Type': 'application/json',
                        ...response.headers
                    }
                });
            }

            console.log('🔍 EncryptedFetch: Response not encrypted, returning as-is');
            return response;
        } catch (error) {
            console.error('❌ EncryptedFetch error:', error);
            console.error('❌ Error stack:', error.stack);
            throw error;
        }
    }

    /**
     * Convenience methods for different HTTP methods
     */
    async get(url, options = {}) {
        return this.fetch(url, { ...options, method: 'GET' });
    }

    async post(url, data, options = {}) {
        return this.fetch(url, {
            ...options,
            method: 'POST',
            body: data
        });
    }

    async put(url, data, options = {}) {
        return this.fetch(url, {
            ...options,
            method: 'PUT',
            body: data
        });
    }

    async patch(url, data, options = {}) {
        return this.fetch(url, {
            ...options,
            method: 'PATCH',
            body: data
        });
    }

    async delete(url, options = {}) {
        return this.fetch(url, { ...options, method: 'DELETE' });
    }
}

// Create a global instance
window.encryptedFetch = new EncryptedFetch();

// Override the global fetch function (optional)
// window.fetch = window.encryptedFetch.fetch.bind(window.encryptedFetch);

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = EncryptedFetch;
}
