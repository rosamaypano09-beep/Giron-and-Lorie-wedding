import { siteConfig as baseSiteConfig } from "@/content/site"
import {
  type WeddingDetails,
  emptyWeddingDetails,
} from "@/lib/wedding-details-types"
import { normalizeWeddingDateString, parseWeddingDate } from "@/lib/wedding-date"

export type SiteConfig = typeof baseSiteConfig

function pick(value: string | undefined, fallback: string): string {
  const trimmed = value?.trim()
  return trimmed ? trimmed : fallback
}

export function mergeWeddingDetailsIntoSiteConfig(
  details: WeddingDetails
): SiteConfig {
  const merged = JSON.parse(JSON.stringify(baseSiteConfig)) as SiteConfig

  merged.couple = {
    ...merged.couple,
    bride: pick(details.couple.bride, merged.couple.bride),
    brideNickname: pick(details.couple.brideNickname, merged.couple.brideNickname),
    groom: pick(details.couple.groom, merged.couple.groom),
    groomNickname: pick(details.couple.groomNickname, merged.couple.groomNickname),
  }

  const weddingDate = pick(
    normalizeWeddingDateString(details.wedding.date),
    merged.wedding.date,
  )
  const ceremonyDate = weddingDate || merged.ceremony.date
  const ceremonyDay =
    parseWeddingDate(ceremonyDate).dayOfWeek || merged.ceremony.day

  merged.wedding = {
    ...merged.wedding,
    date: weddingDate,
    venue: pick(details.wedding.venue, merged.wedding.venue),
    tagline: pick(details.wedding.tagline, merged.wedding.tagline),
    theme: pick(details.theme, merged.wedding.theme),
  }

  merged.ceremony = {
    ...merged.ceremony,
    location: pick(details.ceremony.venue, merged.ceremony.location),
    venue: pick(details.ceremony.address, merged.ceremony.venue),
    time: pick(details.ceremony.time, merged.ceremony.time),
    map: pick(details.ceremony.googleMapsUrl, merged.ceremony.map),
    date: ceremonyDate,
    day: ceremonyDay,
  }

  merged.reception = {
    ...merged.reception,
    location: pick(details.reception.venue, merged.reception.location),
    venue: pick(details.reception.address, merged.reception.venue),
    time: pick(details.reception.time, merged.reception.time),
    map: pick(details.reception.googleMapsUrl, merged.reception.map),
    date: ceremonyDate || merged.reception.date,
  }

  merged.narratives = {
    ...merged.narratives,
    bride: pick(details.narratives.bride, merged.narratives.bride),
    groom: pick(details.narratives.groom, merged.narratives.groom),
    ourStory: pick(details.narratives.shared, merged.narratives.ourStory),
  }

  merged.dressCode = {
    ...merged.dressCode,
    theme: pick(details.dressCode.theme, merged.dressCode.theme),
    note: pick(details.dressCode.note, merged.dressCode.note),
  }

  merged.details = {
    ...merged.details,
    rsvp: {
      ...merged.details.rsvp,
      deadline: pick(details.details.rsvp.deadline, merged.details.rsvp.deadline),
      contact: pick(details.couple.bride, merged.details.rsvp.contact),
      phone: pick(details.contact.bridePhone, merged.details.rsvp.phone),
    },
  }

  merged.contact = {
    ...merged.contact,
    bridePhone: pick(details.contact.bridePhone, merged.contact.bridePhone),
    groomPhone: pick(details.contact.groomPhone, merged.contact.groomPhone),
    email: pick(details.contact.email, merged.contact.email),
  }

  if (details.hashtag?.trim()) {
    merged.snapShare = {
      ...merged.snapShare,
      hashtag: [details.hashtag.trim()],
    }
  }

  return merged
}

async function fetchWeddingDetailsFromGoogle(): Promise<WeddingDetails> {
  const response = await fetch(baseSiteConfig.googleAPI.weddingDetails, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    cache: "no-store",
  })

  if (!response.ok) {
    return emptyWeddingDetails
  }

  const data = await response.json()

  if (data.error) {
    return emptyWeddingDetails
  }

  return data as WeddingDetails
}

export async function getSiteConfig(): Promise<SiteConfig> {
  try {
    const details = await fetchWeddingDetailsFromGoogle()
    return mergeWeddingDetailsIntoSiteConfig(details)
  } catch {
    return baseSiteConfig
  }
}

/**
 * /invitetwo: reception-only celebration on another date and venue (siteConfig.inviteTwo).
 * Countdowns, hero and loader read ceremony / wedding, so they point at the reception too;
 * Event Details and the footer show only the reception card. No ceremony text: FAQ, reminders,
 * attire (guests only) and the love story invitation chapter come from inviteTwo.
 */
export function applyInviteTwo(config: SiteConfig): SiteConfig {
  // Read from content/site.ts, not the fetched config: inviteTwo isn't sheet-driven, and a
  // config served by /api/wedding-details from an older build won't have it
  const {
    date, day, time, venue, guestListApi, faqItems,
    invitationChapter, attireGroups, attireDescription, reminders,
  } = baseSiteConfig.inviteTwo
  const venues = config.eventDetails.venues
  return {
    ...config,
    guestListApi,
    wedding: { ...config.wedding, date, time, venue: venue.name },
    ceremony: {
      ...config.ceremony,
      location: venue.name,
      venue: venue.address,
      map: venue.map,
      mapQuery: venue.mapQuery,
      date,
      day,
      time,
      image: venue.photos,
    },
    reception: {
      ...config.reception,
      location: venue.name,
      venue: venue.address,
      map: venue.map,
      mapQuery: venue.mapQuery,
      date,
      day,
      time,
      image: venue.photos,
      second: undefined,
    },
    loveStory: {
      ...config.loveStory,
      chapters: config.loveStory.chapters.map((chapter) =>
        chapter.title === invitationChapter.title
          ? { ...chapter, paragraphs: invitationChapter.paragraphs }
          : { ...chapter, inviteTwoOnly: false },
      ),
    },
    eventDetails: {
      ...config.eventDetails,
      attire: {
        ...config.eventDetails.attire,
        description: attireDescription,
        groups: config.eventDetails.attire.groups.filter((group) => attireGroups.includes(group.id)),
      },
      reminders: { ...config.eventDetails.reminders, items: reminders },
      venues: {
        ...venues,
        layout: "separate",
        ceremony: { ...venues.ceremony, show: false },
        // Only card left, so it carries the big date
        reception: { ...venues.reception, show: true, showDate: true, showTime: true },
      },
      route: { ...(config.eventDetails.route ?? baseSiteConfig.eventDetails.route), show: false },
      zoom: undefined,
    },
    faq: { ...config.faq, items: faqItems },
  }
}
