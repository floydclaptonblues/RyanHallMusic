# Preview Test Report — Homepage Revision 3

Tested before GoDaddy deployment on July 13, 2026.

## Revision completed

- Replaced the generated coastline homepage with Ryan's **The Deep End of Time** video as the full-screen background.
- Created a 1272×720 desktop background encode and a 720×1280 mobile presentation that preserves the complete widescreen composition against black rather than cropping away the principal imagery.
- Removed audio from both background-only encodes; the complete video with sound remains available in the Videos section.
- Added muted, looping, inline autoplay behavior with a restrained Play/Pause control.
- Retained the drifting, non-clickable photographic memories above the film.
- Added a poster-frame fallback and reduced-motion behavior.
- Preserved the unboxed Chicago Classic / MS DOT Gothic 16 navigation treatment.

## Automated checks passed

- JavaScript syntax validation
- Internal HTML asset-reference validation
- Desktop and mobile layout rendering with no horizontal overflow
- Browser decoding and muted autoplay of both background encodes
- Desktop source selection: H.264, 1272×720, 227.3 seconds
- Mobile source selection: H.264, 721×1280, 227.3 seconds
- Both background encodes contain no audio stream
- Homepage photographs contain no links and remain under `pointer-events: none`
- Pause/play state control and poster fallback are present
- All original music, video, picture, song-detail, and contact files remain present

## Review-image note

The supplied review images use a representative frame from the background video so the layout can be judged deterministically. The local preview plays the actual film.

## Deliberately unfinished before public deployment

- Final contact address or form destination
- Ryan's creation notes and credits for each recording
- Final decision about which supplied recordings and videos should be public
- Final social/press links, if any
- Exact Chicago Classic rendering on devices that do not already have the font installed; the site requests Chicago Classic and MS DOT Gothic 16 locally and uses DotGothic16 as the web fallback.

## Deployment status

Not deployed. This remains a local review build only.
