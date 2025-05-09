import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '@/lib/prisma';

const COOKIE_NAME = 'session_token';
const JWT_SECRET = process.env.JWT_SECRET;

export async function POST(request) {
  try {
    const { email, password } = await request.json();

    // 1. Lookup user by email
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, password: true },
    });
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // 2. Compare submitted password with hashed password
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // 3. Create a JWT
    const token = jwt.sign(
      { userId: user.id },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // 4. Set it as an HTTP-only cookie
    const res = NextResponse.json({ success: true });
    res.cookies.set(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });
    

    return res;
  } catch (err) {
    console.error('Login error:', err);
    return NextResponse.json(
      { error: 'Login failed' },
      { status: 500 }
    );
  }
}