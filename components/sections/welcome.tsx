"use client"

import localFont from "next/font/local"
import { motion } from "motion/react"
import { useSiteConfig } from "@/hooks/use-site-config"
import { sectionType, welcomeTitleSize } from "@/lib/section-typography"
import { cinzel } from "@/lib/fonts"

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

function OrnamentalDivider({ compact = false }: { compact?: boolean }) {
  return (
    <div className={`flex items-center justify-center ${compact ? "gap-1.5" : "gap-2"}`}>
      <span
        className={`h-px ${compact ? "w-6 sm:w-10" : "w-8 sm:w-12"}`}
        style={{
          background:
            "linear-gradient(to right, transparent, color-mix(in srgb, var(--color-welcome-navy) 45%, transparent))",
        }}
      />
      <span className="h-0.5 w-0.5 rounded-full bg-motif-teal/55 sm:h-1 sm:w-1" aria-hidden />
      <span
        className={`h-px ${compact ? "w-6 sm:w-10" : "w-8 sm:w-12"}`}
        style={{
          background:
            "linear-gradient(to left, transparent, color-mix(in srgb, var(--color-welcome-navy) 45%, transparent))",
        }}
      />
    </div>
  )
}

function LayeredWelcomeTitle() {
  return (
    <h2
      className="welcome-title-lockup relative mx-auto w-full max-w-full text-center"
      style={
        {
          "--welcome-size": welcomeTitleSize.main,
          "--script-size": welcomeTitleSize.script,
          "--script-overlap": welcomeTitleSize.overlap,
        } as React.CSSProperties
      }
    >
      <span
        className={`${theSeasons.className} block uppercase leading-[0.78] tracking-[0.08em] min-[400px]:tracking-[0.11em] sm:tracking-[0.13em] md:tracking-[0.14em]`}
        style={{
          fontSize: "var(--welcome-size)",
          color: "var(--color-welcome-navy)",
        }}
      >
        Welcome
      </span>

      <span
        aria-hidden
        className={`${aboveTheBeyond.className} relative z-10 mx-auto block w-fit max-w-full px-1 leading-[0.88] sm:leading-[0.9]`}
        style={{
          fontSize: "var(--script-size)",
          color: "var(--color-welcome-navy)",
        }}
      >
        to our love story
      </span>

      <span className="sr-only"> to our love story</span>
    </h2>
  )
}

export function Welcome() {
  const siteConfig = useSiteConfig()
  const brideName = siteConfig.couple.brideNickname || siteConfig.couple.bride
  const groomName = siteConfig.couple.groomNickname || siteConfig.couple.groom
  const weddingDate = new Date(siteConfig.wedding.date)
  const dateLabel = Number.isNaN(weddingDate.getTime())
    ? siteConfig.wedding.date
    : weddingDate.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })
  const venueName = siteConfig.ceremony.location
  const venueArea = siteConfig.ceremony.venue
  // Same corner florals as the loader and envelope (content/site.ts → CORNER_DECOS)
  const decos = siteConfig.loadingScreen?.cornerDecos

  return (
    <section
      id="welcome"
      className={`${theSeasons.variable} ${aboveTheBeyond.variable} relative overflow-x-clip px-4 py-12 sm:px-6 sm:py-16 md:px-8 md:py-20`}
    >
      <div className="mx-auto w-full max-w-3xl">
        <motion.article
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.65, ease: [0.22, 0.61, 0.36, 1] }}
          className="relative @container/welcome overflow-visible rounded-xl border px-5 py-8 sm:rounded-2xl sm:px-9 sm:py-10 md:px-11 md:py-12"
          style={{
            borderColor: "color-mix(in srgb, var(--color-welcome-navy) 22%, transparent)",
            background: "var(--color-motif-soft)",
            boxShadow:
              "0 10px 30px color-mix(in srgb, var(--color-welcome-navy) 18%, transparent)",
          }}
        >
          {/* Corner florals: top-left and bottom-right, tucked over the card's corners */}
          {decos?.topLeft && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={encodeURI(decos.topLeft)}
              alt=""
              aria-hidden
              className="welcome-deco welcome-deco--tl pointer-events-none absolute z-20 select-none"
            />
          )}
          {decos?.bottomRight && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={encodeURI(decos.bottomRight)}
              alt=""
              aria-hidden
              className="welcome-deco welcome-deco--br pointer-events-none absolute z-20 select-none"
            />
          )}

          <div
            className="wedding-frame-inner hidden min-[400px]:block"
            style={{ borderColor: "color-mix(in srgb, var(--color-welcome-navy) 22%, transparent)" }}
            aria-hidden
          />

          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-8 top-0 h-px sm:inset-x-10 md:inset-x-12"
            style={{
              background:
                "linear-gradient(to right, transparent, var(--color-motif-yellow), transparent)",
            }}
          />

          <div className="relative flex flex-col gap-8 sm:gap-9 md:gap-10">
            <header className="space-y-3 pt-2 text-center sm:space-y-3.5 sm:pt-3 md:space-y-4 md:pt-4">
              <LayeredWelcomeTitle />
              <OrnamentalDivider compact />
            </header>

            <figure className="mx-auto max-w-[36rem] text-center">
              <blockquote>
                <p
                  className={`font-goudy-italic ${sectionType.textSnug}`}
                  style={{ color: "var(--color-welcome-navy)" }}
                >
                  &ldquo;Of all the moments we have shared, none is sweeter than the one still ahead of
                  us — and we would be honored to have you there as our forever begins.&rdquo;
                </p>
                <figcaption className="mt-2 sm:mt-2.5">
                  <cite
                    className={`${cinzel.className} ${sectionType.label} not-italic uppercase tracking-[0.2em] sm:tracking-[0.24em]`}
                    style={{ color: "var(--color-welcome-navy)" }}
                  >
                    {groomName} &amp; {brideName}
                  </cite>
                </figcaption>
              </blockquote>
            </figure>

            {/* Body: Crimson Text (upright book serif), same reading style as the love story */}
            <div
              className="mx-auto max-w-[36rem] space-y-3 text-center text-[clamp(0.875rem,1vw+0.6rem,0.96875rem)] leading-[1.7] sm:space-y-3.5 md:space-y-4"
              style={{
                color: "var(--color-welcome-navy)",
                fontFamily: '"Crimson Text", "Cormorant Garamond", Georgia, serif',
              }}
            >
              <p>
                Dear beloved family and friends, with hearts full of joy and gratitude, we are
                delighted to share the beginning of our forever with you. What started as a simple
                hello has blossomed into a love we treasure, and we cannot imagine this day without
                the people who have shaped our lives.
              </p>
              <p>
                On {dateLabel}
                {venueName ? <>, at {venueName}{venueArea ? `, ${venueArea}` : ""}</> : null}, we will
                exchange our vows in a celebration of Modern Filipiniana elegance, touched with a
                little garden romance. Inside this invitation you will find everything you need: the
                schedule, venue details, the attire guide and a few gentle reminders.
              </p>
              <p>
                Your presence, prayers and warm wishes are the greatest gifts we could ask for.
                Thank you for being part of our story — we can&apos;t wait to celebrate with you.
              </p>
            </div>

            <footer className="space-y-2 border-t pt-8 text-center sm:space-y-2.5 sm:pt-9 md:pt-10"
              style={{
                borderColor: "color-mix(in srgb, var(--color-welcome-navy) 18%, transparent)",
              }}
            >
              <p
                className={`${aboveTheBeyond.className} ${sectionType.script}`}
                style={{ color: "var(--color-welcome-navy)" }}
              >
                With all our love,
              </p>
              <p
                className={`${cinzel.className} ${sectionType.subheader} font-semibold tracking-[0.12em] sm:tracking-[0.16em] md:tracking-[0.18em]`}
                style={{ color: "var(--color-welcome-navy)" }}
              >
                {groomName} &amp; {brideName}
              </p>
            </footer>
          </div>
        </motion.article>
      </div>
    </section>
  )
}
