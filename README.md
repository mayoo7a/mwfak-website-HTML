# Marah — Medical Exams, Made Simple

مرح — منصة الفحوصات الطبية الرقمية للسوق السعودي.

A homepage prototype for Marah, a Saudi healthtech platform for booking and managing official medical exams (driving license, residency, municipality, occupational health). Built as a static single-page site, no build step required.

## Live preview

Once GitHub Pages is enabled on this repo, the site is at:

`https://YOUR-USERNAME.github.io/REPO-NAME/`

- English homepage: the default URL above.
- Arabic homepage (RTL, Saudi/Gulf register): append `/ar.html`.

The language switcher pill in the top-right of the nav (`عربي` / `EN`) links the two.

## What's in this folder

| Path | What it is |
|---|---|
| `index.html` | Homepage (English). Same content as `index13.html`, copied so GitHub Pages serves it as the default. |
| `index13.html` | The original English homepage filename — kept for direct linking. |
| `ar.html` | Full Arabic version with `dir="rtl"`, mirrored layout, and Saudi-register copy. |
| `Fonts/` | LamaSans (brand typeface) + weights and italics, .otf files. |
| `logos/` | Partner-ticker logos (.svg). |
| `logo.svg`, `character.svg`, `character3.svg`, `profile icon.svg`, `icons and vector visuals.svg` | Brand marks, mascot, profile placeholder, and the icon sprite sheet referenced by the CSS. |
| `img1.jpg`, `img2.jpg`, `img3.jpg`, `clients-logos.png` | Hero overlap-circle images and trust strip. |
| `.nojekyll` | Tells GitHub Pages to serve files as-is (no Jekyll processing). |

## How to give feedback

Open the live URL on desktop and on a phone. Things that are useful to flag:

- **Copy** — anything that reads off in either language.
- **Layout** — anything that looks misaligned, especially when comparing the EN and AR versions side by side. They should be pixel-for-pixel mirrored.
- **Animations** — the typewriter words in the hero, the "لماذا مرح" / "Why Marah" sticky scroll cards, and the services hover. Note anything that feels jittery or wrong-direction.
- **Mobile** — the layout collapses to single-column under 880px. Flag anything that breaks at common phone widths.

Thanks for taking a look.
