import invariant from "tiny-invariant";

import { PrismaClient } from "../generated/mongo-client";

import { singleton } from "./singleton.server";

// Unique key for the mongo client instance
const mongo = singleton("mongo", getMongoClient);

function getMongoClient() {
  const { MONGODB_URL } = process.env;
  invariant(typeof MONGODB_URL === "string", "MONGODB_URL env var not set");

  const databaseUrl = new URL(MONGODB_URL);

  const isLocalHost = databaseUrl.hostname === "localhost";

  const PRIMARY_REGION = isLocalHost ? null : process.env.PRIMARY_REGION;
  const FLY_REGION = isLocalHost ? null : process.env.FLY_REGION;

  const isReadReplicaRegion = !PRIMARY_REGION || PRIMARY_REGION === FLY_REGION;

  if (!isLocalHost) {
    if (databaseUrl.host.endsWith(".internal")) {
      databaseUrl.host = `${FLY_REGION}.${databaseUrl.host}`;
    }

    // NOTE: MongoDB doesn't have replica port switching like Postgres (5433), so just log info.
    if (!isReadReplicaRegion) {
      console.log("📡 using MongoDB in read-replica region");
    }
  }

  console.log(`🍃 setting up mongo client to ${databaseUrl.host}`);

  const client = new PrismaClient({
    datasources: {
      mongodb: {
        url: databaseUrl.toString(),
      },
    },
  });

  client.$connect();

  return client;
}

export { mongo };
