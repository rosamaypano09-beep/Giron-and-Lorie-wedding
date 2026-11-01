"use client"

import Link from "next/link"
import { useEffect } from "react"
import { cinzel } from "@/lib/fonts"
import localFont from "next/font/local"
import { ChevronLeft } from "lucide-react"
import { useSiteConfig } from "@/hooks/use-site-config"
import { HEART_PATH } from "@/components/rising-hearts"

const aboveTheBeyond = localFont({
  src: "../../Font/above-the-beyond-script.otf",
  display: "swap",
})

// Top bar: frosted cream glass with a whisper of pastel blue (matches the invitation navbar)
const BAR_BG =
  "linear-gradient(180deg, rgb(255 251 240 / 92%) 0%, color-mix(in srgb, var(--color-motif-blue) 38%, rgb(255 251 240 / 88%)) 100%)"

export default function GalleryLayout({ children }: { children: React.ReactNode }) {
  const { couple, gallery } = useSiteConfig()
  const page = gallery.page

  useEffect(() => {
    const navbar = document.querySelector("nav") as HTMLElement | null
    if (navbar) navbar.style.display = "none"
    return () => {
      if (navbar) navbar.style.display = ""
    }
  }, [])

  return (
    <div style={{ background: "var(--color-bg-pattern-base)" }}>
      <div
        className="sticky top-0 z-50"
        style={{
          background: BAR_BG,
          WebkitBackdropFilter: "blur(14px) saturate(1.15)",
          backdropFilter: "blur(14px) saturate(1.15)",
          boxShadow: "0 10px 28px -6px color-mix(in srgb, var(--color-welcome-navy) 20%, transparent)",
        }}
      >
        <div className="mx-auto flex h-12 max-w-7xl items-center justify-between gap-3 px-3 sm:h-14 sm:px-6 lg:px-8">
          <Link
            href="/#gallery"
            onClick={() => sessionStorage.setItem("returnFromGallery", "true")}
            className={`${cinzel.className} inline-flex items-center gap-1 rounded-full py-1.5 pl-2 pr-3.5 text-[0.625rem] font-semibold uppercase tracking-[0.16em] transition-all duration-300 hover:scale-[1.03] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-motif-accent)] sm:py-2 sm:pr-4 sm:text-[0.6875rem] sm:tracking-[0.2em]`}
            style={{
              background:
                "linear-gradient(180deg, var(--color-welcome-heading) 0%, color-mix(in srgb, var(--color-welcome-heading) 72%, var(--color-welcome-navy)) 100%)",
              color: "#FFFFFF",
              boxShadow: "0 0 0 3px color-mix(in srgb, var(--color-motif-blue) 50%, transparent), 0 6px 14px -8px color-mix(in srgb, var(--color-motif-deep) 60%, transparent)",
            }}
          >
            <ChevronLeft className="h-3.5 w-3.5" aria-hidden />
            <span className="hidden min-[400px]:inline">{page.backText}</span>
            <span className="min-[400px]:hidden">{page.backTextShort}</span>
          </Link>

          <div className="flex min-w-0 items-baseline gap-2" style={{ color: "var(--color-welcome-navy)" }}>
            <span
              className={`${aboveTheBeyond.className} hidden truncate text-lg leading-none sm:inline sm:text-xl`}
              style={{ color: "#B8914A" }}
            >
              {couple.groomNickname} &amp; {couple.brideNickname}
            </span>
            <svg viewBox="0 0 24 24" className="hidden h-2.5 w-2.5 self-center sm:inline-block" fill="var(--color-motif-accent)" aria-hidden>
              <path d={HEART_PATH} />
            </svg>
            <span
              className={`${cinzel.className} text-[0.625rem] font-semibold uppercase tracking-[0.24em] sm:text-[0.6875rem] sm:tracking-[0.28em]`}
            >
              {page.label}
            </span>
          </div>
        </div>
        {/* Pastel ribbon along the bottom edge: blue · green · butter · pink · violet */}
        <div
          className="h-[2px] w-full"
          style={{
            background:
              "linear-gradient(90deg, transparent 0%, var(--color-motif-blue) 12%, var(--color-motif-green) 30%, var(--color-motif-butter) 50%, var(--color-motif-pink) 70%, var(--color-motif-violet) 88%, transparent 100%)",
          }}
          aria-hidden
        />
      </div>
      {children}
    </div>
  )
}
