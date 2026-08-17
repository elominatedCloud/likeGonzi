# Figma implementation audit — 2026-08-15

## Scope

- Figma file: `l73ERyKZFmvi3JrbAwcx4z` (`디자인 전체부분`)
- Reference viewport: 393px mobile frames
- Local build: `http://127.0.0.1:3000`
- Captured implementation routes: start, login, home, product, care, storybook, timeline, shopping, my

## Verdict

The implementation is partial. Start, login, storybook, timeline, and care preserve the overall Figma structure. Home and product detail implement the intended information architecture but use substitute imagery and introduce content/layout changes. Shopping, My, and Settings are not implemented even though complete Figma frames exist.

## Screen status

1. Start / unboxing — Good
   - Core composition and swipe-based unboxing are implemented.
   - The initial box asset differs from the ribbon-wrapped Figma reference.
   - The unauthenticated browse button has no action.
2. Login — Good visually, incomplete functionally
   - Layout, colors, social buttons, and field structure closely match.
   - Submit only writes to the console; it does not authenticate or navigate.
   - Signup and password-recovery links return 404.
3. Home — Partial
   - Core sections and bottom navigation exist.
   - Product imagery is generic external imagery rather than the Figma MCM assets.
   - The third Pina product is absent and an extra ESG card changes the Figma content order and fold.
4. Product detail — Partial
   - Identity, care, repair, story, and ownership sections exist.
   - Product/lifestyle imagery differs substantially from Figma.
   - Extra carousel, AI repair, and leather-check sections make the page longer than the source frame.
5. Care guide — Good
   - Score, tabs, four tips, care cycle, and bottom navigation match the reference structure.
6. Storybook — Good visually, navigation defect
   - Three product cards, typography, timeline links, and fixed bottom bar closely match.
   - Home points to `/` instead of `/home`; Shopping points to missing `/shopping` instead of `/shop`.
7. Timeline — Good
   - Tabs, vertical timeline, history/memory cards, and add-record entry are implemented.
   - Product-history cards use `#` links and therefore are not actionable.
8. Shopping — Missing
   - Figma contains a complete campaign/shop frame.
   - The local route is an IA-placeholder screen.
9. My — Missing
   - Figma contains membership, benefits, product management, repair history, and settings entry points.
   - The local route is a placeholder.
10. Settings — Missing
   - Figma contains settings and settings-detail frames; matching routes/screens are absent.

## Highest-impact fixes

1. Implement Shopping, My, and Settings from their existing Figma frames.
2. Unify bottom navigation routes and components; remove `/shopping`, `/`, and other stale destinations.
3. Replace external substitute product imagery with the exact supplied MCM/Figma assets.
4. Complete onboarding/login actions and add or remove the currently broken signup/password links.
5. Reconcile Home and Product Detail content with Figma before visual polish: missing Pina card, extra ESG/AI sections, page heights, and fold position.

## Accessibility notes

- Semantic headings, labels, navigation landmarks, and image alt text are generally present.
- Several Figma-derived labels are 9–11px; verify text scaling and contrast on device.
- Placeholder pages and non-functional controls create misleading affordances.
- Screenshot review cannot confirm keyboard focus, screen-reader announcements, drag alternatives, or full WCAG compliance.

## Evidence

- Implementation screenshots: `01-start.png` through `09-my.png`
- Figma reference screenshots: `figma-02-login.png`, `figma-05-care.png`, `figma-07-timeline.png`, `figma-08-shopping.png`, `figma-09-my.png`
- HTTP verification: `/shopping`, `/signup`, and `/find-password` returned 404.
