import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '@/lib/prisma';

const COOKIE_NAME = 'session_token';
const JWT_SECRET = process.env.JWT_SECRET;


//verify user data and generate the token, and set its as an http-only cookie
export async function POST(request) {
  try {
    // prase the incoming json payload
    const { email, password } = await request.json();

    //check if a user with the given email exists and fetch their hashed password
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

    const isValid = await bcrypt.compare(password, user.password);

    // if user not found return the error 
    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // if all are good generate a signed jwt token 
    const token = jwt.sign(
      { userId: user.id }, 
      JWT_SECRET,
      { expiresIn: '7d' } // token lifespan(later need to reduce for 2d for better security)
    );

    // create response and attach token as http-only cookes
    const res = NextResponse.json({ success: true });
    res.cookies.set(COOKIE_NAME, token, {
      httpOnly: true, // not accessible via javascript (prevents xss)
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax', 
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    }); // its not safe to have for 7 days latter need to change for 2 days 
    

    return res;
  } catch (err) {
    console.error('Login error:', err);
    return NextResponse.json(
      { error: 'Login failed' },
      { status: 500 }
    );
  }
}