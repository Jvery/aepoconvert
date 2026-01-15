import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // Anonymous sessions - device-based identification
  sessions: defineTable({
    sessionId: v.string(),
    deviceFingerprint: v.string(),
    createdAt: v.number(),
    lastActiveAt: v.number(),
  }).index("by_sessionId", ["sessionId"]),

  // User preferences - quality settings synced across tabs
  preferences: defineTable({
    sessionId: v.string(),
    qualityMode: v.union(v.literal("simple"), v.literal("advanced")),
    defaultQuality: v.number(),
    defaultBitrate: v.optional(v.number()),
    defaultSampleRate: v.optional(v.number()),
    updatedAt: v.number(),
  }).index("by_sessionId", ["sessionId"]),
});
