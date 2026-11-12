"use client"

import { RisingHearts } from "@/components/rising-hearts"
import { type CSSProperties } from "react"
import localFont from "next/font/local"
import { cinzel } from "@/lib/fonts"
import { Gift } from "lucide-react"
import { motion, useReducedMotion, type Variants } from "motion/react"
import { useSiteConfig } from "@/hooks/use-site-config"
import { layeredSectionTitleSize, sectionType } from "@/lib/section-typography"

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

// Text outside the card sits on the dusty-blue page backdrop: white with a soft navy shadow
const onBg = {
  color: "white",
  textShadow:
    "0 1px 2px color-mix(in srgb, var(--color-welcome-navy) 50%, transparent), 0 2px 14px color-mix(in srgb, var(--color-welcome-navy) 40%, transparent)",
} as const
const onBgScript = onBg

const onBgLine = "color-mix(in srgb, white 85%, transparent)"

const ct = {
  body: sectionType.text,
  bodyLg: sectionType.textRelaxed,
} as const

const ease = [0.22, 1, 0.36, 1] as const

const revealVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.8, ease } },
}

const staggerVariants: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12, delayChildren: 0.15 } },
}

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease } },
}

// Sits outside the card, so drawn in white
function DiamondDivider() {
  return (
    <div className="flex items-center justify-center gap-2" aria-hidden>
      <span className="h-px w-10 sm:w-16" style={{ background: `linear-gradient(to right, transparent, ${onBgLine})` }} />
      <span className="h-1.5 w-1.5 rotate-45" style={{ background: "var(--color-motif-accent)" }} />
      <span className="h-px w-10 sm:w-16" style={{ background: `linear-gradient(to left, transparent, ${onBgLine})` }} />
    </div>
  )
}

function RegistryTitle({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <h2
      className="welcome-title-lockup relative mx-auto w-full max-w-full text-center"
      style={
        {
          "--title-size": layeredSectionTitleSize.main,
          "--script-size": layeredSectionTitleSize.script,
        } as CSSProperties
      }
    >
      <span className="sr-only">
        {title} — {subtitle}
      </span>
      <span
        aria-hidden
        className={`${theSeasons.className} block uppercase leading-[0.9] tracking-[0.04em] min-[400px]:tracking-[0.08em] sm:tracking-[0.12em] md:tracking-[0.14em]`}
        style={{ fontSize: "var(--title-size)", ...onBg }}
      >
        {title}
      </span>
      <span
        aria-hidden
        className={`${aboveTheBeyond.className} relative z-10 mx-auto mt-1.5 block w-fit max-w-full px-1 leading-[0.88] sm:mt-2 sm:leading-[0.9]`}
        style={{ fontSize: "var(--script-size)", ...onBgScript }}
      >
        {subtitle}
      </span>
    </h2>
  )
}

export function Registry() {
  const siteConfig = useSiteConfig()
  const content = siteConfig.registry
  const c = content.colors // siteConfig.registry.colors (content/site.ts)
  const { brideNickname, groomNickname } = siteConfig.couple
  // Same corner florals as the loader / welcome card (content/site.ts → CORNER_DECOS)
  const decos = siteConfig.loadingScreen?.cornerDecos
  const reduceMotion = useReducedMotion()
  const initial = reduceMotion ? false : "hidden"

  const buttonText = "#FFFFFF"
  const cardStyle = {
    background: c.card,
    border: `1px solid ${c.cardEdge}`,
    boxShadow: `0 0 0 6px rgb(255 255 255 / 30%), 0 26px 56px -30px color-mix(in srgb, var(--color-welcome-navy) 55%, transparent)`,
  }
  const dividerLineStyle = { background: `linear-gradient(to right, transparent, ${onBgLine}, transparent)` }

  return (
    <div
      className={`${theSeasons.variable} ${aboveTheBeyond.variable} relative w-full overflow-hidden`}
    >
      <section
        id="registry"
        className="relative z-10 overflow-hidden pt-14 pb-12 sm:pt-16 sm:pb-14 md:pt-20 md:pb-16 lg:pt-24 lg:pb-20"
      >
        {/* Readability scrim — translucent so the background still shows through */}
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 bg-black/35" />
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
          <RisingHearts tone="butter" fill />
        </div>
        {/* Header */}
        <motion.div
          className="relative z-20 mx-auto mb-8 max-w-5xl px-3 text-center @container/registry sm:mb-10 sm:px-4 md:mb-12"
          variants={revealVariants}
          initial={initial}
          whileInView="show"
          viewport={{ once: true, amount: 0.3 }}
        >
          <DiamondDivider />
          <p
            className={`${cinzel.className} mx-auto mt-4 max-w-[20rem] px-2 text-[0.6875rem] font-semibold uppercase leading-snug tracking-[0.16em] min-[400px]:max-w-none min-[400px]:text-[0.75rem] sm:mt-5 sm:text-[0.875rem] sm:tracking-[0.22em]`}
            style={onBg}
          >
            {content.eyebrow}
          </p>
          <div className="mx-auto mt-3 sm:mt-4 md:mt-5">
            <RegistryTitle title={content.title} subtitle={content.subtitle} />
          </div>
          <p
            className={`font-goudy-italic mx-auto mt-4 max-w-xl px-2 sm:mt-5 md:mt-6 ${ct.bodyLg}`}
            style={{ ...onBg, fontWeight: 600 }}
          >
            {content.description}
          </p>
          <div className="mt-4 flex items-center justify-center sm:mt-5">
            <span className="h-px w-16 sm:w-24 md:w-32" style={dividerLineStyle} />
          </div>
        </motion.div>

        <div className="relative z-20 mx-auto max-w-2xl px-4 sm:px-6 md:px-8">
          {/* Letter card */}
          <motion.div
            className="relative mt-8 rounded-[1.75rem] px-7 pb-12 pt-14 text-center sm:mt-10 sm:rounded-[2.25rem] sm:px-12 sm:pb-12 sm:pt-14 md:px-14"
            style={cardStyle}
            variants={staggerVariants}
            initial={initial}
            whileInView="show"
            viewport={{ once: true, amount: 0.05 }}
          >
            {/* Soft sky light at the top, blush at the foot */}
            <div
              className="pointer-events-none absolute inset-0 rounded-[inherit]"
              style={{
                background:
                  "radial-gradient(80% 35% at 50% 0%, color-mix(in srgb, #90E3F4 22%, transparent) 0%, transparent 70%), radial-gradient(70% 30% at 50% 100%, color-mix(in srgb, #F7D6E0 40%, transparent) 0%, transparent 70%)",
              }}
              aria-hidden
            />
            {/* Fine gold double frame inside the card */}
            <div
              className="pointer-events-none absolute inset-2.5 rounded-[1.35rem] sm:inset-3.5 sm:rounded-[1.8rem]"
              style={{
                border: "1px solid color-mix(in srgb, #C9A24E 45%, transparent)",
                boxShadow: "inset 0 0 0 4px transparent, inset 0 0 0 5px color-mix(in srgb, #C9A24E 18%, transparent)",
              }}
              aria-hidden
            />
            {/* Corner florals: top-left and bottom-right */}
            {decos?.topLeft ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={encodeURI(decos.topLeft)}
                alt=""
                aria-hidden
                className="registry-deco registry-deco--tl pointer-events-none absolute z-10 select-none"
              />
            ) : null}
            {decos?.bottomRight ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={encodeURI(decos.bottomRight)}
                alt=""
                aria-hidden
                className="registry-deco registry-deco--br pointer-events-none absolute z-10 select-none"
              />
            ) : null}

            {/* Gold wax seal on the top edge with a gift */}
            <motion.div variants={itemVariants} className="absolute left-1/2 top-0 z-20 -translate-x-1/2 -translate-y-1/2">
              <span
                className="flex h-14 w-14 items-center justify-center rounded-full sm:h-16 sm:w-16"
                style={{
                  background: "radial-gradient(circle at 35% 30%, #D9B66A 0%, #B08440 55%, #8F6730 100%)",
                  boxShadow: `0 0 0 4px ${c.card}, 0 0 0 5px color-mix(in srgb, #C9A24E 60%, transparent), 0 14px 26px -10px rgb(47 90 120 / 45%), inset 0 1px 2px rgb(255 255 255 / 45%)`,
                }}
                aria-hidden
              >
                <Gift
                  className="h-6 w-6 sm:h-7 sm:w-7"
                  style={{ color: buttonText, filter: "drop-shadow(0 1px 1px rgb(0 0 0 / 25%))" }}
                />
              </span>
            </motion.div>

            <div className={`font-goudy-italic relative z-20 mx-auto max-w-xl space-y-4 ${ct.bodyLg} leading-relaxed`} style={{ color: c.body }}>
              {content.paragraphs.map((text, i) => (
                <motion.p key={i} variants={itemVariants} className={i === 0 ? "text-left sm:text-center" : ""}>
                  {i === 0 && text.length > 1 ? (
                    <>
                      {/* Drop cap on the first paragraph */}
                      <span
                        className={`${theSeasons.className} float-left mr-2 mt-1 text-[2.6rem] leading-[0.8] sm:float-none sm:mr-1 sm:inline sm:text-[2.2rem] sm:leading-none`}
                        style={{ color: c.script }}
                        aria-hidden
                      >
                        {text.charAt(0)}
                      </span>
                      <span className="sr-only">{text.charAt(0)}</span>
                      {text.slice(1)}
                    </>
                  ) : (
                    text
                  )}
                </motion.p>
              ))}
            </div>

            <div className="h-6 sm:h-7" aria-hidden />

            {/* Sign-off */}
            <motion.div variants={itemVariants} className="relative z-20 space-y-1.5">
              {content.thankYou ? (
                <p className={`font-goudy-italic ${ct.body}`} style={{ color: c.body }}>
                  {content.thankYou}
                </p>
              ) : null}
              <p className={`font-goudy-italic ${ct.body}`} style={{ color: c.soft }}>
                {content.signOff}
              </p>
              {/* Couple signature: names in script, "&" in an italic serif, sage hairlines either side */}
              {(() => {
                const signature = (content.signature || "{groom} & {bride}")
                  .split("{groom}").join(groomNickname)
                  .split("{bride}").join(brideNickname)
                const [first, ...rest] = signature.split("&")
                const second = rest.join("&")
                return (
                  <div className="flex items-center justify-center gap-2.5 pt-2 sm:gap-3.5">
                    <span className="h-px w-8 shrink-0 sm:w-14" style={{ background: `linear-gradient(to right, transparent, ${c.line})` }} aria-hidden />
                    <p
                      className={`${aboveTheBeyond.className} flex items-baseline gap-2 text-[1.9rem] leading-none sm:text-[2.4rem]`}
                      style={{ color: c.script }}
                      aria-label={signature}
                    >
                      <span aria-hidden>{first.trim()}</span>
                      {second ? (
                        <>
                          <span
                            aria-hidden
                            className="font-goudy-italic text-[0.62em] italic"
                            style={{ color: c.line }}
                          >
                            &amp;
                          </span>
                          <span aria-hidden>{second.trim()}</span>
                        </>
                      ) : null}
                    </p>
                    <span className="h-px w-8 shrink-0 sm:w-14" style={{ background: `linear-gradient(to left, transparent, ${c.line})` }} aria-hidden />
                  </div>
                )
              })()}
              <span
                className="mx-auto mt-4 block h-px w-24"
                style={{ background: "linear-gradient(to right, transparent, #C9A24E, transparent)" }}
                aria-hidden
              />
            </motion.div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
