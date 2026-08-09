"use client";

import { useRef, useState } from "react";

/**
 * Lets a member reposition their photo inside the circular crop.
 * Drag the image, or use the sliders. Stores a CSS object-position string
 * like "50% 30%" rather than re-encoding the file, so nothing is lost.
 */
export default function PhotoFramer({
  src,
  value,
  onChange,
  size = 160,
}: {
  src: string;
  value: string;
  onChange: (position: string) => void;
  size?: number;
}) {
  const [x, y] = parsePosition(value);
  const dragging = useRef(false);
  const [hint, setHint] = useState(true);

  const handleDrag = (e: React.MouseEvent | React.TouchEvent) => {
    if (!dragging.current) return;
    const box = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const point = "touches" in e ? e.touches[0] : (e as React.MouseEvent);
    const nx = clamp(((point.clientX - box.left) / box.width) * 100);
    const ny = clamp(((point.clientY - box.top) / box.height) * 100);
    onChange(`${Math.round(nx)}% ${Math.round(ny)}%`);
  };

  return (
    <div className="flex flex-wrap items-center gap-6">
      <div
        className="relative cursor-move touch-none overflow-hidden rounded-full border-4 border-white shadow-[0_6px_20px_rgba(20,24,31,.14)]"
        style={{ width: size, height: size }}
        onMouseDown={() => {
          dragging.current = true;
          setHint(false);
        }}
        onMouseUp={() => (dragging.current = false)}
        onMouseLeave={() => (dragging.current = false)}
        onMouseMove={handleDrag}
        onTouchStart={() => {
          dragging.current = true;
          setHint(false);
        }}
        onTouchEnd={() => (dragging.current = false)}
        onTouchMove={handleDrag}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt="Your profile photo"
          className="h-full w-full select-none object-cover"
          style={{ objectPosition: `${x}% ${y}%` }}
          draggable={false}
        />
        {hint && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-ink/45 text-center text-[12.5px] font-semibold text-white">
            Drag to
            <br />
            reposition
          </div>
        )}
      </div>

      <div className="min-w-[190px] flex-1">
        <div className="mb-3">
          <label
            htmlFor="pos-x"
            className="mb-1 block text-[12.5px] font-semibold text-ink-soft"
          >
            Horizontal
          </label>
          <input
            id="pos-x"
            type="range"
            min={0}
            max={100}
            value={x}
            onChange={(e) => onChange(`${e.target.value}% ${y}%`)}
            className="w-full accent-[#1d4f91]"
          />
        </div>
        <div className="mb-3">
          <label
            htmlFor="pos-y"
            className="mb-1 block text-[12.5px] font-semibold text-ink-soft"
          >
            Vertical
          </label>
          <input
            id="pos-y"
            type="range"
            min={0}
            max={100}
            value={y}
            onChange={(e) => onChange(`${x}% ${e.target.value}%`)}
            className="w-full accent-[#1d4f91]"
          />
        </div>
        <button
          type="button"
          onClick={() => onChange("50% 50%")}
          className="text-[13px] font-semibold text-brand hover:underline"
        >
          Reset to centre
        </button>
      </div>
    </div>
  );
}

function parsePosition(v: string): [number, number] {
  const m = (v || "50% 50%").match(/(-?\d+(?:\.\d+)?)%\s+(-?\d+(?:\.\d+)?)%/);
  return m ? [clamp(+m[1]), clamp(+m[2])] : [50, 50];
}

const clamp = (n: number) => Math.max(0, Math.min(100, n));
