import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['server.js'],
  format: ['esm'],
  platform: 'node',
  target: 'node22',
  outDir: 'dist',
  clean: true,
  sourcemap: true,
});
