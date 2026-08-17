# MCM Storybook design QA — 2026-08-17

## Comparison target

- Source visual truth:
  - Home: `/var/folders/20/w2djl2qn53l346lngj2snjzw0000gn/T/TemporaryItems/NSIRD_screencaptureui_CtAA4U/스크린샷 2026-08-17 오후 10.31.33.png`
  - Product story timeline: `/var/folders/20/w2djl2qn53l346lngj2snjzw0000gn/T/TemporaryItems/NSIRD_screencaptureui_ZPx2Xk/스크린샷 2026-08-17 오후 10.34.26.png`
  - Authentication panel: `/var/folders/20/w2djl2qn53l346lngj2snjzw0000gn/T/TemporaryItems/NSIRD_screencaptureui_3zELAa/스크린샷 2026-08-17 오후 10.46.15.png`
  - Pattern motif reference: `/var/folders/20/w2djl2qn53l346lngj2snjzw0000gn/T/TemporaryItems/NSIRD_screencaptureui_SQVgYq/스크린샷 2026-08-17 오후 10.43.13.png`
- Implementation routes: `/home`, `/products/stark-backpack`, `/start`, `/login`, `/log/stark/record/new`, `/log/stark/ai-recommendation`
- Browser-rendered implementation screenshots:
  - `/private/tmp/likegonzi-final-20260817/home.png`
  - `/private/tmp/likegonzi-final-20260817/product-stories.png`
  - `/private/tmp/likegonzi-final-20260817/auth-signup.png`
- Combined comparison inputs:
  - `/private/tmp/likegonzi-final-20260817/home-comparison.png`
  - `/private/tmp/likegonzi-final-20260817/story-comparison.png`
  - `/private/tmp/likegonzi-final-20260817/auth-comparison.png`

## Viewport and normalization

- Implementation CSS viewport and pixels: `393 x 852`, device scale factor `1`.
- Source pixels: Home `390 x 1370`, story `426 x 742`, auth `1014 x 914`.
- The source files include either the surrounding Figma canvas or an isolated component crop. Each source was aspect-fit into a `500 x 852` evidence pane; each implementation capture stayed at `393 x 852`. Pixel aspect ratios were normalized to `1:1` before side-by-side comparison.
- States: default Home, Product Detail scrolled to `MY STORIES`, and Start with the sign-up tab open in the authentication bottom sheet.

## Findings

- No actionable P0, P1, or P2 mismatch remains in the compared states.
- [P3] The auth reference shows the login tab while the final interaction capture shows the newly implemented sign-up tab. The segmented control, dark field treatment, rounded white sheet, and typography hierarchy are shared; the different field count is intentional.
- [P3] The implementation uses the available Apple Korean system font fallback, while the exact Figma font metadata was not available in the supplied raster captures. The resulting weight, wrapping, and optical hierarchy are visually consistent at the target viewport.

## Required fidelity surfaces

- Fonts and typography: Korean UI uses restrained sans-serif weights and product/display names use the existing serif token. No oversized generic headings or inconsistent card typography remain.
- Spacing and layout rhythm: Home now uses the Figma-like large `271 x 435` product card, horizontal next-card peek, compact utility cards, and fixed bottom navigation. Product stories retain the vertical rail, diamond markers, compact card radius, and image ratio.
- Colors and visual tokens: cream paper, cognac product field, dark brown product footer, gold accents, and the repeated MCM/diamond background are consistent with the supplied references. The pattern was strengthened without moving the base motifs.
- Image quality and asset fidelity: existing MCM logo, product cutouts, story photos, and pattern assets are reused. No placeholder illustration, emoji, handcrafted logo, or fake product image was introduced.
- Copy and content: Home, story records, future Instagram state, login, sign-up, and demo-auth copy communicate the current product scope. Instagram export is explicitly marked as future functionality.

## Full-view comparison evidence

- Home: composition, product-card prominence, next-card peek, care card, membership card, background pattern, and persistent navigation align with the visual hierarchy in the source.
- Product story section: the implementation reproduces the `MY STORIES` heading, rail, diamonds, two seeded records, metadata density, and right-aligned imagery inside Product Detail as requested.
- Authentication: the source treatment is carried into a functional bottom sheet with matching dark inputs and segmented login/sign-up tabs.

## Focused-region comparison evidence

- Home product panel: correct subject, cognac field, white favorite control, dark information band, and visible adjacent product.
- Story cards: matching date/title/place/memo hierarchy, vertical connector, diamond nodes, shadows, and rounded image crops.
- Authentication panel: matching white rounded sheet, dark fields, icon labels, tab selection, password fields, and full-width primary action.

## Interaction checks

- Home product card opens Product Detail.
- Product Detail story card opens the matching story detail.
- Story detail `WITH` product card returns to Product Detail.
- Start sheet opens by drag or tap; its CTA opens the authentication sheet.
- Login/sign-up tabs switch; both primary actions complete the current demo auto-login and route to `/home`.
- AI recommendation selection returns to the record form with the selected image applied.
- Saving a record opens its detail and adds it to Product Detail; the server was restarted afterward to restore seeded demo data.
- Browser console check: zero errors in the final states. Development-only information and performance warnings were not treated as functional errors.
- `npm run lint`: zero errors (existing warnings remain).
- `npm run build`: passed, including TypeScript and all application routes.

## Comparison history

- Pass 1 findings: background pattern was too faint, Home used undersized generic product tiles, authentication was a separate login-only form, Product Detail used disconnected story presentation, and AI image selection did not return to the draft reliably.
- Fixes: doubled the fixed pattern layer, rebuilt the Home product rail to measured Figma proportions, added a reusable login/sign-up panel inside the Start bottom sheet, unified Product Detail with API-backed story records, and carried AI selection through the record route.
- Pass 2 post-fix evidence: the three combined comparison images above show the corrected Home, story section, and auth sheet. Core interactions and console state were verified in the in-app browser at `393 x 852`.

final result: passed
