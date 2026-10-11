import { createFileRoute, useRouter } from '@tanstack/react-router';
import { useServerFn } from '@tanstack/react-start';
import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, Heart, LockKeyhole } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { GiftShell } from '@/components/gift-shell';
import { unlockGift } from '@/lib/gift.functions';
import hello from '@/assets/hello.gif.asset.json';
import passkeyGif from '@/assets/passkey.gif.asset.json';

export const Route = createFileRoute('/')({
  head: () => ({ meta: [
    { title: 'A little love, for Koko ♡' },
    { name: 'description', content: 'A little anniversary surprise, made with love just for you.' },
    { property: 'og:title', content: 'A little love, for Koko ♡' },
    { property: 'og:description', content: 'You have a little gift waiting to be opened.' },
    { property: 'og:type', content: 'website' },
    { name: 'twitter:card', content: 'summary_large_image' },
  ] }),
  component: Index,
});

const choices = [['Yes, please!', 'No, thanks'], ['Suree babe', 'NO!'], ['Okay sure bby', 'Nope'], ["Oki let’s see bae", 'ကြည့်ဘူး'], ['ကြည့်မယ် ဘေဘီလေး', 'ကြည့်ချင်ဘူး'], ['Okii babe', 'Sure bby']];
const responses = ['', '', 'ကိုကိုနော် ရဘူး ပြန်‌ရွေး', 'ဟာ အဲ့လိုနော် ကိုကို', 'ဘာ ဘာပြောလိုက်တယ်', 'ကိုကိုနော် ဟွန့်'];

function Index() {
  const [noCount, setNoCount] = useState(0);
  const [passkey, setPasskey] = useState(false);
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const checking = useRef(false);
  const unlock = useServerFn(unlockGift);
  const router = useRouter();
  async function checkPasskey(value: string) {
    if (checking.current || value.length !== 5) return;
    checking.current = true; setBusy(true); setError('');
    try {
      const result = await unlock({ data: { password: value } });
      if (result.ok) {
        await router.invalidate();
        await router.navigate({ to: '/surprise' });
      }
      else { setError(result.message); setPin(''); }
    } catch { setError('ခဏလေးနေပြီး ပြန်ကြိုးစားနော် ♡'); setPin(''); }
    finally { checking.current = false; setBusy(false); }
  }
  useEffect(() => {
    if (pin.length === 5) void checkPasskey(pin);
  }, [pin]);
  function submit(e: React.FormEvent) {
    e.preventDefault();
    void checkPasskey(pin);
  }
  return <GiftShell><main className="opening">
    <span className="doodle doodle-one">♡</span><span className="doodle doodle-two">✧</span>
    <span className="doodle doodle-three">for my favorite person ↗</span><span className="doodle doodle-four">♡ ♡</span>
    {!passkey ? <>
      <div className="eyebrow">a very special delivery</div>
      <div className="gif-wrap"><img src={hello.url} alt="A little animated penguin greeting Koko" /></div>
      <h1>Hello <span>koko.</span> <span className="hand">♡</span></h1>
      <p>You have a gift to open.<br />Would you like to open it?</p>
      <div className="gift-actions">
        <Button variant="gift" onClick={() => setPasskey(true)}>{choices[noCount]?.[0]} <Heart size={16} /></Button>
        <Button variant="gentle" onClick={() => noCount === 5 ? setPasskey(true) : setNoCount(n => Math.min(n + 1, 5))}>{choices[noCount]?.[1]}</Button>
      </div>
      {responses[noCount] && <p className="text-primary text-sm">{responses[noCount]}</p>}
      <div className="love-note">{noCount === 5 ? 'hee" choose one koko' : 'a tiny surprise. a whole lot of love.'}</div>
    </> : <form className="pin-form" onSubmit={submit}>
      <div className="gif-wrap mx-auto"><img src={passkeyGif.url} alt="A cute animated chick waiting for your passkey" /></div>
      <h1>Enter a <span>passkey!</span></h1>
      <p>ဖွင့်ကြည့်ဖို့ နံပါတ်လေးထည့်ဦး</p>
      <div className="pin-wrap"><input aria-label="Five-digit passkey" className="pin-input" type="password" inputMode="numeric" autoComplete="off" maxLength={5} value={pin} autoFocus disabled={busy} onChange={e => setPin(e.target.value.replace(/\D/g, '').slice(0, 5))} placeholder="♡♡♡♡♡" /></div>
      <p className="text-sm text-muted-foreground">hint : ကိုကို နဲ့ bby နှစ်ယောက်ထဲသိတယ် တခြားဘယ်သူမှ ဖွင့်ကြည့်မရအောင်ဖွက်ထားတာ ကိုကိုစဥ်းစားကြည့်ကွ :3 <br /><span className="font-bold">(photobooth date)</span></p>
      {error && <p role="alert" className="error-note mt-4">{error}</p>}
      <div className="gift-actions"><Button type="submit" variant="gift" disabled={pin.length !== 5 || busy}>{busy ? 'Opening…' : 'Unlock my gift'} <LockKeyhole size={16} /></Button></div>
      <Button type="button" variant="ghost" onClick={() => setPasskey(false)}><ArrowLeft /> Back</Button>
    </form>}
  </main></GiftShell>;
}
