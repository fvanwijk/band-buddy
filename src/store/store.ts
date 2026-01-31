import { createStore } from "tinybase";
import { createLocalPersister } from "tinybase/persisters/persister-browser";

// Create the store
export const store = createStore();

// Create persister for localStorage
export const persister = createLocalPersister(store, "gig-buddy-store");

// Initialize and persist
export async function initializeStore() {
  // Try to load from localStorage first
  await persister.load();

  // Start auto-save
  await persister.startAutoSave();
}
