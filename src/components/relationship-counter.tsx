import { useEffect, useState } from 'react';

function duration(since: string, now: Date) {
  const start = new Date(since);
  let years = now.getFullYear() - start.getFullYear();
  let anniversary = new Date(start); anniversary.setFullYear(start.getFullYear() + years);
  if (anniversary > now) { years--; anniversary.setFullYear(start.getFullYear() + years); }
  let months = 0;
  while (months < 11) {
    const next = new Date(anniversary); next.setMonth(next.getMonth() + months + 1);
    if (next > now) break;
    months++;
  }
  const monthStart = new Date(anniversary); monthStart.setMonth(monthStart.getMonth() + months);
  const seconds = Math.max(0, Math.floor((now.getTime() - monthStart.getTime()) / 1000));
  return { values: [Math.max(0, years), months, Math.floor(seconds / 86400), Math.floor(seconds / 3600) % 24, Math.floor(seconds / 60) % 60, seconds % 60], days: Math.max(0, Math.floor((now.getTime() - start.getTime()) / 86400000)) };
}

export function RelationshipCounter({ since }: { since: string }) {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => { setNow(new Date()); const timer = setInterval(() => setNow(new Date()), 1000); return () => clearInterval(timer); }, []);
  const data = now ? duration(since, now) : null;
  const labels = ['years', 'months', 'days', 'hours', 'mins', 'secs'];
  return <section className="counter">
    <h2>We’ve been together for</h2>
    <div className="counter-grid">{labels.map((label, i) => <div className="counter-unit" key={label}><strong>{data?.values[i] ?? '–'}</strong><span>{label}</span></div>)}</div>
    <p className="counter-caption">that’s {data?.days ?? '…'} days of loving you 💗</p>
    <div className="anniversary-banner">🎉 {data?.values[0] === 2 && data.values[1] === 0 && data.values[2] === 0 ? 'It’s our 2nd anniversary today!' : 'Two years of us. A lifetime to go.'} 🎉</div>
  </section>;
}