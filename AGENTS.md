# Sterilization Workflow Agent Guide

## Product intent

This app is a sterilization workflow prototype visually aligned with `modoock-health` and `modoock-health-radiology`.

## Visual identity

- Use a clinical healthcare look: calm, structured, and operational.
- Prefer the shared Modoock palette:
  - Primary blue: `#1378ac`
  - Secondary blue: `#0b4867`
  - Accent teal: `#11b5a2`
  - Light surfaces: `#f4f8fb`, `#edf5f9`, `#eafaf7`
- Prefer white or near-white panels with soft borders and moderate shadows.
- Use Montserrat for the main UI font.
- Keep status feedback clear and restrained. Use teal for success/validated states, not neon multi-color accents.

## UX direction

- Treat each workflow screen like an internal hospital application, not a gamified demo.
- Favor concise labels, strong hierarchy, and readable spacing over decorative effects.
- Keep dashboard and step cards consistent across modules.
- Minimize emoji-only affordances. If an icon is used, it should support the label rather than carry the UI.

## Current implementation anchors

- Global theme and typography live in `app/globals.css` and `app/layout.tsx`.
- The main prototype entry is `app/page.tsx`.
- Core workflow screens are:
  - `components/PredesinfectionWizard.tsx`
  - `components/steps/Lavage.tsx`
  - `components/steps/Recomposition.tsx`
  - `components/steps/Sterilization.tsx`
  - `components/steps/StorageDistribution.tsx`

## Reference repos

- Borrow base color/system cues from `..\modoock-health`
- Borrow page density and prototype polish cues from `..\modoock-health-radiology`

## Avoid

- Reintroducing rose, purple, orange, or indigo as module-defining primary themes.
- Mixing multiple unrelated visual identities between steps.
- Reverting to generic Next.js metadata or default typography.
