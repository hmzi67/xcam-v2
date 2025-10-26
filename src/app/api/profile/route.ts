import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { writeFile } from 'fs/promises';
import path from 'path';

// GET: Fetch user profile
export async function GET(req: NextRequest) {
  const session = await auth();
  
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });
  
  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }
  
  return NextResponse.json(user);
}

// POST: Fetch user profile by user ID
export async function POST(req: NextRequest) {
  // Check authentication
  const session = await auth();
  
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { userId } = body;

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    // Find user by ID with all related data
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        profile: true,
        wallet: true,
        _count: {
          select: {
            streams: true,
            follows: true,
            followers: true,
          }
        }
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT: Update user profile (including avatar upload)
export async function PUT(req: NextRequest) {
  const session = await auth();
  
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  const formData = await req.formData();
  const updateData: any = {
    name: formData.get('name'),
    phone: formData.get('phone'),
    dateOfBirth: formData.get('dateOfBirth'),
    country: formData.get('country'),
    city: formData.get('city'),
    postalCode: formData.get('postalCode'),
  };
  
  // Handle avatar upload
  const avatar = formData.get('avatar');
  if (avatar && typeof avatar === 'object' && 'arrayBuffer' in avatar) {
    const buffer = Buffer.from(await avatar.arrayBuffer());
    const fileName = `${session.user.email}-avatar.png`;
    const filePath = path.join(process.cwd(), 'public', fileName);
    await writeFile(filePath, buffer);
    updateData.image = `/${fileName}`;
  }
  
  const user = await prisma.user.update({
    where: { email: session.user.email },
    data: updateData,
  });
  
  return NextResponse.json(user);
}
