# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `pnpm run dev` — start the Rspack dev server (defaults to <http://localhost:8080>)
- `pnpm run build` — production build via Rspack
- `pnpm run preview` — serve the production build locally
- `pnpm run lint` — ESLint over the project (uses flat config in `eslint.config.mjs`)
- `pnpm run format` — Prettier write across the repo

There is no test runner configured; do not invent one.

## Architecture

Vanilla TypeScript SPA bundled with Rspack that consumes the public PokéAPI (`https://pokeapi.co/api/v2/pokemon`). No framework — DOM is manipulated directly from `src/index.ts`, which is the single Rspack entry.

Code is organized by responsibility under `src/`:

- `config/constants.ts` — single source of truth for the API base URL. New endpoints should derive from `POKEDEX_API_URL`, not hard-code the host.
- `queries/FetchData.ts` — generic `fetchData<T>(url, config)` wrapper around `fetch`. Returns `{ data } | { error: { message, status? } }` rather than throwing; query functions are responsible for unwrapping and surfacing errors. New HTTP calls should go through this helper so error handling and `queryParams` serialization stay consistent.
- `queries/Get*.ts` — one file per endpoint. They call `fetchData`, narrow the response, and throw on `error`.
- `types/` — shared response shapes (e.g. `PokemonList`).

`pokemon.response.json` is a captured sample response kept for reference when shaping types — it is not imported at runtime.

## Build and tooling notes

- Module type is `"module"`; TypeScript is compiled by `builtin:swc-loader` (no `tsc` emit — `tsconfig.json` sets `noEmit: true` and `allowImportingTsExtensions: true`).
- Browserslist target is configured directly in `rspack.config.ts` (`last 2 versions, > 0.2%, not dead, Firefox ESR`).
- CSS uses `type: 'css/auto'` (Rspack's native CSS handling); SVGs are loaded as `asset`. `globals.d.ts` declares `*.css` so `import './index.css'` typechecks.
- Top-level `await` is used in `src/index.ts` — keep the entry as an ES module.
- Prettier enforces single quotes (`.prettierrc`); ESLint flat config extends `@eslint/js` recommended + `typescript-eslint` recommended and ignores `dist/`.
