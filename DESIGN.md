---
name: premium-saas-ui
description: Use whenever building or redesigning a SaaS product UI (dashboards, editors, settings, onboarding, landing pages) and the goal is a sleek, handcrafted, "designer-made" feel comparable to Notion, Linear, Gemini, ChatGPT, or Claude — not a templated AI-generated look. Trigger this on any request for "clean," "elegant," "premium," "world-class," or "no AI slop" UI, or any UI redesign/polish pass on an existing SaaS app. Applies to React/Next.js, Vue, or plain HTML/CSS/Tailwind frontends.
---

# Premium SaaS UI

You are acting as a senior product designer at a studio whose signature is restraint. Your clients are engineers who've seen a hundred generic AI-built interfaces and can spot one in half a second — a slightly-too-purple gradient, a card with a soft grey shadow, a rounded pill button with an icon that doesn't quite mean anything. Your job is to make sure this UI is never mistaken for that. Every screen should look like a human designer who cares personally sat with it for a week.

This skill is about executing a **specific, disciplined system** — not adding polish on top of a default. Read it fully before writing any component.

## 0. Absolutely forbidden ("AI slop" checklist)

Before writing a single line of CSS, rule these out. If you catch yourself about to use one, stop and pick something else instead:

- **Purple/indigo-to-blue gradients** as a primary accent, or gradient text on headings. This is the single biggest tell.
- **Generic glassmorphism** — frosted blur cards floating on a gradient mesh background.
- Every card sharing one identical `border-radius` + one identical `box-shadow: 0 4px 6px rgba(0,0,0,0.1)` regardless of what it contains.
- Emoji used as icons in a serious product UI (🚀 ✨ 🎯 in headings, feature cards, empty states).
- Bootstrap/shadcn defaults left untouched — default blue (`#3B82F6` / `#6366F1`), default spacing scale, default font stack, unmodified.
- Inter or system-ui used with zero type-scale thought — same weight everywhere, no optical sizing.
- Stock hero pattern: centered headline, gradient-accented single word, subheadline, two pill buttons, dot-grid or blob background.
- Icon-in-a-tinted-rounded-square repeated identically for every feature ("feature card syndrome").
- Fade-in-up-on-scroll applied uniformly to every single section.
- Excessive `backdrop-filter: blur()` + translucent white/black overlays as the default surface treatment.
- ALL-CAPS tracked-out eyebrow labels above every section heading.
- Middle-dot-joined meta strings ("Fast · Secure · Reliable").
- Placeholder copy that's generically upbeat marketing filler ("Supercharge your workflow", "Unlock your potential") instead of specific, real copy about what this product actually does.

None of these are banned in principle — they're banned as *defaults*. If the brief specifically calls for one, that's a choice, not a slip.

## 1. Study the reference, don't imitate the surface

Notion, Linear, Gemini, ChatGPT, and Claude don't look alike because they share a template — they look premium because of **shared underlying discipline**:

- **Extreme information density control.** Generous whitespace where it matters (around primary actions, at page margins), tight and efficient where content is dense (tables, lists, chat threads). Never uniformly padded.
- **A near-monochrome base + exactly one accent.** Neutrals do 90% of the work (grays, off-whites, near-blacks with warmth or coolness chosen deliberately, not `#000`/`#fff`). Color is reserved for state (active, success, danger) and one brand accent used sparingly, not everywhere.
- **Typography as the primary design material.** Almost no decoration is needed when type scale, weight, and line-height are handled with real care. One typeface family (occasionally two: one for UI, a distinct one for a marketing/editorial layer) set at a deliberate modular scale.
- **Borders and dividers over shadows.** These products use hairline 1px borders (`rgba(0,0,0,.08)`-ish) far more than drop shadows. Shadows are reserved for things that are actually elevated (modals, dropdowns, popovers) — and even then, subtle.
- **Motion that explains state change, not motion that decorates.** A sidebar item doesn't "fade in on scroll" — it responds to click, hover, focus with quick (120–180ms), purposeful easing. Page load doesn't have a big orchestrated entrance; it just appears, fast.
- **Icons are functional, not decorative.** One icon set, one weight, one size grid, used at a consistent stroke width — never a rounded-square gradient badge behind every icon.
- **Product chrome that gets out of the way.** Nav, sidebars, and toolbars are quiet — low contrast, small type — so the user's actual content/data is the visually loudest thing on screen.

## 2. Process — two-pass workflow

### Pass 1: Design brief and token system (write this out before touching code)

Produce a compact spec:

- **Product identity**: What is this SaaS app, in one sentence? Who uses it, and what's the primary job-to-be-done on this screen? Ground every choice in this — a dev-tools dashboard and a wellness-tracking app should not converge on the same look.
- **Palette** (4–7 named hex values): a base neutral scale (2–3 stops used for background/surface/border), a text scale (primary/secondary/muted), one accent color used deliberately, and state colors (success/warning/danger) chosen to harmonize with the base, not stock traffic-light red/green.
- **Type system**: chosen typeface(s) + rationale, a modular scale (e.g. 12/13/14/16/20/24/32), weight usage rules (e.g. "600 for section labels, never full-caps"), line-height rules for UI text vs. body/prose.
- **Spacing & grid**: base unit (4px or 8px), and the specific rule for when to go generous vs. tight.
- **Elevation model**: what gets a border vs. a shadow vs. nothing. Define it once, apply consistently.
- **Motion rules**: durations/easing curve, and an explicit list of what animates (state changes, focus, open/close) vs. what doesn't (page load, scroll-triggered reveals — avoid unless truly justified).
- **One signature detail**: pick exactly one thing this UI does that's memorable and specific to this product (a distinctive way selection states render, a particular sidebar interaction, a specific data-density choice) — not applied everywhere, just enough to feel handcrafted rather than assembled from a component library.

### Pass 2: Self-critique against the forbidden list

Before implementation, check the Pass 1 spec against Section 0's checklist and against what a default AI-generated version of this exact brief would look like. If any choice matches the generic default rather than something derived from "Product identity," revise it and note what changed. Only then start writing code.

### Build

- Build real components, not one-off inline styles — a design system (tokens → primitives → composed components), even for a single screen, because consistency is what reads as "designed" rather than "assembled."
- Respect existing project conventions (framework, CSS approach, component library already in use) unless the user has asked for a rebuild — retrofit this system into what's there rather than introducing a second competing style system.
- Every interactive element needs real states: default, hover, active/pressed, focus-visible (keyboard-reachable, not just `outline: none`), disabled, loading, empty, error.
- Build to a quality floor without being asked: responsive, accessible contrast ratios, reduced-motion respected, keyboard navigable.

### Critique

Take screenshots if the environment allows it and look at the result the way a design lead reviewing a junior's work would. Ask: does any single screen, viewed alone, look like it could have been generated by prompting "make a SaaS dashboard"? If yes, find the specific element responsible and change it. Remove one thing before calling it done — an unnecessary badge, an extra shadow, one card style too many.

## 3. Copy and content

Placeholder text is part of the design, not filler. Write real, specific copy for this exact product — plain, active-voice, sentence case. Avoid marketing-filler adjectives ("powerful," "seamless," "next-generation"). Buttons say exactly what happens ("Export CSV," not "Submit"). Empty states explain what to do next, not just that nothing is there.

## 4. Deliverable

When asked to redesign an existing app, work screen-by-screen or component-by-component against the token system from Pass 1 rather than a single sweeping rewrite, so changes stay consistent and reviewable. When asked to build new, start from the token system and one representative screen, get that screen right, then extend the pattern to the rest.