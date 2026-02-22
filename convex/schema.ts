import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

const entryType = v.union(
  v.literal("task"),
  v.literal("note"),
  v.literal("link"),
  v.literal("snippet"),
  v.literal("secret"),
);

const taskStatus = v.union(
  v.literal("todo"),
  v.literal("in_progress"),
  v.literal("done"),
);

const taskPriority = v.union(
  v.literal("low"),
  v.literal("medium"),
  v.literal("high"),
);

export default defineSchema({
  notes: defineTable({
    content: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_updatedAt", ["updatedAt"]),

  profiles: defineTable({
    name: v.string(),
    key: v.string(),
    description: v.string(),
    isActive: v.boolean(),
    order: v.number(),
  })
    .index("by_key", ["key"])
    .index("by_isActive", ["isActive"])
    .index("by_order", ["order"]),

  entries: defineTable({
    profileId: v.id("profiles"),
    project: v.optional(v.string()),
    type: entryType,
    title: v.string(),
    content: v.optional(v.string()),
    status: v.optional(taskStatus),
    priority: v.optional(taskPriority),
    dueAt: v.optional(v.number()),
    blocked: v.optional(v.boolean()),
    blockedReason: v.optional(v.string()),
    carryOver: v.boolean(),
    tags: v.array(v.string()),
    archivedAt: v.optional(v.number()),
    completedAt: v.optional(v.number()),
  })
    .index("by_profile", ["profileId"])
    .index("by_profile_and_type", ["profileId", "type"])
    .index("by_profile_and_status", ["profileId", "status"])
    .index("by_profile_and_dueAt", ["profileId", "dueAt"])
    .index("by_profile_and_carryOver", ["profileId", "carryOver"])
    .index("by_profile_and_archived", ["profileId", "archivedAt"]),

  entryActivity: defineTable({
    entryId: v.id("entries"),
    profileId: v.id("profiles"),
    eventType: v.string(),
    note: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_entry", ["entryId"])
    .index("by_profile_and_createdAt", ["profileId", "createdAt"]),
});
