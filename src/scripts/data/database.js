import { openDB } from "idb";

const DATABASE_NAME = "story-app-database";
const DATABASE_VERSION = 1;
const OBJECT_STORE_NAME = "stories";

const dbPromise = openDB(DATABASE_NAME, DATABASE_VERSION, {
  upgrade(db) {
    if (!db.objectStoreNames.contains(OBJECT_STORE_NAME)) {
      db.createObjectStore(OBJECT_STORE_NAME, {
        keyPath: "id",
        autoIncrement: true,
      });
    }
  },
});

const Database = {
  async putStory(story) {
    return (await dbPromise).put(OBJECT_STORE_NAME, story);
  },

  async getAllStories() {
    return (await dbPromise).getAll(OBJECT_STORE_NAME);
  },

  async getStoryById(id) {
    return (await dbPromise).get(OBJECT_STORE_NAME, id);
  },

  async deleteStory(id) {
    return (await dbPromise).delete(OBJECT_STORE_NAME, id);
  },

  async saveStories(stories) {
    const db = await dbPromise;
    const tx = db.transaction(OBJECT_STORE_NAME, "readwrite");
    const store = tx.objectStore(OBJECT_STORE_NAME);

    // Bersihkan data lama
    await store.clear();

    // Simpan semua cerita baru
    for (const story of stories) {
      await store.put(story);
    }

    await tx.done;
  },
};

export default Database;
