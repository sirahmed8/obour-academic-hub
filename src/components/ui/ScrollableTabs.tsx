"use client";

import React, { useRef, useState, useEffect, ReactNode } from "react";
import { cn } from "@/lib/utils";

interface ScrollableTabsProps {
  children: ReactNode;
  className?: string;
}

export function ScrollableTabs({ children, className }: ScrollableTabsProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const startX = useRef(0);
  const scrollLeftStart = useRef(0);
  const [dragging, setDragging] = useState(false);

  // Non-passive wheel listener — React's onWheel is passive and cannot prevent scroll
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const handler = (e: WheelEvent) => {
      if (e.deltaY !== 0) {
        e.preventDefault();
        el.scrollLeft += e.deltaY;
      }
    };
    el.addEventListener("wheel", handler, { passive: false });
    return () => el.removeEventListener("wheel", handler);
  }, []);

  const onMouseDown = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    isDragging.current = true;
    startX.current = e.pageX - containerRef.current.offsetLeft;
    scrollLeftStart.current = containerRef.current.scrollLeft;
    setDragging(true);
  };

  const onMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current || !containerRef.current) return;
    e.preventDefault();
    const x = e.pageX - containerRef.current.offsetLeft;
    const walk = (x - startX.current) * 1.5;
    containerRef.current.scrollLeft = scrollLeftStart.current - walk;
  };

  const onMouseUp = () => {
    isDragging.current = false;
    setDragging(false);
  };

  const onMouseLeave = () => {
    isDragging.current = false;
    setDragging(false);
  };

  return (
    <div
      ref={containerRef}
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseLeave}
      className={cn(
        "w-full max-w-full overflow-x-auto flex items-center gap-2 flex-nowrap py-1.5 touch-pan-x shrink-0 select-none scrollbar-hide",
        dragging ? "cursor-grabbing" : "cursor-grab",
        className
      )}
    >
      {children}
    </div>
  );
}
