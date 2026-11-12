'use client';

import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import localFont from 'next/font/local';
import { useReducedMotion } from 'motion/react';
import { useSiteConfig } from '@/hooks/use-site-config';
import { siteConfig as defaultSiteConfig } from '@/content/site';
import { GhostBackdrop, PhotoBackground } from '@/components/loader/invite-photo-backdrop';
import { TintedDeco } from '@/components/tinted-deco';
import { SectionBackdrop } from '@/components/section-backdrop';
import { LeafParticles } from '@/components/loader/leaf-particles';
import './loading-screen.css';

const theSeasons = localFont({
  src: '../../Font/Fontspring-DEMO-theseasons-reg.otf',
  display: 'swap',
});

const aboveTheBeyond = localFont({
  src: '../../Font/above-the-beyond-script.otf',
  display: 'swap',
});

interface LoadingScreenProps {
  onComplete: () => void;
  onFadeStart?: () => void;
}

// Photos-mode entrance, top to bottom (ms). CSS-delay driven, so it plays as soon as the
// HTML paints — no wait for hydration:
// Poster layout: invitation line → script headline → couple rises in from the bottom →
// side notes → "the wedding of" · groom · "and" · bride (over the gown) → date in type →
// countdown → footer
const PHOTO_IN = {
  invite: 0,
  headline: 150,
  couple: 300,
  sides: 850,
  lead: 800,
  groom: 950,
  and: 1100,
  bride: 1200,
  date: 1400,
  dateStagger: 150,
  kicker: 1750,
  rule: 1850,
  status: 1900,
  progress: 1950,
} as const;
// Photos mode opens behind a pair of pastel-blue silk curtains: the content's entrance is pushed
// back by this much so it plays as the curtains part (0 when the curtains are skipped)
const CURTAIN_LEAD_MS = 700;
// Folds per curtain side (each 12.5% wide)
const CURTAIN_FOLDS = 8;
// Full curtain run (ms) — matches .ls-curtains' hide time in loading-screen.css
const CURTAIN_TOTAL_MS = 3300;
// When the curtains started opening (page clock), shared across remounts: if React ever
// re-creates the curtain DOM (e.g. a hydration retry), its CSS animations would restart from
// "closed" — instead they are fast-forwarded to where the open already was
let curtainClock: number | null = null;

function getCurtainClock() {
  if (curtainClock === null) {
    // First open on this page load: the server HTML started animating at first paint
    const fcp = performance.getEntriesByName('first-contentful-paint')[0]?.startTime;
    curtainClock = fcp !== undefined && performance.now() - fcp < CURTAIN_TOTAL_MS ? fcp : performance.now();
  }
  return curtainClock;
}
const MIN_DURATION_MS = 8000;
const FADE_OUT_MS = 1400;
// Handoff: the loader's content fades away first, then the envelope screen fades in
// (photos mode: over the same, uninterrupted photo marquee)
const HANDOFF_LEAD_MS = 550;
const MS_PER_DAY = 1000 * 60 * 60 * 24;

// Plain mode choreography — all CSS-delay driven so it plays in sync even before hydration:
// ornament → headline letters → countdown → names → date (day, month/year, weekday) → details
const PLAIN_LETTER_START_MS = 350;
const PLAIN_LETTER_STAGGER_MS = 75;
// Offsets below are measured from the moment the last headline letter has landed
const PLAIN_DATE_OFFSET_MS = 1300;
const PLAIN_DATE_STAGGER_MS = 800;

// Short joining words in the headline ("Save the Date") are set in script
const SCRIPT_WORDS = new Set(['the', 'of', 'and', '&', 'a']);

// Splits the headline into display words with a running letter index for staggering.
// Longer titles break onto a second line before a mid-title joining word
// ("A Celebration / of Love"); short ones like "Save the Date" stay on one line.
function splitHeadline(headline: string) {
  let letterIndex = 0;
  const words = headline.split(/\s+/).filter(Boolean);
  return words.map((word, i) => {
    const script = SCRIPT_WORDS.has(word.toLowerCase());
    const start = letterIndex;
    letterIndex += script ? 2 : word.length;
    const breakBefore = words.length >= 4 && script && i > 0 && i < words.length - 1;
    return { word, script, start, breakBefore };
  });
}

// Motif colors cycled through the floating petals (plain mode): mostly pastel blue
// and sky blue, a little butter yellow, navy only once in a while
const MOTE_COLORS = [
  'var(--color-motif-blush)',
  'var(--color-motif-medium)',
  'var(--color-motif-blush)',
  'var(--color-motif-yellow)',
  'var(--color-motif-medium)',
  'var(--color-motif-blush)',
  'var(--color-motif-deep)',
]

// Colorful motes and petals drifting up behind the invitation card (plain mode)
const PLAIN_MOTES = Array.from({ length: 14 }, (_, i) => ({
  x: (i * 37 + 11) % 100,
  size: 4 + ((i * 7) % 6),
  dur: 14 + ((i * 5) % 10),
  delay: -((i * 3.1) % 18),
  drift: ((i % 2 === 0 ? 1 : -1) * (12 + ((i * 11) % 24))),
  spin: (i % 2 === 0 ? 1 : -1) * (180 + ((i * 47) % 360)),
  color: MOTE_COLORS[i % MOTE_COLORS.length],
  petal: i % 3 === 0,
}))

// "Mars J. Vallejo" → "Mars Vallejo": drops middle initials from a full name
function withoutMiddleInitials(name: string) {
  return name.replace(/\s+\p{L}\.(?=\s)/gu, '');
}

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({ onComplete, onFadeStart }) => {
  const siteConfig = useSiteConfig();
  // Fall back to the bundled config if a remote override is missing this block.
  const content = siteConfig.loadingScreen ?? defaultSiteConfig.loadingScreen;
  // The loader always stays up for at least 8s, even if a config sets a shorter time
  const totalDurationMs = Math.max(content.durationMs ?? 0, MIN_DURATION_MS);
  const statusMessages = content.statusMessages;
  const isPlain = content.display === 'plain';
  const backgroundPhotos = useMemo(
    () => (content.backgroundPhotos ?? []).map((src) => encodeURI(src)),
    [content.backgroundPhotos],
  );
  const backgroundPhotosDesktop = useMemo(
    () => (content.backgroundPhotosDesktop ?? []).map((src) => encodeURI(src)),
    [content.backgroundPhotosDesktop],
  );
  const plainTheme = content.plainTheme ?? defaultSiteConfig.loadingScreen.plainTheme;
  const cornerDecos = content.cornerDecos ?? defaultSiteConfig.loadingScreen.cornerDecos;
  const plainInvite = content.plainInvite ?? defaultSiteConfig.loadingScreen.plainInvite;
  const coupleImageSrc = content.coupleImage ?? defaultSiteConfig.loadingScreen.coupleImage;
  const coupleImage = coupleImageSrc ? encodeURI(coupleImageSrc) : '';
  const poster = content.poster ?? defaultSiteConfig.loadingScreen.poster;

  const reduceMotion = useReducedMotion();
  const [fadeOut, setFadeOut] = useState(false);
  const [statusIndex, setStatusIndex] = useState(0);
  // Set after mount: the server's clock / timezone can disagree with the guest's, and a text
  // mismatch makes React re-render the loader from scratch (restarting the curtains)
  const [now, setNow] = useState<Date | null>(null);
  const curtainsRef = useRef<HTMLDivElement>(null);
  const [curtainsDone, setCurtainsDone] = useState(false);

  const weddingDate = useMemo(() => new Date(siteConfig.wedding.date), [siteConfig.wedding.date]);
  const hasValidDate = !Number.isNaN(weddingDate.getTime());

  const countdownText = useMemo(() => {
    if (!hasValidDate || !now) return '';
    const days = Math.round((startOfDay(weddingDate) - startOfDay(now)) / MS_PER_DAY);
    if (days < 0) return content.countdownPastText;
    if (days === 0) return content.countdownTodayText;
    if (days === 1) return content.countdownOneDayText;
    return content.countdownText.replace('{days}', days.toLocaleString());
  }, [content, hasValidDate, now, weddingDate]);

  // Plain display: short month ("Dec") + full weekday for the engraved-style date line
  const silkDate = hasValidDate
    ? {
        weekday: weddingDate.toLocaleString('en-US', { weekday: 'long' }),
        month: weddingDate.toLocaleString('en-US', { month: 'short' }),
        day: String(weddingDate.getDate()).padStart(2, '0'),
        year: String(weddingDate.getFullYear()),
        label: weddingDate.toLocaleDateString('en-US', {
          weekday: 'long',
          month: 'long',
          day: 'numeric',
          year: 'numeric',
        }),
      }
    : null;

  const headlineWords = useMemo(() => splitHeadline(content.headline), [content.headline]);
  const headlineLetterCount = headlineWords.reduce(
    (n, w) => n + (w.script ? 2 : w.word.length),
    0,
  );
  // Plain mode: the rest of the card waits for the headline letters to land
  const afterHeadlineMs = isPlain
    ? PLAIN_LETTER_START_MS + headlineLetterCount * PLAIN_LETTER_STAGGER_MS + 250
    : 0;
  // Photos mode: the curtains part first (the photo marquee is already loading behind them),
  // then the text plays in
  const showCurtains = !isPlain && !reduceMotion;
  // Rendered regardless of reduceMotion (CSS hides them for reduced motion), so the curtain
  // DOM never mounts/unmounts while the open is playing
  const renderCurtains = !isPlain && !curtainsDone;
  const pin = (ms: number) => ms + (showCurtains ? CURTAIN_LEAD_MS : 0);
  const revealDelay = (photoMs: number, plainOffsetMs: number) =>
    ({ '--ls-delay': `${isPlain ? afterHeadlineMs + plainOffsetMs : pin(photoMs)}ms` }) as React.CSSProperties;
  // Plain date steps: 0 = day, 1 = month & year, 2 = weekday
  const dateDelay = (step: number) =>
    ({
      '--ls-delay': `${afterHeadlineMs + PLAIN_DATE_OFFSET_MS + step * PLAIN_DATE_STAGGER_MS}ms`,
    }) as React.CSSProperties;

  const ceremonyLine = siteConfig.ceremony.time ?? '';
  // Nicknames only ("Mars and Yanyan"); falls back to the full name without middle initials
  const groomName = siteConfig.couple.groomNickname || withoutMiddleInitials(siteConfig.couple.groom);
  const brideName = siteConfig.couple.brideNickname || withoutMiddleInitials(siteConfig.couple.bride);
  const coupleNames = `${groomName} & ${brideName}`;


  useEffect(() => {
    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';
    return () => {
      document.documentElement.style.overflow = '';
      document.body.style.overflow = '';
    };
  }, []);

  useEffect(() => {
    setNow(new Date());
    const t = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (statusMessages.length < 2) return;
    const step = totalDurationMs / statusMessages.length;
    const t = setInterval(
      () => setStatusIndex((i) => Math.min(i + 1, statusMessages.length - 1)),
      step,
    );
    return () => clearInterval(t);
  }, [statusMessages.length, totalDurationMs]);

  // Keep the curtains on the page clock: a fresh mount mid-open continues the open instead of
  // snapping shut and reopening; one mounted after the open has finished isn't shown at all
  useLayoutEffect(() => {
    const el = curtainsRef.current;
    if (!el) return;
    const elapsed = performance.now() - getCurtainClock();
    if (elapsed >= CURTAIN_TOTAL_MS) {
      setCurtainsDone(true);
    } else {
      for (const anim of el.getAnimations({ subtree: true })) {
        const current = Number(anim.currentTime ?? 0);
        // Only animations that are clearly behind (re-created) — the hydrated originals are in sync
        if (current < elapsed - 200) anim.currentTime = elapsed;
      }
    }
    return () => {
      // A real unmount after the open (e.g. navigating back later) starts a fresh run next time
      if (performance.now() - getCurtainClock() >= CURTAIN_TOTAL_MS) curtainClock = null;
    };
  }, []);

  useEffect(() => {
    let fadeTimer: ReturnType<typeof setTimeout> | undefined;
    let handoffTimer: ReturnType<typeof setTimeout> | undefined;
    const lead = reduceMotion ? 0 : HANDOFF_LEAD_MS;
    const t = setTimeout(() => {
      setFadeOut(true);
      handoffTimer = setTimeout(() => {
        onFadeStart?.();
        fadeTimer = setTimeout(onComplete, reduceMotion ? 200 : FADE_OUT_MS);
      }, lead);
    }, totalDurationMs);
    return () => {
      clearTimeout(t);
      clearTimeout(handoffTimer);
      clearTimeout(fadeTimer);
    };
  }, [isPlain, onComplete, onFadeStart, reduceMotion, totalDurationMs]);

  return (
    <div
      className={`loading-screen loading-screen--invitation${isPlain ? ' loading-screen--plain' : ''} fixed inset-0 z-50 flex flex-col overflow-hidden overscroll-none h-dvh max-h-dvh w-full${fadeOut ? ' is-fading' : ''}${reduceMotion ? ' is-reduced-motion' : ''}`}
      aria-live="polite"
      aria-busy={!fadeOut}
      aria-label="Loading invitation"
      style={
        {
          pointerEvents: fadeOut ? 'none' : 'auto',
          ...(isPlain && {
            '--ls-plain-bg': plainTheme.background,
            '--ls-plain-ink': plainTheme.text,
            '--ls-plain-accent': plainTheme.accent,
          }),
        } as React.CSSProperties
      }
    >
      {/* Photos display: the sliding photo marquee is rendered once by the page
          (invitation-page.tsx → LoaderPhotoBackdrop) behind both this screen and the
          envelope, so it carries straight on through the handoff */}

      {isPlain && (
        <>
          <PhotoBackground photos={backgroundPhotos} desktopPhotos={backgroundPhotosDesktop} />
          <GhostBackdrop src={content.ghostImage} />
          <div className="loading-screen__plain-corners" aria-hidden="true">
            {(
              [
                { src: cornerDecos.topLeft, pos: 'tl', className: 'left-0 top-0' },
                { src: cornerDecos.topRight, pos: 'tr', className: 'right-0 top-0' },
                { src: cornerDecos.bottomLeft, pos: 'bl', className: 'left-0 bottom-0' },
                { src: cornerDecos.bottomRight, pos: 'br', className: 'right-0 bottom-0' },
              ] as const
            ).filter(({ src }) => src).map(({ src, pos, className }) => (
              <div
                key={pos}
                className={`loading-screen__plain-corner-slot loading-screen__plain-corner-slot--${pos} pointer-events-none absolute ${className}`}
              >
                {/* Corners keep their original artwork colors (no tint) */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={src} alt="" className="loading-screen__plain-corner-img" />
              </div>
            ))}
          </div>
          <div className="loading-screen__plain-frame" aria-hidden="true" />
          <div className="ls-plain-glow" aria-hidden="true" />
          {/* Paper grain + rising hearts, same as the invitation sections (section-backdrop.tsx);
              no extra wash — the backdrop (photos or plain paper) already carries the tint */}
          <SectionBackdrop wash={false} overlay />
          {!reduceMotion && (
            <div className="ls-plain-motes" aria-hidden="true">
              {PLAIN_MOTES.map((m, i) => (
                <span
                  key={i}
                  className={`ls-plain-mote${m.petal ? ' ls-plain-mote--petal' : ''}`}
                  style={
                    {
                      '--x': `${m.x}%`,
                      '--size': `${m.size}px`,
                      '--dur': `${m.dur}s`,
                      '--delay': `${m.delay}s`,
                      '--drift': `${m.drift}px`,
                      '--spin': `${m.spin}deg`,
                      '--c': m.color,
                    } as React.CSSProperties
                  }
                />
              ))}
            </div>
          )}
        </>
      )}

      {/* Photos mode: soft sky wash over the photo marquee (pastel blue sky → cream → blush),
          so the photos sit back like a dreamy Regency garden behind the type */}
      {!isPlain && <div className="ls-sky-wash" aria-hidden="true" />}

      {/* Photos mode: pastel leaves falling over the photos (under the corners + text) */}
      {!isPlain && !reduceMotion && <LeafParticles />}

      {/* Photos mode: thin gold double frame around the screen, poster style */}
      {!isPlain && (
        <div className="ls-poster-frame ls-in ls-in--fade" style={{ '--ls-delay': `${pin(0)}ms` } as React.CSSProperties} aria-hidden="true">
          <span className="ls-poster-frame__gem ls-poster-frame__gem--top" />
          <span className="ls-poster-frame__gem ls-poster-frame__gem--bottom" />
        </div>
      )}

      {/* Photos mode: four corner florals (content/site.ts → loadingScreen.cornerDecos), tucked
          into the screen corners. Already in place behind the curtains — revealed as they part,
          then they just sway gently */}
      {!isPlain && (
        <div className="ls-photo-corners" aria-hidden="true">
          {(
            [
              { src: cornerDecos.topLeft, pos: 'tl', delay: 0 },
              { src: cornerDecos.topRight, pos: 'tr', delay: -2000 },
              { src: cornerDecos.bottomLeft, pos: 'bl', delay: -4000 },
              { src: cornerDecos.bottomRight, pos: 'br', delay: -6000 },
            ] as const
          )
            .filter(({ src }) => src)
            .map(({ src, pos, delay }) => (
              <span
                key={pos}
                className={`ls-photo-corner ls-photo-corner--${pos}`}
                // Sway phase offset per corner so they don't move in unison
                style={{ '--ls-delay': `${delay}ms` } as React.CSSProperties}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={encodeURI(src)} alt="" className="ls-photo-corner__img" />
              </span>
            ))}
        </div>
      )}

      <div className="loading-screen__save-date">
        <header
          className={`flex flex-col items-center w-full px-4 sm:px-6 flex-shrink-0${
            isPlain ? ' pt-10 sm:pt-14 md:pt-16' : ' ls-photo-header'
          }`}
        >
          {isPlain && plainInvite.ornament && (
            <TintedDeco
              src={plainInvite.ornament}
              className="loading-screen__plain-ornament ls-ornament-in"
              style={{ '--ls-delay': '100ms' } as React.CSSProperties}
            />
          )}
          {isPlain ? (
            <h1 className="loading-screen__std-headline ls-headline" aria-label={content.headline}>
              {headlineWords.map(({ word, script, start, breakBefore }, wi) =>
                script ? (
                  <React.Fragment key={wi}>
                  {breakBefore && <span className="ls-headline__break" aria-hidden="true" />}
                  <span
                    className="ls-headline__script"
                    aria-hidden="true"
                    style={
                      {
                        '--ls-delay': `${PLAIN_LETTER_START_MS + start * PLAIN_LETTER_STAGGER_MS}ms`,
                      } as React.CSSProperties
                    }
                  >
                    {word}
                  </span>
                  </React.Fragment>
                ) : (
                  <span key={wi} className="ls-headline__word" aria-hidden="true">
                    {Array.from(word).map((ch, ci) => (
                      <span
                        key={ci}
                        className="ls-headline__letter"
                        style={
                          {
                            '--ls-delay': `${PLAIN_LETTER_START_MS + (start + ci) * PLAIN_LETTER_STAGGER_MS}ms`,
                          } as React.CSSProperties
                        }
                      >
                        {ch}
                      </span>
                    ))}
                  </span>
                ),
              )}
            </h1>
          ) : (
            <>
            {poster.invite && (
              <p
                className="ls-poster-invite ls-in ls-in--track"
                style={{ '--ls-delay': `${pin(PHOTO_IN.invite)}ms` } as React.CSSProperties}
              >
                {poster.invite}
              </p>
            )}
            <span
              className="ls-poster-rule ls-in ls-in--line"
              style={{ '--ls-delay': `${pin(PHOTO_IN.invite + 150)}ms` } as React.CSSProperties}
              aria-hidden="true"
            />
            <h1
              className="loading-screen__std-headline ls-poster-headline ls-in ls-in--headline"
              style={{ '--ls-delay': `${pin(PHOTO_IN.headline)}ms` } as React.CSSProperties}
              aria-label={content.headline}
            >
              {/* "Save the Date" lockup: big script words, the joining word in small serif caps
                  between two hairlines */}
              {headlineWords.map(({ word, script }, wi) =>
                script ? (
                  <span key={wi} className={`${theSeasons.className} ls-poster-headline__join`} aria-hidden="true">
                    {word}
                  </span>
                ) : (
                  <span key={wi} className="ls-poster-headline__word" aria-hidden="true">
                    {word}
                  </span>
                ),
              )}
            </h1>
            <span
              className="ls-poster-flourish ls-in ls-in--line"
              style={{ '--ls-delay': `${pin(PHOTO_IN.headline + 500)}ms` } as React.CSSProperties}
              aria-hidden="true"
            />
            </>
          )}
          {isPlain && countdownText && (
            <p
              className={`loading-screen__std-kicker ${isPlain ? 'ls-reveal' : 'ls-in ls-in--track'}`}
              style={revealDelay(PHOTO_IN.kicker, 0)}
            >
              {countdownText}
            </p>
          )}
        </header>

        {isPlain && plainInvite.lineAbove && (
          <p className="loading-screen__plain-line ls-reveal" style={revealDelay(350, 200)}>
            {plainInvite.lineAbove}
          </p>
        )}

        <div
          className={`loading-screen__std-names-slot${isPlain ? ' ls-reveal' : ''}${
            !isPlain && coupleImage ? ' ls-couple-stage' : ''
          }`}
          style={isPlain ? revealDelay(0, 400) : undefined}
        >
          {/* Photos mode: the couple stands centre stage, rising and fading in from the bottom;
              their names are set over the lower part of the portrait */}
          {!isPlain && coupleImage && (
            <div
              className="ls-couple ls-couple--in"
              style={{ '--ls-delay': `${pin(PHOTO_IN.couple)}ms` } as React.CSSProperties}
              aria-hidden="true"
            >
              <span className="ls-couple__halo" />
              <span className="ls-couple__figure">
                <Image
                  src={coupleImage}
                  alt=""
                  fill
                  priority
                  className="ls-couple__img"
                  sizes="(max-width: 640px) 90vw, 520px"
                  quality={85}
                />
              </span>
            </div>
          )}
          {!isPlain && coupleImage &&
            (['left', 'right'] as const).map((side) =>
              poster.sideNotes[side] ? (
                <p
                  key={side}
                  className={`ls-poster-side ls-poster-side--${side} ls-in ls-in--fade`}
                  style={{ '--ls-delay': `${pin(PHOTO_IN.sides)}ms` } as React.CSSProperties}
                >
                  {poster.sideNotes[side]}
                </p>
              ) : null,
            )}
          {!isPlain && poster.namesLead && (
            <p
              className="ls-poster-lead ls-in ls-in--track"
              style={{ '--ls-delay': `${pin(PHOTO_IN.lead)}ms` } as React.CSSProperties}
            >
              {poster.namesLead}
            </p>
          )}
          <h2 className="loading-screen__std-names loading-screen__std-names--text" aria-label={coupleNames}>
            {/* Photos mode: groom glides in from the left, "and" blooms, bride from the right */}
            <span
              className={`${theSeasons.className} ls-names__nick${isPlain ? '' : ' ls-in ls-in--from-left'}`}
              style={isPlain ? undefined : ({ '--ls-delay': `${pin(PHOTO_IN.groom)}ms` } as React.CSSProperties)}
              aria-hidden="true"
            >
              {groomName}
            </span>
            <span
              className={`${aboveTheBeyond.className} ls-names__and${isPlain ? '' : ' ls-in ls-in--bloom'}`}
              style={isPlain ? undefined : ({ '--ls-delay': `${pin(PHOTO_IN.and)}ms` } as React.CSSProperties)}
              aria-hidden="true"
            >
              and
            </span>
            <span
              className={`${theSeasons.className} ls-names__nick${isPlain ? '' : ' ls-in ls-in--from-right'}`}
              style={isPlain ? undefined : ({ '--ls-delay': `${pin(PHOTO_IN.bride)}ms` } as React.CSSProperties)}
              aria-hidden="true"
            >
              {brideName}
            </span>
          </h2>
        </div>

        {isPlain && plainInvite.lineBelow && (
          <p className="loading-screen__plain-line ls-reveal" style={revealDelay(550, 650)}>
            {plainInvite.lineBelow}
          </p>
        )}

        {isPlain && silkDate && (
          <div className="ls-silk-date px-4 pt-1 pb-3 sm:pb-4 flex-shrink-0" role="img" aria-label={silkDate.label}>
            {/* Entry order: day rises in → month & year glide out from it → weekday draws in */}
            <p className="ls-silk-date__weekday is-visible" style={dateDelay(2)}>
              {silkDate.weekday}
            </p>
            <div className="ls-silk-date__row">
              <span className="ls-silk-date__side ls-silk-date__side--month is-visible" style={dateDelay(1)}>
                {silkDate.month}
              </span>
              <span className="ls-silk-date__day is-visible" style={dateDelay(0)}>
                {Array.from(silkDate.day).map((digit, i) => (
                  <span key={i} className="ls-silk-date__digit" style={{ '--i': i } as React.CSSProperties}>
                    <span className="ls-silk-date__digit-inner">{digit}</span>
                  </span>
                ))}
              </span>
              <span className="ls-silk-date__side ls-silk-date__side--year is-visible" style={dateDelay(1)}>
                {silkDate.year}
              </span>
            </div>
          </div>
        )}

        {/* Photos mode: the date set in type under the names — main date between gold rules,
            then weekday · ceremony time */}
        {!isPlain && silkDate && (
          <div className="ls-date-text flex-shrink-0">
            <span
              className={`${theSeasons.className} ls-date-text__main ls-in ls-in--up`}
              style={{ '--ls-delay': `${pin(PHOTO_IN.date)}ms` } as React.CSSProperties}
            >
              {weddingDate.toLocaleString('en-US', { month: 'long' })} {weddingDate.getDate()}, {silkDate.year}
            </span>
            <span
              className="ls-date-text__time ls-in ls-in--track"
              style={{ '--ls-delay': `${pin(PHOTO_IN.date + PHOTO_IN.dateStagger)}ms` } as React.CSSProperties}
            >
              {silkDate.weekday}
              {ceremonyLine && (
                <>
                  <span className="ls-date-text__dot" aria-hidden="true" />
                  {ceremonyLine}
                </>
              )}
            </span>
            {siteConfig.ceremony.location && (
              <span
                className="ls-date-text__venue ls-in ls-in--fade"
                style={{ '--ls-delay': `${pin(PHOTO_IN.date + PHOTO_IN.dateStagger * 2)}ms` } as React.CSSProperties}
              >
                {siteConfig.ceremony.location}
                {siteConfig.ceremony.venue && <span className="ls-date-text__venue-sub">{siteConfig.ceremony.venue}</span>}
              </span>
            )}
          </div>
        )}

        <footer
          className={`loading-screen__std-footer flex flex-col items-center w-full pt-1 px-6 flex-shrink-0${isPlain ? '' : ' ls-photo-footer'}`}
        >
          {/* Photos mode: countdown under the date */}
          {!isPlain && countdownText && (
            <p
              className="loading-screen__std-kicker ls-poster-countdown ls-in ls-in--up"
              style={{ '--ls-delay': `${pin(PHOTO_IN.kicker)}ms` } as React.CSSProperties}
            >
              {countdownText}
            </p>
          )}
          {isPlain && content.showCeremonyDetails &&
            (ceremonyLine || siteConfig.ceremony.location || siteConfig.ceremony.venue) && (
            <div className="loading-screen__std-venue ls-reveal" style={revealDelay(900, 3200)}>
              {ceremonyLine && <span className="loading-screen__std-venue-time">{ceremonyLine}</span>}
              {siteConfig.ceremony.location && (
                <span className="loading-screen__std-venue-name">{siteConfig.ceremony.location}</span>
              )}
              {siteConfig.ceremony.venue && (
                <span className="loading-screen__std-venue-address">{siteConfig.ceremony.venue}</span>
              )}
            </div>
          )}
          <div
            className={`loading-screen__std-rule${isPlain ? '' : ' ls-in ls-in--line'}`}
            style={isPlain ? undefined : ({ '--ls-delay': `${pin(PHOTO_IN.rule)}ms` } as React.CSSProperties)}
            aria-hidden="true"
          />
          {statusMessages.length > 0 && (
            <p
              key={statusIndex}
              className="loading-screen__std-status"
              // Photos mode: the first message waits its turn in the entrance; later ones swap in right away
              style={!isPlain && statusIndex === 0 ? { animationDelay: `${pin(PHOTO_IN.status)}ms` } : undefined}
            >
              {statusMessages[statusIndex]}
            </p>
          )}
          <div
            className={`w-full max-w-[200px] sm:max-w-xs mx-auto${isPlain ? '' : ' ls-in ls-in--fade'}`}
            style={isPlain ? undefined : ({ '--ls-delay': `${pin(PHOTO_IN.progress)}ms` } as React.CSSProperties)}
            role="progressbar"
            aria-label="Loading invitation"
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <div className="loading-screen__std-track">
              <div
                className="loading-screen__std-bar"
                style={{ animationDuration: `${totalDurationMs}ms` }}
              />
              {isPlain && (
                <span
                  className="ls-plain-progress-glow"
                  style={{ animationDuration: `${totalDurationMs}ms` }}
                  aria-hidden="true"
                />
              )}
            </div>
            {/* Photos mode: percentage counting up in step with the bar (CSS-animated) */}
            {!isPlain && (
              <span
                className="ls-progress-pct"
                style={{ animationDuration: `${totalDurationMs}ms` }}
                aria-hidden="true"
              />
            )}
          </div>
        </footer>
      </div>

      {/* Opening curtains (photos mode): pastel-blue (#90E3F4) silk drapes hung in folds part from the
          centre — inner folds are pulled first and travel furthest, gathering toward the
          wings — then slide off and dissolve. Pure CSS, so they open on first paint. */}
      {renderCurtains && (
        <div ref={curtainsRef} className="ls-curtains" aria-hidden="true">
          {(['left', 'right'] as const).map((side) => (
            <div key={side} className={`ls-curtain ls-curtain--${side}`}>
              {Array.from({ length: CURTAIN_FOLDS }, (_, i) => (
                <span
                  key={i}
                  className="ls-curtain__fold"
                  style={{ '--i': i, '--inner': CURTAIN_FOLDS - 1 - i } as React.CSSProperties}
                />
              ))}
            </div>
          ))}
          <span className="ls-curtains__seam" />
        </div>
      )}
    </div>
  );
};
