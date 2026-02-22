import { v } from "convex/values";
import { internalMutation, query } from "./_generated/server";

const activityValidator = v.object({
  _id: v.id("entryActivity"),
  _creationTime: v.number(),
  entryId: v.id("entries"),
  profileId: v.id("profiles"),
  eventType: v.string(),
  note: v.optional(v.string()),
  createdAt: v.number(),
});

export const log = internalMutation({
  args: {
    entryId: v.id("entries"),
    profileId: v.id("profiles"),
    eventType: v.string(),
    note: v.optional(v.string()),
  },
  returns: v.id("entryActivity"),
  handler: async (ctx, args) => {
    return await ctx.db.insert("entryActivity", {
      entryId: args.entryId,
      profileId: args.profileId,
      eventType: args.eventType,
      note: args.note,
      createdAt: Date.now(),
    });
  },
});

export const listByEntry = query({
  args: {
    entryId: v.id("entries"),
    limit: v.optional(v.number()),
  },
  returns: v.array(activityValidator),
  handler: async (ctx, args) => {
    const limit = args.limit ?? 20;
    return await ctx.db
      .query("entryActivity")
      .withIndex("by_entry", (q) => q.eq("entryId", args.entryId))
      .order("desc")
      .take(limit);
  },
});
