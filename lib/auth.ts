import { betterAuth } from "better-auth"
import { prismaAdapter } from "better-auth/adapters/prisma"
import prisma from "@/lib/prisma"

// Allowed users for IRA platform
const ALLOWED_USERS = [
  { email: "rashmi@cosmosfin.com", role: "ASSESSOR" },
  { email: "rahul@cosmosfin.com", role: "ASSESSOR" },
  { email: "jaydeep@cosmosfin.com", role: "ASSESSOR" },
  { email: "piyush@cosmosfin.com", role: "REVIEWER" },
  { email: "veshant@cosmosfin.com", role: "REVIEWER" },
  { email: "sonali@cosmosfin.com", role: "ASSESSOR" },
  { email: "abhishekchauhaninc@gmail.com", role: "REVIEWER" },
] as const

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),

  // Base configuration
  secret: process.env.BETTER_AUTH_SECRET!,
  baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3000",
  basePath: "/api/auth",

  // Trusted origins for CORS (production + development)
  trustedOrigins: [
    "https://irascore.com",
    "https://www.irascore.com",
    "http://localhost:3000",
  ],

  // Google OAuth only
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
  },

  // Session configuration
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // Update every 24 hours
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60, // 5 minutes
    },
  },

  // User schema extension
  user: {
    additionalFields: {
      role: {
        type: "string",
        required: true,
        defaultValue: "ASSESSOR",
        input: false, // Don't allow users to set their own role
      },
    },
  },

  // Database hooks for access control
  databaseHooks: {
    user: {
      create: {
        before: async (user) => {
          const email = user.email

          if (!email) {
            throw new Error("Email is required for user creation")
          }

          // Check if user is in allowed list
          const allowedUser = ALLOWED_USERS.find((u) => u.email === email)

          if (!allowedUser) {
            throw new Error(
              "Access denied. This application is for authorized users only. Please contact your administrator."
            )
          }

          // Assign role based on allowed users list
          return {
            data: {
              ...user,
              role: allowedUser.role,
            },
          }
        },
      },
    },
  },
})

export type Session = typeof auth.$Infer.Session
