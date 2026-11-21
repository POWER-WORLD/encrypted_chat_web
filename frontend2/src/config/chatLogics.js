/**
 * Real-time Chat Logic Utilities
 * Safe helper functions for sender resolution and messaging calculations.
 */

/**
 * Returns the name of the conversation peer (opposite of loggedUser)
 * @param {Object} loggedUser - Currently authenticated user
 * @param {Array} users - Array of chat participant objects
 * @returns {string} Peer name or empty string
 */
export const getSender = (loggedUser, users) => {
  if (!loggedUser || !Array.isArray(users) || users.length < 2) return "";
  return users[0]?._id === loggedUser._id ? (users[1]?.name || "") : (users[0]?.name || "");
};

/**
 * Returns the full user object of the conversation peer
 * @param {Object} loggedUser - Currently authenticated user
 * @param {Array} users - Array of chat participant objects
 * @returns {Object} Peer user object or empty object
 */
export const getSenderFull = (loggedUser, users) => {
  if (!loggedUser || !Array.isArray(users) || users.length < 2) return {};
  return users[0]?._id === loggedUser._id ? (users[1] || {}) : (users[0] || {});
};

/**
 * Determines whether a message sender is the logged in user
 * @param {Object} loggedUser - Currently authenticated user
 * @param {Object} message - Message object
 * @returns {boolean}
 */
export const isMessageFromLoggedUser = (loggedUser, message) => {
  if (!loggedUser || !message?.sender) return false;
  const senderId = message.sender._id || message.sender;
  return senderId === loggedUser._id;
};

/**
 * Formats a message timestamp into clean 24h format (HH:mm)
 * @param {string|Date} timestamp - ISO date string or Date
 * @returns {string}
 */
export const formatMessageTime = (timestamp) => {
  if (!timestamp) return "";
  try {
    const date = new Date(timestamp);
    if (isNaN(date.getTime())) return "";
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
  } catch {
    return "";
  }
};
