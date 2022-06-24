import { babel } from '@rollup/plugin-babel'
import postcss from "rollup-plugin-postcss";
import { terser } from "rollup-plugin-terser";
 
export default {
  input: './src/index.js', // 入口文件
  output: {
    file: './lib/bundle.js', // 出口文件
    name: 'bundle', // 出口文件
    format: 'umd', // 输出的模块语法格式
    sourceMap: true,
    globals: { // 全局模块 用于umd/iife包
      react: 'react',
      antd: 'antd',
      'classnames': 'classnames',
      'react-table': 'react-table',
      'react-virtual': 'react-virtual',
      '@ant-design/icons': '@ant-design/icons',
    }
  },
  plugins: [
    babel({ babelHelpers: 'bundled' }),
    postcss({
      // Extract CSS to the same location where JS file is generated but with .css extension.
      // extract: true,
      // Use named exports alongside default export.
      namedExports: true,
      // Minimize CSS, boolean or options for cssnano.
      minimize: true,
      // Enable sourceMap.
      sourceMap: true,
      exec: true,
      // This plugin will process files ending with these extensions and the extensions supported by custom loaders.
      extensions: [".less", ".css"],
    }),
    terser(),
  ],
  external: ['react', 'antd', '@ant-design/icons'] // 将[模块]视为外部依赖项
}
