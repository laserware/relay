import { builtinModules } from "node:module";

import { type Options, defineConfig } from "tsup";

export default defineConfig(() => {
  const commonOptions: Options = {
    bundle: true,
    clean: true,
    // This is forwarded to Redux, just in case:
    define: {
      "process.env.NODE_ENV": JSON.stringify("production"),
    },
    external: [
      "electron",
      // And also exclude Node internals from build.
      ...builtinModules.flatMap((name) => [name, `node:${name}`]),
    ],
    minify: false,
    sourcemap: true,
    tsconfig: "./tsconfig.build.json",
  };

  type Platform = Options["platform"];

  const cjs = (
    processName: "main" | "preload" | "renderer",
    platform: Platform,
  ) => ({
    ...commonOptions,
    name: `${processName} (CJS)`,
    dts: true,
    entry: { [processName]: `src/${processName}/index.ts` },
    format: "cjs",
    outExtension: () => ({ js: ".cjs" }),
    platform,
  });

  const esm = (
    processName: "main" | "preload" | "renderer",
    platform: Platform,
  ) => ({
    ...commonOptions,
    name: `${processName} (ESM)`,
    dts: true,
    entry: { [processName]: `src/${processName}/index.ts` },
    format: "esm",
    outExtension: () => ({ js: ".mjs" }),
    platform,
    target: "esnext",
    treeshake: true,
  });

  return [
    esm("main", "node"),
    esm("preload", "node"),
    esm("renderer", "browser"),
    cjs("main", "node"),
    cjs("preload", "node"),
    cjs("renderer", "browser"),
  ] as Options[];
});
