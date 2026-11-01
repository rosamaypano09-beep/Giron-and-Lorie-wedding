"use client"

import Image from "next/image"

// Stacked photos that cross-fade to `active`; the showing photo slowly zooms in.
// Every photo loads up front so the next one is ready before it fades in.
export function CrossfadeImages({
  images,
  active,
  sizes,
  alt,
  className = "object-cover",
  reduceMotion = false,
  fadeMs = 1600,
  zoomMs = 7000,
}: {
  images: readonly string[]
  active: number
  sizes: string
  alt: string
  className?: string
  reduceMotion?: boolean | null
  fadeMs?: number
  zoomMs?: number
}) {
  return (
    <div className="absolute inset-0">
      {images.map((src, i) => {
        const isActive = i === active
        return (
          <div
            key={src}
            className="absolute inset-0 ease-in-out"
            style={{
              opacity: isActive ? 1 : 0,
              transitionProperty: "opacity",
              transitionDuration: reduceMotion ? "0ms" : `${fadeMs}ms`,
            }}
            aria-hidden={!isActive}
          >
            <Image
              src={src}
              alt={isActive ? alt : ""}
              fill
              sizes={sizes}
              priority={i === 0}
              loading={i === 0 ? undefined : "eager"}
              className={`${className} ease-out`}
              style={{
                transform: isActive && !reduceMotion ? "scale(1.08)" : "scale(1)",
                transitionProperty: "transform",
                transitionDuration: reduceMotion ? "0ms" : `${zoomMs + fadeMs}ms`,
              }}
            />
          </div>
        )
      })}
    </div>
  )
}
