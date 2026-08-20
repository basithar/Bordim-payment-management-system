# Bodima - Boarding House Management System 🏡

A modern, responsive, full-stack Boarding House Management System built with **React (Vite)**, **Tailwind CSS**, and **Firebase** (Firebase Auth, Cloud Firestore, Firebase Storage, and Cloud Functions).

---

## 🌟 Key Features

1. **User Auth & Extended Registration**
   - Firebase Auth (Email/Password) with role-based authorization (Admin / Warden vs Student).
   - Extended student profile details: Full Name, Hometown, NIC, Contact Number, Parents' Details (Father/Mother Name & Phone), and Room Number.

2. **Bank Slip Upload & Payments**
   - Secure slip file uploads to Firebase Cloud Storage.
   - Saves generated download URL and form data to Firestore `payments` collection.
   - Status workflow: `pending` ➔ `approved` | `rejected` | `excused`.

3. **Admin Dashboard & OCR Validation**
   - Overview metrics: Total Revenue, Pending Review, Granted Excused, and Boarding Students.
   - Image zoom modal for manual slip inspection.
   - Automated OCR duplicate detection checking for identical Transaction IDs in Firestore.

4. **Utility Bills Webhook (Firebase Cloud Function)**
   - HTTP Trigger Cloud Function (`utilityBillWebhook`) that receives parsed SMS data (Water, Electricity, Internet) from external automation tools (Tasker, Zapier, Android SMS Parsers).
   - Real-time sync with Firestore `bills` collection and displayed on both dashboards.
   - Built-in Webhook Simulator in the Admin Dashboard for easy testing.

5. **Scheduled WhatsApp Reminders (Pub/Sub Cloud Function)**
   - Scheduled Cloud Function running on the **8th and 20th of every month** (`0 9 8,20 * *`).
   - Queries `payments` collection for `pending` status records.
   - **Excused Status Exclusion**: Users with `excused` status are strictly ignored by the Cloud Function schedule.
   - Includes modular wrapper with code hooks for `whatsapp-web.js` or Twilio WhatsApp API.

---

## 🗄️ Database Structure (Cloud Firestore)

### `users` Collection
```json
{
  "uid": "string",
  "name": "Kasun Perera",
  "email": "kasun@boarding.lk",
  "hometown": "Kandy",
  "nic": "199834200192",
  "contact": "+94771234567",
  "parentsDetails": {
    "fatherName": "Sunil Perera",
    "fatherContact": "+94719876543",
    "motherName": "Malini Perera",
    "motherContact": "+94718765432"
  },
  "roomNumber": "Room 101",
  "role": "student" | "admin",
  "createdAt": "timestamp"
}
```

### `payments` Collection
```json
{
  "id": "string",
  "userId": "string",
  "userName": "Kasun Perera",
  "userRoom": "Room 101",
  "month": "August 2026",
  "amount": 15000,
  "slipUrl": "https://firebasestorage.googleapis.com/...",
  "transactionId": "TXN984210",
  "status": "pending" | "approved" | "rejected" | "excused",
  "ocrStatus": "valid" | "duplicate_warning",
  "adminNote": "Payment verified",
  "createdAt": "timestamp"
}
```

### `bills` Collection
```json
{
  "id": "string",
  "type": "Water" | "Electricity" | "Internet",
  "month": "August 2026",
  "amount": 4850,
  "description": "NWSDB Account #904812",
  "source": "webhook" | "manual",
  "createdAt": "timestamp"
}
```

---

## 🛠️ Installation & Local Setup

### 1. Install Dependencies
```bash
# Install frontend dependencies
npm install

# Install Cloud Functions dependencies
cd functions
npm install
cd ..
```

### 2. Configure Firebase Environment Variables
Rename `.env.example` to `.env` and fill in your Firebase credentials:
```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```
*(Note: If `.env` is omitted, the app runs in **Demo Mode** out of the box so you can immediately test all Admin/Student features).*

### 3. Run Application Locally
```bash
npm run dev
```

---

## ⚡ Firebase Cloud Functions Deployment

```bash
# Login to Firebase CLI
npx firebase-tools login

# Deploy Cloud Functions, Firestore Rules & Storage Rules
npx firebase-tools deploy
```

---

## 🔗 Target GitHub Repository & Pushing Instructions

Target Repository: `https://github.com/basithar/Bordim-payment-management-system.git`

```bash
git init
git add .
git commit -m "Initial commit: Completed Boarding House Management System with Firebase integration"
git branch -M main
git remote add origin https://github.com/basithar/Bordim-payment-management-system.git
git push -u origin main
```
