const path = require('path');

module.exports = {
  mode: 'production', // Use production mode for optimized output
  target: 'node', // Target Node.js environment
  entry: './src/cli.ts', // Entry point for the CLI
  output: {
    filename: 'cli.js', // Output filename
    path: path.resolve(__dirname, 'bin'), // Output directory
    libraryTarget: 'commonjs2', // Use CommonJS module format
  },
  resolve: {
    extensions: ['.ts', '.js'], // Resolve TypeScript and JavaScript files
    alias: {
      '@app': path.resolve(__dirname, 'src/app'),
      '@common': path.resolve(__dirname, 'src/common'),
      '@cli': path.resolve(__dirname, 'src/cli'),
      '@root': path.resolve(__dirname),
    },
  },

  module: {
    rules: [
      {
        test: /\.ts$/, // Process TypeScript files
        use: {
          loader: 'ts-loader',
          options: {
            configFile: 'tsconfig.cli.json',
          },
        },
        exclude: /node_modules/,
      },
    ],
  },
  externals: {
    // Exclude dependencies from the bundle
    yargs: 'commonjs yargs',
    react: 'commonjs react',
    'react-dom': 'commonjs react-dom',
  },
};
