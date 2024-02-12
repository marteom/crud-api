// const path = require('path');

// module.exports = {
//   entry: './src/server.ts',
//   module: {
//     rules: [
//       {
//         test: /\.ts?$/,
//         use: 'ts-loader',
//         exclude: /node_modules/,
//       },
//     ],
//   },
//   resolve: {
//     extensions: ['.tsx', '.ts', '.js'],
//     fallback: {
//         "fs": false,
//         "path": false,
//         "os": false,
//         "http": false,
//         "crypto": false,
//       }
//   },
//   output: {
//     filename: 'bundle.js',
//     path: path.resolve(__dirname, 'dist'),
//   }
// };

const path = require('path')
const nodeExternals = require('webpack-node-externals')

const isMulti = process.env.NODE_ENV == 'cluster'

module.exports = {
  entry: './src/server.ts',
  target: 'node',
  mode: 'production',
  resolve: {
    extensions: ['.js', '.jsx', '.ts', '.tsx'],
  },
  externals: [nodeExternals()],
  // entry: isMulti
  //   ? path.join(__dirname, 'src', 'cluster.ts')
  //   : path.join(__dirname, 'src', 'index.ts'),
  output: {
    path: path.join(__dirname, 'dist'),
    filename: 'bundle.js',
  },
  optimization: {
    minimize: false,
  },
  module: {
    rules: [
      {
        test: /\.([cm]?ts|tsx)$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
}