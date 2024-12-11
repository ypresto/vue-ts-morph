# vue-ts-morph

Provides Vue single file component (*.vue) support for [ts-morph](https://github.com/dsherret/ts-morph)

## Installation / Usage

```bash
npm install vue-ts-morph
yarn add vue-ts-morph
pnpm install vue-ts-morph
```

```ts
import { createVueFileSystemHost } from 'vue-ts-morph';
import { Project } from 'ts-morph';

const project = new Project({
  fileSystem: createVueFileSystemHost(),
});
project.addSourceFilesFromTsConfig('tsconfig.json');
```

## Why? And how does it work?

Both [ts-morph](https://github.com/dsherret/ts-morph/blob/061a3febe2383c4f0df32ac1339294dfe3f1f851/packages/common/src/compiler/createHosts.ts#L53) and [Volar](https://github.com/volarjs/volar.js/blob/bdbd555a7fed6e084a454d64ba0b98aac1d85241/packages/typescript/lib/protocol/createProject.ts#L27) implements their own LanguageServiceHost. That fact makes it hard to use them together.

To put it very simply, Volar adds virtual file for each SFC. Vue's older language support [Vetur](https://github.com/vuejs/vetur/blob/96aaa707f8ca629f0883c57a47adb0e58995936d/server/src/services/typescriptService/util.ts#L16) also does it.

While we are not able to pass a custom LanguageServiceHost, we can still implement FileSystemHost interface of ts-morph.
This library implements virtual `.vue.ts` file that translates read/write for source `.vue` file.

## Limitations

Currently does not support `<template>` section and simultaneous `<script setup>` and `<script>` blocks.

`<template>` support is future work. It could be done by translating to template literal or JSX.
