import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { resolve } from 'path';
export default defineConfig({
  plugins: [vue()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: 'src/tests/setupTests.js', // 如果有的話
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
});
