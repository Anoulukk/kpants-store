import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath } from 'url'
import path from 'path'
import fs from 'fs'

const __dirname = fileURLToPath(new URL('.', import.meta.url))

// Runs the serverless functions in ./api during `npm run dev`, the same way
// Vercel runs them in production (exported GET/POST taking a web Request).
function devApi() {
  return {
    name: 'dev-api',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const url = new URL(req.url, 'http://localhost')
        if (!url.pathname.startsWith('/api/') || url.pathname.includes('..') || url.pathname.includes('/_')) return next()
        const file = path.join(__dirname, `${url.pathname}.js`)
        if (!fs.existsSync(file)) return next()

        try {
          const mod = await server.ssrLoadModule(file)
          const handler = mod[req.method]
          if (!handler) { res.statusCode = 405; return res.end() }

          const chunks = []
          for await (const chunk of req) chunks.push(chunk)
          const hasBody = !['GET', 'HEAD'].includes(req.method)
          const response = await handler(new Request(url, {
            method: req.method,
            headers: req.headers,
            body: hasBody ? Buffer.concat(chunks) : undefined,
          }))

          res.statusCode = response.status
          response.headers.forEach((value, key) => res.setHeader(key, value))
          res.end(Buffer.from(await response.arrayBuffer()))
        } catch (err) {
          console.error('[dev-api]', err)
          res.statusCode = 500
          res.end('API error')
        }
      })
    },
  }
}

export default defineConfig(({ mode }) => {
  // Make server-only variables (no VITE_ prefix) visible to ./api in dev
  const env = loadEnv(mode, __dirname, '')
  for (const [key, value] of Object.entries(env)) {
    if (process.env[key] === undefined) process.env[key] = value
  }

  return {
    plugins: [react(), devApi()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
  }
})
