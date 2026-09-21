import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
export default defineConfig({
  plugins: [react()],
  base: './',
  server: { host: '0.0.0.0', allowedHosts: true },
  preview: { host: '0.0.0.0', allowedHosts: true },
  build: { chunkSizeWarningLimit: 700, rollupOptions: { output: { manualChunks: (id) => {
    if (id.includes('node_modules')) return 'vendor';
    if (/src\/data\/uniques\.json/.test(id)) return 'data-uniques';
    if (/src\/data\/(authority|misc)\.json/.test(id)) return 'data-items';
    if (/src\/data\/(runes|runestones|runemaster|zodiac|tags)\.json/.test(id)) return 'data-runes';
  } } } },
});
