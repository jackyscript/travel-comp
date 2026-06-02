<!--VITE PLUS START-->

# Using Vite+, the Unified Toolchain for the Web

This project uses **Vite+** (unified toolchain built on Vite, Rolldown, Oxlint, Oxfmt, Vite Task). Wrapped via the `vp` CLI. Run `vp help` to list commands.

Docs: `node_modules/vite-plus/docs` or https://viteplus.dev/guide/

## Project Overview

**Travel-Comp** — a Nuxt 4 + Vuetify 3 real-time transit departure board for Berlin/Brandenburg (VBB network). Deployed to GitHub Pages at `https://jackyscript.github.io/travel-comp/`.

## Tech Stack

- **Framework:** Nuxt 4 (SSR) + Vue 3 + vue-router 5
- **UI:** Vuetify 3 via `vuetify-nuxt-module`, `@jamescoyle/vue-icon`, `@mdi/js`
- **Data:** `@vueuse/core` (debounced refs), `v6.vbb.transport.rest` API
- **Tooling:** Vite+ (`vp`) → Oxlint (type-aware + type-check), Oxfmt, Vite Task
- **Package manager:** npm 11.16.0 (Node 24.x — see `.node-version`; CI uses Node 20)
- **CI/CD:** GitHub Actions (`deploy.yml` — push to `main` or `workflow_dispatch`)

## Project Structure

```
app/
├── app.vue                  # Root layout (v-app shell + NuxtPage)
├── pages/
│   ├── index.vue            # Home → <StationSearch>
│   └── departures/[id].vue  # Station departures → <DeparturesSection>
├── components/
│   ├── StationSearch.vue    # Debounced station search (v6.vbb/ locations)
│   └── DeparturesSection.vue# Departure board with filter, refresh, delay coloring
├── utils/
│   ├── apiHealth.ts         # Reactive VBB API health check (UptimeRobot)
│   └── transportIcons.ts    # Product-type → SVG icon + color map
public/                      # SVGs, favicon, robots.txt
```

## Review Checklist

- [ ] Run `vp install` after pulling remote changes and before getting started (equivalent to `npm install`).
- [ ] Run `vp check` to format (Oxfmt) and lint (Oxlint) all files.
- [ ] Run scripts via `vp run <script>` (e.g. `vp run dev`). Key scripts: `dev`, `build`, `generate`, `preview`.
- [ ] Build for GitHub Pages: `npm run build` (runs `nuxt build`). The CI uses `npx nuxt build --preset github_pages`.
- [ ] Pre-commit hooks: staged files are auto-formatted/linted via `vp check --fix` (configured in `vite.config.ts`). No need to run `vp check` manually after edits — it runs on commit.
- [ ] If setup looks wrong, run `vp env doctor` and include its output when asking for help.

## Code Conventions

- **Components:** Single-file `.vue` with `<script setup lang="ts">`. Use Vuetify components (`v-text-field`, `v-list`, `v-btn`, etc.).
- **Styling:** Vuetify helper classes and props; no scoped CSS files.
- **API calls:** Use `$fetch` (Nuxt built-in) to hit `https://v6.vbb.transport.rest`.
- **Icons:** Import from `@mdi/js` (e.g. `mdiBus`), render via `<v-icon :icon="mdiBus" />` or `<icon :path="..." />` from `@jamescoyle/vue-icon`.
- **Typing:** Use `interface` for props/state; `defineProps<{ ... }>()` and `defineEmits<{ ... }>()`.
- **Routing:** Nuxt file-based routing under `app/pages/`. Dynamic params via `useRoute().params`.
- **No tests** — no test framework is configured.
- **No composables directory** — put reusable logic in `app/utils/` or inline.

<!--VITE PLUS END-->
