import { MongoClient, ServerApiVersion } from "mongodb";
import { getRequiredEnv } from "@/lib/env";

const MONGODB_URI = getRequiredEnv("MONGODB_URI");
const MONGODB_DB_NAME = process.env.MONGODB_DB_NAME?.trim() || undefined;

let mongoClientPromise: Promise<MongoClient> | null = null;

function createMongoClient() {
  return new MongoClient(MONGODB_URI, {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
    },
  });
}

export function getMongoClient() {
  if (!mongoClientPromise) {
    const client = createMongoClient();
    mongoClientPromise = client.connect();
  }

  return mongoClientPromise;
}

export async function getMongoDb() {
  const client = await getMongoClient();

  if (MONGODB_DB_NAME) {
    return client.db(MONGODB_DB_NAME);
  }

  return client.db();
}
