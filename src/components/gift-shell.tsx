import { Heart } from 'lucide-react';
import { Link } from '@tanstack/react-router';
import type { ReactNode } from 'react';
import { MusicToggle } from '@/lib/music';

export function GiftShell({ children }: { children: ReactNode }) {
  return <div className="gift-world">
    <header className="gift-header">
      <Link to="/" className="brand"><Heart size={19} fill="currentColor" /> a little love, for koko</Link>
      <MusicToggle />
    </header>
    {children}
    <footer className="footer-note">made with all my love <span className="text-primary">♡</span> just for you</footer>
  </div>;
}
