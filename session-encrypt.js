// session-encrypt.js
const zlib = require('zlib');

/**
 * Compresses and encodes a session file content into the BAYMAX-MD format.
 * @param {Buffer} sessionData The raw content of creds.json.
 * @returns {string} The encrypted session string.
 */
function encryptSession(sessionData) {
  try {
    // Step 1: Compress the session data using gzip
    const compressedData = zlib.gzipSync(sessionData);
    
    // Step 2: Encode the compressed data to Base64
    const base64Data = compressedData.toString('base64');
    
    // Step 3: Prepend the header and return the final string
    return `HRIBOT-MD;;;${base64Data}`;
  } catch (error) {
    console.error('Error encrypting session:', error);
    throw new Error('Failed to encrypt session data');
  }
}

module.exports = { encryptSession };
