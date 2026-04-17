import type { Configuration } from 'webpack'

import { rules } from './webpack.rules'
import { definePlugin } from './webpack.plugins'

rules.push({
    test: /\.css$/,
    use: [{ loader: 'style-loader' }, { loader: 'css-loader' }],
})

export const rendererConfig: Configuration = {
    module: {
        rules,
    },
    plugins: [definePlugin],
    resolve: {
        extensions: ['.js', '.ts', '.jsx', '.tsx', '.css'],
    },
}
