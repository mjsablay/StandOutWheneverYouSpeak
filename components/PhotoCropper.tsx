"use client";

import { useCallback, useRef, useState } from "react";
import { ZoomIn, ZoomOut } from "lucide-react";

/**
 * Crop-on-upload editor.
 *
 * Opens as soon as a file is chosen: drag to position, pinch/scroll or use
 * the zoom control, then Save. It renders the visible circle to a square
 * canvas and returns a real cropped JPEG — so the stored image is already
 * framed correctly and displays right everywhere, with no position data to
 * keep in sync.
 */

const BOX = 320; // editor canvas size on screen
const OUT = 512; // exported image size

export default function PhotoCropper({
  file,
  onCancel,
  onSave,
  saving,
}: {
  file: File;
  onCancel: () => void;
  onSave: (cropped: Blob) => void;
  saving: boolean;
}) {
  const [url] = useState(() => URL.createObjectURL(file));
  const [zoom, setZoom] = useState(1);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [natural, setNatural] = useState({ w: 0, h: 0 });

  const imgRef = useRef<HTMLImageElement>(null);
  const drag = useRef<{ x: number; y: number } | null>(null);

  /** Base scale so the shorter side exactly fills the circle. */
  const baseScale =
    natural.w && natural.h ? BOX / Math.min(natural.w, natural.h) : 1;
  const scale = baseScale * zoom;
  const dispW = natural.w * scale;
  const dispH = natural.h * scale;

  /** Keep the image covering the circle at all times. */
  const clampPos = useCallback(
    (p: { x: number; y: number }) => {
      const maxX = Math.max(0, (dispW - BOX) / 2);
      const maxY = Math.max(0, (dispH - BOX) / 2);
      return {
        x: Math.max(-maxX, Math.min(maxX, p.x)),
        y: Math.max(-maxY, Math.min(maxY, p.y)),
      };
    },
    [dispW, dispH],
  );

  const start = (clientX: number, clientY: number) => {
    drag.current = { x: clientX - pos.x, y: clientY - pos.y };
  };

  const move = (clientX: number, clientY: number) => {
    if (!drag.current) return;
    setPos(clampPos({ x: clientX - drag.current.x, y: clientY - drag.current.y }));
  };

  const end = () => {
    drag.current = null;
  };

  const changeZoom = (z: number) => {
    const next = Math.max(1, Math.min(3, z));
    setZoom(next);
    // Re-clamp so zooming out can't leave a gap.
    const nDispW = natural.w * baseScale * next;
    const nDispH = natural.h * baseScale * next;
    const maxX = Math.max(0, (nDispW - BOX) / 2);
    const maxY = Math.max(0, (nDispH - BOX) / 2);
    setPos((p) => ({
      x: Math.max(-maxX, Math.min(maxX, p.x)),
      y: Math.max(-maxY, Math.min(maxY, p.y)),
    }));
  };

  const save = () => {
    const img = imgRef.current;
    if (!img) return;

    const canvas = document.createElement("canvas");
    canvas.width = OUT;
    canvas.height = OUT;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Map the on-screen crop window back to source pixels.
    const ratio = OUT / BOX;
    ctx.imageSmoothingQuality = "high";
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, OUT, OUT);
    ctx.drawImage(
      img,
      (BOX / 2 - dispW / 2 + pos.x) * ratio,
      (BOX / 2 - dispH / 2 + pos.y) * ratio,
      dispW * ratio,
      dispH * ratio,
    );

    canvas.toBlob(
      (blob) => blob && onSave(blob),
      "image/jpeg",
      0.9,
    );
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-ink/60 p-4">
      <div className="w-full max-w-[420px] rounded-2xl bg-white p-6 shadow-[0_24px_60px_rgba(0,0,0,.3)]">
        <h3 className="mb-1 text-[19px] font-semibold tracking-tight">
          Position your photo
        </h3>
        <p className="mb-5 text-[14px] text-ink-soft">
          Drag to move. Zoom to fill the circle.
        </p>

        <div
          className="relative mx-auto cursor-grab touch-none overflow-hidden rounded-full bg-paper-warm active:cursor-grabbing"
          style={{ width: BOX, height: BOX }}
          onMouseDown={(e) => start(e.clientX, e.clientY)}
          onMouseMove={(e) => move(e.clientX, e.clientY)}
          onMouseUp={end}
          onMouseLeave={end}
          onTouchStart={(e) => start(e.touches[0].clientX, e.touches[0].clientY)}
          onTouchMove={(e) => move(e.touches[0].clientX, e.touches[0].clientY)}
          onTouchEnd={end}
          onWheel={(e) => changeZoom(zoom + (e.deltaY < 0 ? 0.08 : -0.08))}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            ref={imgRef}
            src={url}
            alt=""
            draggable={false}
            onLoad={(e) => {
              const el = e.currentTarget;
              setNatural({ w: el.naturalWidth, h: el.naturalHeight });
            }}
            className="pointer-events-none absolute left-1/2 top-1/2 max-w-none select-none"
            style={{
              width: dispW || undefined,
              height: dispH || undefined,
              transform: `translate(calc(-50% + ${pos.x}px), calc(-50% + ${pos.y}px))`,
            }}
          />
        </div>

        <div className="mt-5 flex items-center gap-3">
          <button
            type="button"
            onClick={() => changeZoom(zoom - 0.2)}
            aria-label="Zoom out"
            className="rounded-lg border border-line p-2 hover:bg-paper-warm"
          >
            <ZoomOut className="h-4 w-4" strokeWidth={2} />
          </button>
          <input
            type="range"
            min={1}
            max={3}
            step={0.01}
            value={zoom}
            onChange={(e) => changeZoom(Number(e.target.value))}
            aria-label="Zoom"
            className="flex-1 accent-[#1d4f91]"
          />
          <button
            type="button"
            onClick={() => changeZoom(zoom + 0.2)}
            aria-label="Zoom in"
            className="rounded-lg border border-line p-2 hover:bg-paper-warm"
          >
            <ZoomIn className="h-4 w-4" strokeWidth={2} />
          </button>
        </div>

        <div className="mt-6 flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={saving}
            className="flex-1 rounded-lg border border-line px-5 py-2.5 text-[14.5px] font-semibold hover:bg-paper-warm disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={save}
            disabled={saving || !natural.w}
            className="flex-1 rounded-lg bg-brand px-5 py-2.5 text-[14.5px] font-semibold text-white hover:bg-brand-dark disabled:opacity-50"
          >
            {saving ? "Saving…" : "Save photo"}
          </button>
        </div>
      </div>
    </div>
  );
}
