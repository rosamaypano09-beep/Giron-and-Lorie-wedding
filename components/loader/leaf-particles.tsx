'use client';

import React from 'react';

// Falling leaves and petals in the motif pastels (blue, mint, sage, butter, blush, lavender)
// plus a few gold flecks — used over the photo marquee on the loading screen and the
// envelope screen (styles: loading-screen.css → .ls-photo-particle*)
const LEAF_COLORS = ['#A9B9A1', '#90E3F4', '#F7D6E0', '#B2F7EF', '#F6CBE0', '#EFF7F6', '#9FB596', '#B9CBE6'] as const;

const LEAVES = Array.from({ length: 24 }, (_, i) => ({
  x: (i * 41 + 7) % 100,
  size: 10 + ((i * 7) % 11),
  dur: 13 + ((i * 7) % 10),
  delay: -((i * 2.7) % 20),
  drift: (i % 2 === 0 ? 1 : -1) * (30 + ((i * 13) % 50)),
  spin: (i % 2 === 0 ? 1 : -1) * (200 + ((i * 53) % 320)),
  color: i % 6 === 5 ? '#D9B66A' : LEAF_COLORS[i % LEAF_COLORS.length],
  kind: i % 6 === 5 ? 'fleck' : i % 3 === 0 ? 'round' : i % 4 === 1 ? 'petal' : 'leaf',
}));

export function LeafParticles({ className = '' }: { className?: string }) {
  return (
    <div className={`ls-photo-particles ${className}`.trim()} aria-hidden="true">
      {LEAVES.map((p, i) => (
        <span
          key={i}
          className={`ls-photo-particle ls-photo-particle--${p.kind}`}
          style={
            {
              '--x': `${p.x}%`,
              '--size': `${p.size}px`,
              '--dur': `${p.dur}s`,
              '--delay': `${p.delay}s`,
              '--drift': `${p.drift}px`,
              '--spin': `${p.spin}deg`,
              '--c': p.color,
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  );
}
