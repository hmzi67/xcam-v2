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
            return null;
          }

          const isValidPassword = await verifyPassword(
            password,
            user.passwordHash
          );
          if (!isValidPassword) {
            return null;
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
          return null;
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
                profile: {
                  create: {
                    displayName: user.name || user.email!.split("@")[0],
                    avatarUrl: user.image || null,
                  },
                },
              },
              include: { profile: true },
            });
          } else if (!existingUser.profile) {
            // Create profile if it doesn't exist
            await prisma.profile.create({
              data: {
                userId: existingUser.id,
                displayName: user.name || user.email!.split("@")[0],
                avatarUrl: user.image || null,
              },
            });
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
  secret: process.env.NEXTAUTH_SECRET,
});
