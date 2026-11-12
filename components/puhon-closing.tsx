"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import localFont from "next/font/local"
import { cinzel } from "@/lib/fonts"
import { AnimatePresence, motion, useReducedMotion } from "motion/react"
import { useSiteConfig } from "@/hooks/use-site-config"
import { StoryGlyphText } from "@/lib/story-glyph-text"

const theSeasons = localFont({
  src: "../Font/Fontspring-DEMO-theseasons-reg.otf",
  display: "swap",
  variable: "--font-the-seasons",
})

const BURGUNDY = "var(--color-welcome-navy)"
const ROSE = "var(--color-welcome-heading)"
const INK = "#4A5A6B" // soft cocoa for the long verse line — gentler than burgundy, still high contrast
const QUOTE_MARK = "color-mix(in srgb, #9EB9D4 70%, transparent)"
// Soft ivory edge keeps burgundy text crisp over pink or photos
const glow = "0 1px 0 rgb(247 244 239 / 90%), 0 0 14px rgb(247 244 239 / 85%)"

// Two looks: burgundy on light pink (love story) or ivory over photos (Snap & Share banner)
const TONES = {
  dark: {
    title: BURGUNDY,
    accent: ROSE,
    lead: BURGUNDY,
    body: INK,
    mark: QUOTE_MARK,
    rule: "#9EB9D4",
    shadow: glow,
  },
  light: {
    title: "#FFFBF0",
    accent: "#DCE3EC",
    lead: "#FFFBF0",
    body: "rgb(247 244 239 / 94%)",
    mark: "rgb(220 227 236 / 75%)",
    rule: "rgb(220 227 236 / 85%)",
    // Layered burgundy shadow: crisp edge plus a soft halo so ivory reads on any photo
    shadow:
      "0 1px 2px rgb(31 45 58 / 85%), 0 2px 8px rgb(31 45 58 / 60%), 0 0 22px rgb(31 45 58 / 45%)",
  },
} as const

// "Puhon" — big word, hashtag, then the verse. Text comes from loveStory.closing* in site.ts.
export function PuhonText({ className = "", tone = "dark" }: { className?: string; tone?: keyof typeof TONES }) {
  const t = TONES[tone]
  const { loveStory } = useSiteConfig()
  const { closingEyebrow, closingHashtag, closingQuoteLead, closingQuote, closingCitation } = loveStory

  return (
    <div className={`mx-auto max-w-xl text-center ${className}`}>
      {closingEyebrow ? (
        <p
          className={`${theSeasons.className} uppercase leading-[0.9] tracking-[0.12em]`}
          style={{ color: t.title, textShadow: t.shadow, fontSize: "clamp(3rem, 15vw, 6rem)" }}
        >
          {closingEyebrow}
        </p>
      ) : null}
      {closingHashtag ? (
        <p
          className={`${cinzel.className} mt-3 break-words text-[0.8rem] font-bold tracking-[0.06em] sm:mt-4 sm:text-base md:text-lg`}
          style={{ color: t.accent, textShadow: t.shadow }}
        >
          {closingHashtag}
        </p>
      ) : null}
      {closingQuoteLead || closingQuote ? (
      <blockquote className="relative mx-auto mt-6 max-w-lg px-7 pt-6 pb-2 sm:mt-8 sm:px-12 sm:pt-8">
        {/* Large open / close quotation marks framing the verse */}
        <span
          aria-hidden
          className={`${theSeasons.className} pointer-events-none absolute left-0 top-0 select-none leading-none`}
          style={{ color: t.mark, textShadow: tone === "light" ? t.shadow : undefined, fontSize: "clamp(3.5rem, 13vw, 5.5rem)" }}
        >
          &ldquo;
        </span>
        <span
          aria-hidden
          className={`${theSeasons.className} pointer-events-none absolute -bottom-9 right-0 select-none leading-none sm:-bottom-12`}
          style={{ color: t.mark, textShadow: tone === "light" ? t.shadow : undefined, fontSize: "clamp(3.5rem, 13vw, 5.5rem)" }}
        >
          &rdquo;
        </span>
        {closingQuoteLead ? (
          <p
            className="font-goudy-italic text-[0.95rem] font-semibold not-italic leading-snug sm:text-lg md:text-xl"
            style={{ color: t.lead, textShadow: t.shadow }}
          >
            <StoryGlyphText text={closingQuoteLead} />
          </p>
        ) : null}
        <p
          className="font-goudy-italic mt-1.5 text-[0.9rem] italic leading-relaxed sm:text-base md:text-[1.05rem]"
          style={{ color: t.body, textShadow: t.shadow }}
        >
          <StoryGlyphText text={closingQuote} />
        </p>
      </blockquote>
      ) : null}
      {closingCitation ? (
        <p className="mt-5 flex items-center justify-center gap-2.5 sm:mt-5 sm:gap-3">
          <span className="h-px w-8 sm:w-12" style={{ background: `linear-gradient(to right, transparent, ${t.rule})` }} />
          <cite
            className={`${cinzel.className} text-[0.68rem] font-semibold not-italic uppercase tracking-[0.16em] sm:text-xs md:text-sm`}
            style={{ color: t.accent, textShadow: t.shadow }}
          >
            <StoryGlyphText text={closingCitation} />
          </cite>
          <span className="h-px w-8 sm:w-12" style={{ background: `linear-gradient(to left, transparent, ${t.rule})` }} />
        </p>
      ) : null}
    </div>
  )
}

type Verse = { lead: string; quote: string; citation: string }

// One verse at a time over the photos; fades + drifts up into the next one
function RotatingVerses({ verses, intervalMs }: { verses: readonly Verse[]; intervalMs: number }) {
  const t = TONES.light
  const reduceMotion = useReducedMotion()
  const [index, setIndex] = useState(0)

  useEffect(() => {
    if (reduceMotion || verses.length < 2) return
    const id = window.setInterval(() => setIndex((i) => (i + 1) % verses.length), intervalMs)
    return () => window.clearInterval(id)
  }, [verses.length, intervalMs, reduceMotion])

  const verse = verses[index % verses.length]

  return (
    <div className="mx-auto max-w-xl px-5 py-14 text-center sm:px-10 sm:py-20 md:py-24">
      {/* Fixed height so the banner doesn't jump between short and long verses */}
      <div className="relative grid min-h-[13rem] place-items-center sm:min-h-[14rem]" aria-live="polite">
        <AnimatePresence mode="wait" initial={false}>
          <motion.figure
            key={index}
            className="w-full"
            initial={reduceMotion ? false : { opacity: 0, y: 16, filter: "blur(6px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -12, filter: "blur(6px)" }}
            transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
          >
            <blockquote className="relative mx-auto max-w-lg px-7 pt-6 pb-2 sm:px-12 sm:pt-8">
              <span
                aria-hidden
                className={`${theSeasons.className} pointer-events-none absolute left-0 top-0 select-none leading-none`}
                style={{ color: t.mark, textShadow: t.shadow, fontSize: "clamp(3.5rem, 13vw, 5.5rem)" }}
              >
                &ldquo;
              </span>
              <span
                aria-hidden
                className={`${theSeasons.className} pointer-events-none absolute -bottom-9 right-0 select-none leading-none sm:-bottom-12`}
                style={{ color: t.mark, textShadow: t.shadow, fontSize: "clamp(3.5rem, 13vw, 5.5rem)" }}
              >
                &rdquo;
              </span>
              {verse.lead ? (
                <p
                  className="font-goudy-italic text-[1.05rem] font-semibold not-italic leading-snug sm:text-xl md:text-2xl"
                  style={{ color: t.lead, textShadow: t.shadow }}
                >
                  <StoryGlyphText text={verse.lead} />
                </p>
              ) : null}
              <p
                className="font-goudy-italic mt-2 text-[0.9rem] italic leading-relaxed sm:text-base md:text-[1.05rem]"
                style={{ color: t.body, textShadow: t.shadow }}
              >
                <StoryGlyphText text={verse.quote} />
              </p>
            </blockquote>
            {verse.citation ? (
              <figcaption className="mt-6 flex items-center justify-center gap-2.5 sm:mt-7 sm:gap-3">
                <span className="h-px w-8 sm:w-12" style={{ background: `linear-gradient(to right, transparent, ${t.rule})` }} />
                <cite
                  className={`${cinzel.className} text-[0.68rem] font-semibold not-italic uppercase tracking-[0.16em] sm:text-xs md:text-sm`}
                  style={{ color: t.accent, textShadow: t.shadow }}
                >
                  <StoryGlyphText text={verse.citation} />
                </cite>
                <span className="h-px w-8 sm:w-12" style={{ background: `linear-gradient(to left, transparent, ${t.rule})` }} />
              </figcaption>
            ) : null}
          </motion.figure>
        </AnimatePresence>
      </div>

      {/* Which verse is showing */}
      {verses.length > 1 && (
        <div className="mt-6 flex items-center justify-center gap-1.5" aria-hidden>
          {verses.map((v, i) => (
            <span
              key={v.citation + i}
              className="block h-1.5 rounded-full transition-all duration-500"
              style={{ width: i === index ? 16 : 6, background: i === index ? t.title : t.rule, opacity: i === index ? 1 : 0.6 }}
            />
          ))}
        </div>
      )}
    </div>
  )
}

// Same text over photos that slowly crossfade (snapShare.puhon in site.ts)
export function PuhonBanner() {
  const { snapShare } = useSiteConfig()
  const { show, images, intervalMs } = snapShare.puhon
  // Older configs may not have their own verses — then the love story closing text is used
  const extra = snapShare.puhon as { verses?: Verse[]; verseIntervalMs?: number }
  const verses = (extra.verses ?? []).filter((v) => v.quote.trim())
  const verseIntervalMs = extra.verseIntervalMs ?? intervalMs * 2
  const reduceMotion = useReducedMotion()
  const [active, setActive] = useState(0)

  useEffect(() => {
    if (reduceMotion || images.length < 2) return
    const id = window.setInterval(() => setActive((i) => (i + 1) % images.length), intervalMs)
    return () => window.clearInterval(id)
  }, [images.length, intervalMs, reduceMotion])

  if (!show) return null

  return (
    <div
      className="relative isolate overflow-hidden rounded-[1.5rem] sm:rounded-[2rem]"
      style={{
        boxShadow:
          "0 0 0 1px color-mix(in srgb, #9EB9D4 45%, transparent), 0 0 0 6px rgb(247 244 239 / 35%), 0 26px 50px -28px color-mix(in srgb, #2F4A66 45%, transparent)",
      }}
    >
      {images.map((src, i) => (
        <div
          key={src}
          aria-hidden
          className="absolute inset-0 -z-20 transition-opacity duration-[1800ms] ease-in-out"
          style={{ opacity: i === active ? 1 : 0 }}
        >
          <Image
            src={encodeURI(src)}
            alt=""
            fill
            loading="lazy"
            sizes="(max-width: 1024px) 100vw, 1152px"
            className="object-cover transition-transform ease-out"
            style={{
              // Slow drift while a photo is showing
              transform: i === active && !reduceMotion ? "scale(1.08)" : "scale(1)",
              transitionDuration: `${intervalMs + 1800}ms`,
            }}
          />
        </div>
      ))}
      {/* Burgundy wash — deeper in the middle where the text sits, so ivory text reads while the photos stay visible */}
      <div
        aria-hidden
        className="absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(85% 70% at 50% 50%, rgb(31 45 58 / 52%) 0%, rgb(47 74 102 / 34%) 60%, rgb(47 74 102 / 22%) 100%), linear-gradient(180deg, rgb(47 74 102 / 10%) 0%, rgb(31 45 58 / 25%) 100%)",
        }}
      />
      {verses.length > 0 ? (
        <RotatingVerses verses={verses} intervalMs={verseIntervalMs} />
      ) : (
        <PuhonText tone="light" className="px-5 py-14 sm:px-10 sm:py-20 md:py-24" />
      )}
    </div>
  )
}
