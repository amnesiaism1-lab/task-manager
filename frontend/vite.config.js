import { defineConfig } from 'vite';
import { fileURLToPath, URL } from 'node:url';

// The SPA consumes the source contract during development/build, while Nest
// consumes the compiled CommonJS package. Both therefore use the same symbols.
export default defineConfig({
  resolve: {
    alias: {
      '@task-manager/shared': fileURLToPath(new URL('../shared/src/index.ts', import.meta.url)),
    },
  },
});
