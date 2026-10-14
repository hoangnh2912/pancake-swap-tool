import type { Prisma } from '../../prisma/client'

// Không import trực tiếp từ '../app' — app.tsx có side-effect top-level (window.location,
// document.body) chỉ chạy được trong renderer. Decouple qua configureZenStack() để module
// này (và cả automationService.ts phụ thuộc nó) import được từ môi trường Node thuần (vd
// script headless chạy automation ngoài Electron GUI) mà không crash.
let endpoint = 'http://localhost:8791/api/model'
let fetchInstance: typeof fetch = (globalThis as any).fetch

export function configureZenStack(ep: string, fetchFn: typeof fetch) {
    endpoint = ep
    fetchInstance = fetchFn
}

const zenStackFunction = async <T, K = unknown>(
    model: Prisma.ModelName,
    ops: Prisma.PrismaAction,
    q: T
): Promise<K> => {
    const method = (() => {
        if (ops.startsWith('find') || ops === 'aggregate' || ops === 'count' || ops === 'groupBy') {
            return 'GET'
        }
        if (ops.startsWith('create') || ops === 'upsert') {
            return 'POST'
        }
        if (ops.startsWith('update')) {
            return 'PATCH'
        }
        if (ops.startsWith('delete')) {
            return 'DELETE'
        }
        return 'POST'
    })()
    const modelFormatted = model.charAt(0).toLowerCase() + model.slice(1)
    const url =
        method === 'GET'
            ? `${endpoint}/${modelFormatted}/${ops}?q=${JSON.stringify(q)}`
            : `${endpoint}/${modelFormatted}/${ops}`
    const res = await fetchInstance(url, {
        method,
        ...(method !== 'GET' && {
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(q),
        }),
    })
    const data = await res.json()
    if (!res.ok) {
        const msg = data?.error?.message || data?.message || JSON.stringify(data)
        throw new Error(`zenStackFunction ${model}.${ops} failed (${res.status}): ${msg}`)
    }
    return data.data
}

export default zenStackFunction
