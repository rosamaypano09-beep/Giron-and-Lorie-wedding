"use client"

import { RisingHearts } from "@/components/rising-hearts"
import { useState, type CSSProperties, type KeyboardEvent } from "react"
import { QRCodeSVG } from "qrcode.react"
import { useQrColors } from "@/hooks/use-css-color"
import localFont from "next/font/local"
import { cinzel } from "@/lib/fonts"
import { Gift, Heart, Copy, Check } from "lucide-react"
import { AnimatePresence, motion, useReducedMotion, type Variants } from "motion/react"
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

type GiftAccount = { provider: string; name: string; number: string }

// "09309324933" → "0930 932 4933"; other numbers in groups of four
function formatAccountNumber(number: string) {
  const digits = number.replace(/\s+/g, "")
  if (/^09\d{9}$/.test(digits)) return `${digits.slice(0, 4)} ${digits.slice(4, 7)} ${digits.slice(7)}`
  return digits.replace(/(\d{4})(?=\d)/g, "$1 ")
}

type RegistryColors = { title: string; script: string; eyebrow: string; body: string; soft: string; cardEdge: string }

// Tab label: "GCash · Melchor" (first name only), or just the provider when there's no name
function tabLabel(account: GiftAccount) {
  const first = account.name.trim().split(/\s+/)[0]
  return first ? { provider: account.provider, who: first } : { provider: account.provider, who: "" }
}

// One account at a time: tabs on top, a large QR with the name, number and Copy below
function AccountTabs({
  accounts,
  colors,
  buttonBg,
}: {
  accounts: readonly GiftAccount[]
  colors: RegistryColors
  buttonBg: string
}) {
  const { fg: qrFg, bg: qrBg } = useQrColors()
  const reduceMotion = useReducedMotion()
  const [active, setActive] = useState(0)
  const [copied, setCopied] = useState(false)
  const account = accounts[Math.min(active, accounts.length - 1)]
  const number = account.number.replace(/\s+/g, "")

  const select = (index: number) => {
    setActive(index)
    setCopied(false)
  }

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(number)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      /* clipboard blocked — the number is still shown to copy by hand */
    }
  }

  // Arrow keys move between tabs
  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return
    e.preventDefault()
    const next = (active + (e.key === "ArrowRight" ? 1 : -1) + accounts.length) % accounts.length
    select(next)
    document.getElementById(`gift-tab-${next}`)?.focus()
  }

  return (
    <motion.div variants={itemVariants} className="mx-auto mt-4 w-full max-w-sm">
      {/* Tabs */}
      <div
        role="tablist"
        aria-label="Gift accounts"
        onKeyDown={onKeyDown}
        className="relative flex rounded-full p-1"
        style={{ background: "color-mix(in srgb, var(--color-motif-blush) 22%, white)", boxShadow: `inset 0 0 0 1px ${colors.cardEdge}` }}
      >
        {accounts.map((acc, i) => {
          const isActive = i === active
          const { provider, who } = tabLabel(acc)
          return (
            <button
              key={`${acc.provider}-${acc.number}`}
              id={`gift-tab-${i}`}
              type="button"
              role="tab"
              aria-selected={isActive}
              aria-controls="gift-tab-panel"
              tabIndex={isActive ? 0 : -1}
              onClick={() => select(i)}
              className="relative flex min-w-0 flex-1 flex-col items-center rounded-full px-1.5 py-1.5 outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-motif-accent)] sm:py-2"
            >
              {isActive && (
                <motion.span
                  layoutId="gift-tab-pill"
                  className="absolute inset-0 rounded-full"
                  style={{ background: buttonBg, boxShadow: "0 6px 14px -8px color-mix(in srgb, var(--color-welcome-navy) 70%, transparent)" }}
                  transition={reduceMotion ? { duration: 0 } : { type: "spring", stiffness: 380, damping: 32 }}
                />
              )}
              <span
                className={`${cinzel.className} relative text-[0.58rem] font-semibold uppercase leading-tight tracking-[0.14em] sm:text-[0.66rem]`}
                style={{ color: isActive ? "#FFFFFF" : colors.title }}
              >
                {provider}
              </span>
              {who ? (
                <span
                  className="font-goudy-italic relative mt-0.5 truncate text-[0.66rem] leading-none sm:text-[0.74rem]"
                  style={{ color: isActive ? "rgb(255 255 255 / 85%)" : colors.soft }}
                >
                  {who}
                </span>
              ) : null}
            </button>
          )
        })}
      </div>

      {/* Panel */}
      <div
        id="gift-tab-panel"
        role="tabpanel"
        aria-labelledby={`gift-tab-${active}`}
        className="mt-3 rounded-2xl px-4 pb-5 pt-5 text-center sm:px-6"
        style={{ background: "color-mix(in srgb, var(--color-motif-blush) 14%, white)", border: `1px solid ${colors.cardEdge}` }}
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={active}
            className="flex flex-col items-center"
            initial={reduceMotion ? false : { opacity: 0, y: 10, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -8, scale: 0.97 }}
            transition={{ duration: 0.3, ease }}
          >
            <div
              className="rounded-2xl p-2.5 sm:p-3"
              style={{ backgroundColor: qrBg, boxShadow: `0 0 0 1px ${colors.cardEdge}, 0 14px 28px -16px color-mix(in srgb, var(--color-welcome-navy) 50%, transparent)` }}
            >
              <QRCodeSVG
                value={number}
                size={220}
                level="M"
                includeMargin={false}
                fgColor={qrFg}
                bgColor={qrBg}
                className="block h-40 w-40 sm:h-44 sm:w-44"
                aria-label={`QR code for ${account.provider} ${number}`}
              />
            </div>
            <span
              className={`${cinzel.className} mt-4 rounded-full px-3 py-0.5 text-[0.58rem] font-semibold uppercase tracking-[0.2em] sm:text-[0.64rem]`}
              style={{ background: "#FFFFFF", color: colors.eyebrow, border: `1px solid ${colors.cardEdge}` }}
            >
              {account.provider}
            </span>
            {account.name ? (
              <p
                className={`${cinzel.className} mt-2 text-[0.7rem] font-semibold uppercase leading-snug tracking-[0.14em] sm:text-[0.78rem]`}
                style={{ color: colors.title }}
              >
                {account.name}
              </p>
            ) : null}
            <p
              className={`${cinzel.className} mt-1 text-[1.15rem] font-semibold tabular-nums tracking-[0.06em] sm:text-[1.3rem]`}
              style={{ color: colors.script }}
            >
              {formatAccountNumber(number)}
            </p>
            <button
              type="button"
              onClick={copy}
              className={`${cinzel.className} mt-3 inline-flex items-center gap-1.5 rounded-full border px-4 py-2 text-[0.62rem] font-semibold uppercase tracking-[0.14em] transition-all duration-200 hover:scale-[1.03] active:scale-[0.97] sm:text-[0.68rem]`}
              style={{ color: "#FFFFFF", background: buttonBg, borderColor: "rgb(255 255 255 / 70%)" }}
              aria-label={`Copy ${account.provider} number ${number}`}
            >
              {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
              {copied ? "Copied" : "Copy Number"}
            </button>
          </motion.div>
        </AnimatePresence>
      </div>
    </motion.div>
  )
}

export function Registry() {
  const siteConfig = useSiteConfig()
  const content = siteConfig.registry
  const c = content.colors // siteConfig.registry.colors (content/site.ts)
  const { brideNickname, groomNickname } = siteConfig.couple
  const reduceMotion = useReducedMotion()
  const initial = reduceMotion ? false : "hidden"

  // Older configs (e.g. from /api/wedding-details) may not have accounts
  const extra = content as { accounts?: GiftAccount[]; accountsTitle?: string; accountsHint?: string }
  const accounts = extra.accounts ?? []
  const accountsTitle = extra.accountsTitle || "Ways to Send Your Gift"
  const accountsHint = extra.accountsHint ?? ""

  const buttonBg = c.button
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
            className="relative mt-8 rounded-[1.75rem] px-7 pb-10 pt-12 text-center sm:mt-10 sm:rounded-[2.25rem] sm:px-12 sm:pb-12 sm:pt-14 md:px-14"
            style={cardStyle}
            variants={staggerVariants}
            initial={initial}
            whileInView="show"
            viewport={{ once: true, amount: 0.05 }}
          >
            {/* Seal sitting on the top edge */}
            <motion.div variants={itemVariants} className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2">
              <span
                className="flex h-14 w-14 items-center justify-center rounded-full sm:h-16 sm:w-16"
                style={{
                  background: buttonBg,
                  boxShadow: `0 0 0 5px ${c.card}, 0 0 0 6px ${c.cardEdge}, 0 16px 30px -12px color-mix(in srgb, ${c.title} 55%, transparent)`,
                }}
                aria-hidden
              >
                <Gift className="h-6 w-6 sm:h-7 sm:w-7" style={{ color: buttonText }} />
              </span>
            </motion.div>

            <div className={`font-goudy-italic relative mx-auto max-w-xl space-y-4 ${ct.bodyLg} leading-relaxed`} style={{ color: c.body }}>
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

            {/* Gift accounts with QR codes */}
            {accounts.length > 0 && (
              <div className="mt-7 sm:mt-8">
                <motion.div variants={itemVariants} className="flex items-center justify-center gap-2.5">
                  <span className="h-px w-8 sm:w-12" style={{ background: `linear-gradient(to right, transparent, ${c.line})` }} aria-hidden />
                  <p
                    className={`${cinzel.className} text-[0.66rem] font-semibold uppercase tracking-[0.22em] sm:text-[0.74rem]`}
                    style={{ color: c.eyebrow }}
                  >
                    {accountsTitle}
                  </p>
                  <span className="h-px w-8 sm:w-12" style={{ background: `linear-gradient(to left, transparent, ${c.line})` }} aria-hidden />
                </motion.div>
                {accountsHint ? (
                  <motion.p variants={itemVariants} className={`font-goudy-italic mt-1.5 ${ct.body}`} style={{ color: c.soft }}>
                    {accountsHint}
                  </motion.p>
                ) : null}
                <AccountTabs accounts={accounts} colors={c} buttonBg={buttonBg} />
              </div>
            )}

            <div className="h-6 sm:h-7" aria-hidden />

            {/* Sign-off */}
            <motion.div variants={itemVariants} className="relative space-y-1.5">
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
              <Heart className="mx-auto mt-3 h-3.5 w-3.5" style={{ color: "var(--color-motif-accent)", fill: "var(--color-motif-accent)" }} aria-hidden />
            </motion.div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
