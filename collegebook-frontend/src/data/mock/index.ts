/**
 * Mock data barrel.
 *
 * Every piece of seed/demo data lives in this folder and is consumed ONLY by
 * `src/lib/api.ts`. Pages and components must never import from here directly —
 * they call the api layer, so swapping mocks for the real backend is a one-file change.
 */
export * from "./posts";
export * from "./ads";
