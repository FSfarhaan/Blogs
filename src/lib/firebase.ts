import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

function getFirebaseApp() {
  const existingApp = getApps()[0];

  if (existingApp) {
    return existingApp;
  }

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");

  if (projectId && clientEmail && privateKey) {
    return initializeApp({
      credential: cert({
        projectId,
        clientEmail,
        privateKey,
      }),
    });
  }

  if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    return initializeApp({
      projectId,
    });
  }

  throw new Error(
    "Firebase Admin is not configured. Set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY.",
  );
}

export function getFirestoreDb() {
  return getFirestore(getFirebaseApp());
}

export function getSubscribersCollection() {
  return getFirestoreDb().collection("subscribers");
}

export function getAdminOtpCollection() {
  return getFirestoreDb().collection("adminOtps");
}

export function getPostNotificationCollection() {
  return getFirestoreDb().collection("postNotifications");
}

export function getBlogContentCacheCollection() {
  return getFirestoreDb().collection("blogContentCache");
}

export async function getSubscriberEmails() {
  const snapshot = await getSubscribersCollection().get();

  return snapshot.docs
    .map((doc) => doc.data().email)
    .filter((email): email is string => typeof email === "string")
    .map((email) => email.trim().toLowerCase());
}
