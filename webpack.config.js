const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  mode: 'development',
  entry: {
    main: './src/app.js'
  },
  output: {
    filename: 'bundle.js', // Use [name] placeholder to generate unique filenames
    path: path.resolve(__dirname, 'dist'),
  },
  devServer: {
    static: {
      directory: path.join(__dirname, 'dist'),
    },
    compress: true,
    port: 9000,
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './src/template.html',
      filename: 'index.html'
    }),
    new HtmlWebpackPlugin({
      template: './src/login.html',
      filename: 'login.html'
    }),
    new HtmlWebpackPlugin({
        template: './src/register.html',
        filename: 'register.html'
      })
  ],
};
