import { createServerFn } from '@tanstack/react-start';
import { useSession, setResponseHeader } from '@tanstack/react-start/server';
import { createHash, timingSafeEqual } from 'node:crypto';
import { redirect } from '@tanstack/react-router';

function sessionConfig() {
  const password = process.env['SESSION_SECRET'];
  if (!password) throw new Error('The gift is not configured yet.');
  return { password, name: 'koko-gift', maxAge: 60 * 60 * 24 * 7, cookie: { httpOnly: true, secure: true, sameSite: 'lax' as const, path: '/' } };
}

export const unlockGift = createServerFn({ method: 'POST' })
  .inputValidator((data: { password: string }) => {
    if (typeof data.password !== 'string' || data.password.length > 32) throw new Error('Enter five digits.');
    return data;
  })
  .handler(async ({ data }) => {
    setResponseHeader('Cache-Control', 'no-store');
    const expected = process.env['SITE_PASSWORD'];
    if (!expected) throw new Error('The gift is not configured yet.');
    const session = await useSession<{ unlocked?: boolean; attempts?: number; lastAttempt?: number }>(sessionConfig());
    const recent = Date.now() - (session.data.lastAttempt ?? 0) < 60000;
    const attempts = recent ? session.data.attempts ?? 0 : 0;
    if (attempts >= 10) return { ok: false, message: 'ခဏလေးနားပြီး ပြန်ကြိုးစားနော် ကိုကို 💕' };
    const a = createHash('sha256').update(data.password).digest();
    const b = createHash('sha256').update(expected).digest();
    if (!timingSafeEqual(a, b)) {
      await session.update({ attempts: attempts + 1, lastAttempt: Date.now() });
      return { ok: false, message: 'မမှန်သေးဘူး ကိုကို၊ ပြန်စဉ်းစားကြည့်နော် ♡' };
    }
    await session.update({ unlocked: true, attempts: 0 });
    return { ok: true, message: '' };
  });

export const getGift = createServerFn({ method: 'GET' }).handler(async () => {
  setResponseHeader('Cache-Control', 'no-store');
  const session = await useSession<{ unlocked?: boolean }>(sessionConfig());
  if (!session.data.unlocked) throw redirect({ to: '/' });
  const { gift } = await import('./gift-data.server');
  return gift;
});