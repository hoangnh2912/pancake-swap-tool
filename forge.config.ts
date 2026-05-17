import { MakerZIP } from '@electron-forge/maker-zip'
import { AutoUnpackNativesPlugin } from '@electron-forge/plugin-auto-unpack-natives'
import { WebpackPlugin } from '@electron-forge/plugin-webpack'
import type { ForgeConfig } from '@electron-forge/shared-types'

import { mainConfig } from './webpack.main.config'
import { rendererConfig } from './webpack.renderer.config'
import path from 'path'
const config: ForgeConfig = {
    packagerConfig: {
        asar: true,
        icon: './src/favicon',
        extraResource: [path.resolve(__dirname, 'prisma')],
    },
    rebuildConfig: {},
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
