import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";

const noteValidator = v.object({
  _id: v.id("notes"),
  _creationTime: v.number(),
  content: v.string(),
  createdAt: v.number(),
  updatedAt: v.number(),
});

export const list = query({
  args: {},
  returns: v.array(noteValidator),
  handler: async (ctx) => {
    return await ctx.db
      .query("notes")
      .withIndex("by_updatedAt")
      .order("desc")
      .collect();
  },
});

export const create = mutation({
  args: {
    content: v.optional(v.string()),
  },
  returns: v.id("notes"),
  handler: async (ctx, args) => {
    const now = Date.now();
    return await ctx.db.insert("notes", {
      content: args.content ?? "",
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const update = mutation({
  args: {
    noteId: v.id("notes"),
    content: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const note = await ctx.db.get(args.noteId);
    if (!note) {
      throw new ConvexError("Note not found.");
    }

    await ctx.db.patch(args.noteId, {
      content: args.content,
      updatedAt: Date.now(),
    });

    return null;
  },
});
