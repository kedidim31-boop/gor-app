import { db } from "../utils/firebase.js";
import { collection, addDoc } from "firebase/firestore";

let activeTimer = null;

export function startTimer(userId) {
  activeTimer = { userId, start: Date.now() };
}

export async function stopTimer() {
  if (!activeTimer) return;
  const duration = Date.now() - activeTimer.start;
  await addDoc(collection(db, "timeLogs"), {
    userId: activeTimer.userId,
    start: activeTimer.start,
    stop: Date.now(),
    duration
  });
  activeTimer = null;
}
