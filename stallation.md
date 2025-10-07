Living Sketch UI — Portable Style Guide & Cursor AI Implementation Playbook

A minimal, monochrome, generative‑motion style system you can drop into any product. Built for web apps and sites; extendable to native.

⸻

0) TL;DR
	•	Visual DNA: black canvas, white/gray vector lines, dashed splines, nodes, arrow “agents”, soft additive trails, occasional stellation bursts; serif accent type.
	•	Keywords: monochrome · generative · data‑viz minimalism · orbital motion · kinetic poetry.
	•	Apply anywhere: background systems, hero sections, progress visualizations, onboarding flows, loaders, or diagram UIs.
	•	Stack: React + Canvas/WebGL (PixiJS or three.js). Tokens via CSS variables + Tailwind.

⸻

1) Brand & Visual Principles
	1.	Economy of form – Lines, circles, triangles; no skeuomorphism.
	2.	Constellation logic – Elements imply connection and direction (graphs over blobs).
	3.	Temporal persistence – Trails reveal time; avoid hard cuts.
	4.	Contrast discipline – Monochrome first; color only for semantic callouts.
	5.	Poetic restraint – Serif type used sparingly for labels/epigraphs.

Do
	•	Keep 90% of pixels near-black.
	•	Use motion to show causality.
	•	Prefer splines over corners.

Don’t
	•	Add textures/gradients that fight the trails.
	•	Overuse blooms; preserve crisp edges on text.

⸻

2) Design Tokens (Foundations)

Use these as CSS variables; Tailwind consumes them and code references them directly.

:root {
  /* Color */
  --stel-bg: #000000;
  --stel-ink-100: #FFFFFF;
  --stel-ink-80: #E6E6E6;
  --stel-ink-60: #BFBFBF;
  --stel-ink-40: #8C8C8C;
  --stel-ink-20: #595959;
  --stel-glow: 255,255,255; /* rgb tuple for additive */
  --stel-accent: #8EE2FF;   /* optional rare accent */

  /* Stroke weights (px) */
  --stel-stroke-hair: 1;
  --stel-stroke-thin: 1.5;
  --stel-stroke-std: 2;

  /* Motion */
  --stel-speed-agent: 0.002; /* normalized t per frame */
  --stel-fade-alpha: 0.08;   /* 0..1 fade per frame on trails */
  --stel-duration-xxs: 90ms;
  --stel-duration-xs: 160ms;
  --stel-duration-sm: 240ms;
  --stel-ease: cubic-bezier(0.22, 1, 0.36, 1); /* easeOutCubic */

  /* Radii / sizes */
  --stel-node-r: 8px;
  --stel-node-ring: 2px;
  --stel-arrow-l: 14px; /* agent triangle length */

  /* Typography */
  --stel-font-sans: ui-sans-serif, Inter, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, "Apple Color Emoji", "Segoe UI Emoji";
  --stel-font-serif: ui-serif, "Cormorant Garamond", Georgia, serif;
}

Semantic color aliases (optional):
	•	--semantic-ok: var(--stel-ink-80) (or a single accent hue if color is needed)
	•	--semantic-warn: #FFDB6E (used < 1% of surfaces)

⸻

3) Typography
	•	Primary UI: Sans (Regular/Medium). Tracking slightly tight (−1% to −2%).
	•	Accents/Headlines/Labels within visuals: Serif (Medium). All‑caps allowed for single words.
	•	Kinetic text: Fade with opacity, no blur/bloom. Motion = 160–240ms easeOut, slight overshoot ≤2px.

⸻

4) Iconography & Primitives
	•	Node: 2 concentric circles (outer dashed ring). Inner dot optional.
	•	Agent: Isosceles triangle with subtle body (diamond→triangle). Align to tangent.
	•	Path: Catmull‑Rom or cubic Bézier. Dashed rendering by segment sampling; dash:gap = 8:6 (px).
	•	Stellation burst: Radial 8–16 line sprites, 4–12 frames, additive, decay by 12%/frame.
	•	Particles: 1px discs, lifespan 20–60 frames, slight tangential jitter.

⸻

5) Motion System
	•	World tick: 60 FPS target; degrade gracefully to 30 (halve trail life).
	•	Trail persistence: Multiply blend or additive buffer + alpha fade rectangle each frame with --stel-fade-alpha.
	•	Agent pathing: Parameter t advances with small Perlin noise; reverse or retarget on node events.
	•	Graph logic: Nodes connected by weighted edges; on arrival, pick next edge by weight * randomness.
	•	Accessibility: Respect prefers-reduced-motion: freeze trails, reduce particles by 80%, skip blooms.

⸻

6) Layout Patterns (Where it lives)
	1.	Hero canvas (full‑bleed background) – UI floats above, text z-index > visuals.
	2.	Inset module – 600–900px canvas within card; use as empty state / education.
	3.	Procedural loader – Single agent looping; ring forms complete to 360° when done.
	4.	Diagram mode – Edges + nodes map to app entities (e.g., steps/tasks/metrics). Clickable.

Safe densities
	•	Nodes: 6–20 visible, Agents: 1–4, Particles: ≤200 alive.

⸻

7) Tailwind & Theming

tailwind.config.js (excerpt)

module.exports = {
  theme: {
    extend: {
      colors: {
        bg: "var(--stel-bg)",
        ink: {
          100: "var(--stel-ink-100)",
          80: "var(--stel-ink-80)",
          60: "var(--stel-ink-60)",
          40: "var(--stel-ink-40)",
          20: "var(--stel-ink-20)",
        },
        accent: "var(--stel-accent)",
      },
      fontFamily: {
        sans: "var(--stel-font-sans)",
        serif: "var(--stel-font-serif)",
      },
    }
  }
}


⸻

8) React + Canvas Baseline (PixiJS)

Purpose: a reusable <StellationsCanvas /> you can drop into any page.

// StellationsCanvas.tsx
import { useEffect, useRef } from 'react'
import { Application, Graphics, BLEND_MODES, ParticleContainer } from 'pixi.js'

export function StellationsCanvas({ density = 1, interactive = false }) {
  const ref = useRef<HTMLDivElement>(null)
  const appRef = useRef<Application | null>(null)

  useEffect(() => {
    const app = new Application({ background: 0x000000, resizeTo: ref.current! })
    ref.current!.appendChild(app.view as any)
    appRef.current = app

    // trail buffer
    const trail = new Graphics()
    trail.blendMode = BLEND_MODES.ADD
    app.stage.addChild(trail)

    // state
    const nodes = seedNodes(app.renderer.width, app.renderer.height)
    const agents = seedAgents(nodes, Math.max(1, 2 * density))

    app.ticker.add(() => {
      // fade trail
      trail.beginFill(0x000000, parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--stel-fade-alpha')) || 0.08)
      trail.drawRect(0,0,app.renderer.width, app.renderer.height)
      trail.endFill()

      // draw edges (static layer could be separate)
      app.renderer.render(trail)

      // agents step
      agents.forEach(a => a.step(trail))
    })

    return () => app.destroy(true)
  }, [density, interactive])

  return <div ref={ref} className="absolute inset-0" aria-hidden />
}

Implement seedNodes, seedAgents, and drawDashedSpline using the primitives defined above. Keep agents and trails in their own containers for perf.

⸻

9) WebGL Bloom (three.js) — optional
	•	Use postprocessing’s EffectComposer + UnrealBloomPass.
	•	Render text/UI in a separate DOM layer—never inside the bloom pass.
	•	FX budget: threshold 0.75–0.9, strength 0.4–0.8, radius 0.6–0.9.

⸻

10) Accessibility & Ethics
	•	Contrast: Body text ≥ 12.5:1 against bg; lines can be < 4.5:1 if decorative and aria-hidden.
	•	Reduced motion: @media (prefers-reduced-motion: reduce) { freeze agents; turn off trails; }
	•	Keyboard: If interactive, ensure nodes/edges are tabbable; provide non-animated focus outlines.
	•	Seizure safety: No strobe > 3 Hz; bursts decay smoothly.

⸻

11) Production QA Checklist
	•	FPS ≥ 55 on M1 Air / mid‑Android @ 1440×900.
	•	CPU ≤ 25% / GPU ≤ 35% sustained 60s.
	•	Memory leaks: no unbounded particle arrays.
	•	Cross‑tab pause (visibilitychange) halts ticker.
	•	prefers-reduced-motion honored.
	•	Text rendering unaffected by bloom.
	•	Server‑side render OK (component lazy‑loads on client).

⸻

12) Porting Rules (Apply to any UI)
	1.	Overlay model: Visuals are a background service; business UI must remain legible at all times.
	2.	Color: Keep monochrome unless a semantic color communicates state.
	3.	Density scaling: Use three densities (low, normal, high) tied to container size & FPS.
	4.	Event hooks: Expose onNodeEnter, onEdgeComplete, onBurst for product teams to attach behaviors.
	5.	Theming: Tokens only; no hard-coded hex values inside renderers.

⸻

13) Cursor AI Playbook

A) Repository Scaffold

/apps
  /web (Next.js app)
/packages
  /stellations-core   (renderers, math, types)
  /stellations-react  (React bindings, <StellationsCanvas>)
  /tokens             (CSS vars, Tailwind theme)

.cursorrules
package.json (workspaces)

B) .cursorrules (excerpt)

# Goals
Build and maintain a portable “Stellations” visual system: React + Pixi/Three.

# Conventions
- All visual constants come from /packages/tokens/css/stellations.css
- No hard-coded colors or durations inside renderers.
- Provide storybook stories for: Node, Edge, Agent, StellationBurst, Canvas.

# Tasks Cursor can perform
- Generate/modify TypeScript modules under stellations-core.
- Write unit tests with Vitest for math utilities.
- Create Storybook stories.
- Optimize render loops (profiling hints provided in TODOs).

# Don’ts
- Don’t introduce new deps without updating /ARCHITECTURE.md
- Don’t mix DOM text inside WebGL layer.

C) Cursor Task Prompts (ready to paste)

1. Create math & spline utilities

Create /packages/stellations-core/src/splines.ts with Catmull-Rom and cubic Bézier helpers including tangent, arclength reparameterization, and dashed sampling. Add Vitest tests.

2. Render primitives in Pixi

Add /packages/stellations-core/src/pixi/primitives.ts for Node, Edge (dashed), Agent, and StellationBurst. Agents advance by t with noise; expose update(dt). Ensure additive blending for trails.

3. React wrapper

Implement /packages/stellations-react/src/StellationsCanvas.tsx with props: density, interactive, onEvent hooks. Lazy-load Pixi, respect prefers-reduced-motion, and pause on page hide.

4. Tailwind & tokens

Create /packages/tokens/css/stellations.css exporting all variables from the style guide. Update tailwind.config to map variables. Provide a demo page in /apps/web showing hero+loader.

5. Performance pass

Profile the demo at 1440×900; cap particles, throttle bloom when FPS < 55, pool objects.

D) PR Template

## What changed

## Screenshots (with FPS overlay)

## Checks
- [ ] Tokens only
- [ ] Reduced motion
- [ ] No text inside bloom
- [ ] Storybook updated


⸻

14) Figma Library Notes
	•	Components: Node / Edge (dashed) / Agent / Burst / Path presets / Canvas frame.
	•	Text styles: Sans (UI), Serif (Accent).
	•	Tokens page mirrors CSS vars; export via Variables.
	•	Motion specimens: 240ms easeOut curves; trail persistence mocked with 3‑frame overlays.

⸻

15) Extending Beyond Monochrome (Optional)
	•	Introduce a single hue for semantic emphasis (accent). Use at ≤5% pixel coverage.
	•	Dual‑tone mode: warm gray (#EDE8E3) on near‑black (#0B0B0B) for a softer feel.

⸻

16) Implementation Risks & Non‑Goals
	•	Risk: Over‑blooming → illegible UI. Mitigation: hard rule “no bloom on text/UI layer.”
	•	Risk: Mobile perf dips. Mitigation: scale density + disable bursts under 45 FPS.
	•	Non‑goal: Photorealism or shader art; keep it diagrammatic.

⸻

17) License & Packaging
	•	Ship /packages/stellations-* as MIT internal packages.
	•	Provide UMD build for non‑React sites (window.Stellations).

⸻

18) Ready‑to‑Use Acceptance Criteria (for any page integrating Stellations)
	•	Canvas renders behind content without layout shift.
	•	2–4 agents visible within first fold; at least one node burst/minute.
	•	Text contrast ≥ 12.5:1; no bloom artifacts on typography.
	•	prefers-reduced-motion removes trails/particles but keeps static graph.
	•	CPU/GPU budgets met; FPS HUD shows ≥55 on reference laptop.

⸻

Done. Drop this guide into your repo, wire the tokens, add the React canvas, and let Cursor generate the core modules + tests from the prompts above.