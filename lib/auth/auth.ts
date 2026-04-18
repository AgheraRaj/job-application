import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { MongoClient } from "mongodb";
import { headers } from "next/headers";
import { initializeUserBoard } from "../init-user-board";

// Module-level singleton so the connection is reused across hot reloads
declare global {
  var _mongoClient: MongoClient | undefined;
}

function getMongoClient(): MongoClient {
  if (!process.env.MONGODB_URI) {
    throw new Error("MONGODB_URI environment variable is not set");
  }
  if (!global._mongoClient) {
    global._mongoClient = new MongoClient(process.env.MONGODB_URI);
  }
  return global._mongoClient;
}

const mongoClient = getMongoClient();

// better-auth needs a connected client — connect() is idempotent if already connected
await mongoClient.connect();

const db = mongoClient.db();

export const auth = betterAuth({
  database: mongodbAdapter(db),
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: process.env.BETTER_AUTH_URL ?? process.env.NEXT_PUBLIC_BETTER_AUTH_URL,
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 60 * 60,
    },
  },
  emailAndPassword: {
    enabled: true,
  },
  databaseHooks: {
    user: {
      create: {
        after: async (user) => {
          if (user.id) {
            await initializeUserBoard(user.id);
          }
        },
      },
    },
  },
});

export async function getSession() {
  const result = await auth.api.getSession({
    headers: await headers(),
  });

  return result;
}