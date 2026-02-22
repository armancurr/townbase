import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

const profileValidator = v.object({
  _id: v.id("profiles"),
  _creationTime: v.number(),
  name: v.string(),
  key: v.string(),
  description: v.string(),
  isActive: v.boolean(),
  order: v.number(),
});

export const list = query({
  args: {},
  returns: v.array(profileValidator),
  handler: async (ctx) => {
    return await ctx.db.query("profiles").withIndex("by_order").collect();
  },
});

export const getActive = query({
  args: {},
  returns: v.union(profileValidator, v.null()),
  handler: async (ctx) => {
    const active = await ctx.db
      .query("profiles")
      .withIndex("by_isActive", (q) => q.eq("isActive", true))
      .first();

    return active ?? null;
  },
});

export const setActive = mutation({
  args: { profileId: v.id("profiles") },
  returns: v.null(),
  handler: async (ctx, args) => {
    const profiles = await ctx.db.query("profiles").collect();
    await Promise.all(
      profiles.map((profile) =>
        ctx.db.patch(profile._id, {
          isActive: profile._id === args.profileId,
        }),
      ),
    );
    return null;
  },
});

export const bootstrapPrototype = mutation({
  args: {},
  returns: v.object({
    activeProfileId: v.id("profiles"),
  }),
  handler: async (ctx) => {
    const existingProfiles = await ctx.db.query("profiles").collect();

    if (existingProfiles.length > 0) {
      const activeProfile = existingProfiles.find(
        (profile) => profile.isActive,
      );
      if (activeProfile) {
        return { activeProfileId: activeProfile._id };
      }
      const firstProfile = existingProfiles[0];
      await ctx.db.patch(firstProfile._id, { isActive: true });
      return { activeProfileId: firstProfile._id };
    }

    const workProfileId = await ctx.db.insert("profiles", {
      name: "Work",
      key: "work",
      description: "Client projects and team delivery",
      isActive: true,
      order: 0,
    });

    const personalProfileId = await ctx.db.insert("profiles", {
      name: "Personal",
      key: "personal",
      description: "Life admin and personal routines",
      isActive: false,
      order: 1,
    });

    await ctx.db.insert("entries", {
      profileId: workProfileId,
      type: "task",
      title: "Update client staging environment",
      content: "Quick patch and smoke test before standup.",
      status: "todo",
      priority: "high",
      dueAt: Date.now() + 1000 * 60 * 90,
      blocked: false,
      carryOver: true,
      tags: ["client", "infra"],
    });

    await ctx.db.insert("entries", {
      profileId: workProfileId,
      type: "task",
      title: "Investigate JWT issue in auth module",
      content: "Pair with Priya and unblock team deadline.",
      status: "in_progress",
      priority: "high",
      dueAt: Date.now() + 1000 * 60 * 60 * 6,
      blocked: true,
      blockedReason: "Token signature mismatch",
      carryOver: true,
      tags: ["auth", "team"],
    });

    await ctx.db.insert("entries", {
      profileId: workProfileId,
      type: "note",
      title: "Client API migration notes",
      content: "Remember to rotate key after endpoint verification.",
      carryOver: false,
      tags: ["client", "api"],
    });

    await ctx.db.insert("entries", {
      profileId: personalProfileId,
      type: "task",
      title: "Order the book from last week's note",
      status: "todo",
      priority: "medium",
      carryOver: false,
      blocked: false,
      tags: ["reading"],
    });

    await ctx.db.insert("entries", {
      profileId: personalProfileId,
      type: "note",
      title: "Weekend itinerary",
      content: "Saturday morning trail, lunch at Cedar Cafe, evening movie.",
      carryOver: false,
      tags: ["weekend"],
    });

    return { activeProfileId: workProfileId };
  },
});
