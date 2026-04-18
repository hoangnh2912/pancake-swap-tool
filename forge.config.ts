import { MakerZIP } from '@electron-forge/maker-zip'
import { AutoUnpackNativesPlugin } from '@electron-forge/plugin-auto-unpack-natives'
import { WebpackPlugin } from '@electron-forge/plugin-webpack'
import type { ForgeConfig } from '@electron-forge/shared-types'
import fs from 'fs'
import path from 'path'

import { mainConfig } from './webpack.main.config'
import { rendererConfig } from './webpack.renderer.config'

const config: ForgeConfig = {
    packagerConfig: {
        asar: true,
        icon: './src/favicon',
    },
    rebuildConfig: {},
    hooks: {
        postPackage: async (_forgeConfig, options) => {
            const prismaSource = path.resolve(__dirname, 'prisma')
            for (const outputPath of options.outputPaths) {
                const dest = path.join(outputPath, 'prisma')
                fs.cpSync(prismaSource, dest, { recursive: true })
                console.log(`Copied prisma -> ${dest}`)
            }
        },
    },
    makers: [new MakerZIP({})],
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
