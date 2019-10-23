# Usemin plugin for Webpack
![npm](https://img.shields.io/npm/v/usemin-webpack-plugin) ![GitHub](https://img.shields.io/github/license/mikeandtherest/usemin-webpack-plugin) ![npm bundle size](https://img.shields.io/bundlephobia/min/usemin-webpack-plugin)

A Webpack Plugin to use the min.js version of a library at build time.

## About
Sometimes the .min.js file version of a javascript library is not coming from the actual raw .js file. Like in the case of [p5.js], where, as they say, the minified file doesnt' include some logic found in the big javascript file:

> This file is a minified version of the p5.js file (...) and **does not include** the friendly error system.

So a whole part of the library, helpful for the development phase, but not necessarily for the production release, is missing in p5.min.js. 

To show some numbers, below you can see the actual size for p5.js version v0.10.2:

| File        | Size           | Explanation  |
| ------------- |-------------| -----|
| p5.js      | 4,207 KB | The original js file |
| p5.min.js      | 545 KB      |   The .min file coming with the library |
| p5.min.js | ~1,500 KB      |    The .min file generated from the original js file |

As you can see, the minified file coming with p5.js is almost three times smaller than the one we obtain after minified the raw javascript file. Again, that's because some nice-to-have logic for development time, are missing in the original p5.min.js file.

Knowing all this, what Usemin-Webpack-plugin does, is to allow one to specify inside the Webpack config file, a series of libraries that will have the .js and .min.js swapped at build time. After the build process is completed, the files will be restored to the initial state.

Used together with CompressionWebpackPlugin (especially with the brotliCompress algorithm), this plugin will allow us to get very small bundle sizes, for eg. in the case of p5.js, a final bundle size of 118 KB!

## Install

`npm install usemin-webpack-plugin --save-dev`

or short version

`npm i -D usemin-webpack-plugin`

## Options and Defaults

(TODO)

## Usage

```js
const UseminWebpackPlugin = require("usemin-webpack-plugin");

const webpackConfig = {
    plugins: [
         /**
         * See `Options and Defaults` for information
         */
        new UseminWebpackPlugin()
    ],
};

module.exports = webpackConfig;
```

## Examples

This is a modified version of [WebPack's Plugin documentation](https://webpack.js.org/concepts/plugins/) that includes the Usemin Webpack Plugin.

```js
const HtmlWebpackPlugin = require('html-webpack-plugin');
const webpack = require('webpack');
const path = require('path');

const UseminWebpackPlugin = require("usemin-webpack-plugin");

module.exports = {
    entry: './path/to/my/entry/file.js',
    output: {
        filename: 'my-first-webpack.bundle.js',
        path: path.resolve(__dirname, 'dist'),
    },
    module: {
        rules: [
            {
                test: /\.(js|jsx)$/,
                loader: 'babel-loader',
            },
        ],
    },
    plugins: [
        new HtmlWebpackPlugin({ template: './src/index.html' }),
        new UseminWebpackPlugin({
			entries: [
				{
					path: "node_modules/p5/lib",
					fileName: "p5"
                },
				{
					path: "node_modules/sockjs-client/dist",
					fileName: "sockjs"
				}                
			]
		}),        
        new webpack.ProgressPlugin(),
    ],
};
```

[p5.js]: https://p5js.org/