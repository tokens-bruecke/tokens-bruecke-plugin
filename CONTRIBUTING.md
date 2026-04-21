# Contributing to TokensBrücke

Thanks for taking the time to contribute! Here's everything you need to get started.

---

## Getting started

**Prerequisites:** Node.js, pnpm

```bash
git clone https://github.com/tokens-bruecke/figma-plugin.git
cd figma-plugin
pnpm install
```

**Development build (watch mode):**

```bash
pnpm dev
```

Load the plugin in Figma: **Plugins → Development → Import plugin from manifest** and point it to `manifest.json`.

**Run tests:**

```bash
pnpm test
```

---

## Project structure

| Path          | Purpose                                              |
| ------------- | ---------------------------------------------------- |
| `src/app/`    | Figma plugin UI (React)                              |
| `src/cli/`    | CLI entry point                                      |
| `src/common/` | Shared transform logic (used by both plugin and CLI) |

---

## Making changes

1. Fork the repo and create a branch from `main`.
2. Write code — keep changes focused and minimal.
3. Add or update tests for any logic in `src/common/`.
4. Open a pull request against `main`.

### Commit style

This project uses [Conventional Commits](https://www.conventionalcommits.org/):

| Prefix                         | Effect             |
| ------------------------------ | ------------------ |
| `feat:`                        | Minor version bump |
| `fix:`                         | Patch version bump |
| `feat!:` / `BREAKING CHANGE:`  | Major version bump |
| `chore:`, `docs:`, `refactor:` | No release         |

---

## Reporting bugs

Open a [GitHub issue](https://github.com/tokens-bruecke/figma-plugin/issues) with:

- Steps to reproduce
- Expected vs. actual behavior
- Plugin version and Figma version

---

## License

By contributing, you agree your changes will be licensed under the project's [MIT License](./LICENSE).
