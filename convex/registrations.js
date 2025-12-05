import { internal } from "./_generated/api";
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Generate unique QR code for tickets
function generateQRCode() {
  return `EVT-${Date.now()}-${Math.random()
    .toString(36)
    .substr(2, 9)
    .toUpperCase()}`;
}

/* -----------------------------------------
   REGISTER FOR EVENT
----------------------------------------- */
export const registerForEvent = mutation({
  args: {
    eventId: v.id("events"),
    attendeeName: v.string(),
    attendeeEmail: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.runQuery(internal.users.getCurrentUser);
    if (!user) throw new Error("You must be logged in to register for this event.");

    const event = await ctx.db.get(args.eventId);
    if (!event) throw new Error("Event not found");

    if (event.registrationCount >= event.capacity) {
      throw new Error("Event is full");
    }

    const existingRegistration = await ctx.db
      .query("registrations")
      .withIndex("by_event_user", (q) =>
        q.eq("eventId", args.eventId).eq("userId", user._id)
      )
      .unique();

    if (existingRegistration) {
      throw new Error("You are already registered for this event");
    }

    // Create QR
    const qrCode = generateQRCode();

    const registrationId = await ctx.db.insert("registrations", {
      eventId: args.eventId,
      userId: user._id,
      attendeeName: args.attendeeName,
      attendeeEmail: args.attendeeEmail,
      qrCode,
      checkedIn: false,
      status: "confirmed",
      registeredAt: Date.now(),
    });

    await ctx.db.patch(args.eventId, {
      registrationCount: event.registrationCount + 1,
    });

    return registrationId;
  },
});

/* -----------------------------------------
   CHECK IF USER REGISTERED FOR EVENT
----------------------------------------- */
export const checkRegistration = query({
  args: { eventId: v.id("events") },
  handler: async (ctx, args) => {
    const user = await ctx.runQuery(internal.users.getCurrentUser);
    if (!user) return null;

    return ctx.db
      .query("registrations")
      .withIndex("by_event_user", (q) =>
        q.eq("eventId", args.eventId).eq("userId", user._id)
      )
      .unique();
  },
});

/* -----------------------------------------
   GET CURRENT USER'S REGISTRATIONS (TICKETS)
----------------------------------------- */
export const getMyRegistrations = query({
  handler: async (ctx) => {
    const user = await ctx.runQuery(internal.users.getCurrentUser);
    if (!user) return [];

    const registrations = await ctx.db
      .query("registrations")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .order("desc")
      .collect();

    return Promise.all(
      registrations.map(async (reg) => {
        const event = await ctx.db.get(reg.eventId);
        return { ...reg, event };
      })
    );
  },
});

/* -----------------------------------------
   CANCEL REGISTRATION
----------------------------------------- */
export const cancelRegistration = mutation({
  args: { registrationId: v.id("registrations") },
  handler: async (ctx, args) => {
    const user = await ctx.runQuery(internal.users.getCurrentUser);
    if (!user) throw new Error("Not authenticated");

    const registration = await ctx.db.get(args.registrationId);
    if (!registration) throw new Error("Registration not found");

    if (registration.userId !== user._id) {
      throw new Error("You are not authorized to cancel this registration");
    }

    const event = await ctx.db.get(registration.eventId);
    if (!event) throw new Error("Event not found");

    await ctx.db.patch(args.registrationId, { status: "cancelled" });

    if (event.registrationCount > 0) {
      await ctx.db.patch(registration.eventId, {
        registrationCount: event.registrationCount - 1,
      });
    }

    return { success: true };
  },
});

/* -----------------------------------------
   GET REGISTRATIONS FOR AN EVENT (ORGANIZER)
----------------------------------------- */
export const getEventRegistrations = query({
  args: { eventId: v.id("events") },
  handler: async (ctx, args) => {
    const user = await ctx.runQuery(internal.users.getCurrentUser);
    if (!user) throw new Error("Not authenticated");

    const event = await ctx.db.get(args.eventId);
    if (!event) throw new Error("Event not found");

    if (event.organizerId !== user._id) {
      throw new Error("You are not authorized to view registrations");
    }

    return ctx.db
      .query("registrations")
      .withIndex("by_event", (q) => q.eq("eventId", args.eventId))
      .collect();
  },
});

/* -----------------------------------------
   CHECK-IN USING QR CODE
----------------------------------------- */
export const checkInAttendee = mutation({
  args: { qrCode: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.runQuery(internal.users.getCurrentUser);
    if (!user) throw new Error("Not authenticated");

    const registration = await ctx.db
      .query("registrations")
      .withIndex("by_qr_code", (q) => q.eq("qrCode", args.qrCode))
      .unique();

    if (!registration) throw new Error("Invalid QR code");

    const event = await ctx.db.get(registration.eventId);
    if (!event) throw new Error("Event not found");

    if (event.organizerId !== user._id) {
      throw new Error("You are not authorized to check in attendees");
    }

    if (registration.checkedIn) {
      return { success: false, message: "Already checked in", registration };
    }

    await ctx.db.patch(registration._id, {
      checkedIn: true,
      checkedInAt: Date.now(),
    });

    return {
      success: true,
      message: "Check-in successful",
      registration: { ...registration, checkedIn: true },
    };
  },
});
