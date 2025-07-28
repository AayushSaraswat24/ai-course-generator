// function to clear redis data only for development.

import { redis } from "@/lib/redis"; // your existing redis client

export async function cleanYouTubeKeys() {
  const prefix = "yt:";

  // Scan Redis keys with prefix (Upstash supports SCAN with cursor)
  let cursor = 0;
  let totalDeleted = 0;

  do {
    const response = await redis.scan(cursor, {
      match: `${prefix}*`,
      count: 100,
    });

    cursor = Number(response[0]);
    const keys: string[] = response[1];

    if (keys.length > 0) {
      // Delete all matched keys
      await Promise.all(keys.map((key) => redis.del(key)));
      totalDeleted += keys.length;
      console.log(`Deleted ${keys.length} keys:`, keys);
    }

  } while (cursor !== 0);

  console.log(`✅ Finished. Total keys deleted: ${totalDeleted}`);
}

cleanYouTubeKeys().catch((err) => {
  console.error("❌ Error cleaning Redis:", err);
});
