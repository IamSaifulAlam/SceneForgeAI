'use server';
import { cookies } from 'next/headers';
import { SignJWT, jwtVerify } from 'jose';

const secretKey = process.env.SESSION_SECRET || 'fallback-secret-key-for-development';
const key = new TextEncoder().encode(secretKey);
const cookieName = 'session';

export async function encrypt(payload: any) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('1h') // Session expires in 1 hour
    .sign(key);
}

export async function decrypt(input: string): Promise<any> {
  try {
    const { payload } = await jwtVerify(input, key, {
      algorithms: ['HS256'],
    });
    return payload;
  } catch (error) {
    // This could be due to an expired or invalid token
    return null;
  }
}

export async function setSession() {
  const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
  const session = await encrypt({ user: { role: 'admin' }, expires });

  cookies().set(cookieName, session, { expires, httpOnly: true });
}

export async function getSession() {
  const cookieStore = cookies();
  const cookie = cookieStore.get(cookieName)?.value;
  if (!cookie) return null;
  return await decrypt(cookie);
}

export async function deleteSession() {
  cookies().delete(cookieName);
}
