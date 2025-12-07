// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const SECRET_KEY = new TextEncoder().encode(process.env.JWT_SECRET || 'rahasia-super-aman-jangan-disebar');

export async function middleware(request: NextRequest) {
  const session = request.cookies.get('session')?.value;
  const { pathname } = request.nextUrl;

  // 1. Jika akses halaman Login tapi sudah punya session -> Lempar ke Home
  if (pathname === '/pages/login') {
    if (session) {
      try {
        await jwtVerify(session, SECRET_KEY);
        return NextResponse.redirect(new URL('/', request.url));
      } catch (e) {
        // Token invalid, biarkan akses login
      }
    }
    return NextResponse.next();
  }

  // 2. Jika akses halaman dilindungi tapi belum login -> Lempar ke Login
  if (!session) {
    return NextResponse.redirect(new URL('/pages/login', request.url));
  }

  try {
    await jwtVerify(session, SECRET_KEY);
    return NextResponse.next();
  } catch (error) {
    return NextResponse.redirect(new URL('/pages/login', request.url));
  }
}

export const config = {
  matcher: ['/', '/pages/history', '/pages/simulation'],
};