import { Heart, Music2 } from 'lucide-react';
import { Link } from '@tanstack/react-router';
import type { ReactNode } from 'react';

export function GiftShell({ children }: { children: ReactNode }) {
  return <div className="gift-world">
    <header className="gift-header">
      <Link to="/" className="brand"><Heart size={19} fill="currentColor" /> a little love, for koko</Link>
      <span className="text-muted-foreground" title="Star · Colde — audio file to be added"><Music2 size={18} /></span>
    </header>
    {children}
    <footer className="footer-note">made with all my love <span className="text-primary">♡</span> just for you</footer>
  </div>;
}