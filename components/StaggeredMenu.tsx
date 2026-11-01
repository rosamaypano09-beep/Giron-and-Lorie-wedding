import React, { useCallback, useLayoutEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';

export interface StaggeredMenuItem {
  label: string;
  ariaLabel: string;
  link: string;
}
export interface StaggeredMenuSocialItem {
  label: string;
  link: string;
}
export interface StaggeredMenuProps {
  position?: 'left' | 'right';
  colors?: string[];
  items?: StaggeredMenuItem[];
  socialItems?: StaggeredMenuSocialItem[];
  displaySocials?: boolean;
  className?: string;
  menuButtonColor?: string;
  openMenuButtonColor?: string;
  accentColor?: string;
  isFixed: boolean;
  /** Link of the section currently on screen — highlighted in the menu */
  activeLink?: string;
  changeMenuColorOnOpen?: boolean;
  onMenuOpen?: () => void;
  onMenuClose?: () => void;
}

// Colors sourced from globals.css @theme inline — edit there to update everywhere
const HERO_ACCENT = 'var(--color-motif-accent)';
const MENU_PANEL_BG =
  'radial-gradient(120% 45% at 0% 0%, color-mix(in srgb, var(--color-motif-blue) 55%, transparent) 0%, transparent 70%), radial-gradient(110% 40% at 100% 100%, color-mix(in srgb, var(--color-motif-pink) 45%, transparent) 0%, transparent 70%), linear-gradient(175deg, #FFFFFF 0%, var(--color-motif-soft) 55%, color-mix(in srgb, var(--color-motif-violet) 35%, white) 100%)';
const MENU_TEXT = 'var(--color-welcome-navy)';
const MENU_TEXT_MUTED = 'var(--color-welcome-heading)';

// Symbols such as "&" are set in an italic serif so they read as ornaments
// instead of the display face's plain glyph.
function renderLabel(label: string) {
  return label.split(/([^A-Za-z0-9\s])/).map((part, i) =>
    /^[^A-Za-z0-9\s]$/.test(part) ? (
      <span key={i} className="sm-panel-symbol">
        {part}
      </span>
    ) : (
      part
    )
  );
}

export const StaggeredMenu: React.FC<StaggeredMenuProps> = ({
  position = 'right',
  colors = [MENU_PANEL_BG, MENU_PANEL_BG, MENU_PANEL_BG, MENU_PANEL_BG],
  items = [],
  socialItems = [],
  displaySocials = true,
  className,
  menuButtonColor = HERO_ACCENT,
  openMenuButtonColor = MENU_TEXT,
  changeMenuColorOnOpen = true,
  accentColor = HERO_ACCENT,
  isFixed = false,
  activeLink,
  onMenuOpen,
  onMenuClose
}: StaggeredMenuProps) => {
  const [open, setOpen] = useState(false);
  const openRef = useRef(false);

  const panelRef = useRef<HTMLDivElement | null>(null);
  const preLayersRef = useRef<HTMLDivElement | null>(null);
  const preLayerElsRef = useRef<HTMLElement[]>([]);

  const lineTopRef = useRef<HTMLSpanElement | null>(null);
  const lineMidRef = useRef<HTMLSpanElement | null>(null);
  const lineBottomRef = useRef<HTMLSpanElement | null>(null);

  const openTlRef = useRef<gsap.core.Timeline | null>(null);
  const closeTweenRef = useRef<gsap.core.Tween | null>(null);
  const iconAnimRef = useRef<gsap.core.Timeline | null>(null);
  const colorTweenRef = useRef<gsap.core.Tween | null>(null);

  const toggleBtnRef = useRef<HTMLButtonElement | null>(null);
  const busyRef = useRef(false);

  const itemEntranceTweenRef = useRef<gsap.core.Tween | null>(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const panel = panelRef.current;
      const preContainer = preLayersRef.current;
      const lineTop = lineTopRef.current;
      const lineMid = lineMidRef.current;
      const lineBottom = lineBottomRef.current;

      if (!panel || !lineTop || !lineMid || !lineBottom) return;

      let preLayers: HTMLElement[] = [];
      if (preContainer) {
        preLayers = Array.from(preContainer.querySelectorAll('.sm-prelayer')) as HTMLElement[];
      }
      preLayerElsRef.current = preLayers;

      const offscreen = position === 'left' ? -100 : 100;
      gsap.set([panel, ...preLayers], { xPercent: offscreen });

      gsap.set(lineTop, { y: -5, rotation: 0, transformOrigin: '50% 50%' });
      gsap.set(lineMid, { y: 0, rotation: 0, opacity: 1, scaleX: 1, transformOrigin: '50% 50%' });
      gsap.set(lineBottom, { y: 5, rotation: 0, transformOrigin: '50% 50%' });

      if (toggleBtnRef.current) gsap.set(toggleBtnRef.current, { color: menuButtonColor });
    });
    return () => ctx.revert();
  }, [menuButtonColor, position]);

  const buildOpenTimeline = useCallback(() => {
    const panel = panelRef.current;
    const layers = preLayerElsRef.current;
    if (!panel) return null;

    openTlRef.current?.kill();
    if (closeTweenRef.current) {
      closeTweenRef.current.kill();
      closeTweenRef.current = null;
    }
    itemEntranceTweenRef.current?.kill();

    const itemEls = Array.from(panel.querySelectorAll('.sm-panel-itemLabel')) as HTMLElement[];
    const socialTitle = panel.querySelector('.sm-socials-title') as HTMLElement | null;
    const socialLinks = Array.from(panel.querySelectorAll('.sm-socials-link')) as HTMLElement[];

    const layerStates = layers.map(el => ({ el, start: Number(gsap.getProperty(el, 'xPercent')) }));
    const panelStart = Number(gsap.getProperty(panel, 'xPercent'));

    if (itemEls.length) gsap.set(itemEls, { y: 14, opacity: 0 });
    if (socialTitle) gsap.set(socialTitle, { opacity: 0 });
    if (socialLinks.length) gsap.set(socialLinks, { y: 25, opacity: 0 });

    const tl = gsap.timeline({ paused: true });

    layerStates.forEach((ls, i) => {
      tl.fromTo(ls.el, { xPercent: ls.start }, { xPercent: 0, duration: 0.45, ease: 'power3.out' }, i * 0.06);
    });

    const lastTime = layerStates.length ? (layerStates.length - 1) * 0.07 : 0;
    const panelInsertTime = lastTime + (layerStates.length ? 0.08 : 0);
    const panelDuration = 0.55;

    tl.fromTo(
      panel,
      { xPercent: panelStart },
      { xPercent: 0, duration: panelDuration, ease: 'power3.out' },
      panelInsertTime
    );

    if (itemEls.length) {
      const itemsStartRatio = 0.35;
      const itemsStart = panelInsertTime + panelDuration * itemsStartRatio;

      tl.to(
        itemEls,
        { y: 0, opacity: 1, duration: 0.6, ease: 'power2.out', stagger: { each: 0.045, from: 'start' } },
        itemsStart
      );
    }

    if (socialTitle || socialLinks.length) {
      const socialsStart = panelInsertTime + panelDuration * 0.4;

      if (socialTitle) tl.to(socialTitle, { opacity: 1, duration: 0.5, ease: 'power2.out' }, socialsStart);
      if (socialLinks.length) {
        tl.to(
          socialLinks,
          {
            y: 0,
            opacity: 1,
            duration: 0.55,
            ease: 'power3.out',
            stagger: { each: 0.08, from: 'start' },
            onComplete: () => {
              gsap.set(socialLinks, { clearProps: 'opacity' });
            }
          },
          socialsStart + 0.04
        );
      }
    }

    openTlRef.current = tl;
    return tl;
  }, [position]);

  const playOpen = useCallback(() => {
    if (busyRef.current) return;
    busyRef.current = true;
    const tl = buildOpenTimeline();
    if (tl) {
      tl.eventCallback('onComplete', () => {
        busyRef.current = false;
      });
      tl.play(0);
    } else {
      busyRef.current = false;
    }
  }, [buildOpenTimeline]);

  const playClose = useCallback(() => {
    openTlRef.current?.kill();
    openTlRef.current = null;
    itemEntranceTweenRef.current?.kill();

    const panel = panelRef.current;
    const layers = preLayerElsRef.current;
    if (!panel) return;

    const all: HTMLElement[] = [...layers, panel];
    closeTweenRef.current?.kill();

    const offscreen = position === 'left' ? -100 : 100;

    closeTweenRef.current = gsap.to(all, {
      xPercent: offscreen,
      duration: 0.32,
      ease: 'power3.in',
      overwrite: 'auto',
      onComplete: () => {
        const itemEls = Array.from(panel.querySelectorAll('.sm-panel-itemLabel')) as HTMLElement[];
        if (itemEls.length) gsap.set(itemEls, { y: 14, opacity: 0 });

        const socialTitle = panel.querySelector('.sm-socials-title') as HTMLElement | null;
        const socialLinks = Array.from(panel.querySelectorAll('.sm-socials-link')) as HTMLElement[];
        if (socialTitle) gsap.set(socialTitle, { opacity: 0 });
        if (socialLinks.length) gsap.set(socialLinks, { y: 25, opacity: 0 });

        busyRef.current = false;
      }
    });
  }, [position]);


  const animateColor = useCallback(
    (opening: boolean) => {
      const btn = toggleBtnRef.current;
      if (!btn) return;
      colorTweenRef.current?.kill();
      if (changeMenuColorOnOpen) {
        const targetColor = opening ? openMenuButtonColor : menuButtonColor;
        colorTweenRef.current = gsap.to(btn, { color: targetColor, delay: 0.18, duration: 0.3, ease: 'power2.out' });
      } else {
        gsap.set(btn, { color: menuButtonColor });
      }
    },
    [openMenuButtonColor, menuButtonColor, changeMenuColorOnOpen]
  );

  React.useEffect(() => {
    if (toggleBtnRef.current) {
      if (changeMenuColorOnOpen) {
        const targetColor = openRef.current ? openMenuButtonColor : menuButtonColor;
        gsap.set(toggleBtnRef.current, { color: targetColor });
      } else {
        gsap.set(toggleBtnRef.current, { color: menuButtonColor });
      }
    }
  }, [changeMenuColorOnOpen, menuButtonColor, openMenuButtonColor]);

  const animateIcon = useCallback((opening: boolean) => {
    const top = lineTopRef.current;
    const mid = lineMidRef.current;
    const bottom = lineBottomRef.current;
    if (!top || !mid || !bottom) return;

    iconAnimRef.current?.kill();

    const tl = gsap.timeline();
    iconAnimRef.current = tl;

    if (opening) {
      tl.to(top, { y: 0, rotation: 45, duration: 0.35, ease: 'power2.inOut' }, 0)
        .to(mid, { opacity: 0, scaleX: 0, duration: 0.2, ease: 'power2.in' }, 0)
        .to(bottom, { y: 0, rotation: -45, duration: 0.35, ease: 'power2.inOut' }, 0);
    } else {
      tl.to(top, { y: -5, rotation: 0, duration: 0.35, ease: 'power2.inOut' }, 0)
        .to(bottom, { y: 5, rotation: 0, duration: 0.35, ease: 'power2.inOut' }, 0)
        .to(mid, { opacity: 1, scaleX: 1, duration: 0.25, ease: 'power2.out' }, 0.12);
    }
  }, []);

  const toggleMenu = useCallback(() => {
    const target = !openRef.current;
    openRef.current = target;
    setOpen(target);

    if (target) {
      onMenuOpen?.();
      playOpen();
    } else {
      onMenuClose?.();
      playClose();
    }

    animateColor(target);
    animateIcon(target);
  }, [playOpen, playClose, animateColor, animateIcon, onMenuOpen, onMenuClose]);

  const handleItemClick = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>, link: string) => {
      // If it's an in-page anchor, smooth scroll to the element
      if (link && link.startsWith('#')) {
        e.preventDefault();
        const targetId = link.slice(1);
        const el = typeof document !== 'undefined' ? document.getElementById(targetId) : null;
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
          // Optionally update the URL hash without jumping
          if (typeof history !== 'undefined') {
            history.replaceState(null, '', link);
          }
        }
      }

      // Close the menu after any click
      if (openRef.current) {
        openRef.current = false;
        setOpen(false);
        onMenuClose?.();
        playClose();
        animateColor(false);
        animateIcon(false);
      }
    },
    [onMenuClose, playClose, animateColor, animateIcon]
  );

  const toggleButton = (
    <button
      ref={toggleBtnRef}
      className="sm-toggle relative inline-flex items-center justify-center bg-transparent border-0 cursor-pointer font-medium leading-none overflow-visible pointer-events-auto"
      style={{ color: open ? openMenuButtonColor : menuButtonColor }}
      aria-label={open ? 'Close menu' : 'Open menu'}
      aria-expanded={open}
      aria-controls="staggered-menu-panel"
      onClick={toggleMenu}
      type="button"
    >
      <span className="sm-icon" aria-hidden="true">
        <span ref={lineTopRef} className="sm-icon-line sm-line-top" />
        <span ref={lineMidRef} className="sm-icon-line sm-line-mid" />
        <span ref={lineBottomRef} className="sm-icon-line sm-line-bottom" />
      </span>
    </button>
  );

  return (
    <>
      {isFixed ? (
        <div
          className={(className ? className + ' ' : '') + 'sm-toggle-host relative z-[60] flex items-center justify-center'}
          data-open={open || undefined}
        >
          {toggleButton}
        </div>
      ) : null}
      <div
        className={`sm-scope ${isFixed ? 'fixed top-0 left-0 w-screen h-screen overflow-hidden' : 'w-full h-full'} ${open ? 'pointer-events-auto' : 'pointer-events-none'}`}
        data-open={open || undefined}
      >
      <div
        className="staggered-menu-wrapper relative w-full h-full z-40"
        style={accentColor ? ({ ['--sm-accent' as any]: accentColor } as React.CSSProperties) : undefined}
        data-position={position}
        data-open={open || undefined}
        aria-hidden={!open}
      >
        {/* Dimmed strip beside the panel; tap it to close */}
        <div
          className="sm-backdrop absolute inset-0 z-[4]"
          aria-hidden="true"
          onClick={() => {
            if (openRef.current) toggleMenu();
          }}
        />
        <div
          ref={preLayersRef}
          className="sm-prelayers absolute top-0 right-0 bottom-0 pointer-events-none z-[5]"
          aria-hidden="true"
        >
          {(() => {
            const raw =
              colors && colors.length
                ? colors.slice(0, 4)
                : [
                    'var(--color-motif-silver)',
                    'var(--color-motif-blush)',
                    'var(--color-motif-medium)',
                    'var(--color-motif-soft)',
                  ];
            let arr = [...raw];
            if (arr.length >= 3) {
              const mid = Math.floor(arr.length / 2);
              arr.splice(mid, 1);
            }
            return arr.map((c, i) => (
              <div
                key={i}
                className="sm-prelayer absolute top-0 right-0 h-full w-full translate-x-0"
                style={{ background: c }}
              />
            ));
          })()}
        </div>

        {!isFixed ? (
          <header
            className="staggered-menu-header absolute top-0 left-0 w-full flex items-center justify-end p-[2em] bg-transparent pointer-events-none z-20"
            aria-label="Main navigation header"
          >
            {toggleButton}
          </header>
        ) : null}

        <aside
          id="staggered-menu-panel"
          ref={panelRef}
          className="staggered-menu-panel absolute top-0 right-0 h-full flex flex-col p-[6em_2em_2em_2em] overflow-y-auto z-10"
          style={{ background: MENU_PANEL_BG, WebkitBackdropFilter: 'blur(12px)' }}
          aria-hidden={!open}
        >
          <div className="sm-panel-inner flex-1 flex flex-col gap-6">
            <ul
              className="sm-panel-list list-none m-0 p-0 flex flex-col gap-2"
              role="list"
            >
              {items && items.length ? (
                items.map((it, idx) => (
                  <li className="sm-panel-itemWrap relative overflow-hidden leading-none" key={it.label + idx}>
                    <a
                      className="sm-panel-item relative cursor-pointer inline-block no-underline"
                      style={{ color: activeLink === it.link ? 'var(--sm-accent, var(--color-motif-accent))' : MENU_TEXT }}
                      aria-current={activeLink === it.link ? 'location' : undefined}
                      data-active={activeLink === it.link || undefined}
                      href={it.link}
                      onClick={(e) => handleItemClick(e, it.link)}
                      aria-label={it.ariaLabel}
                    >
                      <span className="sm-panel-itemLabel inline-block will-change-transform">
                        {renderLabel(it.label)}
                      </span>
                    </a>
                  </li>
                ))
              ) : (
                <li className="sm-panel-itemWrap relative overflow-hidden leading-none" aria-hidden="true">
                    <span className="sm-panel-item relative font-semibold text-[4rem] cursor-pointer leading-none tracking-[-2px] uppercase transition-[background,color] duration-150 ease-linear inline-block no-underline pr-[1.4em]" style={{ color: MENU_TEXT }}>
                    <span className="sm-panel-itemLabel inline-block [transform-origin:50%_100%] will-change-transform">
                      No items
                    </span>
                  </span>
                </li>
              )}
            </ul>

            {displaySocials && socialItems && socialItems.length > 0 && (
              <div className="sm-socials mt-auto pt-8 flex flex-col gap-3" aria-label="Social links">
                <h3 className="sm-socials-title m-0 text-base font-medium" style={{ color: MENU_TEXT_MUTED }}>
                  Socials
                </h3>
                <ul
                  className="sm-socials-list list-none m-0 p-0 flex flex-row items-center gap-5 flex-wrap"
                  role="list"
                >
                  {socialItems.map((s, i) => (
                    <li key={s.label + i} className="sm-socials-item">
                      <a
                        href={s.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="sm-socials-link font-medium no-underline relative inline-block py-[2px] transition-[color,opacity] duration-300 ease-linear"
                        style={{ color: MENU_TEXT }}
                        onClick={(e) => handleItemClick(e, s.link)}
                      >
                        {s.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </aside>
      </div>

      <style>{`
.sm-scope .staggered-menu-wrapper { position: relative; width: 100%; height: 100%; z-index: 40; }
.sm-scope:not([data-open]) { z-index: 0; pointer-events: none; }
.sm-scope[data-open] { z-index: 60; pointer-events: auto; }
.sm-scope:not([data-open]) .staggered-menu-panel { pointer-events: none; visibility: hidden; }
.sm-scope:not([data-open]) .sm-prelayers { pointer-events: none; visibility: hidden; }
.sm-scope[data-open] .staggered-menu-panel { pointer-events: auto; visibility: visible; }
.sm-scope[data-open] .sm-panel-item { pointer-events: auto; }
.sm-toggle-host { display: flex; align-items: center; justify-content: center; }
.sm-toggle-host[data-open] { position: relative; z-index: 70; }
.sm-scope .staggered-menu-header { position: absolute; top: 0; left: 0; width: 100%; display: flex; align-items: center; justify-content: flex-end; padding: 2em; background: transparent; pointer-events: none; z-index: 20; }
.sm-scope .staggered-menu-header > * { pointer-events: auto; }
.sm-scope .sm-toggle, .sm-toggle-host .sm-toggle { position: relative; display: inline-flex; align-items: center; justify-content: center; width: 2.75rem; height: 2.75rem; margin-right: 0.15rem; background: transparent; border: none; cursor: pointer; color: var(--color-motif-soft); font-weight: 500; line-height: 1; overflow: visible; }
.sm-toggle-host .sm-icon { position: relative; width: 22px; height: 16px; flex: 0 0 22px; display: inline-flex; align-items: center; justify-content: center; will-change: transform; }
.sm-toggle-host .sm-icon-line { position: absolute; left: 50%; top: 50%; width: 100%; height: 2px; background: currentColor; border-radius: 2px; transform: translate(-50%, -50%); will-change: transform, opacity; }
.sm-scope .sm-toggle:focus-visible { outline: 2px solid var(--color-motif-accent); outline-offset: 4px; border-radius: 4px; }
.sm-scope .sm-icon { position: relative; width: 22px; height: 16px; flex: 0 0 22px; display: inline-flex; align-items: center; justify-content: center; will-change: transform; }
.sm-scope .sm-panel-itemWrap { position: relative; overflow: hidden; line-height: 1; }
.sm-scope .sm-icon-line { position: absolute; left: 50%; top: 50%; width: 100%; height: 2px; background: currentColor; border-radius: 2px; transform: translate(-50%, -50%); will-change: transform, opacity; }
.sm-scope .staggered-menu-panel { position: absolute; top: 0; right: 0; width: clamp(260px, 38vw, 420px); height: 100%; background: var(--color-motif-soft); backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px); display: flex; flex-direction: column; padding: 6.5em 2.25em 2.25em 2.25em; overflow-y: auto; z-index: 10; border-left: 1px solid color-mix(in srgb, var(--color-motif-medium) 55%, transparent); }
.sm-scope [data-position='left'] .staggered-menu-panel { border-left: none; border-right: 1px solid rgb(255 255 255 / 80%); box-shadow: 18px 0 40px -18px color-mix(in srgb, var(--color-welcome-navy) 45%, transparent); }
.sm-scope [data-position='left'] .staggered-menu-panel { right: auto; left: 0; }
.sm-scope .sm-prelayers { position: absolute; top: 0; right: 0; bottom: 0; width: clamp(260px, 38vw, 420px); pointer-events: none; z-index: 5; }
.sm-scope [data-position='left'] .sm-prelayers { right: auto; left: 0; }
.sm-scope .sm-prelayer { position: absolute; top: 0; right: 0; height: 100%; width: 100%; transform: translateX(0); }
.sm-scope .sm-panel-inner { flex: 1; display: flex; flex-direction: column; gap: 0.85rem; }
.sm-scope .sm-socials { margin-top: auto; padding-top: 2rem; display: flex; flex-direction: column; gap: 1rem; }
.sm-scope .sm-socials-title { margin: 0; font-size: 1.05rem; font-weight: 500; color: var(--sm-accent, var(--color-motif-accent)); }
.sm-scope .sm-socials-list { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: row; align-items: center; gap: 1.25rem; flex-wrap: wrap; }
.sm-scope .sm-socials-list .sm-socials-link { opacity: 1; transition: opacity 0.3s ease; }
.sm-scope .sm-socials-list:hover .sm-socials-link:not(:hover) { opacity: 0.35; }
.sm-scope .sm-socials-list:focus-within .sm-socials-link:not(:focus-visible) { opacity: 0.35; }
.sm-scope .sm-socials-list .sm-socials-link:hover,
.sm-scope .sm-socials-list .sm-socials-link:focus-visible { opacity: 1; }
.sm-scope .sm-socials-link:focus-visible { outline: 2px solid var(--sm-accent, var(--color-motif-accent)); outline-offset: 3px; }
.sm-scope .sm-socials-link { font-size: 1rem; font-weight: 500; color: var(--color-motif-deep); text-decoration: none; position: relative; padding: 2px 0; display: inline-block; transition: color 0.3s ease, opacity 0.3s ease; }
@media (min-width: 640px) { .sm-scope .sm-socials-link { font-size: 1.05rem; } }
@media (min-width: 768px) { .sm-scope .sm-socials-link { font-size: 1.1rem; } }
@media (min-width: 1024px) { .sm-scope .sm-socials-link { font-size: 1.25rem; } }
.sm-scope .sm-socials-link:hover { color: var(--sm-accent, var(--color-motif-accent)); }
.sm-scope .sm-panel-title { margin: 0; font-size: 1rem; font-weight: 600; color: var(--color-motif-deep); text-transform: uppercase; }
.sm-scope .sm-panel-inner { gap: 0; }
.sm-scope .sm-panel-inner::before,
.sm-scope .sm-panel-inner::after { content: none; }
/* Single column; type and spacing follow the screen height so all links fit on an iPhone SE (375×667) */
.sm-scope .sm-panel-list { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 0; }
.sm-scope .sm-panel-itemWrap { overflow: hidden; }
.sm-scope .sm-panel-item { position: relative; color: var(--color-welcome-navy); font-family: 'The Seasons', 'SortsMillGoudy', Georgia, serif; font-weight: 400; font-size: clamp(1rem, 2.9vh, 1.6rem); line-height: 1.2; letter-spacing: 0.01em; text-transform: none; cursor: pointer; display: inline-block; max-width: 100%; text-decoration: none; padding: clamp(0.2rem, 0.9vh, 0.55rem) 0; white-space: nowrap; transition: color 0.3s ease; }
.sm-scope .sm-panel-itemLabel { display: inline-block; will-change: transform, opacity; }
/* "&" and other symbols: italic serif in sage */
.sm-scope .sm-panel-symbol { font-family: 'SortsMillGoudy', Georgia, 'Times New Roman', serif; font-style: italic; color: #B8914A; padding: 0 0.04em; }
.sm-scope .sm-panel-item:hover { color: var(--sm-accent, var(--color-motif-accent)); }
/* Sage hairline that draws in under the hovered / current item */
.sm-scope .sm-panel-item::before { content: ''; position: absolute; left: 0; bottom: 0.2em; height: 2px; width: 0; border-radius: 2px; background: linear-gradient(90deg, var(--color-motif-blue), var(--color-motif-violet), var(--color-motif-pink)); transition: width 0.35s ease; }
.sm-scope .sm-panel-item:hover::before, .sm-scope .sm-panel-item[data-active]::before { width: 100%; }
.sm-scope .sm-panel-item[data-active] { padding-left: 0.9em; }
.sm-scope .sm-panel-item[data-active]::after { content: ''; position: absolute; left: 0; top: 50%; width: 0.38em; height: 0.38em; border-radius: 50%; transform: translateY(-50%); background: var(--sm-accent, var(--color-motif-accent)); box-shadow: 0 0 0 3px color-mix(in srgb, var(--color-motif-blue) 70%, transparent); }
/* Backdrop beside the panel */
.sm-scope .sm-backdrop { background: color-mix(in srgb, var(--color-welcome-navy) 35%, transparent); -webkit-backdrop-filter: blur(3px); backdrop-filter: blur(3px); opacity: 0; transition: opacity 0.35s ease; pointer-events: none; }
.sm-scope[data-open] .sm-backdrop { opacity: 1; pointer-events: auto; }
@media (prefers-reduced-motion: reduce) { .sm-scope .sm-panel-item::before, .sm-scope .sm-backdrop { transition: none; } }
@media (max-width: 1024px) { .sm-scope .staggered-menu-panel, .sm-scope .sm-prelayers { width: min(calc(100% - 4rem), 26rem); left: 0; right: auto; } .sm-scope .staggered-menu-wrapper[data-open] .sm-logo-img { filter: invert(100%); } }
@media (max-width: 640px) {
  .sm-scope .staggered-menu-header { padding: 1rem; }
  .sm-scope .staggered-menu-panel { padding: 3.75rem 1.5rem calc(1rem + env(safe-area-inset-bottom, 0px)) 1.5rem; }
  .sm-scope .staggered-menu-wrapper[data-open] .sm-logo-img { filter: invert(100%); }
}
      `}</style>
      </div>
    </>
  );
};

export default StaggeredMenu;
