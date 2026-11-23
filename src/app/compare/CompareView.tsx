"use client";

import { useEffect, useRef, useState } from "react";

// The reference image is a 1600 x 1089 sheet of eight page panels. Each entry is
// that page's panel on the sheet: [left, top, width, height] in image pixels.
const SHEET = { width: 1600, height: 1089 };
const pages = [
  { name: "Home", path: "/", box: [8, 35, 405, 565] },
  { name: "About", path: "/about", box: [420, 35, 379, 565] },
  { name: "Culture", path: "/culture", box: [805, 35, 387, 565] },
  { name: "Careers", path: "/careers", box: [1198, 35, 392, 565] },
  { name: "Life", path: "/life", box: [8, 607, 405, 465] },
  { name: "Learning", path: "/learning", box: [420, 607, 379, 465] },
  { name: "Leadership", path: "/leadership", box: [805, 607, 387, 465] },
  { name: "Contact", path: "/contact", box: [1198, 607, 392, 465] },
];

// The live page is rendered at this width (a narrow desktop, like the panels) and scaled to fit.
const SITE_WIDTH = 1040;

export function CompareView() {
  const [index, setIndex] = useState(0);
  const [column, setColumn] = useState(600);
  const columnRef = useRef<HTMLDivElement>(null);
  const page = pages[index];
  const [left, top, width, height] = page.box;

  useEffect(() => {
    const measure = () => setColumn(columnRef.current?.clientWidth ?? 600);
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  const zoom = column / width; // reference panel scaled to the column
  const panelHeight = height * zoom;
  const siteScale = column / SITE_WIDTH;

  return (
    <div className="min-h-dvh bg-slate-900 p-4 text-white">
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <h1 className="mr-3 text-lg font-bold">Design vs. site</h1>
        {pages.map((item, itemIndex) => (
          <button
            key={item.path}
            type="button"
            onClick={() => setIndex(itemIndex)}
            aria-pressed={itemIndex === index}
            className={`rounded-full px-4 py-1.5 text-sm font-semibold ${
              itemIndex === index ? "bg-white text-slate-900" : "bg-white/10 hover:bg-white/20"
            }`}
          >
            {item.name}
          </button>
        ))}
        <a href={page.path} target="_blank" rel="noreferrer" className="ml-auto text-sm underline">
          Open this page ↗
        </a>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <section>
          <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-white/60">
            Your reference design
          </h2>
          <div
            ref={columnRef}
            className="relative overflow-hidden rounded-xl bg-black"
            style={{ height: panelHeight }}
          >
            {/* The whole sheet is shifted and scaled so only this page's panel shows. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/compare/image"
              alt={`Reference design for the ${page.name} page`}
              className="absolute max-w-none"
              style={{
                width: SHEET.width * zoom,
                height: SHEET.height * zoom,
                left: -left * zoom,
                top: -top * zoom,
              }}
            />
          </div>
        </section>

        <section>
          <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-white/60">
            The site now ({page.path})
          </h2>
          <div className="overflow-hidden rounded-xl bg-white" style={{ height: panelHeight }}>
            <iframe
              key={page.path}
              src={page.path}
              title={`Live ${page.name} page`}
              style={{
                width: SITE_WIDTH,
                height: panelHeight / siteScale,
                transform: `scale(${siteScale})`,
                transformOrigin: "top left",
                border: 0,
              }}
            />
          </div>
        </section>
      </div>
      <p className="mt-3 text-xs text-white/50">
        Development tool only. This page returns “not found” on the live site.
      </p>
    </div>
  );
}
