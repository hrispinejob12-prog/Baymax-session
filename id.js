// id.js
function makeid(num = 4) {
  let result = "";
  let characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  var characters9 = characters.length;
  for (var i = 0; i < num; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters9));
  }
  return result;
}

/**
 * Generates a unique session name with a prefix.
 * @returns {string} A unique session name (e.g., baymax_a1b2c).
 */
function generateSessionName() {
    const randomPart = makeid(5).toLowerCase();
    return `baymax_${randomPart}`;
}

module.exports = { makeid, generateSessionName };
