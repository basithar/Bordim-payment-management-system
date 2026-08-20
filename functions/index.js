const functions = require('firebase-functions');
const admin = require('firebase-admin');
const { sendWhatsAppReminder } = require('./whatsappService');
const { validateSlipOCR } = require('./ocrService');

// Initialize Firebase Admin SDK
admin.initializeApp();
const db = admin.firestore();

/**
 * ============================================================================
 * FEATURE 1: UTILITY BILLS WEBHOOK (HTTP TRIGGER)
 * ============================================================================
 * Receives parsed SMS payloads (amount, type, month) from external tools
 * (Tasker, Zapier, Android SMS Parser, etc.) and writes to `bills` collection.
 * 
 * Sample HTTP POST Body:
 * {
 *   "type": "Water" | "Electricity" | "Internet",
 *   "amount": 4850,
 *   "month": "August 2026",
 *   "description": "NWSDB SMS Alert: LKR 4,850 due",
 *   "secretKey": "BODIMA_SECRET_KEY"
 * }
 */
exports.utilityBillWebhook = functions.https.onRequest(async (req, res) => {
  // Enforce HTTP POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed. Send HTTP POST request.' });
  }

  try {
    const { type, amount, month, description, secretKey } = req.body;

    // Basic authentication security check (optional environment secret)
    const expectedSecret = process.env.WEBHOOK_SECRET_KEY || 'BODIMA_SECRET_KEY';
    if (secretKey && secretKey !== expectedSecret) {
      return res.status(401).json({ error: 'Unauthorized webhook request.' });
    }

    if (!type || !amount || !month) {
      return res.status(400).json({ 
        error: 'Missing required parameters. Required fields: type, amount, month.' 
      });
    }

    const billPayload = {
      type: type,
      amount: Number(amount),
      month: month,
      description: description || `Automated SMS Webhook import (${type})`,
      source: 'webhook',
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    };

    const docRef = await db.collection('bills').add(billPayload);

    console.log(`[UTILITY BILL WEBHOOK SUCCESS] Created bill document ID ${docRef.id}`);

    return res.status(200).json({
      success: true,
      message: 'Utility bill parsed and recorded successfully.',
      billId: docRef.id,
      data: billPayload
    });

  } catch (error) {
    console.error('[UTILITY BILL WEBHOOK ERROR]', error);
    return res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
});


/**
 * ============================================================================
 * FEATURE 2: SCHEDULED WHATSAPP REMINDERS (PUB/SUB SCHEDULED FUNCTION)
 * ============================================================================
 * Cron Schedule: "0 9 8,20 * *" -> Runs at 09:00 AM on the 8th and 20th of every month.
 * 
 * Behavior:
 * 1. Queries `payments` collection for records where `status == 'pending'`.
 * 2. Fetches associated user profiles from `users` collection.
 * 3. STRICT REQUIREMENT: Users with status 'excused' are ENTIRELY IGNORED!
 * 4. Triggers `sendWhatsAppReminder` service placeholder.
 */
exports.scheduledWhatsAppReminder = functions.pubsub
  .schedule('0 9 8,20 * *')
  .timeZone('Asia/Colombo')
  .onRun(async (context) => {
    console.log('[SCHEDULED WHATSAPP JOB START] Executing 8th/20th monthly payment check...');

    try {
      // Step 1: Query payments where status is pending
      const pendingSnapshot = await db.collection('payments')
        .where('status', '==', 'pending')
        .get();

      if (pendingSnapshot.empty) {
        console.log('[SCHEDULED WHATSAPP JOB] No pending payments found for this cycle.');
        return null;
      }

      const remindersSent = [];

      for (const doc of pendingSnapshot.docs) {
        const paymentData = doc.data();

        // STRICT REQUIREMENT CHECK: Verify if status is excused (double check safety)
        if (paymentData.status === 'excused') {
          console.log(`[SCHEDULED WHATSAPP JOB] Skipping payment ${doc.id} - User is marked as EXCUSED.`);
          continue;
        }

        // Fetch student contact details from `users` collection
        let studentContact = '+94771234567'; // Fallback sample phone
        if (paymentData.userId) {
          const userDoc = await db.collection('users').doc(paymentData.userId).get();
          if (userDoc.exists && userDoc.data().contact) {
            studentContact = userDoc.data().contact;
          }
        }

        // Trigger WhatsApp API call via modular service
        const result = await sendWhatsAppReminder({
          phoneNumber: studentContact,
          studentName: paymentData.userName || 'Boarding Student',
          roomNumber: paymentData.userRoom || 'Room Unassigned',
          month: paymentData.month || 'Current Month',
          amount: paymentData.amount || 15000
        });

        remindersSent.push({
          paymentId: doc.id,
          student: paymentData.userName,
          phone: studentContact,
          result
        });
      }

      console.log(`[SCHEDULED WHATSAPP JOB COMPLETED] Dispatched ${remindersSent.length} reminders. Summary:`, remindersSent);
      return { success: true, count: remindersSent.length, remindersSent };

    } catch (error) {
      console.error('[SCHEDULED WHATSAPP JOB ERROR]', error);
      throw error;
    }
  });


/**
 * ============================================================================
 * FEATURE 3: OCR VALIDATION PLACEHOLDER FUNCTION
 * ============================================================================
 * Callable / HTTP function to validate submitted bank slips and check for
 * duplicate Transaction IDs in Firestore.
 */
exports.validatePaymentSlipOCR = functions.https.onRequest(async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { transactionId, paymentId } = req.body;
    const ocrResult = await validateSlipOCR(db, transactionId, paymentId);
    return res.status(200).json({ success: true, ocrResult });
  } catch (error) {
    console.error('[OCR VALIDATION FUNCTION ERROR]', error);
    return res.status(500).json({ error: error.message });
  }
});
