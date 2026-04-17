import type IForkTsCheckerWebpackPlugin from 'fork-ts-checker-webpack-plugin'
import webpack from 'webpack'
import { version } from './package.json'

// eslint-disable-next-line @typescript-eslint/no-var-requires
const ForkTsCheckerWebpackPlugin: typeof IForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin')

export const definePlugin = new webpack.DefinePlugin({
    APP_VERSION: JSON.stringify(version),
})

// export const plugins = [
//     new ForkTsCheckerWebpackPlugin({
//         logger: 'webpack-infrastructure',
//     }),
// ]
