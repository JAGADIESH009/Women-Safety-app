# Persistent Frontend Design & UI/UX Workflow Protocol

This rule governs all frontend engineering, styling, UI/UX implementation, component authoring, and page redesign tasks in this workspace.

---

## 1. Mandatory Pre-Flight Skill Consultation

Before modifying or writing any frontend code (HTML, CSS, React, Tailwind, Vue, or JSX):
1. **Consult Relevant Workspace Skills:**
   - **Visual Excellence & High-End Agency Standards:** `.agents/skills/high-end-visual-design/SKILL.md`
   - **Anti-Slop Brief Inference & Design Reads:** `.agents/skills/design-taste-frontend/SKILL.md`
   - **Web Interface Guidelines & Auditing:** `.agents/skills/web-design-guidelines/SKILL.md`
   - **Utilitarian Minimalism & Editorial Layouts:** `.agents/skills/minimalist-ui/SKILL.md`
2. **Execute a Brief "Design Read":**
   Before touching code, establish:
   - **Audience & Context:** Who uses this interface? What trust level is required?
   - **Brand Continuity:** Respect the existing project's established brand identity, logo proportions, and color tokens (e.g., SafeHer's warm ivory `#FFFDF9`, restrained burgundy `#780D2B`, and espresso text `#2A1810`). Do not force generic themes or arbitrary palettes onto established products.
   - **Layout Archetype:** Select an intentional structure (e.g., Asymmetrical Bento Grid, Centered Dual-Card Split, Clean Metric Cards).

---

## 2. Core Frontend Architecture & CSS Rules

1. **Strict CSS Cascade Layering:**
   - Never write unlayered universal resets (`* { margin: 0; padding: 0; }`) in global CSS. All resets must reside within `@layer base` so they do not crush Tailwind utilities (e.g., `.mx-auto`).
   - Use tokenized CSS variables (`var(--color-bg-base)`, `var(--color-primary)`) defined in `@theme` blocks.
2. **Typography Scale & Contrast:**
   - Avoid generic system defaults. Pair high-presence display fonts (e.g., Plus Jakarta Sans, Outfit, Geist) with legible body type (Inter) and mono metrics (JetBrains Mono).
   - Ensure clear hierarchical contrast across H1, H2, subheadings, metadata badges, and captions.
3. **Responsive Grid & Spacing:**
   - Center all primary application views using disciplined max-width containers (`max-w-6xl mx-auto px-4 sm:px-6`).
   - Build responsive bento layouts that collapse gracefully on mobile (`grid-cols-1 md:grid-cols-2 lg:grid-cols-4` with consistent `gap-4 sm:gap-6`).
   - Avoid awkward left-aligned strips, uneven card heights, or unexplained negative space voids.

---

## 3. Strict Negative Constraints (Anti-Patterns)

- ❌ **No Browser-Default Elements:** Never render raw browser-default buttons, unstyled inputs, or basic checkboxes. Every interactive element must have bespoke focus rings, hover transitions, and active states.
- ❌ **No Raw Emojis as UI Controls:** Do not use raw emojis in navigation, headers, or action buttons. Use clean SVG icon primitives or Lucide icons with consistent stroke weights.
- ❌ **No Fabricated Telemetry or Marketing Fluff:** Do not display fake drills, simulated readiness scores, or fabricated activity. Show only real user state or verified public resources.
- ❌ **No Cluttered First-Visit Screens:** First-visit unauthenticated entry must provide a clean, focused authentication or onboarding experience without exposing private data or clutter.

---

## 4. Rendered Verification Gate

- A successful production build (`npm run build`) is a prerequisite, **not proof of visual quality**.
- Every visual change must be inspected in a real browser across four mandatory viewports:
  1. **1440 × 900** (Desktop / Bento Grid alignment)
  2. **1280 × 800** (Standard Laptop / gutter spacing)
  3. **768 × 1024** (Tablet Portrait / responsive reflow)
  4. **390 × 844** (Mobile Phone / touch targets, zero horizontal overflow)
- Inspect both unauthenticated entry views and application dashboard states.
