"use client"

import React, { useRef, useState } from "react"
import localFont from "next/font/local"
import { motion, useInView, useReducedMotion, useScroll, useTransform, type Variants } from "motion/react"
import { sectionType, storyChapterTitleSize } from "@/lib/section-typography"
import Image from "next/image"
import { TornPaperEdge } from "./TornPaperEdge"
import { TintedDeco } from "@/components/tinted-deco"
import { StoryGlyphText } from "@/lib/story-glyph-text"
import { RisingHearts, HEART_PATH } from "@/components/rising-hearts"

const theSeasons = localFont({
  src: "../Font/Fontspring-DEMO-theseasons-reg.otf",
  display: "swap",
  variable: "--font-the-seasons",
})

const lightBg = "var(--color-welcome-bg)"
const darkBg = "var(--color-welcome-green)"
const revealEase = [0.22, 1, 0.36, 1] as const

// Plain cards: flat palette colors — teal text on light cards, light text on teal cards
const TEAL = "var(--color-welcome-navy)"
const ON_TEAL = "var(--color-motif-soft)"

export type StoryCardCorners = {
  topLeft: string
  topRight: string
  bottomLeft: string
  bottomRight: string
}

export type LoveStoryEucalyptusDecos = {
  topLeft: string
  bottomRight: string
  timelineTop: string
  sectionBottom: string
}

interface StorySectionProps {
  imageSrc?: string
  imageAlt?: string
  // Which part of the photo stays in frame (CSS object-position), e.g. "center 20%"
  imagePosition?: string
  // Milestone date shown above the title (falls back to "Chapter 0X")
  date?: string
  title?: string
  text: React.ReactNode
  layout: "image-left" | "image-right"
  theme: "dark" | "light"
  isFirst?: boolean
  isLast?: boolean
  plain?: boolean
  chapterIndex?: number
  eucalyptusDecos?: LoveStoryEucalyptusDecos
  // Word before the number on plain cards, e.g. "Chapter" → "Chapter 01"
  chapterLabelText?: string
  // Plain layout: faint chapter number behind the text / heart divider after the chapter
  showNumber?: boolean
  showDivider?: boolean
  // Plain layout: florals on the card corners (two per card, alternating pairs)
  cardCorners?: StoryCardCorners
}

function PlainEucalyptusDecos({ decos }: { decos: LoveStoryEucalyptusDecos }) {
  return (
    <>
      <TintedDeco src={decos.timelineTop} className="story-plain-card__euc story-plain-card__euc--center" />
      <TintedDeco src={decos.topLeft} className="story-plain-card__euc story-plain-card__euc--left" />
      <TintedDeco src={decos.bottomRight} className="story-plain-card__euc story-plain-card__euc--right" />
    </>
  )
}

function PlainChapterDivider({ dark }: { dark: boolean }) {
  const line = dark
    ? "color-mix(in srgb, var(--color-motif-soft) 45%, transparent)"
    : "color-mix(in srgb, var(--color-welcome-navy) 35%, transparent)"
  return (
    <div className="mb-4 flex items-center justify-center gap-1.5 sm:mb-5">
      <span className="h-px w-8 sm:w-12" style={{ background: line }} />
      <span
        className="h-1 w-1 rotate-45"
        style={{ background: dark ? "var(--color-motif-blush)" : "var(--color-romantic-coral)" }}
        aria-hidden
      />
      <span className="h-px w-8 sm:w-12" style={{ background: line }} />
    </div>
  )
}

/**
 * Plain mode: one card per chapter, with an optional couple photo. Without a photo,
 * cards zig-zag left / right on tablet and up (centered on phones). With one, the
 * photo and card sit side by side and swap sides each chapter (side by side
 * on phones too — compact card text there). Cards alternate butter-yellow and pastel-blue
 * tones, and slide in from the left on scroll with their lines staggered.
 * Two florals bloom on opposite corners of each card (pairs alternate) and
 * sway gently. A large faint chapter number drifts behind each card
 * (parallax). A small heart divider separates chapters.
 */
function PlainStoryCard({
  date,
  title,
  text,
  alignLeft,
  isLast,
  chapterIndex,
  fallbackLabel,
  showNumber,
  showDivider,
  corners,
  imageSrc,
  imageAlt,
  imagePosition,
}: {
  date?: string
  title?: string
  text: React.ReactNode
  alignLeft: boolean
  isLast: boolean
  chapterIndex: number
  fallbackLabel: string
  showNumber: boolean
  showDivider: boolean
  corners?: StoryCardCorners
  imageSrc?: string
  imageAlt?: string
  imagePosition?: string
}) {
  const reduceMotion = useReducedMotion()
  const rowRef = useRef<HTMLDivElement>(null)
  // Scroll-linked drift: the ghost number moves faster than the card for a soft parallax
  const { scrollYProgress } = useScroll({ target: rowRef, offset: ["start end", "end start"] })
  const numberY = useTransform(scrollYProgress, [0, 1], reduceMotion ? [0, 0] : [70, -70])
  const cardY = useTransform(scrollYProgress, [0, 1], reduceMotion ? [0, 0] : [18, -18])
  const number = String(chapterIndex + 1).padStart(2, "0")
  // Cards cycle through the five motif pastels, so every chapter wears the palette:
  // blue → mint → butter → blush → lavender → blue …
  const STORY_TONES = ["blue", "mint", "butter", "blush", "lavender"] as const
  const tone = STORY_TONES[chapterIndex % STORY_TONES.length]
  // Alternate the floral pair so neighbouring cards don't mirror each other
  const cornerPair = corners
    ? chapterIndex % 2
      ? [
          { src: corners.topRight, pos: "tr" },
          { src: corners.bottomLeft, pos: "bl" },
        ]
      : [
          { src: corners.topLeft, pos: "tl" },
          { src: corners.bottomRight, pos: "br" },
        ]
    : []

  // Each side enters from its own edge: whatever sits on the LEFT slides in from the left,
  // whatever sits on the RIGHT slides in from the right. The photo leads, the card follows.
  // alignLeft → photo on the left, card on the right (and the reverse on the next chapter).
  const cardFrom = alignLeft ? 1 : -1 // +1 = from the right, -1 = from the left
  const cardVariants: Variants = {
    hidden: { opacity: 0, x: cardFrom * 90, rotate: cardFrom * 2.5, scale: 0.96, filter: "blur(6px)" },
    show: {
      opacity: 1,
      x: 0,
      rotate: 0,
      scale: 1,
      filter: "blur(0px)",
      transition: {
        x: { type: "spring", stiffness: 70, damping: 16, mass: 0.9, delay: 0.18 },
        rotate: { type: "spring", stiffness: 70, damping: 14, delay: 0.18 },
        default: { duration: 0.85, ease: revealEase, delay: 0.18 },
        staggerChildren: 0.11,
        delayChildren: 0.42,
      },
    },
  }
  // Lines inside the card glide in from the card's side too
  const lineVariants: Variants = {
    hidden: { opacity: 0, x: cardFrom * 26 },
    show: { opacity: 1, x: 0, transition: { duration: 0.7, ease: revealEase } },
  }
  // Florals bloom open once the card has landed
  const cornerVariants: Variants = {
    hidden: { opacity: 0, scale: 0.55, rotate: -12 },
    show: { opacity: 1, scale: 1, rotate: 0, transition: { duration: 1.1, delay: 0.55, ease: revealEase } },
  }
  // Photo slides in from its own side and settles with a slight tilt; hover / tap slides it
  // outward (away from the card), straightens it and brings it to the front so it shows in full
  const photoRef = useRef<HTMLElement>(null)
  const photoInView = useInView(photoRef, { once: true, margin: "-12%" })
  const [photoOpen, setPhotoOpen] = useState(false)
  const photoTilt = alignLeft ? -3 : 3
  const photoVariants: Variants = {
    // Swings in from its own edge, over-rotated, and settles on its tilt
    hidden: { opacity: 0, x: alignLeft ? -110 : 110, rotate: alignLeft ? -12 : 12, scale: 0.9, zIndex: 0 },
    show: {
      opacity: 1,
      x: 0,
      rotate: photoTilt,
      scale: 1,
      zIndex: 0,
      transition: {
        x: { type: "spring", stiffness: 65, damping: 15, mass: 0.9 },
        rotate: { type: "spring", stiffness: 60, damping: 11 },
        scale: { duration: 0.9, ease: revealEase },
        opacity: { duration: 0.6, ease: "easeOut" },
      },
    },
    open: {
      opacity: 1,
      x: alignLeft ? "-8%" : "8%",
      rotate: 0,
      scale: 1.04,
      zIndex: 3,
      transition: { duration: 0.45, ease: revealEase },
    },
  }
  const photoState = reduceMotion
    ? photoOpen ? "open" : "show"
    : photoOpen ? "open" : photoInView ? "show" : "hidden"

  return (
    <div ref={rowRef} className={`${theSeasons.variable} story-card-row relative z-[2] px-5 sm:px-8 md:px-10`}>
      <RisingHearts />
      <div
        className={`relative mx-auto flex max-w-5xl justify-center py-8 sm:py-10 md:py-12 ${
          imageSrc
            ? `story-card-pair items-center ${alignLeft ? "flex-row" : "flex-row-reverse"}`
            : alignLeft
              ? "md:justify-start"
              : "md:justify-end"
        }`}
      >
        {/* Couple photo (loveStory.chapters[].image) — opposite the card, tucked slightly behind it; sides swap each chapter */}
        {imageSrc && (
          <motion.figure
            ref={photoRef}
            className={`story-card-photo ${alignLeft ? "story-card-photo--left" : "story-card-photo--right"}`}
            variants={photoVariants}
            initial={reduceMotion ? "show" : "hidden"}
            animate={photoState}
            whileHover={photoInView || reduceMotion ? "open" : undefined}
            onClick={() => setPhotoOpen((open) => !open)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault()
                setPhotoOpen((open) => !open)
              }
            }}
            role="button"
            tabIndex={0}
            aria-pressed={photoOpen}
            aria-label={imageAlt ? `Show full photo: ${imageAlt}` : "Show full photo"}
          >
            <div className="story-card-photo__frame">
              <Image
                src={encodeURI(imageSrc)}
                alt={imageAlt ?? ""}
                fill
                sizes="(max-width: 767px) 46vw, 380px"
                className="object-cover"
                style={{ objectPosition: imagePosition ?? "center 30%" }}
                quality={85}
                priority={chapterIndex < 1}
              />
            </div>
          </motion.figure>
        )}

        {/* Faint chapter number behind the card (loveStory.showChapterNumbers) */}
        {showNumber && (
          <motion.span
            className={`story-card-number ${alignLeft ? "story-card-number--right" : "story-card-number--left"}`}
            style={{ y: numberY }}
            initial={reduceMotion ? false : { opacity: 0, x: alignLeft ? 48 : -48 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-12%" }}
            transition={{ duration: 1.1, ease: revealEase }}
            aria-hidden
          >
            {number}
          </motion.span>
        )}

        <motion.article
          className={`story-card story-card--${tone}`}
          style={{ y: cardY }}
          variants={cardVariants}
          initial={reduceMotion ? "show" : "hidden"}
          whileInView="show"
          viewport={{ once: true, margin: "-12%" }}
        >
          <span className="story-card__frame" aria-hidden />
          {cornerPair
            .filter(({ src }) => src)
            .map(({ src, pos }) => (
              <motion.span
                key={pos}
                className={`story-card__corner story-card__corner--${pos}`}
                variants={cornerVariants}
                aria-hidden
              >
                {/* Original artwork colors (no tint); the inner img sways gently (CSS) */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={encodeURI(src)} alt="" className="story-card__corner-img" />
              </motion.span>
            ))}
          <span className="story-card__badge" aria-hidden>
            <svg viewBox="0 0 24 24" className="h-3 w-3 sm:h-3.5 sm:w-3.5" fill="currentColor">
              <path d={HEART_PATH} />
            </svg>
          </span>
          {/* Date line — Cinzel (engraved serif with clean numerals), see .story-open-date */}
          <motion.p className="story-open-date" variants={lineVariants}>
            <StoryGlyphText text={date || fallbackLabel} />
          </motion.p>
          {title ? (
            <motion.h2 className={`${theSeasons.className} story-open-title`} variants={lineVariants}>
              <StoryGlyphText text={title} />
            </motion.h2>
          ) : null}
          <motion.span className="story-open-rule mx-auto" variants={lineVariants} aria-hidden />
          <motion.div className="story-open-text" variants={lineVariants}>
            {text}
          </motion.div>
        </motion.article>
      </div>

      {showDivider && !isLast && (
        <div className="story-open-divider flex items-center justify-center gap-2" aria-hidden>
          <span className="h-px w-12 sm:w-20" style={{ background: "linear-gradient(to right, transparent, #9EB9D4)" }} />
          {/* Navy heart — the one accent between chapters */}
          <svg viewBox="0 0 24 24" className="h-3 w-3 sm:h-3.5 sm:w-3.5" fill="#2F4A66">
            <path d={HEART_PATH} />
          </svg>
          <span className="h-px w-12 sm:w-20" style={{ background: "linear-gradient(to left, transparent, #9EB9D4)" }} />
        </div>
      )}
    </div>
  )
}

export const StorySection: React.FC<StorySectionProps> = ({
  imageSrc,
  imageAlt,
  imagePosition,
  date,
  title,
  text,
  layout,
  theme,
  isFirst = false,
  isLast = false,
  plain = false,
  chapterIndex = 0,
  eucalyptusDecos,
  chapterLabelText = "Chapter",
  showNumber = true,
  showDivider = true,
  cardCorners,
}) => {
  const reduceMotion = useReducedMotion()

  if (plain) {
    return (
      <PlainStoryCard
        date={date}
        title={title}
        text={text}
        alignLeft={layout === "image-left"}
        isLast={isLast}
        chapterIndex={chapterIndex}
        fallbackLabel={`${chapterLabelText} ${String(chapterIndex + 1).padStart(2, "0")}`}
        showNumber={showNumber && !imageSrc}
        showDivider={showDivider}
        corners={cardCorners}
        imageSrc={imageSrc}
        imageAlt={imageAlt}
        imagePosition={imagePosition}
      />
    )
  }

  const isDark = theme === "dark"
  const showImage = !plain && Boolean(imageSrc)
  const slideFromLeft = layout === "image-left"

  const imageFrameStyle = isDark
    ? {
        background:
          "color-mix(in srgb, var(--color-welcome-bg-soft) 12%, var(--color-welcome-bg-soft))",
        boxShadow:
          "0 10px 28px color-mix(in srgb, var(--color-motif-accent) 35%, transparent)",
      }
    : {
        background: "var(--color-welcome-bg-soft)",
        border: "1px solid color-mix(in srgb, var(--color-motif-deep) 10%, transparent)",
        boxShadow:
          "0 8px 24px color-mix(in srgb, var(--color-motif-deep) 7%, transparent), inset 0 1px 0 color-mix(in srgb, white 70%, transparent)",
      }

  const rotation = layout === "image-left" ? "rotate-1 md:rotate-2" : "-rotate-1 md:-rotate-2"
  const flexDirection = layout === "image-left" ? "flex-row" : "flex-row-reverse"
  const plainAlign =
    layout === "image-left" ? "md:text-left md:items-start" : "md:text-right md:items-end"

  const chapterLabel = String(chapterIndex + 1).padStart(2, "0")
  const stagger = Math.min(chapterIndex * 0.07, 0.45)

  const plainInitial = reduceMotion
    ? { opacity: 1, x: 0, y: 0, scale: 1 }
    : {
        opacity: 0,
        x: slideFromLeft ? -36 : 36,
        y: 20,
        scale: 0.97,
      }

  const plainAnimate = { opacity: 1, x: 0, y: 0, scale: 1 }

  const imageInitial = reduceMotion
    ? { opacity: 1, scale: 1, y: 0 }
    : { opacity: 0, scale: 0.9, y: 24 }

  const textInitial = reduceMotion
    ? { opacity: 1, y: 0 }
    : { opacity: 0, y: 16 }

  const sectionSurfaceClass = plain
    ? `love-story-plain-track love-story-plain-track--theme-${theme}${isFirst ? " love-story-plain-track--first" : ""}${isLast ? " love-story-plain-track--last" : ""}`
    : ""

  return (
    <div
      className={`${theSeasons.variable} relative z-[2] ${sectionSurfaceClass}`}
      style={plain ? undefined : { background: isDark ? darkBg : lightBg }}
    >
      {plain && (
        <div className="story-plain-atmosphere" aria-hidden="true">
          <div className="story-plain-atmosphere__blobs">
            <span className="story-plain-atmosphere__blob story-plain-atmosphere__blob--a" />
            <span className="story-plain-atmosphere__blob story-plain-atmosphere__blob--b" />
            <span className="story-plain-atmosphere__blob story-plain-atmosphere__blob--c" />
          </div>
        </div>
      )}

      {!isDark && !plain && (
        <>
          {!isFirst && (
            <div className="pointer-events-none absolute left-0 top-0 z-20 -mt-[8px] w-full md:-mt-[20px]">
              <TornPaperEdge flipped={true} color={lightBg} />
            </div>
          )}
          <div className="pointer-events-none absolute bottom-0 left-0 z-20 -mb-[8px] w-full md:-mb-[20px]">
            <TornPaperEdge flipped={false} color={lightBg} />
          </div>
        </>
      )}

      <div
        className={`container relative z-10 mx-auto px-2 md:px-12 ${showImage ? "py-12 md:py-32" : "py-1.5 md:py-14"} ${isFirst ? (showImage ? "pt-16 md:pt-36" : "pt-14 md:pt-16") : ""} ${isLast ? (showImage ? "pb-16 md:pb-36" : "pb-6 md:pb-16") : ""}`}
      >
        <div
          className={
            showImage
              ? `flex ${flexDirection} items-center justify-between gap-3 md:gap-16`
              : `mx-auto flex max-w-2xl flex-col items-center px-2 text-center sm:px-4 ${plainAlign}`
          }
        >
          {showImage && imageSrc && (
            <div className="flex w-[45%] shrink-0 justify-center md:w-5/12">
              <motion.div
                className={`relative w-full md:max-w-md ${rotation}`}
                initial={imageInitial}
                whileInView={{ opacity: 1, scale: 1, y: 0 }}
                viewport={{ once: true, margin: "-12%" }}
                transition={{ duration: 0.95, delay: stagger, ease: revealEase }}
              >
                <div className="w-full p-1.5 md:p-3" style={imageFrameStyle}>
                  <div className="group relative aspect-[3/4] w-full overflow-hidden">
                    <Image
                      src={imageSrc}
                      alt={imageAlt ?? ""}
                      fill
                      sizes="(max-width: 768px) 45vw, (max-width: 1024px) 40vw, 33vw"
                      className="object-cover transition-transform duration-1000 group-hover:scale-105"
                      quality={90}
                      priority={chapterIndex < 2}
                    />
                    {isDark && (
                      <div className="pointer-events-none absolute inset-0 z-10 bg-black/5 mix-blend-multiply" />
                    )}
                  </div>
                </div>
              </motion.div>
            </div>
          )}

          {plain ? (
            <motion.article
              className={`story-plain-card w-full max-w-xl px-5 pb-7 pt-10 sm:rounded-2xl sm:px-8 sm:pb-9 sm:pt-12 md:px-9 md:pb-10 md:pt-14 ${isDark ? "story-plain-card--dark" : ""}`}
              initial={plainInitial}
              whileInView={plainAnimate}
              viewport={{ once: true, margin: "-8%" }}
              transition={{ duration: 0.88, delay: stagger, ease: revealEase }}
            >
              {eucalyptusDecos ? (
                <PlainEucalyptusDecos decos={eucalyptusDecos} />
              ) : null}
              <span className="story-plain-card__frost" aria-hidden />
              <span className="story-plain-card__dot" aria-hidden />
              <div className="wedding-frame-inner hidden min-[400px]:block" aria-hidden />
              <div className="relative z-[2]">
              {imageSrc ? (
                <div
                  className={`story-plain-photo mx-auto mb-6 w-[78%] max-w-[18rem] sm:mb-7 ${slideFromLeft ? "-rotate-2" : "rotate-2"}`}
                >
                  <div className="relative aspect-[4/5] w-full overflow-hidden">
                    <Image
                      src={encodeURI(imageSrc)}
                      alt={imageAlt ?? ""}
                      fill
                      sizes="(max-width: 640px) 70vw, 288px"
                      className="object-cover"
                      quality={85}
                      priority={chapterIndex < 1}
                    />
                  </div>
                </div>
              ) : null}
              <p
                className={`${theSeasons.className} story-plain-chapter-label mb-2 text-[0.6rem] font-medium uppercase sm:text-[0.66rem]`}
              >
                <StoryGlyphText text={date || `${chapterLabelText} ${chapterLabel}`} />
              </p>
              {title ? (
                <h2
                  className={`${theSeasons.className} mb-3 uppercase leading-tight tracking-[0.08em] sm:mb-4 sm:tracking-[0.1em] md:tracking-[0.11em]`}
                  style={{
                    fontSize: storyChapterTitleSize,
                    color: isDark ? ON_TEAL : TEAL,
                  }}
                >
                  <StoryGlyphText text={title} />
                </h2>
              ) : null}
              <PlainChapterDivider dark={isDark} />
              <div
                style={{ color: isDark ? ON_TEAL : TEAL }}
                className={`font-goudy-italic space-y-3 sm:space-y-4 md:space-y-5 lg:leading-[1.7] ${sectionType.textRelaxed}`}
              >
                {text}
              </div>
              <div
                className={`story-plain-chapter-line mt-6 sm:mt-7 ${isDark ? "story-plain-chapter-line--dark" : ""}`}
                aria-hidden
              />
              </div>
              {!isLast && (
                <div className="story-plain-chapter-connector" aria-hidden>
                  <span className="story-plain-chapter-connector__stem" />
                </div>
              )}
            </motion.article>
          ) : (
            <motion.div
              className={
                showImage
                  ? "w-[55%] @container/story md:w-5/12"
                  : "w-full @container/story px-2 sm:px-4"
              }
              style={{ color: isDark ? lightBg : "var(--color-welcome-text)" }}
              initial={textInitial}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-10%" }}
              transition={{ duration: 0.85, delay: stagger + 0.15, ease: revealEase }}
            >
              {title && (
                <h2
                  className={`${theSeasons.className} mb-3 uppercase leading-tight tracking-[0.08em] sm:mb-4 sm:tracking-[0.1em] md:mb-6 md:tracking-[0.12em]`}
                  style={{
                    fontSize: storyChapterTitleSize,
                    color: isDark ? lightBg : "var(--color-welcome-navy)",
                  }}
                >
                  <StoryGlyphText text={title} />
                </h2>
              )}
              <div
                className={`font-goudy-italic space-y-3 sm:space-y-4 md:space-y-6 lg:leading-[1.7] ${sectionType.textRelaxed}`}
              >
                {text}
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
}
