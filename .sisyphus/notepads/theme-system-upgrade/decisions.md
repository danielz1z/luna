# Decisions

- Use `createMMKV({ id: 'app-preferences' })` instead of `new MMKV(...)` because the installed `react-native-mmkv` exports `MMKV` as a type-only symbol and provides `createMMKV` as the runtime constructor.
