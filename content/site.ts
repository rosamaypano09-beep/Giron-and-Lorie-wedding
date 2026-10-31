import {
  proposalRoleDefinitions,
  proposalRoleIdAliases,
} from "@/content/proposal-roles"

export type TimelineIconName =
  | "arrival"
  | "guests"
  | "rings"
  | "departure"
  | "cocktail"
  | "fireworks"
  | "dance"

export type AttireGroupId = "entourage" | "family" | "sponsors" | "guests"
// A palette color: "#9CAF88" or { name: "Sage", hex: "#9CAF88" }
export type AttireColor = string | { name: string; hex: string }

/* ============================================================================
   SOP — CREATING / UPDATING AN INVITATION
   ----------------------------------------------------------------------------
   This file is the single source of truth for the couple's content. Pages,
   metadata (link previews), robots.txt, sitemap.xml, QR codes, the table
   finder and proposal pages all read from here. Avoid hard-coding couple
   names, dates, URLs or image paths in components — add them here instead.

   NEW INVITATION (cloned from a previous couple) — work top to bottom:
     1. COUPLE          names + nicknames (nicknames drive "Groom & Bride" text)
     2. DATE & TIMES    wedding date, day, entourage/guest/ceremony/reception times
     3. VENUES          ceremony + reception name, address, Google Maps link, photos;
                        VENUE_CARDS = one combined card or two separate cards + their labels
     4. RSVP            deadline, coordinator, phone; HASHTAGS
     5. WEBSITE         SITE_URL = the live domain (keep the trailing "/").
                        LINK_PREVIEW_IMAGE = 1200×630 JPG for Facebook/Messenger.
                        Both feed app/layout.tsx, app/robots.ts, app/sitemap.ts,
                        lib/proposal-metadata.ts and the table finder.
                        NEXT_PUBLIC_SITE_URL (env, e.g. on Vercel) overrides SITE_URL.
     6. LOOK & FEEL     DISPLAY_MODE "plain" or "photos"
     7. SHARED IMAGES   monogram, couple-name lettering, wax seal, music, COUPLE_PHOTOS
     8. googleAPI       new Apps Script / Form URLs for THIS couple's sheet —
                        never reuse the previous couple's (guests would mix).
     9. SECTIONS        love story, timeline events, ATTIRE (cards + palette), reminders,
                        FAQ, registry accounts/QRs, playlist, snap & share, socials.
    10. Search for "⚠ check" and old couple names/hashtags/QRs and replace them.

   BEFORE GOING LIVE:
     • Put every referenced file in /public (paths are case-sensitive on Vercel).
     • Run `npm run build` to catch typos.
     • Paste the live URL in https://developers.facebook.com/tools/debug/ and
       click "Scrape Again" so Facebook picks up the new title + preview image.
       (Changing the preview image? Rename the file — FB caches by URL.)
     • Test RSVP search, a test RSVP submission, messages and /table on mobile.

   CONVENTIONS:
     • Image paths start with "/" and are relative to /public.
     • "" on a decoration/image hides it; show: false hides a card/account/link.
     • Placeholders like {couple}, {name}, {deadline} are filled automatically —
       keep the braces when editing text.
     • ⚠ marks values likely left over from a previous couple.
   ============================================================================ */

/* ============================================================================
   QUICK SETUP — edit these first.
   Every section below reads from here, so one change updates the whole site
   (loader, envelope, hero, details, timeline, RSVP, FAQ, footer, …).
   ============================================================================ */

// ── The couple ──────────────────────────────────────────────────────────────
const COUPLE = {
  bride: "Jaeviane Mae Abejon",
  brideNickname: "Yanyan",
  groom: "Mars Vallejo",
  groomNickname: "Mars",
}

// ── Date & times ────────────────────────────────────────────────────────────
const WEDDING_DATE = "December 21, 2026" // e.g. "June 5, 2027"
const WEDDING_DAY = "Monday"
const TIMES = {
  entourageCall: "2:00 PM", // entourage assembly ⚠ check — not confirmed yet
  guestArrival: "2:30 PM", // guests arrival / assembly (shown in Event Details + reminders) ⚠ check — not confirmed yet
  ceremony: "2:30 PM",
  reception: "4:30 PM", // start of program
}

// ── Venues ──────────────────────────────────────────────────────────────────

const CEREMONY_VENUE = {
  name: "Iglesia ni Cristo",
  address: "Local Congregation of Santiago Norte Ecclesiastical District of La Union",
  // ⚠ check — Google Maps search link; swap for the exact pin when available
  map: "https://www.google.com/maps/search/?api=1&query=Iglesia+ni+Cristo+Santiago+Norte+San+Fernando+La+Union",
  // Place searched for the embedded map + church → reception route ⚠ check the pin lands on the chapel
  mapQuery: "Iglesia ni Cristo Santiago Norte, San Fernando, La Union",
  photos: ["/Details/Watercolor Illustration of a Gothic Church.png"] as string[],
}
const RECEPTION_VENUE = {
  name: "The Mansion Estates La Union",
  address: "San Juan, La Union",
  // ⚠ check — Google Maps search link; swap for the exact pin when available
  map: "https://www.google.com/maps/search/?api=1&query=The+Mansion+Estates+San+Juan+La+Union",
  mapQuery: "The Mansion Estates, San Juan, La Union", // embedded map + route ⚠ check the pin
  photos: ["/Details/Watercolor Coastal Estate Panorama.png"] as string[],
}

// Route card between the church and reception cards (Event Details, "separate" layout):
// embedded driving route from CEREMONY_VENUE.mapQuery to RECEPTION_VENUE.mapQuery
const VENUE_ROUTE = {
  show: true,
  eyebrow: "On to the Reception",
  title: "From the Church to the Reception",
  travelTime: "13 minutes by car",
  fromLabel: "Church",
  toLabel: "Reception",
  buttonText: "Open Route in Google Maps",
}

// ── Venue cards (Event Details section) ─────────────────────────────────────
// layout:
//   "separate" = two cards: ceremony (CEREMONY_VENUE) + reception (RECEPTION_VENUE)
//   "combined" = ONE card for both — use when ceremony and reception share a venue.
//                Name, address, map and photos come from CEREMONY_VENUE.
// badge        = small pill on the photo (e.g. "Ceremony & Reception")
// sectionLabel = label above the venue name (e.g. "Venue")
// showDate     = show the big Month / Day / Year
// showArrival  = show "Arrival: <guest arrival time>" (otherwise "At <time>")
// showTime     = false hides the time line on that card
const VENUE_CARDS = {
  layout: "separate" as "separate" | "combined",
  // Used when layout is "combined"
  combined: {
    badge: "Ceremony & Reception",
    sectionLabel: "Venue",
    showDate: true,
    showArrival: false,
    showTime: true,
    // Time rows on the card, e.g. "Ceremony 4:30 PM | Reception 7:00 PM"
    ceremonyLabel: "Ceremony",
    receptionLabel: "Reception",
    // false = show only the ceremony time on the combined card
    showReceptionTime: false,
  },
  // Used when layout is "separate"
  ceremony: {
    show: true,
    badge: "Ceremony",
    sectionLabel: "Ceremony Venue",
    showDate: true,
    showArrival: true,
    showTime: true,
  },
  reception: {
    show: true,
    badge: "Reception",
    sectionLabel: "Reception Venue",
    showDate: false,
    showArrival: false,
    showTime: false, // reception card shows no time
  },
}

// ── /invitetwo — reception-only celebration ─────────────────────────────────
// /invitetwo goes to a different guest list (googleAPI.guestListTwo) and a later
// celebration: countdowns, hero, loader and Event Details use the date / time /
// venue below, and only the reception card is shown (no ceremony card or route).
// It also hides the timeline and uses its own FAQ (siteConfig.inviteTwo.faqItems).
const INVITE_TWO = {
  date: "December 27, 2026",
  day: "Sunday",
  time: "10:00 AM",
  venue: {
    name: "Aloha Nui Hotel & Event Center",
    address: "Paras, Candon City, Ilocos Sur",
    map: "https://maps.app.goo.gl/SU7aYMhJa2TAXvQG6",
    mapQuery: "Aloha Nui Hotel & Event Center, Paras, Candon City, Ilocos Sur", // embedded map ⚠ check the pin
    // Venue card photos — crossfade every few seconds
    photos: [
      "/Details/invitetwo-venue (1).jpg",
      "/Details/invitetwo-venue (2).jpg",
      "/Details/invitetwo-venue (3).jpg",
    ] as string[],
  },
  // Guest list API used by RSVP search + Book of Guests on /invitetwo
  guestListApi: "/api/guests?list=two",
}

// ── RSVP & contact ──────────────────────────────────────────────────────────
const RSVP = {
  deadline: " November 30, 2026",
  coordinator: "{groom} / {bride}", // {groom} / {bride} → couple nicknames
  phone: "to be announced",
}
const HASHTAGS = ["#MYwedding"]

// ── Attire guide (Event Details → Attire Guidelines) ────────────────────────
// One card for everyone: ATTIRE.image on top, then one block per group (title, dress
// code, ladies / gentlemen, palette).
// SHOW = which groups to display AND their order, top to bottom. Examples:
//   ["guests"]                            guests only
//   ["entourage", "guests"]               entourage + guests
//   ["sponsors", "entourage", "guests"]   complete
//   ["guests", "sponsors"]                guests first, then sponsors
//   []                                    hide the whole attire guide
// Leave out a name to hide that group. Unknown or empty entries are ignored.
// Each group: fill in only what you need — anything left "" or [] is hidden.
//   palette:   colors for this group — "#9CAF88" or { name: "Sage", hex: "#9CAF88" }
//              (names show on the swatches; [] = no palette)
//   ladies / gentlemen:
//     label:     e.g. "Ninang", "Bridesmaids", "Ladies"
//     details:   the dress code text ("" hides this half of the card)
//     highlight: phrase inside details shown bold + underlined ("" for none)
// Guest dress code colors
const DRESS_CODE_PALETTE: AttireColor[] = [
  { name: "Pastel Blue", hex: "#C7DDF0" },
  { name: "Mint Green", hex: "#D5E3D0" },
  { name: "Sage Green", hex: "#A9B9A1" },
  { name: "Butter Yellow", hex: "#F7E5A9" },
  { name: "Blush Pink", hex: "#F3CED6" },
  { name: "Lavender", hex: "#DCCFF0" },
];

// Attire groups shown in the Details section (components/sections/details.tsx).
//   show      → which groups appear, in order
//   dressCode → small line under the palette title, e.g. "Formal Attire"
//   note      → closing line shown above the card's palette ("" = default color guide note)
//   Each side (ladies / gentlemen) has a label, an optional intro (details, with an
//   optional highlighted phrase) and an optional list of roles with what they wear.
const ATTIRE = {
  show: ["guests", "sponsors"] as AttireGroupId[],
  // Shared illustration at the top of the attire card ("" = no image; any size/shape works)
  image: "/Details/AtttireGuide.png",

  entourage: {
    title: "Entourage",
    dressCode: "Formal Attire",
    palette: [
      { name: "Pastel Blue", hex: "#C7DDF0" },
      { name: "Mint Green", hex: "#D5E3D0" },
      { name: "Sage Green", hex: "#A9B9A1" },
      { name: "Butter Yellow", hex: "#F7E5A9" },
      { name: "Blush Pink", hex: "#F3CED6" },
      { name: "Lavender", hex: "#DCCFF0" },
    ] as AttireColor[],
    note: "Soft pastels of blue, green, yellow, pink and violet — the heart of our wedding palette, worn by the ones standing closest to us.",
    ladies: {
      label: "Bridesmaids & Flower Girls",
      details: "Floor-length pastel gowns in blue, green, yellow, pink or violet, in soft, flowing fabric, with sleeves or a matching shawl for the ceremony.",
      highlight: "pastel gowns in blue, green, yellow, pink or violet",
      roles: [] as { role: string; attire: string }[],
    },
    gentlemen: {
      label: "Groomsmen & Bearers",
      details: "Pastel blue or cream suits over a white shirt, finished with a necktie in one of our pastels.",
      highlight: "Pastel blue or cream suits",
      roles: [] as { role: string; attire: string }[],
    },
  },

  family: {
    title: "Family",
    dressCode: "Formal Attire",
    palette: [
      { name: "Blue", hex: "#4E86B7" },
      { name: "Yellow", hex: "#F6D35B" },
      { name: "Black", hex: "#1E1E1E" },
    ] as AttireColor[],
    note: "",
    ladies: {
      label: "Ladies",
      details: "",
      highlight: "",
      roles: [
        { role: "Mothers of the Bride & Groom", attire: "Blue long dress." },
        { role: "Sisters", attire: "Yellow gown." },
      ],
    },
    gentlemen: {
      label: "Gentlemen",
      details: "",
      highlight: "",
      roles: [
        { role: "Fathers of the Bride & Groom", attire: "Black suit with a blue necktie." },
        { role: "Brothers", attire: "All-black suit and necktie." },
      ],
    },
  },

  sponsors: {
    title: "Principal Sponsors",
    dressCode: "Formal Attire",
    palette: [
      { name: "Ivory Cream", hex: "#F4EBDD" },
      { name: "Cream", hex: "#EADBC6" },
    ] as AttireColor[],
    note: "Soft ivory and cream — a warm, timeless frame around our pastel garden celebration.",
    ladies: {
      label: "Ninang",
      details: "An elegant long gown or formal dress with sleeves, in ivory or cream.",
      highlight: "long gown or formal dress",
      roles: [] as { role: string; attire: string }[],
    },
    gentlemen: {
      label: "Ninong",
      details: "A long-sleeve Barong Tagalog worn with black slacks and dress shoes.",
      highlight: "long-sleeve Barong Tagalog",
      roles: [] as { role: string; attire: string }[],
    },
  },

  guests: {
    title: "Wedding Guests",
    dressCode: "Semi-Formal Attire",
    palette: DRESS_CODE_PALETTE,
    note: "Any shade from the palette below — mix and match, and come comfortable and lovely.",
    ladies: {
      label: "Ladies",
      details: "A modest dress or skirt that falls below the knee, with sleeves, in soft pastels of blue, green, yellow, pink or violet.",
      highlight: "modest dress or skirt",
      roles: [] as { role: string; attire: string }[],
    },
    gentlemen: {
      label: "Gentlemen",
      details: "A collared polo or long-sleeve shirt in yellow or blue tones, with slacks or neat trousers.",
      highlight: "collared polo or long-sleeve shirt",
      roles: [] as { role: string; attire: string }[],
    },
  },
}

// ── Website address (used for QR codes, link previews, table finder) ────────
// NEXT_PUBLIC_SITE_URL (env) overrides this when set.
const SITE_URL = "https://mars-and-yanyan.weddinginvitationrsvp.com/"
// Image shown when the link is shared (Facebook, Messenger, Viber, X, …) — 1200×630 JPG in /public
// Use a NEW filename whenever the image changes — Facebook caches images by URL.
const LINK_PREVIEW_IMAGE = "/Details/newLinkPreviewnew.png"

// Site address with env override applied and no trailing slash — no need to edit
export const canonicalSiteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? SITE_URL).replace(/\/$/, "")

// ── Look & feel ─────────────────────────────────────────────────────────────
// "plain"  = no couple photos on the loader, envelope and home hero (soft butter &
//            pastel-blue backdrop, no envelope portraits, no cover photo)
// "photos" = photo backgrounds on the loader, envelope and closing section
const DISPLAY_MODE = "photos" as "photos" | "plain"
const SHOW_PHOTOS = DISPLAY_MODE === "photos"

// ── Shared images ───────────────────────────────────────────────────────────
const BRAND = {
  monogram: "/monogram/monogramnew.png",
  coupleNameImage: "/Details/newcoupelNames.png", // couple-name lettering (loader, envelope)
  seal: "/monogram/sealnew.png", // envelope wax seal
  backgroundMusic: "/background_music/Kyla - Beautiful Days (Official Lyric Video).mp3",
}

// Couple photos reused across the site (gallery, loader, reminders, snap & share, closing)
// — every portrait in /public/mobile-background
const COUPLE_PHOTOS = Array.from(
  { length: 11 },
  (_, i) => `/mobile-background/couples (${i + 1}).webp`,
)

// Portraits for the envelope reveal + the main cover photo (soft natural light, no heavy filters)
const COUPLE_PORTRAITS = {
  groom: "/mobile-background/couples (52).webp", // left photo in the envelope
  bride: "/mobile-background/couples (14).webp", // right photo in the envelope
  cover: "/mobile-background/couples (9).webp", // main photo: pulled out of the envelope + home hero cover photo
}

// Sliding photo marquee behind the loader and envelope (photos display) — hand-picked
// portraits from /public/mobile-background, in order; alternated across the two rows.
// Desktop (768px+) uses the landscape shots in /public/desktop-background — update the count when files change.
const LOADER_MARQUEE_PHOTOS = [110, 106, 101, 71, 68, 67, 61, 58, 29, 16, 15, 12, 8].map(
  (n) => `/mobile-background/couples (${n}).webp`,
)
const MARQUEE_PHOTO_COUNT_DESKTOP = 51
const MARQUEE_PHOTOS_DESKTOP = Array.from(
  { length: MARQUEE_PHOTO_COUNT_DESKTOP },
  (_, i) => `/desktop-background/couples (${i + 1}).webp`,
)

// ── Decorations ─────────────────────────────────────────────────────────────
// Change a path here to swap it on every section at once.
// To change ONE section only, override it there, e.g. decos: { ...SECTION_DECOS, footerVine: "" }
const DECOR = {
  cornerTopLeft: "/deco/lovestorydeco/top-left.png",
  cornerTopRight: "/deco/lovestorydeco/top-right.png",
  cornerBottomLeft: "/deco/lovestorydeco/bottom-left.png",
  cornerBottomRight: "/deco/lovestorydeco/bottom-right.png",
  cornerOverlayTopLeft: "/deco/cornerOverlayTopLeft.png", // floral corner layered over the top vines (loader + envelope)
  cornerOverlayTopRight: "/deco/cornerOverlayTopRight.png",
  headerOrnament: "/deco/lovestorydeco/headerOrnament.png", // small sprig above titles
  footerVine: "/deco/lovestorydeco/footerVine.png", // long vine at section ends
  sideLeft: "/deco/lovestorydeco/Elegant-Eucalyptus-Left.png", // love story side sprigs
  sideRight: "/deco/lovestorydeco/Elegant-Eucalyptus-Right.png",
}

// The four corners as one set
const CORNER_DECOS = {
  topLeft: DECOR.cornerTopLeft,
  topRight: DECOR.cornerTopRight,
  bottomLeft: DECOR.cornerBottomLeft,
  bottomRight: DECOR.cornerBottomRight,
}

// Default decoration set used by most sections (corners + ornament + vine)
const SECTION_DECOS = {
  ...CORNER_DECOS,
  headerOrnament: DECOR.headerOrnament,
  footerVine: DECOR.footerVine,
}

// One love story chapter (content/site.ts → loveStory.chapters)
type StoryChapter = {
  date?: string // small caps line above the title ("" shows "Chapter 0X")
  title: string
  image?: string // photo beside the text ("" for none)
  imageAlt?: string // photo description ("" uses loveStory.photoAlt)
  paragraphs: string[] // {groom} / {bride} → nicknames
  imagePosition?: string // which part of the photo stays in frame, e.g. "center 20%" (default "center 30%")
  layout?: "image-left" | "image-right" // optional — chapters alternate sides automatically
  inviteTwoOnly?: boolean // true = shown only on /invitetwo (hidden on the main page and /inviteone)
}

// Handy derived values — no need to edit
const COUPLE_LABEL = `${COUPLE.groomNickname} & ${COUPLE.brideNickname}`

/* ============================================================================
   SECTIONS — wording and per-section options. Values above are referenced here.
   ============================================================================ */

// Principal sponsors Google Apps Script — used by the main page and /inviteone
const SPONSORS_API = "https://script.google.com/macros/s/AKfycbx5jkzDs9ZQfRQlH1ogiyZNxV9R-pzUMu3XhZ8-joppLz5B3asEfT2YkQX-p0Gk6ziHog/exec"

export const siteConfig = {
  siteUrl: SITE_URL,
  linkPreviewImage: LINK_PREVIEW_IMAGE,
  couple: {
    ...COUPLE,
    monogram: BRAND.monogram,
    backgroundMusic: BRAND.backgroundMusic,
  },
  googleAPI:{
    messageForm: "https://docs.google.com/forms/d/e/1FAIpQLSc7lZyiyr3aZDA671r808snsFK9MZqRguf8O_0VO-MSE9YjOA/formResponse",   //done
    message: "https://script.google.com/macros/s/AKfycbxzUHsq0jgLBjvwyoZAEcNiXetYlmULGEJtT5wNFV_IlgWLrrJAztDOHTNnN-fGUKpPGw/exec",  //done
    guestList: "https://script.google.com/macros/s/AKfycbwxCJVBhbPT0N4otyEC4MBmcTWp8wNB0IiIEgVH5eO6HSxT3cYHd5QPzfQjW8nmf1rcIg/exec",  //done
    guestListTwo:"https://script.google.com/macros/s/AKfycbwtoZVEORJYnC0l10BO3yoExG0FnbSCAR6onIVItAfU5bRY6v1UKc94i7JOExtYnyIjrg/exec",
    guestRequest: "https://script.google.com/macros/s/AKfycbwOKOO_Qx-FmxVon_LjfyuEuBf4l0-jp4gIBaabcrEB5ylI6XQlwdiEx2M_70zP-bWung/exec",   //done
    entourage: "https://script.google.com/macros/s/AKfycbyzu9cDfMgZfbFR66FwKzdkz7ZhYLybifE8EsuWO6ymKu2XWQLJm8dMw-JbCONFVW9tvg/exec",  //done
    sponsors: SPONSORS_API,  //done 
    // Principal sponsors shown on /inviteone and /invitetwo (entourage section)
    sponsorsInviteOne: SPONSORS_API, // same sheet as sponsors above
    sponsorsInviteTwo: "https://script.google.com/macros/s/AKfycbx5jkzDs9ZQfRQlH1ogiyZNxV9R-pzUMu3XhZ8-joppLz5B3asEfT2YkQX-p0Gk6ziHog/exec",
////google share 
    googleShare: "https://docs.google.com/spreadsheets/d/1WZZu2afoyhetz5599muIPW4lEpKF3DiG3FgpjRgtnnw/edit?usp=sharing",
    videoMessageForm:
      "https://docs.google.com/forms/d/e/1FAIpQLSfeGlEl4CMXWefdvCw6AOPHFS1ROku_rs-Gbofa2LkVJ0sLGQ/viewform", 
  },
  wedding: {
    date: WEDDING_DATE,
    time: TIMES.ceremony,
    venue: CEREMONY_VENUE.name,
    tagline: "are getting married!!!!!",
    theme: "Pastel Garden — blue, green, yellow, pink & violet",
    motif: "#C7DDF0, #D5E3D0, #A9B9A1, #F7E5A9, #F3CED6, #DCCFF0",
  },
  // Opening "Save the Date" loading screen (components/loader/LoadingScreen.tsx).
  // Couple names, wedding date and ceremony details come from couple / wedding / ceremony above.
  loadingScreen: {
    // "photos" = sliding photo background + photo date cards
    // "plain"  = no images at all: soft solid background + plain date cards
    display: DISPLAY_MODE,
    // Colors used when display is "plain"
    plainTheme: {
      background: "var(--color-welcome-bg)",
      text: "var(--color-welcome-text)",
      accent: "var(--color-welcome-gold)",
    },
    // Faint "ghost" illustration behind the loader, envelope and home hero ("" hides it)
    ghostImage: "/Details/church.png",
    // Sliding photo marquee behind the loader and envelope ("photos" display only); files live in /public
    backgroundPhotos: SHOW_PHOTOS ? LOADER_MARQUEE_PHOTOS : [],
    backgroundPhotosDesktop: SHOW_PHOTOS ? MARQUEE_PHOTOS_DESKTOP : [], // same marquee on screens 768px and up
    // Opening title on the loader and the envelope letter — short joining words ("of", "the") are set in script
    headline: "Save the Date", // "the" is set in the Brittany script (loader + envelope letter)
    // {days} is replaced with the number of days left before wedding.date
    countdownText: "{days} more days to go",
    countdownOneDayText: "1 more day to go",
    countdownTodayText: "Today is the day",
    countdownPastText: "Thank you for celebrating with us",
    coupleNameImage: BRAND.coupleNameImage,
    // Shown in the three date cards (Month / Day / Year), left to right (display: "photos")
    photos: [
      "/box/box-2.webp",
      "/box/box-5.webp",
      "/box/box-4.webp",
    ],
    dateLabels: ["Month", "Day", "Year"],
    // Plain mode invitation card — classic invitation wording around the couple's names ("" to hide a line)
    plainInvite: {
      ornament: DECOR.headerOrnament,
      lineAbove: "Together with their families",
      lineBelow: "request the honour of your presence",
    },
    showCeremonyDetails: true,
    eyebrow: "You are invited",
    message: "We can't wait to celebrate with you",
    // Rotates under the progress bar while the invitation loads
    statusMessages: [
      "Gathering our favorite moments",
      "Setting the table for you",
      "Crafting your invitation experience",
    ],
    durationMs: 9000, // loader shows for 9s, then hands off to the envelope
    // Invitation envelope (components/loader/Hero.tsx) — shares display + photos with loader above
    hintText: "Tap the Seal to Open",
    enterButtonText: "View the Invitation",
    sealImage: BRAND.seal,
    // Revealed when the envelope opens: one portrait of each, side by side (groom left, bride right)
    // ("" hides them)
    portraits: {
      groom: COUPLE_PORTRAITS.groom,
      bride: COUPLE_PORTRAITS.bride,
    },
    // Bouquet tucked inside the open envelope, peeking out on both sides ("" to hide)
    envelopeFlowers: "/deco/lovestorydeco/cornerBottomLeft.png",
    // Main page cover photo (home hero, plain display) — one natural, candid couple photo
    // "" = no cover photo (the envelope opens with the curtain reveal instead of the photo pull)
    coverPhoto: COUPLE_PORTRAITS.cover,
    coverPhotoAlt: COUPLE_LABEL,
    // All four corner florals (top two are drawn smaller in CSS; "" hides a corner)
    cornerDecos: { ...CORNER_DECOS },
    // Floral corners drawn on top of the top corner vines ("" hides one)
    cornerOverlays: {
      topLeft: DECOR.cornerOverlayTopLeft,
      topRight: DECOR.cornerOverlayTopRight,
    },
  },
  // Home hero (components/sections/hero.tsx) — the first section after the envelope.
  // Cover photo + background photos come from loadingScreen (coverPhoto / backgroundPhotos).
  homeHero: {
    // Four corner florals, sized per corner like the loader and envelope ("" hides a corner)
    decos: { ...CORNER_DECOS },
    // Thin double border around the section, under the corner florals (false hides it)
    showFrame: true,
    // Sprig tucked under the bottom of the couple's cover photo ("" hides it)
    coverVine: DECOR.headerOrnament,
  },
  // Couple video (components/sections/couple-video.tsx)
  coupleVideo: {
    title: "A Glimpse of Our Love",
    script: "Our Journey Together",
    subtitle: "Watch the journey that brought our hearts together",
    closingNote: "A glimpse into the moments that made our hearts one",
    // Your own video file in /public (e.g. "/video/our-story.mp4"). When set it is
    // played directly with no YouTube at all; leave "" to use youtubeId instead.
    videoSrc: "",
    // YouTube video ID — the part after "watch?v=" (or after "youtu.be/")
    youtubeId: "YPyS5XS-9Ck",
    // Cover image shown before the video plays
    thumbnail: "/desktop-background/couples (49).webp",
    thumbnailAlt: `${COUPLE_LABEL} — video cover`,
    playLabel: "Play our video",
  },
  // Thank-you messages to family and friends (components/sections/love-story.tsx + StorySection)
  loveStory: {
    title: "Our Love Story",
    subtitle: "how our forever began",
    // Short opening line under the title ("" hides it)
    intro: "",
    // Small sprig above the title ("" hides it)
    headerOrnament: DECOR.headerOrnament,
    // Shown above a chapter's title when it has no date, e.g. "Chapter 03"
    chapterLabel: "Chapter",
    // Photo description used when a chapter has no imageAlt
    photoAlt: "{groom} and {bride}",
    // Large faint chapter number (01, 02 …) behind each chapter card
    showChapterNumbers: true,
    // Florals tucked on each chapter card's corners (plain display). Cards alternate:
    // top-left + bottom-right, then top-right + bottom-left ("" hides one)
    cardCorners: { ...CORNER_DECOS },
    // Small heart divider between chapters
    showChapterDividers: true,
    // Closing block: big word, hashtag, then the quote (also shown in Snap & Share)
    closingEyebrow: "", // large word on top (was "Puhon") — "" hides it
    closingHashtag: "", // hashtag under it (was HASHTAGS[0]) — "" hides it
    closingQuoteLead: "", // bold first line ("" for none)
    closingQuote: "", // "" hides the quote block
    closingCitation: "", // "" hides it
    // Four corner florals framing the section, sized per corner like the loader ("" hides a corner)
    decos: { ...CORNER_DECOS },
    // Thin double border around the section, under the corner florals (false hides it)
    showFrame: true,
    eucalyptusDecos: {
      topLeft: DECOR.sideLeft,
      bottomRight: DECOR.sideRight,
      timelineTop: DECOR.headerOrnament,
      sectionBottom: DECOR.headerOrnament, // dusty-blue sprig under the closing quote ("" hides it)
    },
    // The story, one chapter at a time (fields: see StoryChapter above). Plain display shows
    // each chapter as a card with its couple photo beside it ("" image = card only).
    // Add, remove or reorder chapters freely — photo and card swap sides on their own.
    chapters: [
      {
        date: "November 2024",
        title: "Where It All Began",
        image: "/mobile-background/couples (29).webp",
        paragraphs: [
          "It was a moment to remember in November 2024 when we first met in Mahayag renovation. My first assignment as a part of the construction group 2.",
        ],
      },
      {
        date: "Mahayag Renovation",
        title: "A Sister, A Friend",
        image: "/mobile-background/couples (19).webp",
        paragraphs: [
          "Bembem was one of the first batch of LDCVs who volunteered in Mahayag. When I saw her for the first time I told myself that this sister will be a good friend of mine because she is a jolly and  easy-going person. We became good friends as we work together in the site for the whole Mahayag renovation project.",
        ],
      },
      {
        date: "A Quiet Prayer",
        title: "Seeing Her Heart",
        image: "/mobile-background/couples (53).webp",
        paragraphs: [
          "Nakita ko gid nga handa siya mag sakripisyo para sa pag-alagad kay Jehova, matutom, kag maayo siya nga ehemplo sa mga batan-on. It was at that time when I prayed to Jehovah specifically about Bembem. My feelings grew as I observed her and I wanted to see if she is the right one for me.",
        ],
      },
      {
        date: "Leon Postigo",
        title: "Miles Apart, Still Close",
        image: "/mobile-background/couples (107).webp",
        paragraphs: [
          "I keep contacting her although I transferred to Leon Postigo. I wanted to get to know her more and I always pray to Jehovah for his guidance. I always call her in the morning after waking up, during work break, lunch time and in the evening.",
        ],
      },
      {
        date: "10:00 PM",
        title: "The Late-Night Calls",
        image: "/mobile-background/couples (112).webp",
        paragraphs: [
          "Dahil may trabaho siya from 5:00 pm to 10:00 pm hindi ko siya makakausap ng early evening kaya nag set ako ng alarm na 10:00 pm para magising ako at makausap siya ulit. Naging napakakomportable na namin sa isa't-isa kaya nakakapag share ako sa kanya tungkol sa maraming bagay sa buhay ko.",
        ],
      },
      {
        date: "Getting to Know Her",
        title: "Learning Who She Is",
        image: "/mobile-background/couples (101).webp",
        paragraphs: [
          "May mga time na tinatanong ko rin sa iba kung ano ang pagkakakilala nila kay Bembem dahil hindi naman ako taga roon kaya hindi ko pa siya kilala ng higit.",
        ],
      },
      {
        date: "Dinas",
        title: "Welcomed Into the Family",
        image: "/mobile-background/couples (110).webp",
        paragraphs: [
          "Kahit mahirap ang signal ng malipat ako sa Dinas napanatili pa rin namin ang regular na communication. Minsan pa ini-invite nila ako virtually sa family worship nila  kaya napakasaya ko. Na feel ko na tanggap nila ako.",
        ],
      },
      {
        date: "July 03, 2025",
        title: "Finding the Courage",
        image: "/mobile-background/couples (8).webp",
        paragraphs: [
          "Sa tulong ni Jehova at ng mga kapatid mas naging disidido na ako na magpaalam sa kanya na manligaw. From many attempts it was on July 03, 2025 when I finally decided to confess to Bembem. I received a sudden assignment for a 10 minute talk in the week of June 30-July 6 about courtship. It was that part which pushed me to confess and pursue Bembem. It made me so happy to be able to openly show her how I admire her deeply.",
        ],
      },
      {
        date: "September 7, 2025",
        title: "The Long-Awaited Yes",
        image: "/mobile-background/couples (12).webp",
        paragraphs: [
          "Months passed sa ligawan stage. Biyahe na malayo pero sulit. Finally, I received the \"Yes\" with flowers delivered right thru my door on September 7, 2025. Ang araw na pinakahihintay ko we are officially a couple. We can now volunteer as a couple.",
        ],
      },
      {
        date: "Until Today",
        title: "The Woman I Will Marry",
        image: "/mobile-background/couples (71).webp",
        paragraphs: [
          "The long distance relationship wasn't easy but with Jehovah's help we made it until today. Gipakilala ko siya sa akon pamilya nga first, ang babaye nga nagustohan ko. Next, ang babaye nga gipangaluyagan ko. Then, ang babaye nga akon mega. Finally, ang babaye nga akon pangasaw-on.",
        ],
      },
    ] as StoryChapter[],
  },
  // Gallery section (components/sections/gallery.tsx)
  gallery: {
    eyebrow: "Our Moments",
    title: "Gallery",
    subtitle: "our favorite moments",
    description:
      "From our first chapter to this beautiful season of commitment — every moment has been a testament to love, faith, and grace.",
    footnote: "", // line under the photos ("" hides it)
    // Corner florals (sized per corner like the loader), sprig above the title and
    // sprig under the footnote — "" hides any of them
    decos: {
      ...CORNER_DECOS,
      headerOrnament: DECOR.headerOrnament,
      footerVine: DECOR.headerOrnament,
    },
    // Thin double border around the section and the full gallery page (false hides it)
    showFrame: true,
    // Small labels
    swipeHint: "Swipe to explore", // under the phone carousel
    lightboxSwipeHint: "Swipe to navigate", // inside the full-screen photo view
    resetZoomText: "Reset Zoom",
    // Full gallery page (/gallery)
    page: {
      backText: "Back to invitation",
      backTextShort: "Back", // narrow phones
      label: "Gallery", // top bar, beside the couple's names
      emptyText: "No images to display.",
    },
    // Photos shown in the gallery, in order (files live in /public)
    // text → caption used as the photo's description
    images: [
      "/mobile-background/couples (1).webp",
      "/mobile-background/couples (2).webp",
      "/mobile-background/couples (3).webp",
      "/mobile-background/couples (4).webp",
      "/mobile-background/couples (5).webp",
      "/mobile-background/couples (6).webp",
      "/mobile-background/couples (7).webp",
      "/mobile-background/couples (8).webp",
      "/mobile-background/couples (9).webp",
      "/mobile-background/couples (10).webp",
      "/mobile-background/couples (11).webp",
    ].map((image, i) => ({ image, text: `${COUPLE.groomNickname} and ${COUPLE.brideNickname}, photo ${i + 1}` })),
  },

  // Event details section (components/sections/details.tsx)
  // Venue names, addresses, dates, times, maps and venue photos come from ceremony / reception below.
  // In reminder text, {guestsTime} and {ceremonyTime} are replaced from ceremony below.
  eventDetails: {
    eyebrow: "Our Celebration",
    title: "Event Details",
    subtitle: "our special day",
    description: "Everything you need to know about our special day.",
    // Line under the description — "" hides it
    verse: "Two hearts, one promise, and a day we can't wait to share with the people we love most.",
    verseCitation: "",
    decos: { ...SECTION_DECOS },
    // Thin double border around the section (false hides it)
    showFrame: true,
    // Venue cards layout:
    //   "separate" = one card each for ceremony and reception (uses ceremony / reception below)
    //   "combined" = ONE card for both — use when ceremony and reception share a venue.
    //                Venue name, address, map and photos come from CEREMONY_VENUE;
    //                the card lists both times (ceremony.time + reception.time).
    // Set in QUICK SETUP → VENUE_CARDS
    venues: VENUE_CARDS,
    route: VENUE_ROUTE,
    labels: {
      arrival: "Arrival",
      at: "At",
      scanForDirections: "Scan for directions",
      getDirections: "Get Directions",
      copyAddress: "Copy Address",
      copied: "Copied!",
      mapTitle: "Map", // screen-reader title of each embedded map ("<venue> map")
    },
    // Cards, colors, images and which groups show → QUICK SETUP → ATTIRE
    attire: {
      title: "Attire Guidelines",
      description: "Our day is dressed in soft pastels of blue, green, yellow, pink and violet, and we would love for you to wear them with us. As our ceremony is held in an Iglesia ni Cristo house of worship, we kindly ask that all attire be modest. Please find your role below.",
      image: ATTIRE.image,
      // Order and visibility come from ATTIRE.show (skips blanks, typos and repeats)
      groups: ATTIRE.show
        .filter((id, i, list) => ["entourage", "family", "sponsors", "guests"].includes(id) && list.indexOf(id) === i)
        .map((id) => ({ id, ...ATTIRE[id] })),
      // Shared dress code palette (used by the "Strictly Formal" reminder)
      palette: DRESS_CODE_PALETTE,
    },
    reminders: {
      title: "Gentle Reminders",
      description: "A few thoughtful notes to help everyone enjoy our celebration.",
      // showPalette: shows the dress code palette after the first paragraph
      items: [
        {
          title: "Keep Our Invitation Private",
          variant: "soft" as "accent" | "soft",
          showPalette: false,
          paragraphs: [
            "Please keep this just between us! Kindly refrain from posting our invitation online.",
          ],
        },
        {
          title: "Parking",
          variant: "soft" as "accent" | "soft",
          showPalette: false,
          paragraphs: [
            "Parking for both cars and motorcycles is available inside the venue.",
          ],
        },
        {
          title: "Unplugged Ceremony",
          variant: "soft" as "accent" | "soft",
          showPalette: false,
          paragraphs: [
            "We're having a mostly unplugged ceremony. Guests may take photos, but we kindly ask that it be kept minimal. Please avoid blocking or crowding our official photographers so they can capture the special moments. We'd love for everyone to stay present and share the moment with us. Don't worry—professional photos will be shared with you after the event. Thank you for your understanding.",
          ],
        },
        {
          title: "Arrival",
          variant: "soft" as "accent" | "soft",
          showPalette: false,
          paragraphs: [
            "To ensure everything runs smoothly, please arrive at {guestsTime}. This will give you enough time to find your seat, settle in comfortably, and fully enjoy the beautiful ceremony before it begins at {ceremonyTime}. We truly appreciate your punctuality and look forward to celebrating this special moment with you.",
          ],
        },
        {
          title: "Reception Details",
          variant: "accent" as "accent" | "soft",
          showPalette: false,
          paragraphs: [
            "Please join us for early dinner, laughter, and dancing after the ceremony.",
          ],
        },
      ],
    },
  },
  // Wedding day timeline (components/sections/wedding-timeline.tsx)
  weddingTimeline: {
    kicker: "Join us as we tie the knot!",
    title: "Timeline",
    subtitle: "our wedding day",
    description:
      "From the first arrival to the last farewell, here is how we will spend this day together.",
    // "" hides the quote
    quote: "",
    quoteCitation: "",
    // Optional corner decorations — leave "" to hide
    decos: {
      topLeft: "",
      topRight: "",
      bottomLeft: "",
      bottomRight: "",
    },
    // Each event — shown top to bottom in this order (move a block to reorder):
    //   show:     true = display on the site, false = hide it (still kept here to edit later)
    //   time:     shown above the title; TIMES.* come from QUICK SETUP, others are typed in, e.g. "4:00 PM"
    //   location: text shown under the title; {ceremony} / {reception} are replaced
    //             with ceremony.location / reception.location ("" to hide)
    //   image:    line-art illustration from /public/weddingtimeline; "" to use the icon instead
    //   icon:     fallback icon when there is no image —
    //             "arrival" | "guests" | "rings" | "departure" | "cocktail" | "fireworks" | "dance"
    //   description: not shown on the site (kept only as a note)
    events: [
      {
        show: true,
        time: TIMES.entourageCall,
        title: "Entourage Call Time",
        description: "The couple and entourage gather and get ready.",
        location: "{ceremony}",
        image: "/weddingtimeline/Wedding Entourage Call Time Logo.png",
        icon: "arrival" as TimelineIconName,
      },
      {
        show: true,
        time: TIMES.guestArrival,
        title: "Guests Arrive",
        description: "Kindly be seated before the ceremony begins.",
        location: "{ceremony}",
        image: "/weddingtimeline/Elegant Wedding Guests Arrive Sign.png",
        icon: "guests" as TimelineIconName,
      },
      {
        show: true,
        time: TIMES.ceremony,
        title: "Wedding Ceremony",
        description: "We exchange our vows before God, family and friends.",
        location: "{ceremony}",
        image: "/weddingtimeline/WeddingCeremony.png",
        icon: "rings" as TimelineIconName,
      },
      {
        show: true,
        time: "4:00 PM", // ⚠ check — not confirmed yet
        title: "Photo Session",
        description: "Join us for pictures with the newlyweds.",
        location: "{ceremony}",
        image: "/weddingtimeline/PhotoSession.png",
        icon: "rings" as TimelineIconName,
      },
      {
        show: true,
        time: TIMES.reception,
        title: "Start of Program",
        description: "",
        location: "{reception}",
        image: "/weddingtimeline/reception welcom.png",
        icon: "fireworks" as TimelineIconName,
      },
      {
        show: true,
        time: "5:45 PM", // ⚠ check — not confirmed yet
        title: "Grand Entrance",
        description: "Welcome the newlyweds as husband and wife.",
        location: "{reception}",
        image: "/weddingtimeline/assemble.png",
        icon: "fireworks" as TimelineIconName,
      },
      {
        show: true,
        time: "6:00 PM", // ⚠ check — not confirmed yet
        title: "Wedding Feast",
        description: "Let's share a meal and celebrate together.",
        location: "{reception}",
        image: "/weddingtimeline/DinnerService.png",
        icon: "cocktail" as TimelineIconName,
      },
      {
        show: true,
        time: "7:00 PM", // ⚠ check — not confirmed yet
        title: "Cake Cutting",
        description: "",
        location: "{reception}",
        image: "/weddingtimeline/cakecutting.png",
        icon: "fireworks" as TimelineIconName,
      },
      {
        show: true,
        time: "7:30 PM", // ⚠ check — not confirmed yet
        title: "First Dance",
        description: "Our first dance as husband and wife.",
        location: "{reception}",
        image: "/weddingtimeline/dance.png",
        icon: "dance" as TimelineIconName,
      },
      {
        show: true,
        time: "9:00 PM", // ⚠ check — not confirmed yet
        title: "Send-off",
        description: "Thank you for celebrating with us!",
        location: "{reception}",
        image: "/weddingtimeline/SendOff.png",
        icon: "departure" as TimelineIconName,
      },
    ],
  },
  // Wedding entourage (components/sections/entourage.tsx)
  // Names and roles come from the Google Sheet (googleAPI.entourage); couple names from couple above.
  entourage: {
    eyebrow: "Our People",
    title: "Wedding Entourage",
    subtitle: "standing with us",
    description: "Honoring those who stand with us on our special day",
    coupleKicker: "Together as one",
    coupleLine: "The beginning of our forever",
    coupleHeading: "The Couple",
    groomRole: "Groom",
    brideRole: "Bride",
    loadingText: "Loading entourage...",
    retryingText: "Still gathering the wedding party. Trying again...",
    errorText: "Unable to load entourage",
    retryText: "Try again",
    // Corner florals (sized per corner like the loader), sprig above the title and
    // sprig at the end of the section — "" hides any of them
    decos: {
      ...CORNER_DECOS,
      headerOrnament: DECOR.headerOrnament,
      footerVine: DECOR.headerOrnament,
    },
    // Thin double border around the section (false hides it)
    showFrame: true,
    // Rename any heading shown in the entourage card: "Heading as shown": "Your text"
    headingLabels: {
      "Parents of the Groom": "Parents of the Groom",
      "Parents of the Bride": "Parents of the Bride",
      "Principal Sponsors": "Principal Sponsors",
      "Peer Sponsors": "Peer Sponsors",
      "Family of the Groom": "Family of the Groom",
      "Family of the Bride": "Family of the Bride",
      "Man of Honor": "Man of Honor",
      "Best Man": "Best Man",
      "Maid of Honor": "Maid of Honor",
      "Matron of Honor": "Matron of Honor",
      "Little Groom": "Little Groom",
      "Little Bride": "Little Bride",
      "Flower Girls": "Flower Girls",
      "Beloved Entourage": "Beloved Entourage",
      "To light our path": "To light our path",
      "To Cloth us as one": "To Cloth us as one",
      "To bind us together": "To bind us together",
    } as Record<string, string>,
  },
  // RSVP / guest list (components/sections/guest-list.tsx) — card, search, RSVP form and all modals.
  // Placeholders in curly braces are filled in automatically: {name}, {count}, {n}.
  // The RSVP deadline itself comes from details.rsvp.deadline.
  rsvp: {
    headerOrnament: DECOR.headerOrnament, // "" to hide
    title: "RSVP",
    script: "Are you going",
    intro: "Kindly confirm your attendance so we may prepare a place for you at our celebration.",
    deadlineLabel: "RSVP Deadline",
    openButton: "Tap here to respond",
    search: {
      title: "RSVP",
      script: "Find your Name",
      placeholder: "Begin with your first name",
      loading: "Preparing the guest list. We'll keep trying until names appear.",
      refine: "Keep typing to refine results",
      notFoundTitle: "Not finding your name?",
      notFoundText: "We'd love to have you with us. Send a request to join the celebration.",
      requestButton: "Request to Join",
    },
    invite: {
      title: "You are Invited",
      scriptFallback: "to our celebration",
      greeting: "Hello {name}, you are invited to our wedding!",
      seats: "We've reserved {count} for you.",
      seatSingular: "seat",
      seatPlural: "seats",
    },
    responded: {
      title: "Thank You for Responding!",
      text: "We've received your RSVP and look forward to celebrating with you!",
      attending: "You're Attending!",
      declined: "Unable to Attend",
      guestCountLabel: "Number of Guests",
      closeButton: "Close",
    },
    form: {
      attendLabel: "Can you attend? *",
      yes: "Yes!",
      no: "Sorry, No",
      companionsLabel: "Who's Coming With You?",
      companionsHint: "Please provide names and relationships for your {count} additional {guests}",
      guestSingular: "guest",
      guestPlural: "guests",
      companionTitle: "Guest {n}",
      companionNameLabel: "Full Name",
      companionNamePlaceholder: "Name of guest {n}",
      relationshipLabel: "Relationship with {name}",
      relationshipFallbackName: "Primary Guest",
      relationshipPlaceholder: "e.g., Spouse, Friend, Child, Parent",
      // One-tap relationship choices shown under the relationship field
      relationshipOptions: ["Spouse", "Partner", "Child", "Parent", "Sibling", "Friend"],
      companionProgress: "Guest {n} of {total}",
      companionsAdded: "{done} of {total} added",
      prevButton: "Back",
      nextButton: "Next guest",
      phoneLabel: "Phone Number *",
      phonePlaceholder: "09XX XXX XXXX",
      phoneNote: "For wedding updates only. Your number stays private and will never be shown to other guests.",
      submitting: "Submitting...",
      submit: "Submit RSVP",
    },
    phoneAlert: {
      title: "A phone number is needed",
      paragraphs: [
        "We ask for your number so we can reach you with important updates — seating, timing, or anything you may need on the day.",
        "Your number will not appear on this invitation, and it will not be shared with other guests. It is kept private and used only by us and our coordinators to take care of you.",
      ],
      button: "Add my number",
    },
    success: {
      title: "RSVP Confirmed",
      attending: "We're thrilled you'll be joining us — your spot is saved!",
      declined: "We'll miss you, but thank you for letting us know.",
      neutral: "Thank you for your response!",
      messagePrompt:
        "Before you go, leave a message for the couple — your words will be a cherished memory they can always look back on.",
      messageButton: "Leave a Message",
      laterButton: "Maybe later — close",
    },
    request: {
      title: "Request",
      script: "to join us",
      greetingNamed: "Hi {name} — want to celebrate with us? Send a request!",
      greeting: "Want to celebrate with us? Send a request!",
      optional: "(Optional)",
      nameLabel: "Full Name *",
      namePlaceholder: "Enter your full name",
      emailLabel: "Email Address",
      emailPlaceholder: "your.email@example.com",
      phoneLabel: "Phone Number",
      phonePlaceholder: "+63 912 345 6789",
      guestsLabel: "Number of Guests *",
      guestsPlaceholder: "How many guests?",
      messageLabel: "Message",
      messagePlaceholder: "Share why you'd like to join...",
      submitting: "Submitting...",
      submit: "Send Request",
      sentTitle: "Request Sent!",
      sentText: "We've received your request",
      sentSubtext: "We'll review it and get back to you soon",
      autoClose: "This will close automatically",
    },
    messages: {
      thankYou: "Thank you for your response!",
      requestSubmitted: "Request submitted! We'll review and get back to you.",
      loadFailed: "Failed to load guest list",
      selectAttendance: "Please select if you can attend",
      nameRequired: "Name is required",
      requestFailed: "Failed to submit request. Please try again.",
      submitFailed: "We couldn't save your RSVP. Please check your connection and try again.",
    },
  },
  // Messages wall (components/sections/message-wall-display.tsx)
  // Small decorations on each message card — leave "" to hide
  messageWall: {
    cardDecos: {
      topRight: DECOR.cornerTopRight, // sprig tucked in the card's top-right corner
      bottomLeft: "", // e.g. DECOR.cornerBottomLeft (sits behind the text — keep it subtle)
    },
  },
  // Book of guests (components/sections/book-of-guests.tsx) — confirmed guests come from the guest list API.
  bookOfGuests: {
    title: "Book of Guests",
    subtitle: "celebrating with us",
    description:
      "Meet the cherished souls joining us in celebration — your presence makes our day truly special.",
    statsEyebrow: "Our Celebration",
    guestSingular: "Guest",
    guestPlural: "Guests",
    statsCaption: "Celebrating With Us",
    rsvpSingular: "RSVP",
    rsvpPlural: "RSVPs",
    partySingular: "Party",
    partyPlural: "Parties",
    thankYou: "Thank you for confirming your RSVP — your presence means the world to us.",
    updatedLabel: "Updated",
    refreshLabel: "Refresh guest counts",
    listEyebrow: "Joining Us",
    listDescription: "A glimpse of the wonderful guests celebrating with us",
    vipLabel: "VIP",
    noTable: "No Table Yet",
    companionsLabel: "With Them",
    // Shown when a guest has more than 4 companions
    companionsMore: "+{count} more",
    companionsLess: "Show less",
    confirmedLabel: "Confirmed",
    emptyTitle: "Guest list updating",
    emptyText: "Confirmed guests will appear here as RSVPs come in.",
    // How many guest cards show at once (rotates every few seconds when there are more)
    cardsPerView: 4,
    // Corner florals (sized per corner like the loader), sprig above the title and
    // sprig at the end of the section — "" hides any of them.
    // On the invitation page Book of Guests shows the top corners and FAQ the bottom ones.
    decos: {
      ...CORNER_DECOS,
      headerOrnament: DECOR.headerOrnament,
      footerVine: DECOR.headerOrnament,
    },
    // Thin double border around the section (false hides it)
    showFrame: true,
  },
  // FAQ (components/sections/faq.tsx)
  // In answers you can use:
  //   {deadline}    → details.rsvp.deadline
  //   {coordinator} → details.rsvp.coordinator
  //   {contact}     → " at <phone>" when details.rsvp.phone is set (empty while "to be announced")
  //   [link text](#section-id) → a link that smoothly scrolls to that section
  //   A blank line (\n\n) starts a new paragraph; lines starting with "• " show as a bulleted list
  faq: {
    eyebrow: "A Few Notes",
    title: "Frequently Asked Questions",
    subtitle: "everything you need to know",
    description:
      "Everything you need for the day, so you can simply arrive, celebrate and enjoy this new chapter with us.",
    // Corner florals (sized per corner like the loader), sprig above the title and
    // sprig at the end of the section — "" hides any of them.
    // On the invitation page Book of Guests shows the top corners and FAQ the bottom ones.
    decos: {
      ...CORNER_DECOS,
      headerOrnament: DECOR.headerOrnament,
      footerVine: DECOR.headerOrnament,
    },
    // Thin double border around the section (false hides it)
    showFrame: true,
    // Answers: blank line = new paragraph, "• " = bullet, [label](#section) or [label](https://…) = link.
    // {deadline} {coordinator} {contact} {groom} {bride} are filled in automatically.
    items: [
      // ── The day ──
      {
        question: "When and where is the wedding?",
        answer: `Our wedding will be on ${WEDDING_DAY}, ${WEDDING_DATE}.\n\n• Ceremony — ${CEREMONY_VENUE.name}, ${CEREMONY_VENUE.address}. [Open in Google Maps](${CEREMONY_VENUE.map})\n• Reception — ${RECEPTION_VENUE.name}, ${RECEPTION_VENUE.address}. [Open in Google Maps](${RECEPTION_VENUE.map})`,
      },
      {
        question: "What time should I arrive?",
        answer: `Please arrive by ${TIMES.guestArrival}, so you have time to park, find your seat and settle in before the ceremony begins promptly at ${TIMES.ceremony}.\n\nEntourage members are kindly asked to be at the venue by ${TIMES.entourageCall}.`,
      },
      {
        question: "How do I get from the ceremony to the reception?",
        answer: `The reception at ${RECEPTION_VENUE.name} is a short drive from the ceremony. Please arrange your own ride or carpool with family and friends, and use the [map link](${RECEPTION_VENUE.map}) to find your way.`,
      },
      {
        question: "Is there parking at the venue?",
        answer:
          "Yes, parking for cars and motorcycles is available inside the venue. Arriving a little early gives you time to park comfortably.",
      },
      // ── RSVP & guests ──
      {
        question: "How do I RSVP?",
        answer:
          "Find your name on the [guest list](#guest-list) on this invitation and confirm your attendance. Kindly respond by {deadline}.\n\nFor any questions, please reach out to {coordinator}{contact}.",
      },
      {
        question: 'We already said "Yes" to the couple. Do we still need to RSVP?',
        answer:
          "Yes, please. Your formal RSVP lets us finalize the headcount for catering and seating, so a place is ready for every guest.",
      },
      {
        question: "What if I RSVP'd but can no longer attend?",
        answer:
          "We will miss you, and we understand that some things are beyond our control. Please let us know as soon as possible so we can offer your seat to someone else.",
      },
      {
        question: 'I said "No" but my plans changed. Can I still come?',
        answer:
          "Please message us first, as our guest list is limited. If a seat opens up, we will let you know right away. Kindly don't come unannounced, as we may not have a place prepared for you.",
      },
      {
        question: 'Can I bring a "Plus One"?',
        answer:
          "As much as we would love to celebrate with everyone, our venue and guest list are limited. Our wedding is by invitation only, so we can only accommodate the seats reserved under your name on the guest list.",
      },
      // ── Attire, food & seating ──
      {
        question: "What should I wear?",
        answer:
          "Please see the [attire guide](#details) in Event Details.\n\n• Guests: semi-formal, in soft pastels of blue, green, yellow, pink or violet. Ladies, a modest dress or skirt below the knee, with sleeves; gentlemen, a collared polo or long-sleeve shirt with slacks.\n• Entourage: pastel gowns for the bridesmaids and flower girls; pastel blue or cream suits for the groomsmen and bearers.\n• Principal sponsors: Ninang in a long gown or formal dress in ivory or cream; Ninong in a long-sleeve Barong Tagalog with black slacks.\n\nAs our ceremony is held in an Iglesia ni Cristo house of worship, kindly keep attire modest, and please avoid casual wear and all-white outfits.",
      },
      {
        question: "What if I have dietary restrictions or allergies?",
        answer:
          "Please message {coordinator}{contact} before {deadline} so we can let our caterer know and make sure there is something delicious for you.",
      },
      {
        question: "May we choose our own seats at the reception?",
        answer:
          "We kindly ask that you take the seat reserved for you. Each table was arranged with care, so you can share the evening with the people we hoped you would sit with.",
      },
      // ── Photos & sharing ──
      {
        question: "Will the ceremony be unplugged?",
        answer:
          "Mostly. You may take a few photos, but please keep it minimal and never block or crowd our official photographers. We would love for everyone to be fully present with us — professional photos will be shared after the wedding.",
      },
      {
        question: "Can I take photos and videos during the reception?",
        // #hashtags in FAQ answers show bold and colored
        answer: `Absolutely! Capture all the joy you can, tag your post with ${HASHTAGS.join(" ")}`,
      },
      {
        question: "Can I share the invitation online?",
        answer:
          "Please keep this one just between us! Kindly don't post our invitation or its link on social media.",
      },
      // {
      //   question: "May I make an announcement or a proposal during the wedding?",
      //   answer:
      //     "To keep the day centered on our celebration, we kindly ask that there be no surprise announcements or proposals during our wedding.",
      // },
      // ── Gifts & the celebration ──
      {
        question: "What gift should we give?",
        answer:
          "Having you with us and keeping us in your prayers is truly all we could ask for. Should you wish to bless us further, please see our [gift guide](#registry).",
      },
      {
        question: "When is the best time to take our leave?",
        answer:
          "It would mean so much if you could stay until the end of the program. We have planned the evening with love, and we hope you will laugh, dance and celebrate with us until the very last song.",
      },
      {
        question: "How can I help make the day special?",
        answer:
          "• Pray with us for good weather and the Lord's continued blessings on our new life as husband and wife.\n• RSVP as early as you can.\n• Dress according to the attire guide and color palette.\n• Arrive on time.\n• Take your reserved seat at the reception.\n• Stay until the end of the program.\n• Join the activities and enjoy every moment!",
      },
    ],
  },
  // Gift guide (components/sections/registry.tsx). The signature uses couple.groomNickname / brideNickname.
  registry: {
    eyebrow: "A Token of Love",
    title: "Gift Guide",
    subtitle: "with gratitude",
    description: "Your presence on our wedding day is the greatest gift of all.",
    paragraphs: [
      "Having you beside us as we say our vows, and keeping us in your prayers as we begin this new chapter, is truly all we could ask for.",
      "Should you wish to bless us further, a monetary gift toward our life together would be warmly appreciated — though never expected.",
    ],
    thankYou: "Thank you for being part of our story.", // "" hides the line
    signOff: "With joyful hearts,",
    signature: "{groom} & {bride}", // "" falls back to "{groom} & {bride}" nicknames
    // Colors — any CSS color or a palette token from app/globals.css (e.g. "var(--color-motif-accent)")
    colors: {
      title: "var(--color-welcome-navy)",                                              // "Gift Guide", account names
      script: "var(--color-welcome-heading)",                                          // drop cap, couple signature
      eyebrow: "var(--color-welcome-heading)",                                         // small caps labels, icons
      body: "var(--color-welcome-text)",                                               // paragraphs
      soft: "color-mix(in srgb, var(--color-welcome-text) 75%, white)",                // "With joyful hearts," and secondary text
      card: "#FFFFFF",                                                                 // letter card
      cardEdge: "color-mix(in srgb, var(--color-motif-medium) 65%, transparent)",      // letter card border
      button: "linear-gradient(180deg, var(--color-welcome-heading) 0%, color-mix(in srgb, var(--color-welcome-heading) 72%, var(--color-welcome-navy)) 100%)", // gift seal
      line: "var(--color-motif-yellow)",                                               // sage dividers
      glow: "color-mix(in srgb, var(--color-motif-medium) 30%, transparent)",          // tab track / borders
      background: "var(--color-motif-cream)",                                          // section background
    },
    // Leave any path "" to hide that decoration
    decos: { ...SECTION_DECOS },
  },
  // Table finder page (/table — components/table-finder.tsx)
  tableFinder: {
    decos: { ...CORNER_DECOS },
    // "Find Your Table" QR card on the dashboard (components/table-finder-qr-card.tsx)
    // {couple} → "Groom & Bride" nicknames. "" hides a line or image.
    qrCard: {
      coupleNameImage: BRAND.coupleNameImage, // unused: the card sets the names in type like the loader
      coupleImage: "/Details/specialInvitation.png", // couple illustration beside the text
      eyebrow: "The wedding of",
      title: "Find Your Table",
      script: "please be seated",
      description:
        "Place this code at the entrance. Guests scan it, search their name, and go straight to their table.",
      scanLabel: "Scan to find your table",
      buttonText: "Download QR",
      downloadNote: "Saves a print-ready PNG for signs and table cards.",
      previewText: "Preview seating page",
    },
  },
  // Entourage proposal pages (components/proposal-page.tsx)
  // Text placeholders: {name} = invitee, {role} = role title, {groom} / {bride} = nicknames.
  // Each invitation type has its own wording:
  //   party      → Best Man, Maid/Matron of Honor, Bridesmaid, Groomsman, Little Bride, secondary sponsors
  //   sponsor    → Principal Sponsors (Ninong / Ninang)
  //   bearer     → Ring / Coin / Bible / Herald Bearer
  //   flowerGirl → Flower Girl
  // A list ([...]) shows one paragraph per line; "" or [] hides that part.
  proposal: {
    decos: { ...CORNER_DECOS },
    coupleNameImage: BRAND.coupleNameImage, // unused: names are set in type like the loader
    coupleImage: "/Details/Pastel Wedding Party Portrait.webp", // wedding party illustration above the question ("" hides it)
    ornament: DECOR.headerOrnament, // small sprig at the top of the card; "" to hide
    // Eucalyptus sprigs on either side of the couple name; "" to hide one
    nameDecos: { left: DECOR.sideLeft, right: DECOR.sideRight },
    showDate: true, // big date under the couple name (Month / Day / Day-number / Time / Year)
    // Use "Maid of Honor" for unmarried, "Matron of Honor" for married
    honorAttendant: "Matron of Honor" as "Matron of Honor" | "Maid of Honor",
    roles: proposalRoleDefinitions,
    roleIdAliases: proposalRoleIdAliases,
    // Personal note per role id, shown under "Will you be our …?" instead of the type's askNote,
    // e.g. { "best-man": "You've been my brother since day one…" }. Placeholders work here too.
    roleMessages: {} as Record<string, string>,
    // Shared labels used on every invitation.
    // Placeholders: {name} invitee, {role} role title, {groom} / {bride} nicknames.
    labels: {
      headerEyebrow: "A Personal Invitation",
      // Title under the eyebrow, then the eyebrow + title under the illustration ("" hides one)
      headline: "{groom} & {bride} Are Getting Married",
      placeEyebrow: "A Special Place",
      placeTitle: "In Our Wedding",
      headerScript: "written just for you",
      saveTheDate: "Save the Date",
      roleOffered: "Your role",
      preparedFor: "Written for",
      askQuestion: "Will you be our",
      registeredName: "Your name on our list",
      returnButton: "Return to Our Wedding Page",
      // Shown above the reply when the guest opens their link again after answering
      alreadyAnswered: "You already replied — thank you!",
      saving: "Saving...",
      sending: "Sending...",
      sendButton: "Send My Response",
      goBack: "Go Back",
      saveError: "We couldn't save your response just now. Please try again.",
      // Shown when the invite link has no name and the guest says yes
      nameForm: {
        title: "You Said Yes",
        script: "our hearts are full",
        subheader: "Just one little thing",
        body: "We're so happy to have you with us! How would you like your name to appear on our invitation and guest list?",
        label: "Your Preferred Name",
        placeholder: "e.g. Tita Maria Clara / Mr. James Reyes",
        required: "Please type your preferred name so we can include you properly.",
        submit: "Confirm My Name",
        cancel: "Cancel",
      },
    },
    copy: {
      party: {
        greeting: "Dear",
        intro: [
          "Before anything else, we wanted you to hear this from us personally.",
          "We're getting married! After everything we've shared so far, we're ready to begin the next chapter of our lives together, and we couldn't wait to tell you.",
        ],
        body: [
          "This little letter isn't a general invitation. We wrote it with you in mind.",
          "When we pictured our wedding day, we thought about the people who have walked with us, laughed with us and cheered us on. Your name came up right away.",
          "We would love for you to be more than a guest. We'd love you right beside us, sharing the nerves, the joy, the happy tears and every memory we'll keep from that day.",
        ],
        askLead: "So, with all our hearts, we'd like to ask you",
        askNote:
          "We know it takes a bit of your time and effort, and we don't take that lightly. More than anything, we just want you there with us, celebrating this moment together.",
        yesButton: "Yes, I'd Love To!",
        noButton: "I Can't, But With Love",
        signOff: "With all our love,",
        yes: {
          title: "You Said Yes",
          script: "thank you",
          subheader: "You just made our day",
          roleLine: "Standing with us as our {role}",
          body: [
            "Thank you, {name}. Knowing you'll be right beside us makes our wedding feel even more like us. We can't wait to celebrate, laugh, and make memories with you. We'll be in touch soon with all the little details!",
          ],
          signOff: "With so much love,",
        },
        no: {
          title: "Thank You",
          script: "for telling us",
          subheader: "We completely understand",
          body: [
            "Thank you for taking the time to read our invitation and think it over. There are truly no hard feelings. Whether you're beside us or cheering from wherever you are, we're grateful to have you in our lives.",
          ],
        },
        sent: {
          title: "Response Sent",
          script: "with love",
          subheader: "Your reply has reached us",
          body: [
            "We hope you'll still celebrate with us in your own way. Your love and good wishes mean the world to us.",
          ],
          signOff: "With love and warmest wishes,",
        },
      },
      sponsor: {
        greeting: "Dear",
        intro: [
          "We wanted to share some happy news with you, and we wanted you to hear it from us first.",
          "We're getting married, and we're about to begin a new life together as husband and wife.",
        ],
        body: [
          "This letter is not a general invitation. It's a personal request, written especially for you.",
          "As we prepare for this day, we keep thinking of the people we look up to. You have shown us, in ways you may not even realize, what a loving and faithful life looks like.",
          "To us, a {role} is more than a name in our program. It is someone whose wisdom we trust, whose prayers we hold dear, and whose example we hope to follow as we build our own home.",
        ],
        askLead: "With deep respect and sincerity, we'd like to ask you",
        askNote: "Having you stand with us, and having your blessing on our marriage, would mean more to us than we can say.",
        yesButton: "Yes, I'd Be Honored 🤍",
        noButton: "I Can't, But With Love",
        signOff: "With love and respect,",
        yes: {
          title: "You Said Yes",
          script: "thank you",
          subheader: "We are truly honored",
          roleLine: "Our {role}",
          body: [
            "Thank you, {name}, for accepting this role with such an open heart. Your guidance and prayers mean so much to us, and we're grateful to begin our marriage with you beside us. We'll reach out soon with the details.",
          ],
          signOff: "With love and heartfelt gratitude,",
        },
        no: {
          title: "Thank You",
          script: "for your kindness",
          subheader: "We completely understand and respect your decision",
          body: [
            "Thank you for reading our invitation and giving our request your thought. There are no hard feelings at all. We're simply grateful for you, and we'd be happy to have your prayers and blessings in whatever way you can share them.",
          ],
        },
        sent: {
          title: "Response Sent",
          script: "with gratitude",
          subheader: "Your reply has reached us",
          body: [
            "Thank you for being part of our story. Your love and good wishes mean the world to us.",
          ],
          signOff: "With love and warmest wishes,",
        },
      },
      bearer: {
        greeting: "Hi",
        intro: [
          "Guess what? We have the happiest news, and we wanted to tell you first! 🤍",
          "{groom} & {bride} are getting married!",
        ],
        body: [
          "Our wedding is going to be a very special day, and it wouldn't feel complete without you there with us.",
        ],
        askLead: "So we have a super important question, just for you:",
        askNote: "You'd get to walk down the aisle and carry something very precious for our ceremony. We think you'd be amazing at it!",
        yesButton: "Yes, I'd Love To! 🤍",
        noButton: "Maybe Next Time 🤍",
        signOff: "With lots of love,",
        yes: {
          title: "Yay!",
          script: "you said yes!",
          subheader: "You're officially on our team!",
          roleLine: "Our {role}",
          body: [
            "We're so excited to have you as our {role}! We can't wait to see you walk down the aisle. You have a very special job, and we know you'll do great. See you on our big day! 🤍",
          ],
          signOff: "With lots of love,",
        },
        no: {
          title: "That's Okay!",
          script: "we understand",
          subheader: "No worries at all 😊",
          body: [
            "Thank you for thinking about being our {role}. You are special to us no matter what, and we'd love to celebrate with you either way.",
          ],
        },
        sent: {
          title: "Response Sent",
          script: "thank you",
          subheader: "Thanks for letting us know",
          body: ["You are so special to us, and we can't wait to celebrate with you."],
          signOff: "With lots of love,",
        },
      },
      flowerGirl: {
        greeting: "Hi",
        intro: [
          "Guess what? We have the happiest news, and we wanted to tell you first! 🤍",
          "{groom} & {bride} are getting married!",
        ],
        body: [
          "Our wedding needs a little extra sweetness, lots of smiles, and a sprinkle of magic. We thought of you right away.",
        ],
        askLead: "And we have a very special role we'd love for you to have:",
        askNote: "You'd get to walk down the aisle before the bride and make our day even more beautiful. We think you'd be perfect!",
        yesButton: "Yes, I'd Love To! 🌸",
        noButton: "Maybe Next Time 🤍",
        signOff: "With lots of love,",
        yes: {
          title: "Yay!",
          script: "you said yes!",
          subheader: "We're so happy you'll be our Flower Girl!",
          roleLine: "Our {role}",
          body: [
            "We can't wait to see you walk down the aisle! Have fun, smile big, and enjoy every moment. See you on our big day! 🤍",
          ],
          signOff: "With lots of love,",
        },
        no: {
          title: "That's Okay!",
          script: "we understand",
          subheader: "No worries at all 😊",
          body: [
            "Thank you for thinking about being our Flower Girl. You are special to us no matter what, and we'd love to celebrate with you either way!",
          ],
        },
        sent: {
          title: "Response Sent",
          script: "thank you",
          subheader: "Thanks for letting us know",
          body: ["You are so special to us, and we can't wait to celebrate with you."],
          signOff: "With lots of love,",
        },
      },
    },
  },
  details: {
    rsvp: { ...RSVP },
  },
  contact: {
    bridePhone: "to be announced",
    groomPhone: "to be announced",
    email: "to be announced",
  },
  giftRegistry: {
    // QR_1:{
    // id: "BPI",
    // src: "/QR/BPI.png",
    // label: "BPI",
    // accountNumber: "KAMS : ***********569",
    // },
    // QR_2:{
    // id: "MariBank",
    // src: "/QR/MariBank.png",
    // label: "MariBank",
    // accountNumber: "****7672",
    // }
    // ,
    // QR_3:{
    // id: "Gcash",
    // src: "/QR/pleaseProvideQR.png",
    // label: "Gcash",
    // accountNumber: "to be announced",
    // }
  },
  // Guest list API used by RSVP search + Book of Guests ("/api/guests?list=two" on /invitetwo)
  guestListApi: "/api/guests",
  // Reception-only overrides for /invitetwo — date / venue / guest list in QUICK SETUP → INVITE_TWO
  inviteTwo: {
    ...INVITE_TWO,
    // Love story chapter (matched by title) whose paragraphs are replaced on /invitetwo
    invitationChapter: {
      title: "Please Celebrate With Us",
      paragraphs: [
        `With grateful hearts, we warmly invite you to celebrate with us at ${INVITE_TWO.venue.name}, ${INVITE_TWO.venue.address}.`,
        "Your presence is the greatest gift we could ask for. We look forward to celebrating and giving thanks together with you. With all our love, {groom} & {bride}. ♡",
      ],
    },
    // Event Details → attire: guests only (no entourage / principal sponsors)
    attireGroups: ["guests"] as AttireGroupId[],
    attireDescription:
      "Our day is dressed in soft pastels of blue, green, yellow, pink and violet, and we would love for you to wear them with us. We kindly ask that all attire be modest.",
    // Event Details → Gentle Reminders shown on /invitetwo instead of eventDetails.reminders.items
    reminders: [
      {
        title: "Keep Our Invitation Private",
        variant: "soft" as "accent" | "soft",
        showPalette: false,
        paragraphs: [
          "Please keep this just between us! Kindly refrain from posting our invitation online.",
        ],
      },
      {
        title: "Arrival",
        variant: "soft" as "accent" | "soft",
        showPalette: false,
        paragraphs: [
          `To ensure everything runs smoothly, please arrive a little before ${INVITE_TWO.time}. This will give you enough time to find your seat and settle in comfortably before the program begins. We truly appreciate your punctuality and look forward to celebrating with you.`,
        ],
      },
      {
        title: "Reception Details",
        variant: "accent" as "accent" | "soft",
        showPalette: false,
        paragraphs: [
          `Please join us at ${INVITE_TWO.venue.name} for good food, laughter and a joyful celebration.`,
        ],
      },
    ],
    // FAQ shown on /invitetwo instead of faq.items below (same formatting rules)
    faqItems: [
      // ── The day ──
      {
        question: "When and where is the celebration?",
        answer: `Our celebration will be on ${INVITE_TWO.day}, ${INVITE_TWO.date}, at ${INVITE_TWO.time}.\n\n• Reception — ${INVITE_TWO.venue.name}, ${INVITE_TWO.venue.address}. [Open in Google Maps](${INVITE_TWO.venue.map})`,
      },
      {
        question: "What time should I arrive?",
        answer: `Please arrive a little before ${INVITE_TWO.time}, so you have time to park, find your seat and settle in before the program begins.`,
      },
      {
        question: "How do I get to the venue?",
        answer: `Please arrange your own ride or carpool with family and friends, and use the [map link](${INVITE_TWO.venue.map}) to find ${INVITE_TWO.venue.name} in ${INVITE_TWO.venue.address}.`,
      },
      // ── RSVP & guests ──
      {
        question: "How do I RSVP?",
        answer:
          "Find your name on the [guest list](#guest-list) on this invitation and confirm your attendance. Kindly respond by {deadline}.\n\nFor any questions, please reach out to {coordinator}{contact}.",
      },
      {
        question: 'We already said "Yes" to the couple. Do we still need to RSVP?',
        answer:
          "Yes, please. Your formal RSVP lets us finalize the headcount for catering and seating, so a place is ready for every guest.",
      },
      {
        question: "What if I RSVP'd but can no longer attend?",
        answer:
          "We will miss you, and we understand that some things are beyond our control. Please let us know as soon as possible so we can offer your seat to someone else.",
      },
      {
        question: 'Can I bring a "Plus One"?',
        answer:
          "As much as we would love to celebrate with everyone, our venue and guest list are limited. Our celebration is by invitation only, so we can only accommodate the seats reserved under your name on the guest list.",
      },
      {
        question: "Are children invited?",
        answer:
          "We love your little ones, but our celebration is adults-only. We hope you enjoy a relaxing day off with us!",
      },
      // ── Attire, food & seating ──
      {
        question: "What should I wear?",
        answer:
          "Please see the [attire guide](#details) in Event Details.\n\n• Guests: semi-formal, in soft pastels of blue, green, yellow, pink or violet. Ladies, a modest dress or skirt below the knee, with sleeves; gentlemen, a collared polo or long-sleeve shirt with slacks.\n\nKindly keep attire modest, and please avoid casual wear and all-white outfits.",
      },
      {
        question: "What if I have dietary restrictions or allergies?",
        answer:
          "Please message {coordinator}{contact} before {deadline} so we can let our caterer know and make sure there is something delicious for you.",
      },
      {
        question: "May we choose our own seats?",
        answer:
          "We kindly ask that you take the seat reserved for you. Each table was arranged with care, so you can share the celebration with the people we hoped you would sit with.",
      },
      // ── Photos & sharing ──
      {
        question: "Can I take photos and videos during the celebration?",
        answer: `Absolutely! Capture all the joy you can, tag your posts with ${HASHTAGS.join(" ")} and upload your favorites through [Snap and Share](#snap-share) so we can relive the day through your eyes.`,
      },
      {
        question: "Can I share the invitation online?",
        answer:
          "Please keep this one just between us! Kindly don't post our invitation or its link on social media.",
      },
      // ── Gifts & the celebration ──
      {
        question: "What gift should we give?",
        answer:
          "Having you with us and keeping us in your prayers is truly all we could ask for. Should you wish to bless us further, please see our [gift guide](#registry).",
      },
      {
        question: "When is the best time to take our leave?",
        answer:
          "It would mean so much if you could stay until the end of the program. We have planned the day with love, and we hope you will laugh and celebrate with us until the very end.",
      },
      {
        question: "How can I help make the day special?",
        answer:
          "• Pray with us for good weather and the Lord's continued blessings on our new life as husband and wife.\n• RSVP as early as you can.\n• Dress according to the attire guide and color palette.\n• Arrive on time.\n• Take your reserved seat.\n• Stay until the end of the program.\n• Join the activities and enjoy every moment!",
      },
    ],
  },
  // Built from QUICK SETUP — edit the values at the top of the file
  ceremony: {
    location: CEREMONY_VENUE.name,
    venue: CEREMONY_VENUE.address,
    map: CEREMONY_VENUE.map,
    mapQuery: CEREMONY_VENUE.mapQuery,
    date: WEDDING_DATE,
    day: WEDDING_DAY,
    time: TIMES.ceremony,
    entourageTime: TIMES.entourageCall,
    guestsTime: TIMES.guestArrival,
    image: CEREMONY_VENUE.photos,
  },
  reception: {
    location: RECEPTION_VENUE.name,
    venue: RECEPTION_VENUE.address,
    map: RECEPTION_VENUE.map,
    mapQuery: RECEPTION_VENUE.mapQuery,
    date: WEDDING_DATE,
    day: WEDDING_DAY,
    time: TIMES.reception,
    image: RECEPTION_VENUE.photos,
  },
  dressCode: {
    theme: "Whimsical Spring Minimalist",
    sponsors: {
      title: "Sponsors",
      ninang: {
        label: "Ninang",
        description: "Long gown in the shade of silver gray.",
        image: "/Details/Ninang.png",
        palette: ["#D8D3CD", "#C0C0C0", "#A9A9A9", "#969090", "#8C8686"],
      },
      ninong: {
        label: "Ninong",
        description: "Barong Tagalog and black slacks.",
        image: "/Details/Ninong.png",
        palette: ["#D0A386", "#E3C5B3", "#E4DCD1"],
      },
    },
    entourage: {
      title: "Entourage",
      bridesmaid: {
        label: "Bridesmaids",
        description: "Long gown that suits our color motif.",
        image: "/Details/bridesmaid.png",
        palette: ["#B4A3D4", "#C8A2C8"],
      },
      groomsmen: {
        label: "Groomsmen",
        description: "Long sleeve Barong Tagalog and black slacks.",
        image: "/Details/Groomsmen.png",
        palette: ["#D0A386", "#E3C5B3", "#E4DCD1"],
      },
    },
    guests: {
      title: "Guests",
      label: "Guests",
      description: "Casual attire: Whimsical Spring.",
      image: "/Details/guest.png",
      palette: ["#835643", "#C48C73", "#E3CAC5", "#CBAFA1", "#F2E9E2"],
    },
    paletteNote:
      "Our theme is Whimsical Spring Minimalist. Entourage: women, a flowy spring sage green dress, strictly floor length; gentlemen, a black and white suit, a white and gray suit, or sage green long sleeves with gray or brown pants — strictly no rubber shoes. Guests: casual attire, Whimsical Spring.",
    closing:
      "Thank you for helping us bring our wedding vision to life. We can't wait to celebrate with you!",
    note: "We kindly request our guests to dress in attire following our Whimsical Spring Minimalist palette.",
  },
  narratives: {
    ourStory: `Once upon a signature…

Our story began with a simple signature, one that slowly turned into something magical. He was my financial advisor, and I was there to sign documents. It was July 5, 2021, and we met at the Lobby of the building. Little did we know, that ordinary day would start a story neither of us expected.

I wasn't looking for anything, yet somehow, our connection grew in its own gentle, unexpected way. And then, on June 1, 2022, our story truly began—we became us. We found a love that feels like home.

Our journey wasn't rushed, but perfectly timed. We believe that God brought us together in His own way and season.

With hearts full of gratitude, we step into this new chapter hand in hand, trusting His plan and celebrating a love rooted in faith, patience, and grace.

Today, we choose each other- again and again- and we can't wait to celebrate this new chapter with the people we love most.`,
    groom: `The first time Mark saw Catherine, time seemed to slow down. It was an ordinary day that instantly became unforgettable: one smile, one hello, and suddenly his world had a new center. He didn't have the perfect words ready, but he knew he had met someone who felt like home.

Early conversations turned into late-night talks, sharing dreams, favorite meals, and whispered prayers for a future together. With every small adventure—coffee runs, long drives, quiet walks—Mark found himself choosing her over and over again. He loved how she laughed freely, how she listened with her whole heart, and how her faith steadied him.

There were seasons of distance and long workdays, but every reunion reminded him why he stayed patient: because Catherine was worth every mile and every minute apart. When he finally knelt to ask for her hand, it wasn't a question of "if," only "when can we start forever?"`,
    bride: `Catherine remembers the first time Mark said her name. It was gentle but sure, a kindness that made her feel both seen and safe. In that softness, she found a partner who met her with the same grace she prayed to give.

Mark's steadiness won her heart: the way he showed up, even when schedules were tight, and how he always found lightness in the small things. He celebrated her wins, held space for her worries, and never hesitated to choose "us" in every decision.

Now, as they prepare to say yes before God and the people they love most, Catherine is grateful for the patience, humor, and hope Mark brings to every day. She knows this next chapter is just the start of the love story they get to write together.`,
  },
  colors: {
    primary: "#87AE73",
    secondary: "#F5F5DC",
  },
  // Wedding playlist (components/sections/wedding-playlist.tsx). {couple} → "Groom & Bride" nicknames.
  playlist: {
    eyebrow: "Our Soundtrack",
    title: "A Playlist from our hearts",
    script: "songs of our love",
    subtitle: "Songs that have been part of our journey together",
    // Shown on the playlist card
    cardEyebrow: "Spotify Playlist",
    playlistName: `${COUPLE_LABEL} Wedding`,
    cardNote: "Press play and listen along — every song holds a little piece of our story.",
    buttonText: "Open in Spotify",
    // Corner florals (sized per corner like the loader) — "" hides any of them
    decos: { ...CORNER_DECOS, headerOrnament: DECOR.headerOrnament },
    // Thin double border around the section (false hides it)
    showFrame: true,
    embedUrl:
    //https://open.spotify.com/embed/playlist/5sT43YjdM8pJ3xtEkrxyEY?utm_source=generator&si=e5e64aa63fd04356
      "https://open.spotify.com/embed/playlist/3CDN0SxoU8D99qtLaCTeUs?utm_source=generator&si=521a75df21d64062",
    spotifyUrl: "https://open.spotify.com/playlist/3CDN0SxoU8D99qtLaCTeUs",
  },
  // Closing "See you there!" section (components/sections/see-you-there.tsx).
  //   photos mode (loadingScreen.display "photos") → full-screen couple photo
  //   plain mode  (loadingScreen.display "plain")  → botanical card, no photo
  // {couple} → "Groom & Bride" nicknames.
  seeYouThere: {
    titleLine1: "See you",
    titleLine2: "there!",
    // Photos mode
    photo: COUPLE_PHOTOS[4],
    photoAlt: "{couple}",
    // Plain mode
    plain: {
      eyebrow: "Until we meet",
      script: "with love, {couple}",
      message: "We can't wait to celebrate this beautiful day with you.",
      // Fanned photo trio above the title — left, center (front), right; [] hides it
      photos: [COUPLE_PHOTOS[1], COUPLE_PHOTOS[4], COUPLE_PHOTOS[9]],
      // Corner florals — top two here, bottom two on the footer below; "" hides any of them
      decos: { ...CORNER_DECOS, footerVine: DECOR.headerOrnament },
      // Thin double border around See You There + footer (false hides it)
      showFrame: true,
    },
  },
  // Footer (components/sections/footer.tsx).
  // {couple} → "Groom & Bride" nicknames, {year} → current year. Date comes from ceremony, deadline from details.rsvp.
  footer: {
    showMonogram: true, // couple.monogram, tinted to the motif
    dateLabel: "Wedding Date",
    // Ceremony & reception at a glance (times and places come from ceremony / reception)
    summary: {
      show: true,
      ceremonyLabel: "Ceremony",
      receptionLabel: "Reception",
    },
    noteTitle: "A Note From Us",
    // Typed out one after another
    quotes: [
      "Two paths became one, and now we're ready to walk it together — with all of you beside us.",
      "Welcome to our wedding website! We've found a love that's a true blessing, and we give thanks to God for writing the beautiful story of our journey together.",
      "Thank you for your love, prayers, and support. We can't wait to celebrate this joyful day together!",
    ],
    rsvp: {
      show: true,
      title: "RSVP Deadline",
      label: "Please respond by",
      note: "Please confirm your attendance by this date.",
      button: "Tap here to respond",
      href: "#guest-list",
    },
    // Social links — replace each href with your own profile link.
    //   show: false hides one; platforms: facebook | instagram | tiktok | youtube | twitter | threads | messenger | email
    //   email: use "mailto:you@example.com"; messenger: use "https://m.me/yourpage"
    followTitle: "Follow Us",
    followNote: "Share your photos and tag us — we'd love to see the day through your eyes.",
    socials: [
      { show: true, platform: "facebook", href: "https://www.facebook.com" },
      { show: true, platform: "instagram", href: "https://www.instagram.com/" },
      { show: true, platform: "tiktok", href: "https://www.tiktok.com/" },
      { show: true, platform: "youtube", href: "https://www.youtube.com" },
      { show: true, platform: "twitter", href: "https://x.com/" },
      { show: false, platform: "threads", href: "https://www.threads.net/" },
      { show: false, platform: "messenger", href: "https://m.me/" },
      { show: false, platform: "email", href: "mailto:" },
    ] as {
      show: boolean
      platform: "facebook" | "instagram" | "tiktok" | "youtube" | "twitter" | "threads" | "messenger" | "email"
      href: string
    }[],
    quickLinksTitle: "Quick Links",
    links: [
      { label: "Home", href: "#home" },
      { label: "Event Details", href: "#details" },
      { label: "RSVP", href: "#guest-list" },
      { label: "Gallery", href: "#gallery" },
      { label: "Messages", href: "#messages" },
      { label: "FAQ", href: "#faq" },
    ],
    copyright: "© {year} {couple} — crafted with love, prayers, and gratitude.",
    tagline: "This celebration site was designed to share our story and joy with you.",
    credit: {
      show: true,
      developedBy: "Developed by",
      developerName: "Lance Valle",
      developerUrl: "https://lance28-beep.github.io/portfolio-website/",
      promoText: "Want a website like this? Visit",
      promoName: "Wedding Invitation Naga",
      promoUrl: "https://www.facebook.com/WeddingInvitationNaga",
    },
    // Corner florals — bottom two here, top two on See You There above; "" hides any of them
    decos: { ...CORNER_DECOS, headerOrnament: DECOR.headerOrnament },
    // Thin double border when the footer is shown on its own (false hides it)
    showFrame: true,
  },
  // Snap & Share (components/sections/snap-share.tsx). {couple} → "Groom & Bride" nicknames.
  snapShare: {
    googleDriveLink:
      "https://drive.google.com/drive/folders/1ec6wYoZqUGP-aoSoE9734uJdMLauxpKc?usp=sharing",
    albumQR: "/QR/AlbumQR.png",
    hashtag: HASHTAGS,
    instructions: "Please scan this QR Code and upload the photos and videos you have taken during our wedding reception. We are delighted to see your snaps too!",
    title: "Snap and Share",
    subtitle: "Share your memories",
    description:
      "Help us remember the little moments of {couple}'s day — every smile, embrace, and candid laugh. Your photos and clips complete our love story.",
    // "Our Favorite Moments" photo card — always hidden when loadingScreen.display is "plain"
    moments: {
      show: true,
      title: "Our Favorite Moments",
      caption: "Share your snapshots to be featured in our keepsake gallery.",
      // 3 photos: two squares on top, one wide photo below
      images: COUPLE_PHOTOS.slice(0, 3),
    },
    website: {
      show: false,
      title: "Share Our Wedding Website",
      description:
        "Spread the word about {couple}'s celebration. Share this QR code so friends and family can join us.",
      downloadButton: "Download QR",
      note: "Scan with any camera app to open the full invitation and schedule.",
    },
    hashtags: {
      show: true,
      title: "Wedding Hashtags",
      copy: "Copy",
      copied: "Copied",
      copyAll: "Copy All",
      allCopied: "All Copied!",
    },
    social: {
      show: false,
      title: "Share on Social Media",
      description: "Help spread the word about {couple}'s wedding across your favorite platforms.",
      // Remove any you don't want: "instagram" | "facebook" | "tiktok" | "twitter"
      platforms: ["instagram", "facebook", "tiktok", "twitter"] as ("instagram" | "facebook" | "tiktok" | "twitter")[],
      shareText: "Celebrate {couple}'s wedding! Explore the details and share your special memories:",
    },
    // Shown only when googleDriveLink is set
    upload: {
      badge: "Upload Your Photos & Videos",
      scanNote: "Scan with your camera app",
      copyLink: "Copy Link",
      copied: "Copied!",
      downloadQr: "Download QR",
      uploadButton: "Upload Photos",
    },
    closing:
      "Thank you for helping make {couple}'s wedding celebration memorable. Your photos and messages create beautiful memories we will treasure for a lifetime.",
    closingTag: "Thank you for sharing the joy",
    // "Puhon" banner — text comes from loveStory.closing*; photos crossfade behind it
    puhon: {
      show: true,
      // Every portrait in /public/mobile-background
      images: COUPLE_PHOTOS,
      intervalMs: 5000, // time each photo stays before fading to the next
    },
  },
  accommodation: {
    coordinator: {
      name: RSVP.coordinator,
      phone: RSVP.phone,
    },
    hotels: [
      {
        name: "La Luna Resort",
        discount: "Offered 20% discount for early booking",
        facebook: "https://www.facebook.com/lalunabeachresortofficial",
      },
      {
        name: "GOSAM Beach Resort",
        discount: "Offered 10% discount",
        facebook: "https://www.facebook.com/profile.php?id=100083461714073",
      },
      {
        name: "Calicoan Villa",
        discount: "Offered 10% discount",
        facebook: "https://www.facebook.com/CalicoanVilla",
      },
      {
        name: "G Camp Beachfront",
        discount: "Offered 10% discount",
        facebook: "https://www.facebook.com/profile.php?id=100085772194096",
      },
      {
        name: "Punta Viajero Beach Resort",
        discount: "Offered 15% discount",
        phone: "0932 214 6408",
        facebook: "https://www.facebook.com/puntoviajeroresort",
      },
      { name: "Balay Sunset" },
      { name: "Balay Pacifico" },
      { name: "Casa Nala" },
      { name: "The Grey Inn" },
    ],
    carRentals: [
      {
        name: "Apex Car Rental Tacloban",
        facebook: "https://www.facebook.com/profile.php?id=61574882327115",
      },
      {
        name: "Cassey Wheels Car Rental",
        facebook: "https://www.facebook.com/search/top?q=casseywheels%20car%20rental",
      },
    ],
  },
}
