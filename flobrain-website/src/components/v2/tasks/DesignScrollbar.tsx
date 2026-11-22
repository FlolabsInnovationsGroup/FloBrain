"use client";

import { useEffect, useRef, type PointerEvent as ReactPointerEvent, type ReactNode } from "react";

import "./DesignScrollbar.css";

type DesignScrollbarProps = {
  children: ReactNode;
  /** Row that holds the viewport and the track. */
  className?: string;
  /** Scrollable region. */
  viewportClassName?: string;
};

type ThumbMetrics = {
  maxScroll: number;
  thumbPercent: number;
  travel: number;
};

function measure(viewport: HTMLElement): ThumbMetrics {
  const maxScroll = Math.max(viewport.scrollHeight - viewport.clientHeight, 0);
  const ratio =
    viewport.scrollHeight > 0
      ? Math.min(1, viewport.clientHeight / viewport.scrollHeight)
      : 1;
  const thumbPercent = Math.max(ratio * 100, maxScroll > 0 ? 12 : 100);
  return {
    maxScroll,
    thumbPercent,
    travel: Math.max(100 - thumbPercent, 0),
  };
}

function paintThumb(viewport: HTMLElement, thumb: HTMLElement | null, metrics: ThumbMetrics) {
  if (!thumb) return;
  const top =
    metrics.maxScroll === 0 || metrics.travel === 0
      ? 0
      : (viewport.scrollTop / metrics.maxScroll) * metrics.travel;
  thumb.style.height = `${metrics.thumbPercent}%`;
  thumb.style.top = `${top}%`;
}

/**
 * Content scroller with the Lead Controls track (grey rail, dark thumb)
 * beside it. The thumb follows the viewport without re-rendering the content.
 * Wheel input stays on the box instead of the page.
 */
export function DesignScrollbar({ children, className, viewportClassName }: DesignScrollbarProps) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const thumbRef = useRef<HTMLDivElement>(null);
  const metricsRef = useRef<ThumbMetrics>({ maxScroll: 0, thumbPercent: 100, travel: 0 });

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;

    const sync = () => {
      const metrics = measure(viewport);
      metricsRef.current = metrics;
      paintThumb(viewport, thumbRef.current, metrics);
    };

    sync();
    viewport.addEventListener("scroll", sync, { passive: true });
    const observer = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(sync);
    observer?.observe(viewport);
    const content = viewport.firstElementChild;
    if (content instanceof HTMLElement) observer?.observe(content);

    return () => {
      viewport.removeEventListener("scroll", sync);
      observer?.disconnect();
    };
  }, []);

  function scrollToThumbTop(nextTopPercent: number) {
    const viewport = viewportRef.current;
    const { maxScroll, travel } = metricsRef.current;
    if (!viewport || maxScroll === 0 || travel === 0) return;
    const clamped = Math.min(Math.max(nextTopPercent, 0), travel);
    viewport.scrollTop = (clamped / travel) * maxScroll;
  }

  function onTrackPointerDown(event: ReactPointerEvent<HTMLDivElement>) {
    if (event.target !== trackRef.current) return;
    const track = trackRef.current;
    if (!track) return;
    const rect = track.getBoundingClientRect();
    const clickRatio = (event.clientY - rect.top) / rect.height;
    scrollToThumbTop(clickRatio * 100 - metricsRef.current.thumbPercent / 2);
  }

  function onThumbPointerDown(event: ReactPointerEvent<HTMLDivElement>) {
    event.preventDefault();
    event.stopPropagation();
    const viewport = viewportRef.current;
    const track = trackRef.current;
    const { maxScroll, thumbPercent } = metricsRef.current;
    if (!viewport || !track || maxScroll === 0) return;

    const scrollingViewport = viewport;
    const startY = event.clientY;
    const startScroll = scrollingViewport.scrollTop;
    const thumbPx = (thumbPercent / 100) * track.clientHeight;
    const travelPx = Math.max(track.clientHeight - thumbPx, 1);

    function onMove(moveEvent: PointerEvent) {
      scrollingViewport.scrollTop =
        startScroll + ((moveEvent.clientY - startY) / travelPx) * maxScroll;
    }

    function onUp() {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    }

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
  }

  return (
    <div className={className ? `fb-v2-design-scroll ${className}` : "fb-v2-design-scroll"}>
      <div
        ref={viewportRef}
        className={
          viewportClassName
            ? `fb-v2-design-scroll-viewport ${viewportClassName}`
            : "fb-v2-design-scroll-viewport"
        }
      >
        <div className="fb-v2-design-scroll-content">{children}</div>
      </div>
      <div className="fb-v2-design-scroll-rail">
        <div
          ref={trackRef}
          className="fb-v2-design-scroll-track"
          onPointerDown={onTrackPointerDown}
        >
          <div
            ref={thumbRef}
            className="fb-v2-design-scroll-thumb"
            onPointerDown={onThumbPointerDown}
          />
        </div>
      </div>
    </div>
  );
}
