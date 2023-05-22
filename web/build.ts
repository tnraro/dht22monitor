/// <reference types="bun-types" />

import { join } from "path";

const result = await Bun.build({
  entrypoints: [join(import.meta.dir, "./src/index.ts")],
  outdir: join(import.meta.dir, "../dist/js/"),
  minify: true,
});

if (!result.success) {
  throw new AggregateError(result.logs, "Build failed");
}