import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import monacoEditorPlugin from 'vite-plugin-monaco-editor-esm';


export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    monacoEditorPlugin(),
  ],
  esbuild: {
    logLevel: 'silent', // masque warnings esbuild
  },
})
