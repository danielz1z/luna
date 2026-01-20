## Learnings

- Screen migrations map `bg-light-primary/dark-primary` -> `theme.colors.primary`, `bg-light-secondary/dark-secondary` -> `theme.colors.secondary`, and `text-*-subtext` -> `theme.colors.subtext`.
- For spacing tokens: `p-global` maps to `theme.spacing.global` (16); common tailwind sizes were translated to numeric padding/margin.
- Some shared components still accept `className` but ignore it; screens must use `style`/`contentContainerStyle` to control layout after migration.

- Cursor rules should reference Unistyles patterns (`StyleSheet.create((theme) => ...)`, `theme.colors.*`, `palette.*`, `withOpacity`) and avoid `className`/Tailwind examples.
- For Expo SDK 55 canary dependency resolution, `npm install` may require `--legacy-peer-deps` in CI/dev environments.
