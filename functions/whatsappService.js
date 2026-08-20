/**
 * ============================================================================
 * MODULAR WHATSAPP SERVICE PLACEHOLDER
 * ============================================================================
 * This module cleanly abstracts WhatsApp message dispatching.
 * 
 * INTEGRATION INSTRUCTIONS FOR LIVE PRODUCTION:
 * 
 * Option A: Using `whatsapp-web.js` (Headless WhatsApp Web instance)
 * ----------------------------------------------------------------------------
 * 1. npm install whatsapp-web.js qrcode-terminal
 * 2. Initialize Client:
 *    const { Client, LocalAuth } = require('whatsapp-web.js');
 *    const client = new Client({ authStrategy: new LocalAuth() });
 *    client.on('qr', (qr) => qrcode.generate(qr, {small: true}));
 *    client.on('ready', () => console.log('WhatsApp Web client is ready!'));
 *    client.initialize();
 * 3. Replace `sendWhatsAppReminder` body with:
 *    const chatId = `${phoneNumber.replace('+', '')}@c.us`;
 *    await client.sendMessage(chatId, message);
 * 
 * Option B: Using Twilio WhatsApp API
 * ----------------------------------------------------------------------------
 * 1. npm install twilio
 * 2. const client = require('twilio')(accountSid, authToken);
 * 3. await client.messages.create({
 *      from: 'whatsapp:+14155238886',
 *      to: `whatsapp:${phoneNumber}`,
 *      body: message
 *    });
 * ============================================================================
 */

/**
 * Send WhatsApp payment reminder to a student
 * @param {string} phoneNumber - Student contact number (e.g. +94771234567)
 * @param {string} studentName - Student name
 * @param {string} roomNumber - Room number
 * @param {string} month - Billing month
 * @param {number} amount - Amount due
 */
async function sendWhatsAppReminder({ phoneNumber, studentName, roomNumber, month, amount }) {
  const messageBody = `🏡 *Bodima Payment Reminder*\n\nHi *${studentName}* (${roomNumber}),\nYour boarding fee payment for *${month}* (LKR ${Number(amount).toLocaleString()}) is currently *PENDING*.\n\nPlease upload your bank deposit slip via the Bodima Student Portal at your earliest convenience.\n\nThank you!\n- Boarding House Warden`;

  console.log(`[WHATSAPP SERVICE PLACEHOLDER] Dispatching to ${phoneNumber}:`);
  console.log(messageBody);

  // Simulated API call success response
  return {
    success: true,
    messageId: `msg_${Date.now()}_${Math.random().toString(36).substring(7)}`,
    recipient: phoneNumber,
    timestamp: new Date().toISOString()
  };
}

module.exports = {
  sendWhatsAppReminder
};
