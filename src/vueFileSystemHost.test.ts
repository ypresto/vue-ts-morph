import { InMemoryFileSystemHost, Project } from "ts-morph";
import { describe, expect, test } from "vitest";
import { VueFileSystemHost } from "./vueFileSystemHost.js";

describe("VueFileSystemHost", () => {
  describe("<script setup>", () => {
    const createMockFsHost = () => {
      const fsHost = new InMemoryFileSystemHost();

      fsHost.writeFileSync(
        "file.vue",
        `\
<script setup>
const props = defineProps(['todo', 'index']);
</script>

<script>
export default {
  compatConfig: {
    MODE: 3,
  },
}
</script>

<template>
  <div />
</template>
`
      );

      return fsHost;
    };

    test("readFile", async () => {
      const vueFsHost = new VueFileSystemHost(createMockFsHost());
      const content = await vueFsHost.readFile("file.vue.ts", "utf-8");
      expect(content).toStrictEqual(
        `\
const props = defineProps(['todo', 'index']);
`
      );
    });

    test("readFileSync", () => {
      const vueFsHost = new VueFileSystemHost(createMockFsHost());
      const content = vueFsHost.readFileSync("file.vue.ts", "utf-8");
      expect(content).toStrictEqual(
        `\
const props = defineProps(['todo', 'index']);
`
      );
    });

    test("writeFile", async () => {
      const mockFsHost = createMockFsHost();
      const vueFsHost = new VueFileSystemHost(mockFsHost);
      await vueFsHost.writeFile(
        "file.vue.ts",
        `\
const props = defineProps(['todo', 'index', 'foobar']);
const emits = defineEmits(['update:todo']);
`
      );
      expect(mockFsHost.readFileSync("file.vue")).toStrictEqual(
        `\
<script setup>
const props = defineProps(['todo', 'index', 'foobar']);
const emits = defineEmits(['update:todo']);
</script>

<script>
export default {
  compatConfig: {
    MODE: 3,
  },
}
</script>

<template>
  <div />
</template>
`
      );
    });

    test("writeFileSync", () => {
      const mockFsHost = createMockFsHost();
      const vueFsHost = new VueFileSystemHost(mockFsHost);
      vueFsHost.writeFileSync(
        "file.vue.ts",
        `\
const props = defineProps(['todo', 'index', 'foobar']);
const emits = defineEmits(['update:todo']);
`
      );
      expect(mockFsHost.readFileSync("file.vue")).toStrictEqual(
        `\
<script setup>
const props = defineProps(['todo', 'index', 'foobar']);
const emits = defineEmits(['update:todo']);
</script>

<script>
export default {
  compatConfig: {
    MODE: 3,
  },
}
</script>

<template>
  <div />
</template>
`
      );
    });
  });

  describe("<script>", () => {
    const createMockFsHost = () => {
      const fsHost = new InMemoryFileSystemHost();

      fsHost.writeFileSync(
        "file.vue",
        `\
<script>
export default defineComponent({
  props: ['todo', 'index'],
})
</script>

<template>
  <div />
</template>
`
      );

      return fsHost;
    };

    test("readFile", async () => {
      const vueFsHost = new VueFileSystemHost(createMockFsHost());
      const content = await vueFsHost.readFile("file.vue.ts", "utf-8");
      expect(content).toStrictEqual(
        `\
export default defineComponent({
  props: ['todo', 'index'],
})
`
      );
    });

    test("readFileSync", () => {
      const vueFsHost = new VueFileSystemHost(createMockFsHost());
      const content = vueFsHost.readFileSync("file.vue.ts", "utf-8");
      expect(content).toStrictEqual(
        `\
export default defineComponent({
  props: ['todo', 'index'],
})
`
      );
    });

    test("writeFile", async () => {
      const mockFsHost = createMockFsHost();
      const vueFsHost = new VueFileSystemHost(mockFsHost);
      await vueFsHost.writeFile(
        "file.vue.ts",
        `\
export default defineComponent({
  props: ['todo', 'index'],
  emits: ['update:todo'],
})
`
      );
      expect(mockFsHost.readFileSync("file.vue")).toStrictEqual(
        `\
<script>
export default defineComponent({
  props: ['todo', 'index'],
  emits: ['update:todo'],
})
</script>

<template>
  <div />
</template>
`
      );
    });

    test("writeFileSync", () => {
      const mockFsHost = createMockFsHost();
      const vueFsHost = new VueFileSystemHost(mockFsHost);
      vueFsHost.writeFileSync(
        "file.vue.ts",
        `\
export default defineComponent({
  props: ['todo', 'index'],
  emits: ['update:todo'],
})
`
      );
      expect(mockFsHost.readFileSync("file.vue")).toStrictEqual(
        `\
<script>
export default defineComponent({
  props: ['todo', 'index'],
  emits: ['update:todo'],
})
</script>

<template>
  <div />
</template>
`
      );
    });
  });

  test("integration test w/ Project", () => {
    const createMockFsHost = () => {
      const fsHost = new InMemoryFileSystemHost();

      // TODO: test importing component file
      fsHost.writeFileSync(
        "file.vue",
        `\
<script setup>
const props = defineProps(['todo', 'index']);
</script>

<template>
  <div />
</template>
`
      );

      fsHost.writeFileSync("tsconfig.json", `{}`);

      return fsHost;
    };

    const project = new Project({
      fileSystem: new VueFileSystemHost(createMockFsHost()),
    });
    project.addSourceFilesFromTsConfig("tsconfig.json");

    const sourceFile = project.getSourceFile("file.vue.ts");
    expect(sourceFile).not.toBeFalsy();
    expect(sourceFile!.getFullText()).toStrictEqual(`\
const props = defineProps(['todo', 'index']);
`);
    expect(sourceFile!.getChildAtIndex(0).getText()).toStrictEqual(
      `const props = defineProps(['todo', 'index']);`
    );
  });
});
