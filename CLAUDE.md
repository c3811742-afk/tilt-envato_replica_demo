# Envato Replica Demo: Team Rules

React + TypeScript (Vite) demo, styled with CSS Modules, in English and Arabic. These rules apply to every person and every AI session working in this repo. Follow them exactly.

## Commands

- `npm run dev`: start the dev server
- `npm run check`: type-check, lint the code (oxlint) and lint the CSS (Stylelint). Must pass before every PR.
- `npm run build`: production build

## Golden rules

1. **Nothing is implemented twice.** Before writing a component, hook, helper or style, search `src/shared/`. If it exists, use or extend it. If it doesn't exist and will be used more than once, create it in `src/shared/`.
2. **No hard-coded values.** No raw colors, font families, font sizes, spacing, radii, shadows, breakpoints, z-indexes, durations, asset paths or user-facing text inside components. Every value comes from a variable in `src/shared/`.
3. **Every shared component is fully configurable, with defaults.** Each prop has a default that lives in a separate defaults file and points to the theme. A caller can override any prop. A component used with no props must render correctly from its defaults.
4. **Duplicated logic becomes a shared method.** If the same piece of code (a calculation, formatting, filtering, a mock-data call, a validation) appears twice, move it into `src/shared/utils/` or `src/shared/hooks/` and import it from both places.
5. **Relative sizes only.** No `px`, anywhere in styles. Fixed sizes are `rem`; layout sizes are relative (`%`, `vw`, `dvh`, `clamp()`, `min()`); breakpoints are `em`. The whole demo must adapt to any screen size.

## Folder structure

```
src/
  app/                # app shell: App.tsx (routes), global.css, providers/
  shared/
    theme/            # the design system: single source of truth for all styling values
      colors.ts       # palette (raw), colors (semantic), accentPairs
      typography.ts   # root font size, font families, sizes, weights, line heights, text styles (per language)
      spacing.ts
      sizes.ts        # default widths/heights: container, header, button, input, card, avatar, icon...
      radii.ts
      borders.ts
      shadows.ts      # per direction (mirrors in Arabic)
      breakpoints.ts  # em breakpoints, exposed to CSS as @media (--md-up)
      zIndex.ts
      motion.ts
      opacity.ts
      locales.ts      # en / ar: language code and text direction
      themes.ts       # builds `themes.en`, `themes.ar`
      cssVariables.ts # turns the theme into CSS variables; exports `vars`
      index.ts
    components/       # reusable UI components, one folder each (Button, Text, Container...)
    assets/
      images/
      icons/
      index.ts        # asset registry: every asset is imported and exported here
    hooks/            # shared React hooks (useLocale...)
    utils/            # shared pure functions (withDefaults, cx, storage, formatters...)
    constants/        # routes, storage keys
      text/
        en.ts         # every user-facing string in English
        ar.ts         # same keys, in Arabic
    types/            # shared TypeScript types (User, Item, License, Plan...)
    mocks/            # demo mock data
  features/
    common/           # pages shared by all users (e.g. NotFoundPage)
    customer/         # pages and feature-only components for customers
    creator/
    admin/
```

- A component used by **one** feature only may live in that feature's folder. The moment a second feature needs it, move it to `src/shared/components/`. Never copy it.
- Feature folders compose shared components. They don't redefine styling values.

## Theme

The theme is based on the SYNC brand: flat, hard-edged (radius 0 by default), no soft shadows, heavy uppercase display type, bold accent colors.

- All colors live in `theme/colors.ts`. Components use the semantic colors (`primary`, `textMuted`, `surface`, `danger`) or `accentPairs` (a category color plus readable text on it). Never use `palette` directly in a component; it exists only to feed the semantic names.
- All typography lives in `theme/typography.ts`. Prefer a named text style (`textStyles.h2`, or the shared `Text` component), or pick from the scales, never `14px`.
- Default widths and heights live in `theme/sizes.ts`.
- To add a value that doesn't exist yet, add it to the theme file first, then use it. Never put it inline "just this once".
- Don't change existing theme values without team agreement.

## Styling: CSS Modules + theme variables

The active theme is written onto `<html>` as CSS variables (by `LocaleProvider` → `applyTheme`). Each variable is named after its path in the theme, in kebab-case, with the `typography` level dropped:

- `theme.colors.primary` → `var(--colors-primary)`
- `theme.spacing[4]` → `var(--spacing-4)`
- `theme.sizes.button.height.md` → `var(--sizes-button-height-md)`
- `theme.typography.textStyles.h1.fontSize` → `var(--text-styles-h1-font-size)`

Rules:
- **In `.module.css` files**, use only these variables (or the component's own `--component-*` variables, see below).
- **In TypeScript** (defaults files, props), use `vars` from `@/shared/theme`: `vars.colors.primary` is the string `'var(--colors-primary)'`. It's typed, so a typo is a compile error. Don't write `'var(--...)'` strings by hand, and don't use raw `theme.*` values for styling (they wouldn't follow the language switch).
- **Breakpoints** in CSS: `@media (--sm-up)`, `(--md-up)`, `(--lg-up)`, `(--xl-up)`. Mobile first.
- **Class names** are camelCase (`.fullWidth`).
- `npm run lint:css` blocks `px`, hex and named colors, raw values for themed properties, and `left` / `right`.

## Bilingual: English and Arabic

The demo ships in English (left-to-right) and Arabic (right-to-left). Every screen must work in both.

- **Language-dependent values switch automatically.** Direction, fonts, line heights, letter spacing, uppercase and the hover shadow differ per language; they're in the CSS variables, so components never branch on the language. Read the current language with `useLocale()` only when logic needs it (e.g. formatting).
- **No hard-coded text.** Every user-facing string is a key in `shared/constants/text/en.ts` and `ar.ts`, read through `useLocale().text`. `ar.ts` is typed against `en.ts`, so a missing key is a compile error.
- **Logical CSS only.** Use `margin-inline-start`, `padding-inline`, `inset-inline-start`, `border-inline-end`, `inline-size`, `block-size` and `text-align: start / end`. Never `left` / `right`, so the page mirrors automatically in Arabic.
- **Flip directional icons only.** Arrows, chevrons and back/next icons mirror in Arabic. Logos, play buttons, checkmarks and media don't.
- **Don't style text by language by hand.** Arabic must never be uppercased or letter-spaced. Use the text styles, which already handle this.
- **Format through shared helpers.** Numbers, prices, dates and file sizes go through `formatNumber`, `formatPrice`, `formatDate`, `formatFileSize` in `shared/utils` with the active locale.
- **Mixed content is normal.** An Arabic page may show an English item title. Font stacks already fall back across scripts; use `autoDirection` on `Text` for user-generated text (titles, descriptions, names).
- **Check both languages** before finishing any page.

## Error handling

Every feature handles failure. Nothing is written for the happy path only.

The building blocks already exist; use them instead of writing your own:
- `useAsync(load, deps)` (`shared/hooks`): loads data and tracks loading / error / empty / success, with `retry()`.
- `<AsyncContent state={...}>{(data) => ...}</AsyncContent>` (`shared/components`): renders the right state for a `useAsync` result.
- `LoadingState`, `ErrorState`, `EmptyState`: the shared state screens (all built on `StateMessage`), with default text in both languages.
- `safeAsync(call)` (`shared/utils`): runs any async call (e.g. a form submit) and returns `{ ok: true, data }` or `{ ok: false, error }` instead of throwing.
- `ErrorBoundary` (`shared/components`), already wrapped around the whole app in `src/app/AppErrorBoundary.tsx`.
- `NotFoundPage` (`features/common`), shown for any unknown path.

Rules:
- **Every data view has four states:** loading, error, empty and success. Load data with `useAsync` and render it with `AsyncContent`. Override a state only to give a more specific message (e.g. `empty={<EmptyState message={text.search.noResults} />}`).
- **Every async call can fail.** Use `useAsync` or `safeAsync`. Never leave a `.then()` without a `.catch()`, or an `await` without a `try` / `catch`.
- **Errors are never swallowed silently.** Either show the user something or deliberately ignore it with a comment saying why (see `storage.ts`).
- **The user sees a friendly message, not technical details.** Show text from the text files ("Something went wrong. Please try again."), never `error.message`, a stack trace or a status code. Log the details with `console.error` for developers.
- **Offer a way out.** Error states have a "Try again" action where retrying makes sense, or a link back to a safe page.
- **Forms validate before submitting.** Show the message next to the field it belongs to, keep what the user typed, and disable the submit button while a request is in progress, so it can't be sent twice.
- **Guard against bad data.** Handle missing or empty values (no image, no price, zero results) instead of assuming they exist. Unknown routes show a "Page not found" page.
- **Crashes don't blank the page.** The app-wide `ErrorBoundary` shows a friendly error screen and clears when the user navigates. Wrap any section that could fail on its own (e.g. a widget on a dashboard) in its own `ErrorBoundary`, so the rest of the page keeps working.

## UI wording

All text must read like a normal, well-known product (Envato, Shutterstock, Canva), not like AI-generated marketing.

- **Use the standard label for standard actions:** "Sign in", "Sign up", "Log out", "Search", "Download", "Add to collection", "Save changes", "Cancel", "Delete", "Continue", "Back", "View all". Don't invent new names for them.
- **Be short and plain.** Say what the thing does. A button is one to three words. A message is one sentence, two at most.
- **Avoid AI-sounding words:** unlock, elevate, seamless, effortless, empower, supercharge, unleash, revolutionize, dive in, embark, journey, curated, tailored, game-changer, cutting-edge, "take your … to the next level". No emojis, no exclamation marks, no em dashes.
- **Use sentence case** ("Add to collection", not "Add To Collection"). Uppercase display headings come from the text styles, so write the text normally.
- **Error and empty messages say what happened and what to do next:** "No results for 'logo'. Try a different keyword." or "We couldn't load this page. Please try again."
- **Arabic is written, not translated.** Use the Modern Standard Arabic terms Arabic-speaking users already know from common apps and sites (تسجيل الدخول، إنشاء حساب، تنزيل، بحث، إلغاء), not a word-for-word translation of the English.
- **Same thing, same word, everywhere.** If it's called "collection" in one place, it isn't a "board" somewhere else. Reuse existing keys in the text files instead of adding new wording for the same thing.

## Shared component pattern

`src/shared/components/Button/` is the reference implementation. Every shared component has these five files. The only exceptions: a component with no styling of its own has no `module.css` (e.g. `ErrorState`), and one with no optional props has no `defaults` file (e.g. `AsyncContent`).

**`Button.types.ts`**: the props interface. Every prop is optional unless it truly can't have a default.

**`Button.defaults.ts`**: the defaults, all pointing to the theme through `vars`.
```ts
import { vars } from '@/shared/theme';

export const buttonVariants: Record<ButtonVariant, { background: string; color: string }> = {
  primary: { background: vars.colors.primary, color: vars.colors.onPrimary },
  // ...
};

export const buttonDefaults: Required<Pick<ButtonProps, 'variant' | 'size' | 'radius' | ...>> = {
  variant: 'primary',
  size: 'md',
  radius: vars.radii.none,
  // ...
};
```

**`Button.tsx`**: merges props over defaults with `withDefaults`, then hands the resolved values to the CSS module as `--button-*` custom properties.
```tsx
export const Button = (props: ButtonProps) => {
  const { children, variant, size, background, radius, ... } = withDefaults(buttonDefaults, props);
  const style = {
    '--button-background': background ?? buttonVariants[variant].background,
    '--button-radius': radius,
  } as CSSProperties;
  return <button className={styles.button} style={style}>{children}</button>;
};
```

**`Button.module.css`**: styles using only the component's `--button-*` variables and theme variables.
```css
.button {
  background: var(--button-background);
  border-radius: var(--button-radius);
  padding-inline: var(--sizes-button-padding-x);
}
```

**`index.ts`**: re-exports the component, its types and its defaults. Then add it to `shared/components/index.ts`.

Rules:
- Always merge with `withDefaults` (not `{ ...defaults, ...props }`), so a prop passed as `undefined` keeps its default.
- Override at the call site through props: `<Button variant="secondary" size="lg" />`. Never wrap a shared component just to restyle it, and never copy it to make a variant. Add a variant or prop to the shared one instead.
- Build bigger components from smaller shared ones (a `Card` uses the shared `Button`, `Text`, `Container`).
- Use `Text` for all text and `Container` for page width; don't restyle headings or containers per page.
- Join class names with `cx()` from `shared/utils`.

## Assets

- Every image and icon is in `src/shared/assets/` and is exported from `assets/index.ts`.
- Components import assets from the registry (`import { assets } from '@/shared/assets'`), never by a relative file path.
- Fonts are Google Fonts, loaded once in `<head>` from `fontsUrl` in `theme/typography.ts` (by `vite.config.ts`). Don't add font `<link>`s or `@import`s anywhere else.

## Code reuse

- Formatting, validation, filtering/sorting and mock-data access each belong in `shared/utils/` or `shared/hooks/`.
- Shared TypeScript types (`Item`, `Creator`, `License`, `Plan`, `User`) are defined once in `shared/types/`.
- Route paths are defined once in `shared/constants/routes.ts`. Storage keys in `shared/constants/storageKeys.ts`, and storage is accessed only through `storage` from `shared/utils`.
- All UI text goes in `shared/constants/text/` in both languages.

## TypeScript

- `strict` mode on. No `any`. Use `unknown` and narrow it when needed.
- Import through the `@/` alias, not long relative paths (`../../../`).
- Each folder exposes its public API through an `index.ts`.

## Before you open a PR (and before an AI session finishes)

- [ ] `npm run check` passes
- [ ] Searched `src/shared/` before creating anything new
- [ ] No raw color, font, size, spacing or asset path inside any component; no `px`
- [ ] Every new shared component has `types`, `defaults`, `module.css` and `index` files, and renders with zero props
- [ ] No duplicated logic: anything used twice is in `shared/`
- [ ] New theme values were added to the theme files, not inline
- [ ] No hard-coded text; new strings added to both `en.ts` and `ar.ts`
- [ ] Loading, error and empty states handled; every async call and form can fail gracefully
- [ ] Wording uses standard labels, is short and plain, and has no AI-sounding phrases
- [ ] No `left` / `right` in layout styles; the page checked in English and Arabic, on a phone width and a desktop width
