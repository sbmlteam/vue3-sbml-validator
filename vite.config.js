import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

const buildForHugo = process.env.BUILD_FOR_HUGO === '1'

export default defineConfig({
  base: '/vue3-sbml-validator/',
  plugins: [vue()],
  build: buildForHugo
    ? {
        rollupOptions: {
          output: {
            entryFileNames: 'assets/[name].js',
            chunkFileNames: 'assets/[name].js',
            assetFileNames: 'assets/[name].[ext]',
          },
        },
      }
    : undefined,
})
