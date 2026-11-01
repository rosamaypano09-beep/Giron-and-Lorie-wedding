import type React from "react"
import type { Metadata, Viewport } from "next"
import localFont from "next/font/local"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"
import { siteConfig, canonicalSiteUrl } from "@/content/site"
import { ClientLayout } from "@/components/client-layout"
import { getImageProps } from "next/image"
import {
  LOADING_BG_PHOTOS,
  LOADING_BG_PHOTOS_DESKTOP,
  MARQUEE_IMAGE_QUALITY,
  MARQUEE_IMAGE_SIZES,
} from "@/lib/loading-bg-photos"
import { anastasiaScript, greatVibes, inter, imperialScript, cinzel } from "@/lib/fonts"

const canonicalUrl = canonicalSiteUrl
const desktopHero = siteConfig.linkPreviewImage
const mobileHero = siteConfig.linkPreviewImage
const eventImageUrl = `${canonicalUrl}${desktopHero}`
const OG_IMAGE_FALLBACK = `${canonicalUrl}${desktopHero}`
// og:image:type must match the real file — Facebook / Messenger drop the image on a mismatch
const OG_IMAGE_TYPE = /\.png$/i.test(desktopHero)
  ? "image/png"
  : /\.webp$/i.test(desktopHero)
    ? "image/webp"
    : "image/jpeg"

const coupleNames = `${siteConfig.couple.groomNickname} & ${siteConfig.couple.brideNickname}`
// Main wedding hashtag (content/site.ts → HASHTAGS[0])
const mainHashtag = siteConfig.snapShare.hashtag[0] ?? ""
const eventTitle = `${coupleNames} - Wedding Invitation`
const eventDescription = `Celebrate the wedding of ${siteConfig.couple.groomNickname} and ${siteConfig.couple.brideNickname} on ${siteConfig.wedding.date} at the ${siteConfig.ceremony.location.trim()}, ${siteConfig.ceremony.venue}. RSVP, explore their story, and find everything you need to join the celebration.`

// "November 28, 2026" + "9:00 AM" → "2026-11-28T09:00:00+08:00" (Philippine time)
function toIsoStart(date: string, time: string) {
  const d = new Date(date)
  const m = time.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i)
  if (Number.isNaN(d.getTime()) || !m) return undefined
  let hour = Number(m[1]) % 12
  if (m[3].toUpperCase() === "PM") hour += 12
  const pad = (n: number) => String(n).padStart(2, "0")
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(hour)}:${m[2]}:00+08:00`
}

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Event",
  name: `${siteConfig.couple.groomNickname} & ${siteConfig.couple.brideNickname} Wedding`,
  // Built from content/site.ts so it always matches the wedding date and ceremony time
  startDate: toIsoStart(siteConfig.ceremony.date, siteConfig.ceremony.time),
  eventStatus: "https://schema.org/EventScheduled",
  eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
  location: [
    {
      "@type": "Place",
      name: siteConfig.ceremony.location.trim(),
      address: {
        "@type": "PostalAddress",
        streetAddress: siteConfig.ceremony.venue,
        addressLocality: siteConfig.ceremony.venue,
        addressRegion: "Negros Occidental",
        addressCountry: "PH",
      },
    },
    {
      "@type": "Place",
      name: siteConfig.reception.location.trim(),
      address: {
        "@type": "PostalAddress",
        streetAddress: siteConfig.reception.venue,
        addressLocality: siteConfig.reception.venue,
        addressRegion: "Negros Occidental",
        addressCountry: "PH",
      },
    },
  ],
  image: [OG_IMAGE_FALLBACK],
  description:
    `You're invited to celebrate the wedding of ${siteConfig.couple.groomNickname} & ${siteConfig.couple.brideNickname}. Discover ceremony and reception details, RSVP, and explore their story.`,
  organizer: {
    "@type": "Person",
    name: coupleNames,
  },
  eventHashtag: mainHashtag,
}

const brittany = localFont({
  src: "../Font/brittany-signature-script/BrittanySignatureScript.ttf",
  variable: "--font-brittany",
  display: "swap",
})

const playlistScript = localFont({
  src: "../Font/playlist-script/Playlist Script.otf",
  variable: "--font-playlist-script",
  display: "swap",
})

export const metadata: Metadata = {
  metadataBase: new URL(canonicalUrl),
  title: {
    default: eventTitle,
    template: `%s | ${coupleNames}`,
  },
  description: eventDescription,
  keywords:
    `${siteConfig.couple.groomNickname} ${siteConfig.couple.brideNickname} wedding, ${siteConfig.ceremony.location.trim()}, ${siteConfig.reception.location.trim()} wedding, wedding invitation, RSVP, wedding gallery, message wall, love story, ${mainHashtag}`,
  applicationName: `${coupleNames} Wedding Invitation`,
  authors: [
    { name: siteConfig.couple.groomNickname },
    { name: siteConfig.couple.brideNickname },
  ],
  creator: coupleNames,
  publisher: coupleNames,
  category: "Event",
  formatDetection: {
    email: false,
    address: false,
    telephone: true,
  },
  alternates: {
    canonical: canonicalUrl,
  },
  icons: {
    icon: [
      { url: "/favicon_io/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon_io/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    shortcut: "/favicon_io/favicon.ico",
    apple: "/favicon_io/apple-touch-icon.png",
    other: [
      { rel: "android-chrome-192x192", url: "/favicon_io/android-chrome-192x192.png" },
      { rel: "android-chrome-512x512", url: "/favicon_io/android-chrome-512x512.png" },
    ],
  },
  manifest: "/favicon_io/site.webmanifest",
  openGraph: {
    title: `${coupleNames} | ${siteConfig.wedding.date}`,
    description:
      `Celebrate the union of ${siteConfig.couple.groomNickname} & ${siteConfig.couple.brideNickname} on ${siteConfig.wedding.date}. Discover their story, RSVP, and find important details for the ceremony and reception.`,
    url: canonicalUrl,
    siteName: `${coupleNames} Wedding`,
    locale: "en_PH",
    type: "website",
    images: [
      {
        url: OG_IMAGE_FALLBACK,
        secureUrl: OG_IMAGE_FALLBACK,
        width: 1200,
        height: 630,
        type: OG_IMAGE_TYPE,
        alt: `${coupleNames} Wedding Invitation - ${siteConfig.wedding.date}`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${coupleNames} Wedding Invitation`,
    description:
      `You're invited to the wedding of ${siteConfig.couple.groomNickname} & ${siteConfig.couple.brideNickname} on ${siteConfig.wedding.date}. RSVP, explore their story, and get all the details for the big day! ${mainHashtag}`,
    images: [eventImageUrl],
    creator: `@${siteConfig.couple.groomNickname}And${siteConfig.couple.brideNickname}`,
    site: `@${siteConfig.couple.groomNickname}And${siteConfig.couple.brideNickname}`,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  appleWebApp: {
    title: coupleNames,
    statusBarStyle: "default",
    capable: true,
  },
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  colorScheme: "light",
  themeColor: "#D2A4A4",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="color-scheme" content="light" />
        <meta name="theme-color" content="#D2A4A4" />
        <meta name="format-detection" content="telephone=yes,email=no,address=no" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400..900&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Lavishly+Yours&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Style+Script&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Crimson+Text:ital,wght@0,400;0,600;0,700;1,400;1,600;1,700&display=swap" rel="stylesheet" />
        <link
          rel="preload"
          href="/fonts/AnastasiaScript.ttf"
          as="font"
          type="font/ttf"
          crossOrigin="anonymous"
        />
        {/* First loader photos, preloaded as the exact resized files the marquee requests.
            Photos display: the loader marquee shows the same portrait list on every screen,
            so its first tiles (two per row) are preloaded for all widths. Plain display
            uses the landscape set from 768px up. */}
        {(siteConfig.loadingScreen.display === "plain"
          ? [
              ...LOADING_BG_PHOTOS.slice(0, 3).map((src) => ({ src, media: "(max-width: 767px)" })),
              ...LOADING_BG_PHOTOS_DESKTOP.slice(0, 3).map((src) => ({ src, media: "(min-width: 768px)" })),
            ]
          : LOADING_BG_PHOTOS.slice(0, 4).map((src) => ({ src, media: undefined as string | undefined }))
        ).map(({ src, media }, index) => {
          const { props } = getImageProps({
            src,
            alt: "",
            fill: true,
            sizes: MARQUEE_IMAGE_SIZES,
            quality: MARQUEE_IMAGE_QUALITY,
          })
          return (
            <link
              key={`${media}-${src}`}
              rel="preload"
              as="image"
              imageSrcSet={props.srcSet}
              imageSizes={props.sizes}
              media={media}
              {...(index < 2 || (media && index % 3 === 0) ? { fetchPriority: "high" as const } : {})}
            />
          )
        })}
        <link rel="preload" as="image" href={mobileHero} media="(max-width: 767px)" />
        <link rel="preload" as="image" href={desktopHero} media="(min-width: 768px)" />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      </head>
      <body
        className={`${inter.variable} ${greatVibes.variable} ${imperialScript.variable} ${cinzel.variable} ${brittany.variable} ${playlistScript.variable} ${anastasiaScript.variable} font-inter antialiased text-foreground`}
      >
        <ClientLayout>
          {children}
        </ClientLayout>
        <Analytics />
      </body>
    </html>
  )
}