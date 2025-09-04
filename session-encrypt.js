// session-encrypt.js
const zlib = require('zlib');

/**
 * Compresses and encodes a session file content into the BAYMAX-MD format.
 * @param {string} sessionData The raw string content of creds.json.
 * @returns {string} The encrypted session string.
 */
function encryptSession(sessionData) {
  // Step 1: Compress the session data using gzip
  const compressedData = zlib.gzipSync(sessionData);
  
  // Step 2: Encode the compressed data to Base64
  const base64Data = compressedData.toString('base64');
  
  // Step 3: Prepend the header and return the final string
  return `BAYMAX-MD;;;${base64Data}`;
}

module.exports = { encryptSession };
