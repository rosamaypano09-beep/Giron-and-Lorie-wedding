"use client"

import { Section } from "@/components/section"
import { useState, useEffect, type ReactNode } from "react"
import { useQrColors } from "@/hooks/use-css-color"
import { QRCodeSVG } from "qrcode.react"
import { useSiteConfig } from "@/hooks/use-site-config"
import type { AttireColor } from "@/content/site"
import Image from "next/image"
import localFont from "next/font/local"
import { cinzel } from "@/lib/fonts"
import { Shirt, Copy, Check, Navigation, MapPin, House, Video } from "lucide-react"
import { motion, useReducedMotion, type Variants } from "motion/react"
import { PlainBubbles } from "@/components/loader/PlainBubbles"
import { TintedDeco } from "@/components/tinted-deco"
import { DecoCorners } from "@/components/deco-corners"
import { SectionBackdrop } from "@/components/section-backdrop"

const theSeasons = localFont({
  src: "../../Font/Fontspring-DEMO-theseasons-reg.otf",
  display: "swap",
  variable: "--font-the-seasons",
})

const aboveTheBeyond = localFont({
  src: "../../Font/above-the-beyond-script.otf",
  display: "swap",
  variable: "--font-above-beyond",
})

// Palette lives in globals.css → motif / welcome tokens.
const C = {
  heading: "var(--color-welcome-navy)",
  body: "var(--color-welcome-text)",
  soft: "var(--color-welcome-text-soft)",
  label: "var(--color-welcome-heading)",
  script: "var(--color-welcome-script)",
  accent: "var(--color-motif-accent)",
  blue: "var(--color-welcome-heading)",
  green: "var(--color-welcome-green)",
  paper: "var(--color-welcome-bg-soft)",
  light: "var(--color-motif-soft)",
} as const

// Same circle pattern as the gallery / love story sections (PlainBubbles paints the base)
const sectionBg = "var(--color-bg-pattern-base)"

// Soft white edge so text stays crisp over the circles (matches the gallery)
const onBgGlow = "0 1px 0 rgb(255 255 255 / 85%), 0 0 12px rgb(255 255 255 / 70%)"

// Text sitting directly on the background: deep slate titles, slate-blue labels
const onBg = { color: C.heading, textShadow: onBgGlow } as const
const onBgLabel = { color: C.blue, textShadow: onBgGlow } as const
const onBgBody = { color: C.body, textShadow: onBgGlow } as const

const hairline = "color-mix(in srgb, var(--color-motif-medium) 55%, transparent)"
const blushEdge = "color-mix(in srgb, var(--color-motif-blush) 90%, transparent)"

// Paper cards with a blush edge (same paper as the love story / gallery photo frames)
const cardStyle = {
  background: "var(--color-motif-soft)",
  boxShadow:
    `0 0 0 1px ${blushEdge}, 0 22px 48px -26px color-mix(in srgb, var(--color-welcome-navy) 40%, transparent), inset 0 1px 0 rgb(255 255 255 / 80%)`,
} as const

const softPanelStyle = {
  backgroundColor: "color-mix(in srgb, var(--color-motif-blush) 28%, white)",
} as const

// Primary button: dusty rose → charcoal with white text (matches the rest of the invitation)
const primaryButtonBg =
  "linear-gradient(180deg, var(--color-welcome-heading) 0%, color-mix(in srgb, var(--color-welcome-heading) 72%, var(--color-welcome-navy)) 100%)"



function DecoImg({ src, className }: { src: string; className: string }) {
  if (!src) return null
  return <TintedDeco src={src} className={className} />
}

// Warm-gray hairlines either side of a round blush-edged icon
function SectionIconDivider({ icon }: { icon: ReactNode }) {
  return (
    <div className="flex items-center justify-center gap-2 pt-1 sm:pt-2">
      <span
        className="h-px w-10 sm:w-16 md:w-20"
        style={{ background: "linear-gradient(to right, transparent, var(--color-motif-medium))" }}
      />
      <span
        className="flex h-7 w-7 items-center justify-center rounded-full sm:h-8 sm:w-8"
        style={{ border: `1px solid ${blushEdge}`, background: "var(--color-motif-soft)" }}
      >
        {icon}
      </span>
      <span
        className="h-px w-10 sm:w-16 md:w-20"
        style={{ background: "linear-gradient(to left, transparent, var(--color-motif-medium))" }}
      />
    </div>
  )
}

function DetailsTitle({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <h2
      className="relative mx-auto w-full max-w-full text-center"
      style={
        {
          "--title-size": "clamp(2.15rem, 11vw, 4.5rem)",
          "--script-size": "clamp(1.1rem, 4.5vw, 2.25rem)",
        } as React.CSSProperties
      }
    >
      <span
        className={`${theSeasons.className} block uppercase leading-[0.78] tracking-[0.08em] min-[400px]:tracking-[0.11em] sm:tracking-[0.15em] md:tracking-[0.18em] pb-1 sm:pb-1.5`}
        style={{ fontSize: "var(--title-size)", ...onBg }}
      >
        {title}
      </span>
      {subtitle ? (
        <>
          <span
            aria-hidden
            className={`${aboveTheBeyond.className} mx-auto block w-fit max-w-full px-1 leading-[0.88] sm:leading-[0.9] mt-2 sm:mt-2.5 md:mt-3`}
            style={{ fontSize: "var(--script-size)", ...onBg }}
          >
            {subtitle}
          </span>
          <span className="sr-only">{subtitle}</span>
        </>
      ) : null}
    </h2>
  )
}

// Slightly compact type inside card containers (not the page header)
const ct = {
  label: "text-[11px] sm:text-xs md:text-sm",
  labelSm: "text-[10px] sm:text-[11px] md:text-xs",
  body: "text-xs sm:text-sm md:text-base",
  bodyLg: "text-sm sm:text-base md:text-lg",
  month: "text-base sm:text-xl md:text-2xl lg:text-3xl",
  dayNum: "text-2xl sm:text-4xl md:text-5xl lg:text-6xl",
  year: "text-base sm:text-xl md:text-2xl lg:text-3xl",
  sectionTitle: "text-sm sm:text-lg md:text-xl lg:text-2xl",
  attireCardTitle: "text-sm sm:text-lg md:text-xl lg:text-2xl",
  btn: "text-xs sm:text-sm md:text-base",
  reminderHead: "text-[0.8rem] sm:text-sm md:text-base",
  reminderBody: "text-xs sm:text-sm md:text-[0.95rem]",
} as const

type PaletteColor = { name: string; hex: string }

// Palette entries may be a plain "#HEX" or { name, hex }
function toPaletteColors(colors: readonly AttireColor[]): PaletteColor[] {
  return colors.map((c) => (typeof c === "string" ? { name: "", hex: c } : c))
}

function ColorPalette({ colors }: { colors: readonly string[] }) {
  const widthClass = colors.length > 4 ? "max-w-md" : "max-w-xs sm:max-w-sm"

  return (
    <div
      className={`mx-auto flex h-8 w-full overflow-hidden rounded-full border-2 shadow-sm sm:h-9 ${widthClass}`}
      style={{ borderColor: C.light, boxShadow: `0 0 0 1px ${blushEdge}` }}
      role="img"
      aria-label={`Color palette: ${colors.join(", ")}`}
    >
      {colors.map((color) => (
        <div key={color} className="min-w-0 flex-1" style={{ backgroundColor: color }} title={color} />
      ))}
    </div>
  )
}

// Fanned deck of framed photos: the front photo sits in the middle, the rest fan out
// to alternate sides behind it. Each step, every card glides one place round the fan.
function CoupleImagesCarousel({
  coupleImages,
  currentImageIndex,
  onSelect,
}: {
  coupleImages: readonly string[]
  currentImageIndex: number
  onSelect: (index: number) => void
}) {
  const reduceMotion = useReducedMotion()
  const count = coupleImages.length

  return (
    <div className="mb-5 flex flex-col items-center sm:mb-6">
      <div className="relative h-[7.5rem] w-full max-w-[20rem] sm:h-[9.5rem] sm:max-w-[26rem]" aria-hidden>
        {/* Soft blush glow behind the deck */}
        <span
          className="pointer-events-none absolute left-1/2 top-1/2 h-28 w-56 -translate-x-1/2 -translate-y-1/2 rounded-full blur-2xl sm:h-32 sm:w-72"
          style={{ background: "color-mix(in srgb, var(--color-motif-blush) 55%, transparent)" }}
        />
        {coupleImages.map((image, index) => {
          // 0 = front; 1, 2, … alternate right / left, further out each step
          const place = (index - currentImageIndex + count) % count
          const rank = Math.ceil(place / 2)
          const side = place === 0 ? 0 : place % 2 === 1 ? 1 : -1
          return (
            <motion.button
              type="button"
              key={image}
              onClick={() => onSelect(index)}
              tabIndex={-1}
              className="absolute left-1/2 top-1/2 -ml-[2.6rem] -mt-[3.3rem] w-[5.2rem] cursor-pointer rounded-[0.35rem] bg-white p-1 pb-3.5 sm:-ml-[3.25rem] sm:-mt-[4.1rem] sm:w-[6.5rem] sm:p-1.5 sm:pb-5"
              style={{
                zIndex: 20 - rank * 2 - (side < 0 ? 1 : 0),
                boxShadow: `0 0 0 1px ${blushEdge}, 0 14px 26px -12px color-mix(in srgb, var(--color-welcome-navy) 55%, transparent)`,
              }}
              initial={false}
              animate={{
                x: `${side * rank * 62}%`,
                y: rank * 6,
                rotate: side * (5 + rank * 4) + (place === 0 ? -1.5 : 0),
                scale: place === 0 ? 1.08 : 1 - rank * 0.1,
                opacity: rank > 2 ? 0 : 1 - rank * 0.12,
              }}
              transition={reduceMotion ? { duration: 0 } : { type: "spring", stiffness: 120, damping: 18, mass: 0.9 }}
            >
              <span className="relative block aspect-[4/5] w-full overflow-hidden rounded-[0.2rem]">
                <Image
                  src={encodeURI(image)}
                  alt=""
                  fill
                  className="object-cover"
                  sizes="(min-width: 640px) 104px, 84px"
                />
                {/* Slight sheen on the front photo */}
                {place === 0 && (
                  <span
                    className="pointer-events-none absolute inset-0"
                    style={{ background: "linear-gradient(135deg, rgb(255 255 255 / 22%) 0%, transparent 45%)" }}
                  />
                )}
              </span>
            </motion.button>
          )
        })}
      </div>

      {/* Progress dots */}
      {count > 1 && (
        <div className="mt-3 flex items-center gap-1.5" aria-hidden>
          {coupleImages.map((image, index) => (
            <motion.span
              key={image}
              className="block h-1.5 rounded-full"
              animate={{
                width: index === currentImageIndex ? 16 : 6,
                opacity: index === currentImageIndex ? 1 : 0.45,
              }}
              transition={{ duration: 0.4, ease: revealEase }}
              style={{ background: C.blue }}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function FadeRule({ className = "" }: { className?: string }) {
  return (
    <span
      className={`mx-auto block h-px w-24 sm:w-32 ${className}`}
      style={{ background: "linear-gradient(to right, transparent, var(--color-motif-accent), transparent)" }}
      aria-hidden
    />
  )
}

const revealEase = [0.22, 1, 0.36, 1] as const

const reminderListVariants: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12, delayChildren: 0.15 } },
}

const reminderItemVariants: Variants = {
  hidden: { opacity: 0, y: 18, filter: "blur(4px)" },
  show: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.7, ease: revealEase } },
}

function ReminderItem({ title, children }: { title: string; children: ReactNode }) {
  return (
    <motion.div variants={reminderItemVariants} className="mx-auto flex max-w-xl flex-col items-center text-center">
      <h4
        className={`${cinzel.className} ${ct.reminderHead} font-semibold uppercase tracking-[0.16em]`}
        style={{ color: C.heading }}
      >
        {title}
      </h4>
      <div className={`font-goudy-italic ${ct.reminderBody} mt-1.5 leading-relaxed sm:mt-2`} style={{ color: C.body }}>
        {children}
      </div>
    </motion.div>
  )
}

function highlightPhrase(text: string, phrase?: string): ReactNode {
  if (!phrase) return text
  // Case-insensitive so "Formal Dresses" still matches "formal dresses" in the text
  const index = text.toLowerCase().indexOf(phrase.toLowerCase())
  if (index === -1) return text

  return (
    <>
      {text.slice(0, index)}
      <strong className="font-bold underline decoration-[var(--color-motif-medium)] underline-offset-2" style={{ color: C.heading }}>
        {text.slice(index, index + phrase.length)}
      </strong>
      {text.slice(index + phrase.length)}
    </>
  )
}

type AttireHalf = {
  label: string
  details: string
  highlight?: string
  roles: readonly { role: string; attire: string }[]
}

// Small round swatches with their names underneath — compact palette for one group
function PaletteDots({ palette }: { palette: readonly PaletteColor[] }) {
  return (
    <ul
      className="flex flex-wrap items-start justify-center gap-x-2.5 gap-y-2 sm:gap-x-4"
      aria-label={`Color palette: ${palette.map((c) => c.name || c.hex).join(", ")}`}
    >
      {palette.map((color, i) => (
        <li key={`${color.hex}-${i}`} className="flex w-11 flex-col items-center sm:w-14">
          <span
            className="block h-6 w-6 rounded-full sm:h-7 sm:w-7"
            style={{
              backgroundColor: color.hex,
              boxShadow: `0 0 0 2px #FFFFFF, 0 0 0 3px ${blushEdge}, 0 4px 10px -4px color-mix(in srgb, var(--color-welcome-navy) 45%, transparent)`,
            }}
            title={color.name || color.hex}
          />
          {color.name ? (
            <span
              className={`${cinzel.className} mt-1.5 text-center text-[0.5rem] font-semibold uppercase leading-tight tracking-[0.06em] sm:text-[0.56rem]`}
              style={{ color: C.soft }}
            >
              {color.name}
            </span>
          ) : null}
        </li>
      ))}
    </ul>
  )
}

// One attire group in a single compact panel: title + tag, outfits side by side, palette dots
function AttireGroupPanel({
  group,
}: {
  group: {
    id: string
    title: string
    dressCode?: string
    note?: string
    palette: readonly AttireColor[]
    ladies: AttireHalf
    gentlemen: AttireHalf
  }
}) {
  const palette = toPaletteColors(group.palette)
  const halves = [group.ladies, group.gentlemen].filter((h) => h.details.trim() || h.roles.length > 0)
  return (
    <section
      aria-label={`${group.title} attire`}
      className="rounded-2xl px-3.5 py-4 sm:px-6 sm:py-5"
      style={{ ...softPanelStyle, boxShadow: `0 0 0 1px ${blushEdge}` }}
    >
      <div className="flex flex-col items-center gap-1.5 text-center">
        <h4
          className={`${theSeasons.className} text-[0.95rem] uppercase leading-tight tracking-[0.12em] sm:text-lg md:text-xl`}
          style={{ color: C.heading }}
        >
          <SpecialCharFont text={group.title} />
        </h4>
        {group.dressCode ? (
          <span
            className={`${cinzel.className} rounded-full px-2.5 py-0.5 text-[0.52rem] font-semibold uppercase tracking-[0.18em] sm:text-[0.6rem]`}
            style={{ color: C.blue, background: "#FFFFFF", border: `1px solid ${blushEdge}` }}
          >
            {group.dressCode}
          </span>
        ) : null}
      </div>

      {halves.length > 0 && (
        <div className={`mt-3 grid gap-2.5 sm:mt-4 sm:gap-4 ${halves.length > 1 ? "sm:grid-cols-2" : ""}`}>
          {halves.map((half, i) => (
            <div
              key={half.label}
              className={`text-center ${halves.length > 1 && i > 0 ? "border-t pt-2.5 sm:border-l sm:border-t-0 sm:pl-4 sm:pt-0" : ""}`}
              style={{ borderColor: hairline }}
            >
              <p
                className={`${cinzel.className} text-[0.58rem] font-semibold uppercase tracking-[0.2em] sm:text-[0.66rem]`}
                style={{ color: C.label }}
              >
                {half.label}
              </p>
              {half.details.trim() ? (
                <p className="font-goudy-italic mt-1 text-[0.8rem] leading-snug sm:text-sm" style={{ color: C.body }}>
                  {highlightPhrase(half.details, half.highlight)}
                </p>
              ) : null}
              {half.roles.map(({ role, attire }) => (
                <p key={role} className="font-goudy-italic mt-1 text-[0.8rem] leading-snug sm:text-sm" style={{ color: C.body }}>
                  <span className={`${cinzel.className} not-italic text-[0.6rem] font-semibold uppercase tracking-[0.1em]`} style={{ color: C.heading }}>
                    {role}:
                  </span>{" "}
                  {attire}
                </p>
              ))}
            </div>
          ))}
        </div>
      )}

      {palette.length > 0 || group.note?.trim() ? (
        <div className="mt-3.5 border-t pt-3.5 sm:mt-4 sm:pt-4" style={{ borderColor: hairline }}>
          {palette.length > 0 ? <PaletteDots palette={palette} /> : null}
          {group.note?.trim() ? (
            <p
              className={`font-goudy-italic text-center text-[0.72rem] leading-snug sm:text-[0.8rem] ${palette.length ? "mt-2.5" : ""}`}
              style={{ color: C.soft }}
            >
              {group.note}
            </p>
          ) : null}
        </div>
      ) : null}
    </section>
  )
}

function AttireCard({
  title,
  image,
  alt,
  children,
  dressCode,
  belowImage,
}: {
  title: string
  image?: string
  alt: string
  children: ReactNode
  dressCode?: string
  belowImage?: ReactNode
}) {
  return (
    <div className="relative group h-full">
      <div
        className="absolute -inset-1 rounded-2xl opacity-0 blur-lg transition-opacity duration-500 group-hover:opacity-100"
        style={{
          background: "color-mix(in srgb, var(--color-motif-accent) 14%, transparent)",
        }}
      />
      <div
        className="relative flex h-full flex-col overflow-hidden rounded-[1.5rem] sm:rounded-[2rem]"
        style={{ background: cardStyle.background, boxShadow: cardStyle.boxShadow }}
      >
        {title || dressCode ? (
        <div className="flex flex-col items-center gap-1.5 px-4 pt-4 pb-2 sm:pt-6">
          <h4
            className={`${cinzel.className} text-sm sm:text-lg md:text-xl text-center uppercase tracking-[0.2em] font-semibold leading-tight`}
            style={{ color: C.heading }}
          >
            {title}
          </h4>
          {dressCode ? (
            <span
              className={`${cinzel.className} rounded-full px-2.5 py-0.5 text-[0.55rem] font-semibold uppercase tracking-[0.18em] sm:text-[0.62rem]`}
              style={{
                color: C.blue,
                background: "color-mix(in srgb, var(--color-motif-blush) 35%, white)",
                border: "1px solid color-mix(in srgb, var(--color-motif-blush) 90%, transparent)",
              }}
            >
              {dressCode}
            </span>
          ) : null}
        </div>
        ) : null}

        {image ? (
          <div
            className="relative flex w-full shrink-0 items-center justify-center overflow-hidden"
            style={{
              background:
                "radial-gradient(70% 80% at 50% 40%, #FFFFFF 0%, color-mix(in srgb, var(--color-motif-blush) 30%, white) 100%)",
            }}
          >
            {/* Any image shape works: the 3/2 size is only a placeholder until the
                file loads, then h-auto switches to the image's real proportions */}
            <Image
              src={image}
              alt={alt}
              width={1500}
              height={1000}
              className="h-auto w-full object-contain transition-transform duration-700 group-hover:scale-[1.01]"
              sizes="(max-width: 768px) 100vw, (max-width: 1280px) 80vw, 1024px"
            />
          </div>
        ) : null}

        {belowImage}

        <div className="flex flex-1 flex-col px-3 pt-3 pb-4 sm:px-6 sm:pt-4 sm:pb-6">
          {children}
        </div>
      </div>
    </div>
  )
}

// The Seasons has no clean glyphs for symbols / digits — render only those
// characters (e.g. "&", ",", "-", numbers) in Cinzel, keep letters in The Seasons.
function SpecialCharFont({ text }: { text: string }) {
  return (
    <>
      {text.split(/([^\p{L}\s]+)/u).map((part, i) =>
        i % 2 === 1 ? (
          <span key={i} className={`${cinzel.className} tracking-normal`}>
            {part}
          </span>
        ) : (
          part
        ),
      )}
    </>
  )
}

// "Local Congregation of Santiago Norte, Ecclesiastical District of La Union" →
// two lines; short ones like "San Juan, La Union" stay on one
function splitAddress(address: string): string[] {
  const comma = address.indexOf(", ")
  if (address.length <= 32 || comma === -1) return [address]
  return [address.slice(0, comma + 1), address.slice(comma + 2)]
}

type VenueLabels = {
  arrival: string
  at: string
  scanForDirections: string
  getDirections: string
  copyAddress: string
  copied: string
  mapTitle?: string
}

type SecondReception = { show: boolean; eyebrow: string; badge: string; name: string; note: string }

// Second reception: a text-only invitation card (no photo, map link or QR)
function SecondReceptionCard({ info }: { info: SecondReception }) {
  const reduceMotion = useReducedMotion()
  return (
    <motion.div
      className="relative group"
      initial={reduceMotion ? false : { opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.85, ease: revealEase }}
    >
      <div
        className="absolute -inset-1 rounded-2xl opacity-0 blur-lg transition-opacity duration-500 group-hover:opacity-100"
        style={{ background: "color-mix(in srgb, var(--color-motif-accent) 14%, transparent)" }}
      />
      <div
        className="relative overflow-hidden rounded-[1.5rem] px-5 py-8 text-center sm:rounded-[2rem] sm:px-10 sm:py-10 md:px-14 md:py-12"
        style={{ background: cardStyle.background, boxShadow: cardStyle.boxShadow }}
      >
        {/* Soft blush glow behind the text */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(60% 70% at 50% 0%, color-mix(in srgb, var(--color-motif-blush) 45%, transparent) 0%, transparent 70%)",
          }}
          aria-hidden
        />
        {/* Inner hairline frame */}
        <div
          className="pointer-events-none absolute inset-2.5 rounded-[1.15rem] sm:inset-3.5 sm:rounded-[1.6rem]"
          style={{ border: `1px solid ${hairline}` }}
          aria-hidden
        />

        <div className="relative flex flex-col items-center">
          <SectionIconDivider icon={<House className="h-3.5 w-3.5 sm:h-4 sm:w-4" style={{ color: C.blue }} aria-hidden />} />

          {info.eyebrow ? (
            <p
              className={`${cinzel.className} mt-4 text-[0.6rem] font-semibold uppercase tracking-[0.32em] sm:mt-5 sm:text-[0.68rem] sm:tracking-[0.38em]`}
              style={{ color: C.label }}
            >
              {info.eyebrow}
            </p>
          ) : null}

          <p
            className={`${aboveTheBeyond.className} mt-3 leading-[0.9] sm:mt-4`}
            style={{ color: C.script, fontSize: "clamp(1.6rem, 6.5vw, 2.75rem)" }}
          >
            Second Reception
          </p>

          <span
            className={`${cinzel.className} mt-4 rounded-full px-3 py-1 text-[0.55rem] font-semibold uppercase tracking-[0.2em] sm:mt-5 sm:text-[0.65rem]`}
            style={{ color: C.blue, ...softPanelStyle, border: `1px solid ${blushEdge}` }}
          >
            {info.badge}
          </span>

          <h3
            className={`${theSeasons.className} mt-3 uppercase leading-tight tracking-[0.12em] sm:mt-4 sm:tracking-[0.16em]`}
            style={{ color: C.heading, fontSize: "clamp(1.35rem, 5.5vw, 2.4rem)" }}
          >
            <SpecialCharFont text={info.name} />
          </h3>

          <FadeRule className="mt-4 sm:mt-5" />

          {info.note ? (
            <p
              className={`font-goudy-italic ${ct.bodyLg} mx-auto mt-4 max-w-md leading-relaxed sm:mt-5`}
              style={{ color: C.body }}
            >
              {info.note}
            </p>
          ) : null}
        </div>
      </div>
    </motion.div>
  )
}

type ZoomInfo = {
  show: boolean
  eyebrow: string
  title: string
  note: string
  meetingId: string
  passcode: string
  noPasscodeText: string
  link: string
  joinButton: string
  copyButton: string
}

// Online guests: Meeting ID (+ passcode), Join button and Copy Meeting ID
function ZoomCard({
  info,
  copied,
  onCopy,
  onOpen,
}: {
  info: ZoomInfo
  copied: boolean
  onCopy: () => void
  onOpen: (link: string) => void
}) {
  const reduceMotion = useReducedMotion()
  return (
    <motion.div
      className="relative group"
      initial={reduceMotion ? false : { opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.85, ease: revealEase }}
    >
      <div
        className="absolute -inset-1 rounded-2xl opacity-0 blur-lg transition-opacity duration-500 group-hover:opacity-100"
        style={{ background: "color-mix(in srgb, var(--color-motif-accent) 14%, transparent)" }}
      />
      <div
        className="relative overflow-hidden rounded-[1.5rem] px-5 py-8 text-center sm:rounded-[2rem] sm:px-10 sm:py-10 md:px-14"
        style={{ background: cardStyle.background, boxShadow: cardStyle.boxShadow }}
      >
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(60% 70% at 50% 0%, color-mix(in srgb, var(--color-motif-blush) 45%, transparent) 0%, transparent 70%)",
          }}
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-2.5 rounded-[1.15rem] sm:inset-3.5 sm:rounded-[1.6rem]"
          style={{ border: `1px solid ${hairline}` }}
          aria-hidden
        />

        <div className="relative flex flex-col items-center">
          <SectionIconDivider icon={<Video className="h-3.5 w-3.5 sm:h-4 sm:w-4" style={{ color: C.blue }} aria-hidden />} />

          {info.eyebrow ? (
            <p
              className={`${cinzel.className} mt-4 text-[0.6rem] font-semibold uppercase tracking-[0.32em] sm:mt-5 sm:text-[0.68rem] sm:tracking-[0.38em]`}
              style={{ color: C.label }}
            >
              {info.eyebrow}
            </p>
          ) : null}

          <h3
            className={`${theSeasons.className} mt-3 uppercase leading-tight tracking-[0.12em] sm:mt-4 sm:tracking-[0.16em]`}
            style={{ color: C.heading, fontSize: "clamp(1.35rem, 5.5vw, 2.4rem)" }}
          >
            {info.title}
          </h3>

          {info.note ? (
            <p className={`font-goudy-italic ${ct.body} mx-auto mt-2.5 max-w-md leading-relaxed sm:mt-3`} style={{ color: C.body }}>
              {info.note}
            </p>
          ) : null}

          {/* Meeting ID panel */}
          <div
            className="mt-5 w-full max-w-sm rounded-2xl px-4 py-4 sm:mt-6 sm:py-5"
            style={{ ...softPanelStyle, boxShadow: `0 0 0 1px ${blushEdge}` }}
          >
            <p className={`${cinzel.className} ${ct.labelSm} font-semibold uppercase tracking-[0.24em]`} style={{ color: C.label }}>
              Meeting ID
            </p>
            <p
              className={`${cinzel.className} mt-1.5 text-[1.35rem] font-semibold tabular-nums tracking-[0.08em] sm:text-[1.7rem]`}
              style={{ color: C.heading }}
            >
              {info.meetingId}
            </p>
            <span className="mx-auto my-2.5 block h-px w-2/3" style={{ background: hairline }} aria-hidden />
            {info.passcode ? (
              <p className={`${cinzel.className} ${ct.labelSm} font-semibold uppercase tracking-[0.2em]`} style={{ color: C.label }}>
                Passcode: <span style={{ color: C.heading }}>{info.passcode}</span>
              </p>
            ) : (
              <p className="font-goudy-italic text-[0.8rem] sm:text-sm" style={{ color: C.soft }}>
                {info.noPasscodeText}
              </p>
            )}
          </div>

          <div className="mt-5 flex w-full max-w-sm flex-col gap-2 sm:mt-6 sm:flex-row sm:gap-3">
            {info.link ? (
              <button
                type="button"
                onClick={() => onOpen(info.link)}
                className={`${cinzel.className} flex flex-1 items-center justify-center gap-1.5 rounded-full border px-4 py-2.5 font-semibold uppercase tracking-[0.12em] ${ct.btn} transition-all duration-300 hover:scale-[1.02] hover:brightness-110 active:scale-[0.98] sm:py-3`}
                style={{
                  background: primaryButtonBg,
                  borderColor: "rgb(255 255 255 / 70%)",
                  color: "#FFFFFF",
                  boxShadow: "0 12px 24px -10px color-mix(in srgb, var(--color-welcome-navy) 60%, transparent)",
                }}
              >
                <Video className="h-3.5 w-3.5 flex-shrink-0 sm:h-4 sm:w-4" />
                <span>{info.joinButton}</span>
              </button>
            ) : null}
            <button
              type="button"
              onClick={onCopy}
              className={`${cinzel.className} flex flex-1 items-center justify-center gap-1.5 rounded-full border px-4 py-2.5 font-semibold uppercase tracking-[0.12em] ${ct.btn} transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] sm:py-3`}
              style={{ color: C.heading, backgroundColor: "var(--color-motif-soft)", borderColor: blushEdge }}
            >
              {copied ? (
                <Check className="h-3.5 w-3.5 flex-shrink-0 sm:h-4 sm:w-4" style={{ color: C.blue }} />
              ) : (
                <Copy className="h-3.5 w-3.5 flex-shrink-0 sm:h-4 sm:w-4" />
              )}
              <span>{copied ? "Copied" : info.copyButton}</span>
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

type EventVenueCardProps = {
  badge: string
  images: readonly string[]
  activeImageIndex: number
  locationName: string
  venueAddress: string
  day: string
  dateString: string
  time: string
  arrivalTime?: string
  // Combined card: one row per event (e.g. Ceremony 3:00 PM / Reception 6:00 PM)
  schedule?: { label: string; time: string }[]
  mapsLink: string
  copyId: string
  fullVenue: string
  copiedItems: Set<string>
  onCopy: (text: string, id: string) => void
  onOpenMaps: (link: string) => void
  showDateDetails?: boolean
  // false hides the "At <time>" / "Arrival: <time>" line
  showTime?: boolean
  labels: VenueLabels
}

function EventVenueCard({
  badge,
  images,
  activeImageIndex,
  locationName,
  venueAddress,
  day,
  dateString,
  time,
  arrivalTime,
  schedule,
  mapsLink,
  copyId,
  fullVenue,
  copiedItems,
  onCopy,
  onOpenMaps,
  showDateDetails = true,
  showTime = true,
  labels,
}: EventVenueCardProps) {
  const { fg: qrFg, bg: qrBg } = useQrColors() // --color-qr-fg / --color-qr-bg in globals.css
  const eventDate = showDateDetails ? new Date(dateString) : null
  const copied = copiedItems.has(copyId)
  const hasDate = Boolean(eventDate && !Number.isNaN(eventDate.getTime()))
  const hasTimeLine = showTime && (!schedule || Boolean(arrivalTime))
  const hasSchedule = Boolean(schedule && schedule.length > 0)

  return (
    <div className="relative group">
      <div
        className="absolute -inset-1 rounded-2xl opacity-0 blur-lg transition-opacity duration-500 group-hover:opacity-100"
        style={{
          background: "color-mix(in srgb, var(--color-motif-accent) 14%, transparent)",
        }}
      />

      <div
        className="relative overflow-hidden rounded-[1.5rem] sm:rounded-[2rem]"
        style={{ background: cardStyle.background, boxShadow: cardStyle.boxShadow }}
      >
        {/* Date and time above the photo (left out when there's nothing to show) */}
        {(hasDate || hasTimeLine || hasSchedule) && (
        <div className="px-3 pt-5 pb-4 sm:px-5 sm:pt-7 sm:pb-6 md:px-7 md:pt-9 md:pb-8">
          <div className="text-center space-y-2 sm:space-y-2.5 md:space-y-3">
            {hasDate && eventDate && (
              <>
                <p className={`${cinzel.className} ${ct.label} font-semibold uppercase tracking-[0.2em]`} style={{ color: C.label }}>
                  {day}
                </p>
                <p className={`${cinzel.className} ${ct.month} font-semibold leading-none`} style={{ color: C.heading }}>
                  {eventDate.toLocaleString("default", { month: "long" })}
                </p>
                <div className="flex items-center justify-center gap-3 sm:gap-4 md:gap-5 py-1 sm:py-2">
                  <p className={`${cinzel.className} ${ct.dayNum} font-semibold leading-none`} style={{ color: C.blue }}>
                    {eventDate.getDate()}
                  </p>
                  <div
                    className="h-10 sm:h-12 md:h-14 w-[2px] rounded-full"
                    style={{ background: "var(--color-motif-medium)" }}
                  />
                  <p className={`${cinzel.className} ${ct.year} font-semibold leading-none`} style={{ color: C.heading }}>
                    {eventDate.getFullYear()}
                  </p>
                </div>
              </>
            )}

            {hasTimeLine && (
              <p
                className={`${cinzel.className} text-sm sm:text-base md:text-lg lg:text-xl font-semibold tracking-[0.12em] uppercase ${showDateDetails ? "" : "py-2 sm:py-3"}`}
                style={{ color: C.heading }}
              >
                {arrivalTime ? `${labels.arrival}: ${arrivalTime}` : `${labels.at} ${time}`}
              </p>
            )}

            {schedule && schedule.length > 0 && (
              <div className="mx-auto flex max-w-sm items-stretch justify-center gap-3 pt-2 sm:gap-5 sm:pt-3">
                {schedule.map((item, i) => (
                  <div key={item.label} className="flex items-stretch gap-3 sm:gap-5">
                    {i > 0 && <span className="w-px self-stretch" style={{ background: hairline }} aria-hidden />}
                    <div className="flex flex-col items-center">
                      <p className={`${cinzel.className} ${ct.labelSm} font-semibold uppercase tracking-[0.2em]`} style={{ color: C.label }}>
                        {item.label}
                      </p>
                      <p className={`${cinzel.className} ${ct.bodyLg} mt-1 font-semibold tracking-[0.08em]`} style={{ color: C.blue }}>
                        {item.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        )}

        <div className={`relative w-full overflow-hidden ${images.length ? "h-64 sm:h-72 md:h-80 lg:h-96 xl:h-[30rem]" : "h-40 sm:h-44 md:h-48"}`} style={{ background: "color-mix(in srgb, var(--color-motif-blush) 40%, white)" }}>
          {images.map((src, index) => {
            const isActive = index === activeImageIndex
            return (
              <div
                key={src}
                className={`absolute inset-0 transition-[opacity,transform] duration-[1600ms] ease-[cubic-bezier(0.45,0.05,0.55,0.95)] ${
                  isActive ? "opacity-100 scale-100 z-10" : "opacity-0 scale-[1.06] z-0 pointer-events-none"
                }`}
              >
                <Image
                  src={src}
                  alt={locationName}
                  fill
                  className={`object-cover transition-transform duration-[9000ms] ease-out ${
                    isActive && images.length > 1 ? "scale-[1.08] group-hover:scale-[1.12]" : "scale-100"
                  }`}
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 90vw, 1280px"
                  // Load every slide up front so the next one is ready before it fades in
                  priority={index === 0}
                  loading={index === 0 ? undefined : "eager"}
                />
              </div>
            )
          })}
          <div
            className="absolute inset-0 z-20 pointer-events-none"
            style={{
              background:
                "linear-gradient(to top, color-mix(in srgb, var(--color-welcome-navy) 82%, transparent) 0%, color-mix(in srgb, var(--color-welcome-navy) 25%, transparent) 45%, transparent 100%)",
            }}
          />

          {/* Small directions QR in the photo's corner */}
          <div
            className="absolute bottom-3 right-3 z-30 rounded-md p-1 shadow-md sm:bottom-4 sm:right-4 sm:rounded-lg sm:p-1.5 md:bottom-6 md:right-6"
            style={{ backgroundColor: qrBg }}
            title={labels.scanForDirections}
          >
            <QRCodeSVG
              value={mapsLink}
              size={128}
              level="M"
              includeMargin={false}
              fgColor={qrFg}
              bgColor={qrBg}
              className="block h-11 w-11 sm:h-14 sm:w-14 md:h-16 md:w-16"
              aria-label={labels.scanForDirections}
            />
          </div>

          <div className="absolute bottom-3 left-3 sm:bottom-4 sm:left-4 md:bottom-6 md:left-6 right-16 sm:right-22 md:right-26 z-30">
            <span
              className={`${cinzel.className} inline-block mb-2 px-3 py-1 rounded-full backdrop-blur-sm text-[10px] sm:text-xs uppercase tracking-[0.2em] border`}
              style={{
                color: C.light,
                background: "color-mix(in srgb, var(--color-motif-soft) 18%, transparent)",
                borderColor: "color-mix(in srgb, var(--color-motif-soft) 45%, transparent)",
              }}
            >
              {badge}
            </span>
            <h3
              className={`${theSeasons.className} text-base sm:text-lg md:text-xl lg:text-2xl font-semibold mb-1 sm:mb-1.5 drop-shadow-lg uppercase tracking-[0.12em] leading-tight`}
              style={{ color: C.light }}
            >
              <SpecialCharFont text={locationName} />
            </h3>
            {venueAddress ? (
            <p
              className={`${theSeasons.className} text-[10px] sm:text-xs md:text-sm lg:text-base drop-shadow-md tracking-[0.06em] leading-snug whitespace-normal [overflow-wrap:anywhere]`}
              style={{ color: "var(--color-motif-silver)" }}
            >
              {/* Long addresses break after the first comma so nothing runs off the photo */}
              {splitAddress(venueAddress).map((line, i) => (
                <span key={i} className="block">
                  <SpecialCharFont text={line} />
                </span>
              ))}
            </p>
            ) : null}
          </div>
        </div>

        <div className="p-3 sm:p-5 md:p-7 lg:p-9">
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 md:gap-4">
            <button
              type="button"
              onClick={() => onOpenMaps(mapsLink)}
              className={`${cinzel.className} flex-1 flex items-center justify-center gap-1.5 sm:gap-2 px-4 sm:px-5 py-2.5 sm:py-3 md:py-3.5 rounded-full border font-semibold uppercase tracking-[0.12em] ${ct.btn} transition-all duration-300 hover:scale-[1.02] hover:brightness-110 active:scale-[0.98]`}
              style={{
                background: primaryButtonBg,
                borderColor: "rgb(255 255 255 / 70%)",
                color: "#FFFFFF",
                boxShadow: "0 12px 24px -10px color-mix(in srgb, var(--color-welcome-navy) 60%, transparent)",
              }}
              aria-label={`Get directions to ${badge.toLowerCase()} venue`}
            >
              <Navigation className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 flex-shrink-0" />
              <span>{labels.getDirections}</span>
            </button>
            <button
              type="button"
              onClick={() => onCopy(fullVenue, copyId)}
              className={`${cinzel.className} flex-1 flex items-center justify-center gap-1.5 sm:gap-2 px-4 sm:px-5 py-2.5 sm:py-3 md:py-3.5 border rounded-full font-semibold uppercase tracking-[0.12em] ${ct.btn} transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]`}
              style={{
                color: C.heading,
                backgroundColor: "var(--color-motif-soft)",
                borderColor: blushEdge,
              }}
              aria-label={`Copy ${badge.toLowerCase()} venue address`}
            >
              {copied ? (
                <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 flex-shrink-0" style={{ color: C.blue }} />
              ) : (
                <Copy className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 flex-shrink-0" />
              )}
              <span>{copied ? labels.copied : labels.copyAddress}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export function Details() {
  const siteConfig = useSiteConfig()
  const content = siteConfig.eventDetails
  const { decos, venues, labels, attire, reminders } = content
  const { ceremony, reception } = siteConfig

  const [copiedItems, setCopiedItems] = useState<Set<string>>(new Set())
  const [ceremonyImageIndex, setCeremonyImageIndex] = useState(0)
  const [receptionImageIndex, setReceptionImageIndex] = useState(0)
  const [reminderImageIndex, setReminderImageIndex] = useState(0)
  const reduceMotion = useReducedMotion()

  // "combined" = one card for both events at the ceremony venue (eventDetails.venues.layout)
  const isCombined = venues.layout === "combined"
  const ceremonyImages = ceremony.image
  const receptionImages = isCombined ? [] : reception.image
  // Photos above the reminders (older configs may not have them)
  const reminderImages = (reminders as { images?: string[] }).images ?? []
  const paletteHexes = toPaletteColors(attire.palette).map((c) => c.hex)
  // Guard against null entries (e.g. a stray comma in ATTIRE.show)
  const attireGroups = attire.groups.filter(Boolean)

  useEffect(() => {
    if (ceremonyImages.length <= 1) return
    const timer = setInterval(() => setCeremonyImageIndex((prev) => (prev + 1) % ceremonyImages.length), 4500)
    return () => clearInterval(timer)
  }, [ceremonyImages.length])

  useEffect(() => {
    if (receptionImages.length <= 1) return
    const timer = setInterval(() => setReceptionImageIndex((prev) => (prev + 1) % receptionImages.length), 4500)
    return () => clearInterval(timer)
  }, [receptionImages.length])

  // Reminder photos — the deck turns every few seconds (restarts after a tap)
  useEffect(() => {
    if (reminderImages.length <= 1 || reduceMotion) return
    const interval = setInterval(() => {
      setReminderImageIndex((prev) => (prev + 1) % reminderImages.length)
    }, 3200)
    return () => clearInterval(interval)
  }, [reminderImages.length, reduceMotion, reminderImageIndex])

  const copyToClipboard = async (text: string, itemId: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedItems((prev) => new Set(prev).add(itemId))
      setTimeout(() => {
        setCopiedItems((prev) => {
          const next = new Set(prev)
          next.delete(itemId)
          return next
        })
      }, 2000)
    } catch (err) {
      console.error("Failed to copy text: ", err)
    }
  }

  const openInMaps = (link: string) => {
    window.open(link, "_blank", "noopener,noreferrer")
  }

  const fillTimes = (text: string) =>
    text.split("{guestsTime}").join(ceremony.guestsTime).split("{ceremonyTime}").join(ceremony.time)

  const ceremonyVenue = `${ceremony.location}, ${ceremony.venue}`
  const receptionVenue = `${reception.location}, ${reception.venue}`
  const receptionMapsLink = reception.map || `https://maps.google.com/?q=${encodeURIComponent(receptionVenue)}`
  // Older configs (e.g. from /api/wedding-details) may not have a second reception
  const secondReception = (reception as { second?: SecondReception }).second
  const showSecondReception = !isCombined && Boolean(secondReception?.show && secondReception.name)
  const zoom = (content as { zoom?: ZoomInfo }).zoom
  const showZoom = Boolean(zoom?.show && zoom.meetingId)

  return (
    <div
      className={`${theSeasons.variable} ${aboveTheBeyond.variable} relative w-full overflow-hidden`}
      style={{ background: sectionBg }}
    >
      {/* Circle pattern + pink paper wash and rising hearts, same as the love story (section-backdrop.tsx) */}
      <PlainBubbles />
      <SectionBackdrop />
      <Section
        id="details"
        className="relative z-10 pt-14 pb-12 sm:pt-16 sm:pb-14 md:pt-20 md:pb-16 lg:pt-24 lg:pb-20 overflow-hidden"
      >
        {/* Corner florals + double border (content/site.ts → eventDetails.decos / showFrame) */}
        {content.showFrame && <div className="deco-frame" aria-hidden="true" />}
        <DecoCorners decos={decos} />

        {/* Header */}
        <div className="relative z-20 mb-6 px-6 text-center sm:mb-8 sm:px-10 md:mb-10 md:px-12">
          <DecoImg
            src={decos.headerOrnament}
            className="mx-auto mb-3 block h-auto w-28 select-none sm:mb-4 sm:w-36 md:w-44"
          />
          <p
            className={`${cinzel.className} mb-2 text-[0.6rem] font-semibold uppercase tracking-[0.34em] min-[400px]:tracking-[0.38em] sm:text-[0.65rem] sm:tracking-[0.44em]`}
            style={onBgLabel}
          >
            {content.eyebrow}
          </p>
          <div className="my-4 sm:my-5 md:my-6">
            <DetailsTitle title={content.title} subtitle={content.subtitle} />
          </div>
          <p
            className="font-goudy-italic mx-auto max-w-2xl px-2 text-[0.8rem] leading-[1.62] sm:text-[0.875rem] sm:leading-[1.65] md:text-[0.9375rem]"
            style={{ ...onBgBody, fontWeight: 600 }}
          >
            {content.description}
          </p>

          {content.verse ? (
            <figure className="mx-auto mt-4 max-w-xl px-2 sm:mt-5">
              <blockquote
                className="font-goudy-italic text-[0.8rem] leading-[1.62] sm:text-[0.875rem] md:text-[0.9375rem]"
                style={onBgBody}
              >
                &ldquo;{content.verse}&rdquo;
              </blockquote>
              {content.verseCitation ? (
                <figcaption
                  className={`${cinzel.className} mt-1.5 text-[0.6rem] font-semibold uppercase tracking-[0.24em] sm:text-[0.65rem]`}
                  style={onBgLabel}
                >
                  {content.verseCitation}
                </figcaption>
              ) : null}
            </figure>
          ) : null}

          <div className="mt-4 sm:mt-5">
            <SectionIconDivider icon={<MapPin className="h-3.5 w-3.5 sm:h-4 sm:w-4" style={{ color: C.blue }} aria-hidden />} />
          </div>
        </div>

        {/* Venue and Event Information */}
        <div className="relative z-20 max-w-5xl mx-auto px-4 sm:px-6 md:px-8 mb-10 sm:mb-12 md:mb-14 space-y-6 sm:space-y-10 md:space-y-14">
          {isCombined && (
            <EventVenueCard
              badge={venues.combined.badge}
              images={ceremonyImages}
              activeImageIndex={ceremonyImageIndex}
              locationName={ceremony.location}
              venueAddress={ceremony.venue}
              day={ceremony.day}
              dateString={ceremony.date}
              time={ceremony.time}
              arrivalTime={venues.combined.showArrival ? ceremony.guestsTime : undefined}
              schedule={[
                { label: venues.combined.ceremonyLabel, time: ceremony.time },
                ...(venues.combined.showReceptionTime
                  ? [{ label: venues.combined.receptionLabel, time: reception.time }]
                  : []),
              ]}
              mapsLink={ceremony.map}
              copyId="combined"
              fullVenue={ceremonyVenue}
              copiedItems={copiedItems}
              onCopy={copyToClipboard}
              onOpenMaps={openInMaps}
              showDateDetails={venues.combined.showDate}
              showTime={venues.combined.showTime}
              labels={labels}
            />
          )}

          {!isCombined && venues.ceremony.show && (
            <EventVenueCard
              badge={venues.ceremony.badge}
              images={ceremonyImages}
              activeImageIndex={ceremonyImageIndex}
              locationName={ceremony.location}
              venueAddress={ceremony.venue}
              day={ceremony.day}
              dateString={ceremony.date}
              time={ceremony.time}
              arrivalTime={venues.ceremony.showArrival ? ceremony.guestsTime : undefined}
              mapsLink={ceremony.map}
              copyId="ceremony"
              fullVenue={ceremonyVenue}
              copiedItems={copiedItems}
              onCopy={copyToClipboard}
              onOpenMaps={openInMaps}
              showDateDetails={venues.ceremony.showDate}
              showTime={venues.ceremony.showTime}
              labels={labels}
            />
          )}

          {!isCombined && venues.reception.show && (
            <EventVenueCard
              badge={venues.reception.badge}
              images={receptionImages}
              activeImageIndex={receptionImageIndex}
              locationName={reception.location}
              venueAddress={reception.venue}
              day={reception.day}
              dateString={reception.date}
              time={reception.time}
              arrivalTime={venues.reception.showArrival ? ceremony.guestsTime : undefined}
              mapsLink={receptionMapsLink}
              copyId="reception"
              fullVenue={receptionVenue}
              copiedItems={copiedItems}
              onCopy={copyToClipboard}
              onOpenMaps={openInMaps}
              showDateDetails={venues.reception.showDate}
              showTime={venues.reception.showTime}
              labels={labels}
            />
          )}

          {showSecondReception && secondReception && <SecondReceptionCard info={secondReception} />}

          {showZoom && zoom && (
            <ZoomCard
              info={zoom}
              copied={copiedItems.has("zoom")}
              onCopy={() => copyToClipboard(zoom.meetingId.replace(/\s+/g, ""), "zoom")}
              onOpen={openInMaps}
            />
          )}
        </div>

        {/* Attire Guidelines */}
        <div className="relative z-20 mx-auto max-w-7xl px-4 sm:px-6 md:px-8">
          {attireGroups.length > 0 && (
          <div className="text-center mb-8 sm:mb-10 md:mb-12">
            <SectionIconDivider icon={<Shirt className="h-3.5 w-3.5 sm:h-4 sm:w-4" style={{ color: C.blue }} aria-hidden />} />
            <h3
              className={`${theSeasons.className} ${ct.sectionTitle} mt-3 uppercase font-semibold leading-tight tracking-[0.12em] sm:mt-4 md:tracking-[0.15em]`}
              style={onBg}
            >
              {attire.title}
            </h3>
            <p className={`font-goudy-italic ${ct.bodyLg} mt-3 leading-relaxed sm:mt-4`} style={{ ...onBgBody, fontWeight: 600 }}>
              {attire.description}
            </p>
          </div>
          )}


          {/* One card for everyone: shared image, then each group with its palette below */}
          {attireGroups.length > 0 && (
            <div className="mx-auto mb-6 w-full max-w-3xl sm:mb-8 md:mb-10">
              <AttireCard title="" image={attire.image} alt="Attire guide in pastel blue, green, yellow, pink and violet">
                <div className="space-y-3 sm:space-y-4">
                  {attireGroups.map((group) => (
                    <AttireGroupPanel key={group.id} group={group} />
                  ))}
                </div>
              </AttireCard>
            </div>
          )}

          {/* Gentle Reminders */}
          <motion.div
            className="relative mx-auto mt-10 max-w-2xl sm:mt-12"
            initial={reduceMotion ? false : { opacity: 0, y: 28, scale: 0.98 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true, amount: 0.15 }}
            transition={{ duration: 0.9, ease: revealEase }}
          >
            <div
              className="relative overflow-hidden rounded-[1.5rem] sm:rounded-[2rem]"
              style={{ background: cardStyle.background, boxShadow: cardStyle.boxShadow }}
            >
              <motion.div
                className="relative z-10 flex flex-col items-center px-5 py-7 text-center sm:px-10 sm:py-9 md:px-12"
                variants={reminderListVariants}
                initial={reduceMotion ? false : "hidden"}
                whileInView="show"
                viewport={{ once: true, amount: 0.15 }}
              >
                <motion.div variants={reminderItemVariants} className="flex flex-col items-center">
                  {reminderImages.length > 0 ? (
                    <CoupleImagesCarousel
                      coupleImages={reminderImages}
                      currentImageIndex={reminderImageIndex}
                      onSelect={setReminderImageIndex}
                    />
                  ) : null}
                  <h3
                    className={`${theSeasons.className} ${ct.sectionTitle} font-semibold uppercase tracking-[0.18em]`}
                    style={{ color: C.heading }}
                  >
                    {reminders.title}
                  </h3>
                  <p className={`font-goudy-italic ${ct.body} mx-auto mt-1.5 max-w-md leading-relaxed`} style={{ color: C.soft }}>
                    {reminders.description}
                  </p>
                  <FadeRule className="mt-3.5 sm:mt-4" />
                </motion.div>

                <div className="mt-5 w-full sm:mt-6">
                  {reminders.items.map((item, index) => (
                    <div key={item.title}>
                      {index > 0 ? (
                        <motion.span
                          variants={reminderItemVariants}
                          className="mx-auto my-4 block h-px w-1/2 max-w-[14rem] sm:my-5"
                          style={{ background: "linear-gradient(to right, transparent, var(--color-motif-medium), transparent)" }}
                          aria-hidden
                        />
                      ) : null}
                      <ReminderItem title={item.title}>
                        <div className="space-y-2">
                          {item.paragraphs.map((text, i) => (
                            <div key={i} className="space-y-2.5">
                              <p>{fillTimes(text)}</p>
                              {item.showPalette && i === 0 ? <ColorPalette colors={paletteHexes} /> : null}
                            </div>
                          ))}
                        </div>
                      </ReminderItem>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </Section>
    </div>
  )
}
