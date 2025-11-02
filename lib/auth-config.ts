import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { z } from "zod";

const prisma = new PrismaClient();

// Helper function for password verification
async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

// Define custom user type
interface CustomUser {
  id: string;
  email: string;
  name: string;
  role: string;
  emailVerified: boolean;
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
        },
      },
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          const { email, password } = loginSchema.parse(credentials);

          const user = await prisma.user.findUnique({
            where: { email },
            include: { profile: true },
          });

          if (!user || !user.passwordHash) {
            throw new Error("Invalid email or password");
          }

          const isValidPassword = await verifyPassword(
            password,
            user.passwordHash
          );
          if (!isValidPassword) {
            throw new Error("Invalid email or password");
          }

          // Check user account status
          if (user.status === "SUSPENDED") {
            throw new Error(
              "Your account has been suspended. Please contact support for assistance."
            );
          }

          if (user.status === "BANNED") {
            throw new Error(
              "Your account has been permanently banned. Please contact support if you believe this is an error."
            );
          }

          // Allow ACTIVE and PENDING_VERIFICATION users to login
          if (
            user.status !== "ACTIVE" &&
            user.status !== "PENDING_VERIFICATION"
          ) {
            throw new Error("Unable to sign in. Please contact support.");
          }

          // Update last login
          await prisma.user.update({
            where: { id: user.id },
            data: { lastLoginAt: new Date() },
          });

          return {
            id: user.id,
            email: user.email,
            name: user.profile?.displayName || user.email,
            role: user.role,
            emailVerified: user.emailVerified,
          } as CustomUser;
        } catch (error) {
          console.error("Auth error:", error);
          throw error;
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 7 * 24 * 60 * 60, // 7 days
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === "google") {
        try {
          // Check if user exists
          let existingUser = await prisma.user.findUnique({
            where: { email: user.email! },
            include: { profile: true },
          });

          if (!existingUser) {
            // Create new user with Google OAuth
            existingUser = await prisma.user.create({
              data: {
                email: user.email!,
                emailVerified: true, // Google emails are pre-verified
                role: "VIEWER",
                status: "ACTIVE", // Set to ACTIVE for new Google OAuth users
                profile: {
                  create: {
                    displayName: user.name || user.email!.split("@")[0],
                    avatarUrl: user.image || null,
                  },
                },
              },
              include: { profile: true },
            });
          } else {
            // Check existing user's account status
            if (existingUser.status === "SUSPENDED") {
              // Return a URL with error parameter instead of throwing
              return `/login?error=AccountSuspended`;
            }

            if (existingUser.status === "BANNED") {
              return `/login?error=AccountBanned`;
            }

            // Allow ACTIVE and PENDING_VERIFICATION users to login
            if (
              existingUser.status !== "ACTIVE" &&
              existingUser.status !== "PENDING_VERIFICATION"
            ) {
              return `/login?error=AccountInactive`;
            }

            if (!existingUser.profile) {
              // Create profile if it doesn't exist
              await prisma.profile.create({
                data: {
                  userId: existingUser.id,
                  displayName: user.name || user.email!.split("@")[0],
                  avatarUrl: user.image || null,
                },
              });
            }
          }

          // Update last login
          await prisma.user.update({
            where: { id: existingUser.id },
            data: { lastLoginAt: new Date() },
          });

          return true;
        } catch (error) {
          console.error("Google sign-in error:", error);
          return false;
        }
      }
      return true;
    },
    async jwt({ token, user, account }) {
      if (user) {
        const customUser = user as CustomUser;
        token.id = customUser.id;
        token.role = customUser.role;
        token.emailVerified = customUser.emailVerified;
      }

      // For Google OAuth, fetch user data from database
      if (account?.provider === "google" && token.email) {
        const dbUser = await prisma.user.findUnique({
          where: { email: token.email },
          include: { profile: true },
        });

        if (dbUser) {
          token.id = dbUser.id;
          token.role = dbUser.role;
          token.emailVerified = dbUser.emailVerified;
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.name = session.user.name || session.user.email || "";
        // Add custom fields to session user
        (session.user as any).role = token.role as string;
        (session.user as any).emailVerified = token.emailVerified === true;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  events: {
    async signIn({ user, account }) {
      // Log successful sign-ins for audit purposes
      console.log(
        `User ${user.email} signed in successfully with ${
          account?.provider || "credentials"
        }`
      );
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
});
