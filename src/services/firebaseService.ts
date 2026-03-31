import { 
  collection, 
  addDoc, 
  serverTimestamp, 
  query, 
  orderBy, 
  onSnapshot,
  doc,
  getDoc,
  setDoc
} from 'firebase/firestore';
import { db, auth } from '../firebase';
import { Activity, Message } from '../types';
import { MOCK_ACTIVITIES } from '../mockData';

/**
 * Seed the database with initial mock activities if it's empty.
 */
export const seedDatabase = async () => {
  if (!auth.currentUser || auth.currentUser.email !== 'sharmaarnav5662@gmail.com') return;

  try {
    for (const activity of MOCK_ACTIVITIES) {
      const { id, ...data } = activity;
      await setDoc(doc(db, 'activities', id), {
        ...data,
        authorUid: auth.currentUser.uid,
        createdAt: serverTimestamp()
      }, { merge: true });
    }
    console.log("Database seeded successfully");
  } catch (error) {
    console.error("Error seeding database:", error);
    throw error;
  }
};

/**
 * Send a message to an activity chat
 */
export const sendMessage = async (activityId: string, text: string, senderName: string) => {
  if (!auth.currentUser) throw new Error("Must be logged in to send messages");

  try {
    const messagesCol = collection(db, 'activities', activityId, 'messages');
    await addDoc(messagesCol, {
      text,
      sender: senderName,
      senderUid: auth.currentUser.uid,
      timestamp: serverTimestamp(),
      activityId
    });
  } catch (error) {
    console.error("Error sending message:", error);
    throw error;
  }
};
