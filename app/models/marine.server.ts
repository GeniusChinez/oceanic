import { prisma } from "~/db.server";
import { mongo } from "~/db2.server"

import { redis } from "./redis.server";

export async function getMarineObservations() {
  const data = await mongo.elementData.findMany();
  console.log("data:", data);
  return [ // dummy. Do some elements stuff here
    {
      id: "obs_001",
      date: "2025-06-15",
      location: "41.386° N, 2.170° E",
      species: "Bluefin Tuna",
      temperature: 19.2,
      salinity: 34.5
    }
  ]
}

const mysqlClient = prisma;
const mongoClient = mongo;

/**
 * Get all marine data ElementData points within bounding box coordinates
 * and optionally filter by Element ID.
 */
export async function getElementDataByBoundingBox(
  args: {
    latMin?: number,
    latMax?: number,
    longMin?: number,
    longMax?: number,
    elementId?: number
  }
) {
  const { latMin, latMax, longMin, longMax, elementId } = args;

  // Build a cache key string based on arguments (must be unique per query)
  const cacheKey = `elementData:${latMin ?? "null"}:${latMax ?? "null"}:${longMin ?? "null"}:${longMax ?? "null"}:${elementId ?? "all"}`;

  // Try to get cached data first
  const cached = await redis.get(cacheKey);
  if (cached) {
    return JSON.parse(cached) as {
      elementId: number;
      latitude: number;
      longitude: number;
      value: number;
      timestamp: Date;
      fileId: number;
      user: {
        id: number;
        email: string;
        fullName: string | null;
      } | undefined;
    }[];
  }

  // Cache miss: query MongoDB and MySQL
  const results = await mongoClient.elementData.findMany({
    where: {
      latitude: {
        gte: latMin,
        lte: latMax,
      },
      longitude: {
        gte: longMin,
        lte: longMax,
      },
      ...(elementId !== undefined ? { elementId } : {})
    },
    select: {
      elementId: true,
      latitude: true,
      longitude: true,
      value: true,
      timestamp: true,
      fileId: true,
    },
    orderBy: {
      timestamp: "desc"
    }
  });

  const files = await mysqlClient.file.findMany({
    where: {
      id: {
        in: results.map((d) => d.fileId)
      },
    },
    select: {
      id: true,
      user: {
        select: {
          id: true,
          fullName: true,
          email: true
        }
      }
    }
  });

  const data = results.map((d) => ({
    ...d,
    user: files.find((f) => f.id === d.fileId)?.user
  }));

  // Store in Redis cache (expire in 5 minutes)
  await redis.set(cacheKey, JSON.stringify(data), "EX", 300);

  return data;
}

/**
 * Get all files uploaded by a specific user.
 */
export async function getFilesByUser(userId: number) {
  return mysqlClient.file.findMany({
    where: { userId },
  });
}

/**
 * Get user by username or email
 */
export async function getUserByUsernameOrEmail(identifier: string) {
  return mysqlClient.user.findFirst({
    where: {
      email: identifier
    },
  });
}

/**
 * Get elements for a given category
 */
export async function getElementsByCategory(categoryId: number) {
  return mysqlClient.element.findMany({
    where: { categoryId },
  });
}

/**
 * Get metadata summary for files overlapping a given coordinate
 */
export async function getFilesOverlappingCoordinate(latitude: number, longitude: number) {
  return mysqlClient.file.findMany({
    where: {
      lattMin: { lte: latitude },
      lattMax: { gte: latitude },
      longMin: { lte: longitude },
      longMax: { gte: longitude },
    },
  });
}

/**
 * Create a new ElementData point
 */
export async function createElementDataPoint(data: {
  elementId: number;
  fileId: number;
  value: number;
  latitude: number;
  longitude: number;
  timestamp?: Date;
}) {
  return mongoClient.elementData.create({
    data: {
      ...data,
      timestamp: data.timestamp ?? new Date(),
    },
  });
}

/**
 * Create a new File entry for an uploaded data file
 */
export async function createFileEntry(data: {
  userId: number;
  uploadTime?: Date;
  lattMin: number;
  lattMax: number;
  longMin: number;
  longMax: number;
}) {
  return mysqlClient.file.create({
    data: {
      ...data,
      uploadTime: data.uploadTime ?? new Date(),
    },
  });
}

export async function closeClients() {
  await mysqlClient.$disconnect();
  await mongoClient.$disconnect();
}
