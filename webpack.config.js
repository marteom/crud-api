const path = require('path')
const nodeExternals = require('webpack-node-externals')

module.exports = {
  entry: './src/server.ts',
  target: 'node',
  mode: 'production',
  resolve: {
    extensions: ['.js', '.jsx', '.ts', '.tsx'],
  },
  externals: [nodeExternals()],
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