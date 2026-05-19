import type { Configuration } from 'webpack'

import { rules } from './webpack.rules'
import { definePlugin } from './webpack.plugins'

export const mainConfig: Configuration = {
    entry: './src/index.ts',
    externals: {
        solc: 'commonjs solc',
    },
    module: {
        rules,
    },
    plugins: [definePlugin],
    resolve: {
        extensions: ['.js', '.ts', '.jsx', '.tsx', '.css', '.json'],
    },
}
