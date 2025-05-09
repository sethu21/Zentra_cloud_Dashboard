// app/api/user/register/route.js
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';

export async function POST(request) {
  try {
    const { name, email, phone, password } = await request.json();

    // Check for existing user
    const existing = await prisma.user.findUnique({
      where: { email },
    });
    if (existing) {
      return NextResponse.json(
        { error: 'Email already in use' },
        { status: 400 }
      );
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        phone,
        password: hashedPassword,
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
      },
    });

    return NextResponse.json({ user }, { status: 201 });
  } catch (err) {
    console.error('Registration error:', err);
    return NextResponse.json(
      { error: 'Registration failed' },
      { status: 500 }
    );
  }
}
