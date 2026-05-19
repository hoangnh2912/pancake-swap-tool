import { PrismaClient } from '../prisma/client'
import { app as electronApp } from 'electron'
import { serve } from '@hono/node-server'
import { createHonoHandler } from '@zenstackhq/server/hono'
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import path from 'node:path'

const prisma = new PrismaClient({
    datasourceUrl: electronApp.isPackaged
        ? `file:${path.join(electronApp.getAppPath(), '..', 'prisma', 'auto-deploy.sqlite')}`
        : `file:${path.join(electronApp.getAppPath(), 'prisma', 'auto-deploy.sqlite')}`,
})
const app = new Hono()
app.use(
    '*',
    cors({
        origin: '*',
    })
)
app.get('/', (c) => c.text('ZenStack Electron Server is running!'))

app.use(
    '/api/model/*',
    createHonoHandler({
        getPrisma: () => prisma,
    })
)

const server = serve(
    {
        fetch: app.fetch,
        hostname: '0.0.0.0',
        port: 8080,
    },
    () => {
        console.log('Hono server is running on http://localhost:8080')
    }
)

// graceful shutdown
process.on('SIGINT', () => {
    server.close()
    process.exit(0)
})
