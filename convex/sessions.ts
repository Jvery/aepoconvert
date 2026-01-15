import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

/**
 * Get or create an anonymous session based on device fingerprint
 */
export const getOrCreate = mutation({
  args: {
    sessionId: v.string(),
    deviceFingerprint: v.string(),
  },
  handler: async (ctx, args) => {
    // Check if session already exists
    const existing = await ctx.db
      .query("sessions")
      .withIndex("by_sessionId", (q) => q.eq("sessionId", args.sessionId))
      .first();

    if (existing) {
      // Update last active time
      await ctx.db.patch(existing._id, {
        lastActiveAt: Date.now(),
      });
      return {
        sessionId: existing.sessionId,
        isNew: false,
      };
    }

    // Create new session
    const now = Date.now();
    await ctx.db.insert("sessions", {
      sessionId: args.sessionId,
      deviceFingerprint: args.deviceFingerprint,
      createdAt: now,
      lastActiveAt: now,
    });

    return {
      sessionId: args.sessionId,
      isNew: true,
    };
  },
});

/**
 * Update session's last active timestamp
 */
export const touch = mutation({
  args: {
    sessionId: v.string(),
  },
  handler: async (ctx, args) => {
    const session = await ctx.db
      .query("sessions")
      .withIndex("by_sessionId", (q) => q.eq("sessionId", args.sessionId))
      .first();

    if (session) {
      await ctx.db.patch(session._id, {
        lastActiveAt: Date.now(),
      });
    }
  },
});

/**
 * Get session by ID
 */
export const get = query({
  args: {
    sessionId: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("sessions")
      .withIndex("by_sessionId", (q) => q.eq("sessionId", args.sessionId))
      .first();
  },
});
