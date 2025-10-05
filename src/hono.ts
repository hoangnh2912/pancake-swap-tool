import { serve } from '@hono/node-server';
import { OpenAPIHono } from '@hono/zod-openapi';
import { Scalar } from '@scalar/hono-api-reference';
import { createHonoHandler } from '@zenstackhq/server/hono';
import { contextStorage } from 'hono/context-storage';
import { cors } from 'hono/cors';

const app = new OpenAPIHono({ strict: false });
app.use(contextStorage())
app.use(
    '*',
    cors()
)
app.doc('/openapi', (c) => ({
    openapi: '3.0.0',
    info: { version: '1.0.0', title: 'My API' },
    servers: [
        {
            url: new URL(c.req.url).origin,
            description: 'Current environment',
        },
    ],
}))
app.get(
    '/docs',
    Scalar({
        theme: 'purple',
        spec: { url: '/openapi' },
    })
)


app.use(
    '/api/model/*',
    createHonoHandler({
        getPrisma: () => prisma,
    })
);

app.get('/', async (c) => {
    try {
        await prisma.stepper.count()
        return c.text('Ứng dụng đang chạy!')
    } catch (error) {
        return c.text('Khởi chạy thất bại. Vui lòng kiểm tra kết nối cơ sở dữ liệu.', 500)
    }
})

const server = serve({
    fetch: app.fetch,
    hostname: '0.0.0.0',
    port: 3030,
}, () => {
    console.log('Hono server is running on http://localhost:3030')
})

// graceful shutdown
process.on('SIGINT', () => {
    server.close()
    process.exit(0)
})