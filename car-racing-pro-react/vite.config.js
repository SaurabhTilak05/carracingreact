import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// 👇 This makes it work locally AND on GitHub Pages
export default defineConfig({
  plugins: [react()],
  base: process.env.NODE_ENV === 'production' ? '/carracingreact/' : '/'
})
