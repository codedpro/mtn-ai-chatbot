// use-scroll-to-bottom.tsx
'use client';

import { useRef, useEffect, useState } from 'react';

// Accepts a “watch” value—pass in messages.length
export function useScrollToBottom<T extends HTMLElement>(watch: number) {
  const containerRef = useRef<T>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const [isAtBottom, setIsAtBottom] = useState(true);

  // 1) Track user scroll position
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const onScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = el;
      // if you’re within 100px of the bottom, consider “at bottom”
      setIsAtBottom(scrollHeight - scrollTop - clientHeight < 100);
    };

    el.addEventListener('scroll', onScroll);
    onScroll(); // initialize

    return () => {
      el.removeEventListener('scroll', onScroll);
    };
  }, []);

  // 2) Only auto‑scroll when `watch` (messages.length) changes & you’re at bottom
  useEffect(() => {
    if (isAtBottom) {
      endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  }, [watch, isAtBottom]);

  return [containerRef, endRef] as const;
}
