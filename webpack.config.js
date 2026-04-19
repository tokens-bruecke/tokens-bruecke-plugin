// Require the necessary packages
const HtmlWebpackPlugin = require('html-webpack-plugin');
const HtmlInlineScriptPlugin = require('html-inline-script-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const ZipPlugin = require('zip-webpack-plugin');
const HTMLInlineCSSWebpackPlugin =
  require('html-inline-css-webpack-plugin').default;
const path = require('path');

// Export a function that takes in the environment and argv objects
module.exports = (env, argv) => ({
  // Determine the mode based on the argv.mode value
  mode: argv.mode === 'production' ? 'production' : 'development',

  // Set the devtool based on the mode
  // Note: this is necessary because Figma's 'eval' works differently than normal eval
  devtool: argv.mode === 'production' ? false : 'inline-source-map',

  // Define the entry points for the webpack build
  entry: {
    ui: './src/app/index.tsx', // The entry point for your UI code
    code: './src/app/controller/index.ts', // The entry point for your plugin code
  },

  // Define the rules for how different types of files should be handled
  module: {
    rules: [
      // Convert TypeScript code to JavaScript
      {
        test: /\.tsx?$/,
        use: {
          loader: 'ts-loader',
          options: {
            configFile: 'tsconfig.plugin.json',
          },
        },
        exclude: /node_modules/,
      },

      // Allows you to use "<%= require('./file.svg') %>" in your HTML code to get a data URI
      {
        test: /\.(png|jpg|gif|webp|svg)$/,
        use: ['url-loader'],
      },

      // Process SASS/SCSS files and extract the CSS into a separate file
      {
        test: /\.(sass|scss)$/,
        use: [MiniCssExtractPlugin.loader, 'css-loader', 'sass-loader'],
      },
      {
        test: /\.css$/i,
        use: [MiniCssExtractPlugin.loader, 'css-loader'],
      },
    ],
  },

  // Configure how Webpack resolves modules
  resolve: {
    extensions: ['.tsx', '.ts', '.jsx', '.js'], // Specify the order in which extensions should be tried when resolving modules
    alias: {
      '@app': path.resolve(__dirname, 'src/app'),
      '@common': path.resolve(__dirname, 'src/common'),
      '@cli': path.resolve(__dirname, 'src/cli'),
      '@root': path.resolve(__dirname),
    },
  },

  // Define the output file(s)
  output: {
    filename: '[name].js', // Use the name of the entry point as the output filename
    path: path.resolve(__dirname, 'dist/figma-plugin'), // Compile into a folder called "dist"
    publicPath: '', // Set the public path for the output files (empty string means relative path)
  },

  // Define the plugins that should be used in the build process
  plugins: [
    // Generate "ui.html" and inline "ui.js" into it
    new HtmlWebpackPlugin({
      template: './src/app/index.html',
      filename: 'ui.html',
      chunks: ['ui'],
      cache: false, // Disable caching to prevent issues with Figma plugin reloading
    }),

    // Inline the "ui.js" chunk into "ui.html"
    new HtmlInlineScriptPlugin(),

    // Extract the CSS into a separate file
    new MiniCssExtractPlugin(),

    // Inline the CSS into the HTML file
    new HTMLInlineCSSWebpackPlugin(),

    // Package the plugin code into a single file
    // Open manifest.json in Figma from the dist folder
    new CopyPlugin({
      patterns: ['manifest.json'],
    }),
    new ZipPlugin({
      filename: 'figma-plugin.zip',
      path: path.resolve(__dirname, 'dist'),
    }),
  ],
});
