import { app } from 'electron'
import path from 'node:path'

if (app.isPackaged) {
    const engineName =
        process.platform === 'win32' ? 'query_engine-windows.dll.node' :
        process.platform === 'darwin' && process.arch === 'arm64' ? 'libquery_engine-darwin-arm64.dylib.node' :
        process.platform === 'darwin' ? 'libquery_engine-darwin.dylib.node' :
        'libquery_engine-debian-openssl-1.1.x.so.node'

    process.env.PRISMA_QUERY_ENGINE_LIBRARY = path.join(
        process.resourcesPath, 'prisma', 'client', engineName
    )
}
