import type { Prisma } from '../../prisma/client'
import { endpoint, fetchInstance } from '../app'

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
    return data.data
}

export default zenStackFunction
