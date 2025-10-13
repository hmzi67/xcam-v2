import { NextRequest, NextResponse } from "next/server"
import { PrismaClient, UserStatus } from "@prisma/client"
import { hashPassword, generateVerificationToken } from "../../../../../lib/auth-utils"
import { z } from "zod"

const prisma = new PrismaClient()

const registerSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  displayName: z.string().min(3, "Display name must be at least 3 characters").max(50, "Display name must be less than 50 characters"),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password, displayName } = registerSchema.parse(body)

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email },
          { profile: { displayName } },
        ],
      },
      include: { profile: true },
    })

    if (existingUser) {
      if (existingUser.email === email) {
        return NextResponse.json(
          { error: "User with this email already exists" },
          { status: 400 }
        )
      }
      if (existingUser.profile?.displayName === displayName) {
        return NextResponse.json(
          { error: "Display name is already taken" },
          { status: 400 }
        )
      }
    }

    // Hash password
    const passwordHash = await hashPassword(password)
    
    // Generate verification token
    const verificationToken = generateVerificationToken()

    // Create user and profile in a transaction
    const user = await prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          email,
          passwordHash,
          status: UserStatus.PENDING_VERIFICATION,
          emailVerified: false,
        },
      })

      await tx.profile.create({
        data: {
          userId: newUser.id,
          displayName,
        },
      })

      // Create wallet for the user
      await tx.wallet.create({
        data: {
          userId: newUser.id,
          balance: 0,
        },
      })

      // Store verification token (you might want to add this to your schema)
      // For now, we'll just log it or send it via email
      console.log(`Verification token for ${email}: ${verificationToken}`)

      return newUser
    })

    // TODO: Send verification email
    // await sendVerificationEmail(email, verificationToken)

    return NextResponse.json(
      {
        message: "Registration successful. Please check your email to verify your account.",
        userId: user.id,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("Registration error:", error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.issues },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}