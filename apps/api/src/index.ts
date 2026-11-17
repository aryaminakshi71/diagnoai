import { createServer } from 'node:http'
import { config as loadEnv } from 'dotenv'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
loadEnv({ path: path.resolve(__dirname, '../../../.env') })

const { RPCHandler } = await import('@orpc/server/node')
const { appRouter } = await import('./routers')
const { handleAuthRequest } = await import('./auth/handler')

const rpcHandler = new RPCHandler(appRouter)

const port = Number(process.env.PORT ?? 3101)

const server = createServer(async (req, res) => {
  try {
    const requestUrl = req.url ?? '/'
    if (requestUrl.startsWith('/api/auth')) {
      const allowedOrigins = new Set([
        'http://127.0.0.1:3000',
        'http://localhost:3000',
      ])
      const origin = req.headers.origin
      if (origin && allowedOrigins.has(origin)) {
        res.setHeader('Access-Control-Allow-Origin', origin)
        res.setHeader('Access-Control-Allow-Credentials', 'true')
      }
      res.setHeader(
        'Access-Control-Allow-Headers',
        'Content-Type, Authorization',
      )
      res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS')

      if ((req.method ?? 'GET').toUpperCase() === 'OPTIONS') {
        res.statusCode = 204
        res.end()
        return
      }

      const requestOrigin = `http://${req.headers.host ?? `localhost:${port}`}`
      const url = new URL(requestUrl, requestOrigin)
      const method = req.method ?? 'GET'
      const headers = new Headers()
      for (const [key, value] of Object.entries(req.headers)) {
        if (typeof value === 'string') headers.set(key, value)
        else if (Array.isArray(value)) headers.set(key, value.join(','))
      }
      const body =
        method === 'GET' || method === 'HEAD'
          ? undefined
          : await new Promise<Buffer>((resolve, reject) => {
              const chunks: Buffer[] = []
              req.on('data', (chunk) => chunks.push(Buffer.from(chunk)))
              req.on('end', () => resolve(Buffer.concat(chunks)))
              req.on('error', reject)
            })

      const authResponse = await handleAuthRequest(
        new Request(url.toString(), {
          method,
          headers,
          body,
        }),
      )

      res.statusCode = authResponse.status
      authResponse.headers.forEach((value, key) => res.setHeader(key, value))
      const buffer = Buffer.from(await authResponse.arrayBuffer())
      res.end(buffer)
      return
    }

    const result = await rpcHandler.handle(req, res, {
      context: {
        logger: console,
        env: process.env,
      },
    })
    if (!result.matched) {
      res.statusCode = 404
      res.end('Not Found')
    }
  } catch (error) {
    console.error(error)
    if (!res.headersSent) {
      res.statusCode = 500
      res.end('Internal Server Error')
    }
  }
})

server.listen(port, () => {
  console.log(`DiagnoLIS API listening on http://localhost:${port}`)
})
