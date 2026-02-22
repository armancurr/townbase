import type { GenericMutationCtx } from "convex/server";
import { ConvexError, v } from "convex/values";
import type { DataModel, Id } from "./_generated/dataModel";
import { mutation, query } from "./_generated/server";

type MutationCtx = GenericMutationCtx<DataModel>;

const entryTypeValidator = v.union(
  v.literal("task"),
  v.literal("note"),
  v.literal("link"),
  v.literal("snippet"),
  v.literal("secret"),
);

const taskStatusValidator = v.union(
  v.literal("todo"),
  v.literal("in_progress"),
  v.literal("done"),
);

const taskPriorityValidator = v.union(
  v.literal("low"),
  v.literal("medium"),
  v.literal("high"),
);

const entryValidator = v.object({
  _id: v.id("entries"),
  _creationTime: v.number(),
  profileId: v.id("profiles"),
  project: v.optional(v.string()),
  type: entryTypeValidator,
  title: v.string(),
  content: v.optional(v.string()),
  status: v.optional(taskStatusValidator),
  priority: v.optional(taskPriorityValidator),
  dueAt: v.optional(v.number()),
  blocked: v.optional(v.boolean()),
  blockedReason: v.optional(v.string()),
  carryOver: v.boolean(),
  tags: v.array(v.string()),
  archivedAt: v.optional(v.number()),
  completedAt: v.optional(v.number()),
});

const todayPayloadValidator = v.object({
  carryOver: v.array(entryValidator),
  overdue: v.array(entryValidator),
  dueToday: v.array(entryValidator),
  quickWins: v.array(entryValidator),
});

export const listByProfile = query({
  args: {
    profileId: v.id("profiles"),
    includeArchived: v.optional(v.boolean()),
  },
  returns: v.array(entryValidator),
  handler: async (ctx, args) => {
    const includeArchived = args.includeArchived ?? false;

    if (includeArchived) {
      return await ctx.db
        .query("entries")
        .withIndex("by_profile", (q) => q.eq("profileId", args.profileId))
        .order("desc")
        .collect();
    }

    return await ctx.db
      .query("entries")
      .withIndex("by_profile", (q) => q.eq("profileId", args.profileId))
      .filter((q) => q.eq(q.field("archivedAt"), undefined))
      .order("desc")
      .collect();
  },
});

export const listByType = query({
  args: {
    profileId: v.id("profiles"),
    type: entryTypeValidator,
  },
  returns: v.array(entryValidator),
  handler: async (ctx, args) => {
    return await ctx.db
      .query("entries")
      .withIndex("by_profile", (q) => q.eq("profileId", args.profileId))
      .filter((q) =>
        q.and(
          q.eq(q.field("type"), args.type),
          q.eq(q.field("archivedAt"), undefined),
        ),
      )
      .order("desc")
      .collect();
  },
});

export const today = query({
  args: {
    profileId: v.id("profiles"),
    now: v.number(),
  },
  returns: todayPayloadValidator,
  handler: async (ctx, args) => {
    const allTasks = await ctx.db
      .query("entries")
      .withIndex("by_profile", (q) => q.eq("profileId", args.profileId))
      .filter((q) =>
        q.and(
          q.eq(q.field("type"), "task"),
          q.eq(q.field("archivedAt"), undefined),
        ),
      )
      .collect();

    const activeTasks = allTasks.filter((task) => task.status !== "done");

    const startOfDay = new Date(args.now);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(startOfDay);
    endOfDay.setDate(endOfDay.getDate() + 1);

    const carryOver = activeTasks.filter((task) => task.carryOver);
    const overdue = activeTasks.filter(
      (task) =>
        typeof task.dueAt === "number" &&
        task.dueAt < startOfDay.getTime() &&
        !task.carryOver,
    );
    const dueToday = activeTasks.filter(
      (task) =>
        typeof task.dueAt === "number" &&
        task.dueAt >= startOfDay.getTime() &&
        task.dueAt < endOfDay.getTime(),
    );

    const quickWins = activeTasks
      .filter((task) => task.priority === "low" && !task.blocked)
      .slice(0, 3);

    return {
      carryOver,
      overdue,
      dueToday,
      quickWins,
    };
  },
});

export const create = mutation({
  args: {
    profileId: v.id("profiles"),
    project: v.optional(v.string()),
    type: entryTypeValidator,
    title: v.string(),
    content: v.optional(v.string()),
    status: v.optional(taskStatusValidator),
    priority: v.optional(taskPriorityValidator),
    dueAt: v.optional(v.number()),
    blocked: v.optional(v.boolean()),
    blockedReason: v.optional(v.string()),
    carryOver: v.boolean(),
    tags: v.optional(v.array(v.string())),
  },
  returns: v.id("entries"),
  handler: async (ctx, args) => {
    if (args.title.trim().length === 0) {
      throw new ConvexError("Entry title cannot be empty.");
    }

    const entryId = await ctx.db.insert("entries", {
      profileId: args.profileId,
      project: args.project,
      type: args.type,
      title: args.title.trim(),
      content: args.content,
      status: args.type === "task" ? (args.status ?? "todo") : undefined,
      priority: args.priority,
      dueAt: args.dueAt,
      blocked: args.blocked ?? false,
      blockedReason: args.blockedReason,
      carryOver: args.carryOver,
      tags: args.tags ?? [],
    });

    await logActivity(ctx, {
      entryId,
      profileId: args.profileId,
      eventType: "created",
    });

    return entryId;
  },
});

export const update = mutation({
  args: {
    entryId: v.id("entries"),
    title: v.optional(v.string()),
    content: v.optional(v.string()),
    status: v.optional(taskStatusValidator),
    priority: v.optional(taskPriorityValidator),
    dueAt: v.optional(v.number()),
    blocked: v.optional(v.boolean()),
    blockedReason: v.optional(v.string()),
    carryOver: v.optional(v.boolean()),
    tags: v.optional(v.array(v.string())),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const entry = await ctx.db.get(args.entryId);
    if (!entry) {
      throw new ConvexError("Entry not found.");
    }

    await ctx.db.patch(args.entryId, {
      title: args.title,
      content: args.content,
      status: args.status,
      priority: args.priority,
      dueAt: args.dueAt,
      blocked: args.blocked,
      blockedReason: args.blockedReason,
      carryOver: args.carryOver,
      tags: args.tags,
    });

    await logActivity(ctx, {
      entryId: args.entryId,
      profileId: entry.profileId,
      eventType: "updated",
    });

    return null;
  },
});

export const archive = mutation({
  args: {
    entryId: v.id("entries"),
    archived: v.boolean(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const entry = await ctx.db.get(args.entryId);
    if (!entry) {
      throw new ConvexError("Entry not found.");
    }

    await ctx.db.patch(args.entryId, {
      archivedAt: args.archived ? Date.now() : undefined,
    });

    await logActivity(ctx, {
      entryId: args.entryId,
      profileId: entry.profileId,
      eventType: args.archived ? "archived" : "unarchived",
    });

    return null;
  },
});

export const completeTask = mutation({
  args: {
    entryId: v.id("entries"),
    done: v.boolean(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const entry = await ctx.db.get(args.entryId);
    if (!entry) {
      throw new ConvexError("Task not found.");
    }
    if (entry.type !== "task") {
      throw new ConvexError("Only task entries can be completed.");
    }

    await ctx.db.patch(args.entryId, {
      status: args.done ? "done" : "todo",
      completedAt: args.done ? Date.now() : undefined,
      carryOver: false,
      blocked: false,
      blockedReason: undefined,
    });

    await logActivity(ctx, {
      entryId: args.entryId,
      profileId: entry.profileId,
      eventType: args.done ? "completed" : "reopened",
    });

    return null;
  },
});

export const deferTask = mutation({
  args: {
    entryId: v.id("entries"),
    days: v.optional(v.number()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const entry = await ctx.db.get(args.entryId);
    if (!entry) {
      throw new ConvexError("Task not found.");
    }
    if (entry.type !== "task") {
      throw new ConvexError("Only task entries can be deferred.");
    }

    const days = Math.max(1, args.days ?? 1);
    const nextDueAt = Date.now() + days * 24 * 60 * 60 * 1000;

    await ctx.db.patch(args.entryId, {
      dueAt: nextDueAt,
      carryOver: true,
      status: entry.status === "done" ? "todo" : entry.status,
    });

    await logActivity(ctx, {
      entryId: args.entryId,
      profileId: entry.profileId,
      eventType: "deferred",
      note: `${days} day defer`,
    });

    return null;
  },
});

export const setBlocked = mutation({
  args: {
    entryId: v.id("entries"),
    blocked: v.boolean(),
    blockedReason: v.optional(v.string()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const entry = await ctx.db.get(args.entryId);
    if (!entry) {
      throw new ConvexError("Task not found.");
    }
    if (entry.type !== "task") {
      throw new ConvexError("Only task entries can be blocked.");
    }

    await ctx.db.patch(args.entryId, {
      blocked: args.blocked,
      blockedReason: args.blocked ? args.blockedReason : undefined,
      status: args.blocked ? "in_progress" : entry.status,
    });

    await logActivity(ctx, {
      entryId: args.entryId,
      profileId: entry.profileId,
      eventType: args.blocked ? "blocked" : "unblocked",
      note: args.blockedReason,
    });

    return null;
  },
});

async function logActivity(
  ctx: MutationCtx,
  args: {
    entryId: Id<"entries">;
    profileId: Id<"profiles">;
    eventType: string;
    note?: string;
  },
) {
  await ctx.db.insert("entryActivity", {
    entryId: args.entryId,
    profileId: args.profileId,
    eventType: args.eventType,
    note: args.note,
    createdAt: Date.now(),
  });
}
