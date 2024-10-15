![GitHub Actions Workflow Status](https://img.shields.io/github/actions/workflow/status/Unarekin/FoundryVTT-Module-Template/main.yml)
![GitHub License](https://img.shields.io/github/license/Unarekin/FoundryVTT-Module-Template)
![GitHub package.json version](https://img.shields.io/github/package-json/v/Unarekin/FoundryVTT-Module-Template)

# What is This?

This is a version of [the League of Foundry Developers module template](https://github.com/League-of-Foundry-Developers/FoundryVTT-Module-Template) with some customizations to suit my particular preferences.

## Key Features

- esbuild build pipeline
- Supports TypeScript and SASS
- Supports language definitions being split into multiple JSON files, for easier organizing of larger projects.
- Fixes [an issue](https://github.com/League-of-Foundry-Developers/FoundryVTT-Module-Template/issues/26) from the original repository, a PR for which is still waiting to be merged.
- Lints code with ESLint and caching, to prevent having to lint the entire project every single time.

# Setup Instructions

The first step is to fork the repository into your own, then clone that.

After that, you will likely want to ensure that `build.mjs` has execute permissions

On Linux:

```console
chmod +x build.mjs
```

On Windows, it may actually just be simpler to adjust the `build` and `build:prod` scripts in `package.json` to call `node build.mjs` rather than `build.js` directly.

## Installing dependencies

The build script uses several external dependencies. To install them:

With npm:

```console
npm install
```

With yarn:

```console
yarn
```

Yeah that's it. Easy peasy.

## Building

There are two types of build: development and production. The sole difference between the two is that a production type build does not include sourcemaps.

For a development build:

npm:

```console
npm run build
```

yarn:

```console
yarn build
```

You can also just run `build.mjs` directly.

For a production build:
npm:

```console
npm run build:prod
```

yarn:

```console
yarn build:prod
```

# Versioned Module Release

For instructions on how to build a proper module release, see [the original module's README](https://github.com/League-of-Foundry-Developers/FoundryVTT-Module-Template/blob/master/README.md).
