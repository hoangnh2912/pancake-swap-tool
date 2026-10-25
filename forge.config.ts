import { MakerSquirrel } from '@electron-forge/maker-squirrel'
import { MakerZIP } from '@electron-forge/maker-zip'
import { AutoUnpackNativesPlugin } from '@electron-forge/plugin-auto-unpack-natives'
import { WebpackPlugin } from '@electron-forge/plugin-webpack'
import type { ForgeConfig } from '@electron-forge/shared-types'

import { mainConfig } from './webpack.main.config'
import { rendererConfig } from './webpack.renderer.config'
import { execFileSync } from 'child_process'
import fs from 'fs'
import path from 'path'

// Bản build chỉ mang Prisma client + 1 SQLite RỖNG đủ schema — dữ liệu thật chỉ vào app khi mở
// file .adp. KHÔNG đóng gói thẳng prisma/ (chứa DB làm việc có private key ở máy dev).
const BUILD_PRISMA_DIR = path.resolve(__dirname, 'build', 'prisma')

function prepareEmptyPrismaDir() {
    fs.rmSync(BUILD_PRISMA_DIR, { recursive: true, force: true })
    fs.mkdirSync(BUILD_PRISMA_DIR, { recursive: true })
    fs.cpSync(path.resolve(__dirname, 'prisma', 'client'), path.join(BUILD_PRISMA_DIR, 'client'), { recursive: true })
    const schema = path.join(BUILD_PRISMA_DIR, 'schema.prisma')
    fs.copyFileSync(path.resolve(__dirname, 'prisma', 'schema.prisma'), schema)
    // url trong schema là file:./auto-deploy.sqlite (tương đối theo file schema) → tạo DB rỗng trong BUILD_PRISMA_DIR
    execFileSync('npx', ['prisma', 'db', 'push', '--schema', schema, '--skip-generate'], {
        stdio: 'inherit',
        shell: process.platform === 'win32', // Windows: npx là npx.cmd
    })
    // index.ts đọc schema.sql cạnh DB để tự migrate DB tạo bằng bản cũ
    execFileSync(
        'npx',
        ['prisma', 'migrate', 'diff', '--from-empty', '--to-schema-datamodel', schema, '--script', '--output', path.join(BUILD_PRISMA_DIR, 'schema.sql')],
        { stdio: 'inherit', shell: process.platform === 'win32' }
    )
}

const config: ForgeConfig = {
    packagerConfig: {
        asar: {
            unpackDir: 'node_modules',
        },
        icon: './src/favicon',
        extraResource: [BUILD_PRISMA_DIR],
        // macOS: double-click file .adp → mở bằng app (Windows tự đăng ký registry lúc chạy, xem index.ts)
        extendInfo: {
            CFBundleDocumentTypes: [
                {
                    CFBundleTypeName: 'Auto Deploy Project',
                    CFBundleTypeExtensions: ['adp'],
                    CFBundleTypeRole: 'Editor',
                    LSHandlerRank: 'Owner',
                },
            ],
        },
    },
    rebuildConfig: {},
    hooks: {
        prePackage: async () => prepareEmptyPrismaDir(),
    },
    makers: [
        new MakerZIP({}),
        // Windows installer (Squirrel): cài vào %LocalAppData%\auto-deploy, không cần admin; RELEASES +
        // .nupkg đi kèm là thứ autoUpdater (OTA) đọc từ GitHub Releases
        new MakerSquirrel({
            name: 'auto-deploy',
            authors: 'hoangnh',
            setupExe: 'auto-deploy-setup.exe',
            setupIcon: './src/favicon.ico',
            noMsi: true,
        }),
    ],
    plugins: [
        new AutoUnpackNativesPlugin({}),
        new WebpackPlugin({
            mainConfig,
            devContentSecurityPolicy: "connect-src 'self' * 'unsafe-eval'",
            renderer: {
                config: rendererConfig,
                entryPoints: [
                    {
                        html: './src/index.html',
                        js: './src/renderer.ts',
                        name: 'main_window',
                        preload: {
                            js: './src/preload.ts',
                        },
                    },
                ],
            },
        }),
    ],
}

export default config
