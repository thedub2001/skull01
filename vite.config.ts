import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import monacoEditorEsmPlugin from 'vite-plugin-monaco-editor-esm'


export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    monacoEditorEsmPlugin({
      languageWorkers: ["editorWorkerService", "typescript", "json"], 
    }),
  ],
  esbuild: {
    logLevel: 'silent', // masque warnings esbuild
  },
  optimizeDeps: {
    include: ["monaco-editor"], // évite certains warnings
  },
})