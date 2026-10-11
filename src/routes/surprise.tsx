import { createFileRoute } from '@tanstack/react-router';
import { useCallback, useState, useEffect } from 'react';
import { ArrowRight, Heart, Camera, Mail, Flower2, Images } from 'lucide-react';
import { getGift } from '@/lib/gift.functions';
import { GiftShell } from '@/components/gift-shell';
import { CatchGame } from '@/components/catch-game';
import { RelationshipCounter } from '@/components/relationship-counter';
import { Button } from '@/components/ui/button';

export const Route = createFileRoute('/surprise')({
  loader: () => getGift(),
  head: () => ({ meta: [
    { title: 'Our anniversary surprise ♡' },
    { name: 'description', content: 'A private anniversary gift, just for my favorite person.' },
    { property: 'og:title', content: 'Our anniversary surprise ♡' },
    { property: 'og:description', content: 'A private little celebration of our love.' },
    { property: 'og:type', content: 'website' },
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'robots', content: 'noindex, nofollow' },
  ] }),
  component: Surprise,
});

function Surprise() {
  const gift = Route.useLoaderData();
  const [chapter, setChapter] = useState<'game' | 'envelope' | 'opened'>('game');
  const [tab, setTab] = useState<'letter' | 'memories' | 'reasons'>('letter');
  const [flowers, setFlowers] = useState(false);
  const [revealed, setRevealed] = useState<Set<number>>(new Set());
  const complete = useCallback(() => { setChapter('envelope'); window.scrollTo({ top: 0, behavior: 'smooth' }); }, []);
  useEffect(() => {
    if (!flowers) return;
    const timer = setTimeout(() => setFlowers(false), 3300);
    return () => clearTimeout(timer);
  }, [flowers]);
  const open = () => { setChapter('opened'); setFlowers(true); };
  const changeTab = (value: typeof tab) => { setTab(value); window.scrollTo({ top: 0, behavior: 'smooth' }); };
  return <GiftShell>
    {flowers && <div className="flower-burst" aria-hidden="true">{'🌸🌷🌼🌺💐🌻🌹🌸🌷🌼'.split(/(?<=\p{Emoji_Presentation})/u).map((flower, i) => <span key={i}>{flower}</span>)}</div>}
    <main className="gift-content">
      {chapter === 'game' && <CatchGame onComplete={complete} />}
      {chapter === 'envelope' && <section className="text-center py-12">
        <div className="chapter-label">you caught me, like you always do</div>
        <h1 className="chapter-title">A letter from my heart <span className="hand text-primary">♡</span></h1>
        <Button variant="envelope" aria-label="Open your anniversary letter" onClick={open}><span className="wax-heart"><Heart fill="currentColor" size={24} /></span></Button>
        <p className="hand text-3xl text-primary">for my koko, with love</p>
        <Button variant="gift" className="mt-8" onClick={open}>Open my letter <Mail /></Button>
      </section>}
      {chapter === 'opened' && <>
        <nav className="gift-tabs" aria-label="Our anniversary gift">
          <Button variant="ghost" aria-current={tab === 'letter' ? 'page' : undefined} className={tab === 'letter' ? 'selected' : ''} onClick={() => changeTab('letter')}><Mail /> Love letter</Button>
          <Button variant="ghost" aria-current={tab === 'memories' ? 'page' : undefined} className={tab === 'memories' ? 'selected' : ''} onClick={() => changeTab('memories')}><Images /> Our milestones</Button>
          <Button variant="ghost" aria-current={tab === 'reasons' ? 'page' : undefined} className={tab === 'reasons' ? 'selected' : ''} onClick={() => changeTab('reasons')}><Heart /> 100 reasons</Button>
        </nav>
        {tab === 'letter' && <>
          <div className="chapter-label">two years. a thousand little memories.</div>
          <article className="letter-paper">
            <div className="flex justify-center text-primary mb-5"><Flower2 size={32} /></div>
            <h1>{gift.title} <span className="text-primary">♡</span></h1>
            {gift.letter.map((paragraph, i) => <p key={i}>{paragraph}</p>)}
            <div className="letter-sign"><p>{gift.from}<br />{gift.for}</p></div>
          </article>
          <RelationshipCounter since={gift.togetherSince} />
          <div className="gift-actions"><Button variant="gift" onClick={() => changeTab('memories')}>Our little story <ArrowRight /></Button></div>
        </>}
        {tab === 'memories' && <>
          <div className="chapter-label">the moments that made us</div>
          <h1 className="chapter-title">Our little love story <span className="hand text-primary">♡</span></h1>
          <div className="milestones">{gift.milestones.map((milestone, i) => <article className="polaroid" key={milestone}>
            <div className="photo-space"><Camera size={35} strokeWidth={1.3} /><span className="hand text-2xl">a memory goes here ♡</span></div>
            <h2>{milestone}</h2>
            {i < 3 && <svg className="curly-arrow" viewBox="0 0 50 60" fill="none" aria-hidden="true"><path d="M2 10C40-10 45 30 21 29C0 28 24 55 45 40M35 39L46 39L43 51" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>}
          </article>)}</div>
          <div className="gift-actions mt-16"><Button variant="gift" onClick={() => changeTab('reasons')}>And 100 reasons why <Heart /></Button></div>
        </>}
        {tab === 'reasons' && <>
          <div className="chapter-label">every little thing about you</div>
          <h1 className="chapter-title">100 Reasons Why I Love You <span className="hand text-primary">♡</span></h1>
          <div className="reason-count">{revealed.size} / 100 little love notes opened</div>
          <div className="reasons-grid">{gift.reasons.map((reason, i) => <Button variant="reason" className={revealed.has(i) ? 'revealed' : ''} key={i} aria-label={`Reason ${i + 1}${revealed.has(i) ? ', opened' : ', open love note'}`} aria-expanded={revealed.has(i)} onClick={() => setRevealed(old => { const next = new Set(old); if (next.has(i)) next.delete(i); else next.add(i); return next; })}>
            <strong>{String(i + 1).padStart(2, '0')}</strong>
            {revealed.has(i) ? <p>{reason}</p> : <Heart strokeWidth={1.2} />}
          </Button>)}</div>
          <p className="hand text-3xl text-center text-primary my-12">a hundred reasons, and still counting… ♡</p>
        </>}
      </>}
    </main>
  </GiftShell>;
}