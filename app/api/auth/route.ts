import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const API_KEY = process.env.API_KEY || 'default_dev_key'; // Fallback for dev, user defined in CI/CD

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { apiKey } = body;

        if (apiKey === API_KEY) {
            const cookieStore = await cookies();
            cookieStore.set('auth_token', 'valid_session', {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 60 * 60 * 24 * 7, // 1 week
                path: '/',
            });

            return NextResponse.json({ success: true });
        } else {
            return NextResponse.json({ success: false, message: 'Invalid API Key' }, { status: 401 });
        }
    } catch (error) {
        return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
    }
}
