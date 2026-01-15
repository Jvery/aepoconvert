import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Default preferences
const DEFAULT_PREFERENCES = {
  qualityMode: "simple" as const,
  defaultQuality: 80,
  defaultBitrate: undefined,
  defaultSampleRate: undefined,
};

/**
 * Get preferences for a session, returns defaults if none exist
 */
export const get = query({
  args: {
    sessionId: v.string(),
  },
  handler: async (ctx, args) => {
    const prefs = await ctx.db
      .query("preferences")
      .withIndex("by_sessionId", (q) => q.eq("sessionId", args.sessionId))
      .first();

    if (!prefs) {
      return {
        ...DEFAULT_PREFERENCES,
        sessionId: args.sessionId,
        updatedAt: Date.now(),
      };
    }

    return {
      sessionId: prefs.sessionId,
      qualityMode: prefs.qualityMode,
      defaultQuality: prefs.defaultQuality,
      defaultBitrate: prefs.defaultBitrate,
      defaultSampleRate: prefs.defaultSampleRate,
      updatedAt: prefs.updatedAt,
    };
  },
});

/**
 * Upsert preferences for a session
 */
export const upsert = mutation({
  args: {
    sessionId: v.string(),
    qualityMode: v.optional(v.union(v.literal("simple"), v.literal("advanced"))),
    defaultQuality: v.optional(v.number()),
    defaultBitrate: v.optional(v.number()),
    defaultSampleRate: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("preferences")
      .withIndex("by_sessionId", (q) => q.eq("sessionId", args.sessionId))
      .first();

    const now = Date.now();

    if (existing) {
      // Update existing preferences
      await ctx.db.patch(existing._id, {
        ...(args.qualityMode !== undefined && { qualityMode: args.qualityMode }),
        ...(args.defaultQuality !== undefined && { defaultQuality: args.defaultQuality }),
        ...(args.defaultBitrate !== undefined && { defaultBitrate: args.defaultBitrate }),
        ...(args.defaultSampleRate !== undefined && { defaultSampleRate: args.defaultSampleRate }),
        updatedAt: now,
      });

      return { updated: true };
    }

    // Create new preferences
    await ctx.db.insert("preferences", {
      sessionId: args.sessionId,
      qualityMode: args.qualityMode ?? DEFAULT_PREFERENCES.qualityMode,
      defaultQuality: args.defaultQuality ?? DEFAULT_PREFERENCES.defaultQuality,
      defaultBitrate: args.defaultBitrate,
      defaultSampleRate: args.defaultSampleRate,
      updatedAt: now,
    });

    return { created: true };
  },
});
