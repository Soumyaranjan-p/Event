import { internal } from "./_generated/api";
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Create a new event
export const createEvent = mutation({
  args: {
    title: v.string(),
    description: v.string(),
    category: v.string(),
    tags: v.array(v.string()),
    startDate: v.number(),
    endDate: v.number(),
    timezone: v.string(),
    locationType: v.union(v.literal("physical"), v.literal("online")),
    venue: v.optional(v.string()),
    address: v.optional(v.string()),
    city: v.string(),
    state: v.optional(v.string()),
    country: v.string(),
    capacity: v.number(),
    ticketType: v.union(v.literal("free"), v.literal("paid")),
    ticketPrice: v.optional(v.number()),
    coverImage: v.optional(v.string()),
    themeColor: v.optional(v.string()),
  },

  handler: async (ctx, args) => {
    try {
      const user = await ctx.runQuery(internal.users.getCurrentUser);
      if (!user) throw new Error("User not found");

      // FREE LIMIT: Only 1 free event per user
      if (args.ticketType === "free" && user.freeEventsCreated >= 1) {
        throw new Error(
          "Your free event limit is reached. Please upgrade to create more events."
        );
      }

      // Default theme color for users without customization
      const defaultColor = "#1e3a8a";
      const themeColor = args.themeColor ?? defaultColor;

      // Generate slug from title
      const slug = args.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");

      // Create event
      const eventId = await ctx.db.insert("events", {
        ...args,
        themeColor,
        slug: `${slug}-${Date.now()}`,
        organizerId: user._id,
        organizerName: user.name,
        registrationCount: 0,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });

      // Increment free event counter ONLY for free events
      if (args.ticketType === "free") {
        await ctx.db.patch(user._id, {
          freeEventsCreated: user.freeEventsCreated + 1,
          updatedAt: Date.now(),
        });
      }

      return eventId;
    } catch (error) {
      throw new Error(`Failed to create event: ${error.message}`);
    }
  },
});

// Get event by slug
export const getEventBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    return ctx.db
      .query("events")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .unique();
  },
});

// Get events created by logged-in user
export const getMyEvents = query({
  handler: async (ctx) => {
    const user = await ctx.runQuery(internal.users.getCurrentUser);
    if (!user) return [];

    return ctx.db
      .query("events")
      .withIndex("by_organizer", (q) => q.eq("organizerId", user._id))
      .order("desc")
      .collect();
  },
});

// Delete event
export const deleteEvent = mutation({
  args: { eventId: v.id("events") },

  handler: async (ctx, args) => {
    const user = await ctx.runQuery(internal.users.getCurrentUser);
    if (!user) throw new Error("User not found");

    const event = await ctx.db.get(args.eventId);
    if (!event) throw new Error("Event not found");

    // Verify organizer
    if (event.organizerId !== user._id) {
      throw new Error("You are not authorized to delete this event");
    }

    // Delete related registrations
    const registrations = await ctx.db
      .query("registrations")
      .withIndex("by_event", (q) => q.eq("eventId", args.eventId))
      .collect();

    for (const reg of registrations) {
      await ctx.db.delete(reg._id);
    }

    // Delete event
    await ctx.db.delete(args.eventId);

    // If this was a free event, refund free event count
    if (event.ticketType === "free" && user.freeEventsCreated > 0) {
      await ctx.db.patch(user._id, {
        freeEventsCreated: user.freeEventsCreated - 1,
        updatedAt: Date.now(),
      });
    }

    return { success: true };
  },
});
