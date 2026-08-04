# CollegeBook — Build Your College Story

CollegeBook is verified campus infrastructure: a **college-locked, time-bound** network where
students post their work, find teammates, prove their skills with verified badges, and
graduate with a permanent archive of everything they built.

This repository contains the **frontend** — React 18 + Vite + TypeScript + Tailwind +
shadcn/ui, wrapped by **Capacitor** so the same codebase ships as the website and as the
Android / iOS apps. It currently renders realistic mock data through a single HTTP module.

## Quick start

```bash
npm install
npm run dev        # http://localhost:8080
```

## Structure

```text
src/
├── config/app.config.ts   every env-dependent value (API base, APK/iOS URLs, flags)
├── types/index.ts         shared domain types mirroring backend DTOs
├── lib/
│   ├── api.ts             THE ONLY FILE THAT PERFORMS HTTP
│   ├── platform.ts        native vs web + visitor device detection
│   └── native/            Capacitor wrappers (camera, geo, push, storage, shell)
├── data/mock/             seed/demo data, imported ONLY by lib/api.ts
├── components/            AppLayout, AppSidebar, AdCard, ImageCarousel, landing/, ui/
└── pages/                 one file per route
```

## Mobile builds

```bash
./scripts/build-android.sh debug   # app-debug.apk
./scripts/build-ios.sh open        # macOS + Xcode
```

See [`docs/09-capacitor-mobile.md`](./docs/09-capacitor-mobile.md) — including why iOS is
distributed through TestFlight rather than a direct download.

## Documentation

Full specification lives in [`docs/`](./docs/README.md). Start with
[`docs/10-product-concept.md`](./docs/10-product-concept.md), then hand
[`docs/12-ai-build-prompt.md`](./docs/12-ai-build-prompt.md) to your AI agent to build the
Spring Boot backend and integrate it.
