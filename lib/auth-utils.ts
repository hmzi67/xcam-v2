import bcrypt from "bcryptjs";
import crypto from "crypto";
import { UserRole } from "@prisma/client";
import { auth } from "./auth";
import { redirect } from "next/navigation";

interface SessionUser {
  user?: {
    emailVerified?: boolean;
  };
}

/**
 * Hash a password using bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 12;
  return bcrypt.hash(password, saltRounds);
}

/**
 * Verify a password against a hash
 */
export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/**
 * Generate a secure verification token
 */
export function generateVerificationToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

/**
 * Server action helper to require authentication
 */
export async function requireAuth() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  return session;
}

/**
 * Server action helper to require specific roles
 */
export async function requireRole(allowedRoles: UserRole[]) {
  const session = await requireAuth();

  if (!allowedRoles.includes(session.user.role)) {
    throw new Error("Insufficient permissions");
  }

  return session;
}

/**
 * Check if user has any of the specified roles
 */
export function hasRole(userRole: UserRole, allowedRoles: UserRole[]): boolean {
  return allowedRoles.includes(userRole);
}

/**
 * Check if user is authenticated (client-side helper)
 */
export function isAuthenticated(session: SessionUser | null): boolean {
  return !!session?.user;
}

/**
 * Check if user has verified email
 */
export function isEmailVerified(session: SessionUser | null): boolean {
  return session?.user?.emailVerified === true;
}
