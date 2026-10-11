import { useEffect, useRef, useState } from 'react';
import Matter from 'matter-js';
import { ArrowLeft, ArrowRight, Heart, Play, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import girlAsset from '@/assets/girl.jpg.asset.json';
import boyAsset from '@/assets/boy.jpg.asset.json';

export function CatchGame({ onComplete }: { onComplete: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const positionRef = useRef(.5);
  const movementRef = useRef(0);
  const [started, setStarted] = useState(false);
  const [score, setScore] = useState(0);
  const [retry, setRetry] = useState(0);
  const [loadError, setLoadError] = useState(false);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext('2d');
    if (!context) return;
    const width = 560, height = 420;
    canvas.width = width; canvas.height = height;
    const girl = new Image(), boy = new Image();
    girl.src = girlAsset.url; boy.src = boyAsset.url;
    let active = true, frame = 0, catches = 0, last = 0;
    const engine = Matter.Engine.create({ gravity: { x: 0, y: .22 } });
    const catcher = Matter.Bodies.rectangle(width / 2, height - 55, 96, 20, { isStatic: true, isSensor: true });
    let falling: Matter.Body | null = null;
    Matter.Composite.add(engine.world, catcher);
    const spawn = () => {
      if (falling) Matter.Composite.remove(engine.world, falling);
      falling = Matter.Bodies.rectangle(50 + Math.random() * (width - 100), -65, 46, 65, { frictionAir: .035, isSensor: true });
      Matter.Composite.add(engine.world, falling);
    };
    const color = (name: string) => getComputedStyle(canvas).getPropertyValue(name).trim();
    const pink = color('--petal'), primary = color('--primary');
    const render = (time: number) => {
      if (!active) return;
      const delta = Math.min(time - (last || time), 32); last = time;
      positionRef.current = Math.max(.1, Math.min(.9, positionRef.current + movementRef.current * delta * .0009));
      Matter.Body.setPosition(catcher, { x: positionRef.current * width, y: height - 75 });
      if (started && catches < 5) {
        Matter.Engine.update(engine, delta);
        if (!falling) spawn();
        if (falling && Matter.Collision.collides(falling, catcher)) {
          catches++; setScore(catches);
          Matter.Composite.remove(engine.world, falling); falling = null;
          if (catches === 5) { active = false; onComplete(); return; }
        } else if (falling && falling.position.y > height + 80) spawn();
      }
      context.clearRect(0, 0, width, height);
      context.fillStyle = pink; context.font = '24px Nunito';
      [[40,75], [490,120], [130,230], [410,290]].forEach(([x,y]) => context.fillText('♡', x ?? 0, y ?? 0));
      context.fillStyle = primary; context.fillRect(25, height - 12, width - 50, 2);
      context.globalCompositeOperation = 'multiply';
      if (boy.complete && boy.naturalWidth) context.drawImage(boy, catcher.position.x - 46, height - 125, 92, 120);
      if (falling && girl.complete && girl.naturalWidth) context.drawImage(girl, falling.position.x - 29, falling.position.y - 45, 58, 88);
      context.globalCompositeOperation = 'source-over';
      frame = requestAnimationFrame(render);
    };
    const keyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') { e.preventDefault(); movementRef.current = e.key === 'ArrowLeft' ? -1 : 1; }
    };
    const keyUp = () => { movementRef.current = 0; };
    const load = async () => {
      try { await Promise.all([girl.decode(), boy.decode()]); if (active) frame = requestAnimationFrame(render); }
      catch { if (active) setLoadError(true); }
    };
    load();
    window.addEventListener('keydown', keyDown); window.addEventListener('keyup', keyUp);
    return () => { active = false; cancelAnimationFrame(frame); Matter.Engine.clear(engine); window.removeEventListener('keydown', keyDown); window.removeEventListener('keyup', keyUp); movementRef.current = 0; };
  }, [started, retry, onComplete]);

  return <section>
    <div className="chapter-label">a little adventure for us</div>
    <h1 className="chapter-title">save me 5 times koko:3</h1>
    <div className="game-score" aria-live="polite" aria-label={`${score} of 5 catches`}>{Array.from({ length: 5 }, (_, i) => <Heart key={i} size={25} fill={i < score ? 'currentColor' : 'none'} />)}</div>
    <div className="game-stage" onPointerMove={e => { const rect = e.currentTarget.getBoundingClientRect(); positionRef.current = (e.clientX - rect.left) / rect.width; }} onPointerDown={e => { e.currentTarget.setPointerCapture(e.pointerId); const rect = e.currentTarget.getBoundingClientRect(); positionRef.current = (e.clientX - rect.left) / rect.width; }}>
      <canvas ref={canvasRef} aria-label="Koko catching falling bby" />
    </div>
    {loadError && <p role="alert" className="error-note text-center mt-4">The photos didn’t load. <Button variant="ghost" onClick={() => { setLoadError(false); setRetry(n => n + 1); }}>Try again</Button></p>}
    <div className="game-controls">
      {!started ? <Button variant="gift" onClick={() => setStarted(true)}><Play /> Ready, koko!</Button> : <>
        <Button variant="gentle" aria-label="Move left" onPointerDown={() => { movementRef.current = -1; }} onPointerUp={() => { movementRef.current = 0; }} onPointerLeave={() => { movementRef.current = 0; }} onClick={() => { positionRef.current -= .12; }}><ArrowLeft /></Button>
        <Button variant="ghost" aria-label="Restart game" title="Restart game" onClick={() => { setScore(0); setRetry(n => n + 1); }}><RotateCcw /></Button>
        <Button variant="gentle" aria-label="Move right" onPointerDown={() => { movementRef.current = 1; }} onPointerUp={() => { movementRef.current = 0; }} onPointerLeave={() => { movementRef.current = 0; }} onClick={() => { positionRef.current += .12; }}><ArrowRight /></Button>
      </>}
    </div>
  </section>;
}