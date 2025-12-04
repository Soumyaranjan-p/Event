import {defineSchema} from 'convex/server'
import {v} from "convex/values"

export default defineSchema({
    //users table
  users: defineTable({
  name: v.string(),

  tokenIdentifier: v.string(),
  email:v.string(),
  imageUrl:v.optional(v.string()),


  hasCompletedOnboarding:v.boolean(),
  location:v.optional(
           v.object({
            city:v.string(),
            state:v.optional(v.string()),
            country:v.string(),
           })
  ),
  intrests:v.optional(v.array(v.string())),
}).index("by_token", ["tokenIdentifier"])
})
