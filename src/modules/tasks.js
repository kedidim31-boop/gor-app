import { db } from "../utils/firebase.js";
import { collection, addDoc } from "firebase/firestore";

export async function addTask(title, description, assignedTo) {
  await addDoc(collection(db, "tasks"), {
    title,
    description,
    status: "open",
    assignedTo
  });
}
