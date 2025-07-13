import { defineConfig } from 'vite'

export default defineConfig({
  server: {
    port: 3000, // Andere port proberen
    host: '0.0.0.0', // Luister op alle interfaces
    open: false, // Voorkom automatisch openen
    strictPort: false, // Zoek andere port als bezet
    cors: true // CORS toestaan
  },
  build: {
    target: 'es2015',
    minify: 'terser',
    rollupOptions: {
      output: {
        manualChunks: {
          phaser: ['phaser']
        }
      }
    }
  },
  optimizeDeps: {
    include: ['phaser']
  }
}) 