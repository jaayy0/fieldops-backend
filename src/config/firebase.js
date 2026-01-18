import admin from "firebase-admin";

admin.initializeApp(); // ADC (Cloud Run / local con env var)

const db = admin.firestore();
const serverTimestamp = admin.firestore.FieldValue.serverTimestamp;

export { db, serverTimestamp };
