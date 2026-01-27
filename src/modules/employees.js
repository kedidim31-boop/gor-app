import { db } from "../utils/firebase.js";
import { collection, addDoc } from "firebase/firestore";

export async function addEmployee(name, role, email) {
  await addDoc(collection(db, "users"), {
    name,
    role,
    email,
    status: "active"
  });
}
