import { db } from "../utils/firebase.js";
import { collection, addDoc } from "firebase/firestore";

export async function addProduct(product) {
  await addDoc(collection(db, "products"), product);
}
