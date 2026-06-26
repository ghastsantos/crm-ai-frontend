## 2026-06-25 - Final review fix

- Fixed `src/pages/metrics-page.tsx` loading skeleton by replacing transparent hard-coded `loading` text in semantic card title/description components with decorative `aria-hidden="true"` blocks.
- Kept the skeleton dimensions and spacing aligned with the existing layout.
- Verification: focused placeholder-text check passed; `npm.cmd run typecheck` passed; `npm.cmd run lint` passed; `npm.cmd run build` passed.
- Notes: initial sandboxed typecheck could not write TypeScript build info under `node_modules/.tmp`; reran with required filesystem access successfully. Vite build emitted the existing chunk-size warning.
