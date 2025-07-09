'use server';

import { cookies } from 'next/headers';
import { v4 as uuidv4 } from 'uuid';

const ANONYMOUS_USER_COOKIE = 'anonymous_user_id';

/**
 * Gets a unique user identifier.
 * If the user is logged in, it returns their session ID.
 * If they are anonymous, it gets or sets a unique cookie to identify them across sessions.
 */
export async function getUserId(): Promise<string> {
  const cookieStore = cookies();
  
  let userId = cookieStore.get(ANONYMOUS_USER_COOKIE)?.value;

  if (!userId) {
    userId = uuidv4();
    const expires = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000); // 1 year
    cookieStore.set(ANONYMOUS_USER_COOKIE, userId, { expires, httpOnly: true });
  }

  return userId;
}
