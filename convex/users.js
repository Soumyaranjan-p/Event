import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Store or update user from Clerk
export const store = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Called storeUser without authentication present");
    }

    // Check if user exists
    const existing = await ctx.db
      .query("users")
      .withIndex("by_token", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier)
      )
      .unique();

    if (existing) {
      // Update changed fields
      const updates = {};

      if (existing.name !== identity.name) {
        updates.name = identity.name || "Anonymous";
      }

      if (existing.email !== identity.email) {
        updates.email = identity.email || "";
      }

      if (existing.imageUrl !== identity.pictureUrl) {
        updates.imageUrl = identity.pictureUrl || "";
      }

      if (Object.keys(updates).length > 0) {
        updates.updatedAt = Date.now();
        await ctx.db.patch(existing._id, updates);
      }

      return existing._id;
    }

    // Create new user
    return await ctx.db.insert("users", {
      email: identity.email || "",
      tokenIdentifier: identity.tokenIdentifier,
      name: identity.name || "Anonymous",
      imageUrl: identity.pictureUrl || "",
      hasCompletedOnboarding: false,
      interests: [],
      freeEventsCreated: 0,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  },
});

// Get current user
export const getCurrentUser = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    return ctx.db
      .query("users")
      .withIndex("by_token", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier)
      )
      .unique();
  },
});

// Complete onboarding
export const completeOnboarding = mutation({
  args: {
    location: v.object({
      city: v.string(),
      state: v.optional(v.string()),
      country: v.string(),
    }),
    interests: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("User not authenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier)
      )
      .unique();

    if (!user) throw new Error("User not found");

    await ctx.db.patch(user._id, {
      location: args.location,
      interests: args.interests,
      hasCompletedOnboarding: true,
      updatedAt: Date.now(),
    });

    return user._id;
  },
});
