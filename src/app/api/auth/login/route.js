import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '@/lib/prisma';

const COOKIE_NAME = 'session_token';
const JWT_SECRET = process.env.JWT_SECRET;

// handles login POST requests
export async function POST(request) {
    try {
        const body = await request.json();
        const { email, password } = body;

        // check if there's a user with that email
        const existing = await prisma.user.findUnique({
            where: { email },
            select: { id: true, password: true },
        });

        if (!existing) {
            return NextResponse.json(
                { error: 'Email or password is wrong' },
                { status: 401 }
            );
        }

        // check the password using bcrypt
        const matched = await bcrypt.compare(password, existing.password);
        if (!matched) {
            return NextResponse.json(
                { error: 'Email or password is wrong' },
                { status: 401 }
            );
        }

        // if we get here, we log them in with a JWT
        const jwtToken = jwt.sign({ userId: existing.id }, JWT_SECRET, {
            expiresIn: '7d'
        });

        const response = NextResponse.json({ success: true });
        response.cookies.set(COOKIE_NAME, jwtToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/',
            maxAge: 60 * 60 * 24 * 7, // one week
        });

        return response;
    } catch (error) {
        console.error("Something exploded during login:", error.message);
        return NextResponse.json(
            { error: 'Something went wrong trying to log in' },
            { status: 500 }
        );
    }
}
