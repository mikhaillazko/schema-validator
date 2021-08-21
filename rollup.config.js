import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import { terser } from 'rollup-plugin-terser';
import optimizeLodashImports from "rollup-plugin-optimize-lodash-imports";
import pkg from './package.json';

const entrypoint = './src/index.js';

export default [
    {
        input: entrypoint,
        output: {
            name: 'schema-validator',
            file: pkg.browser,
            format: 'umd',
            sourcemap: true
        },
        plugins: [
            resolve(),
            optimizeLodashImports(),
            commonjs(),
            terser()
        ]
    },
    {
        input: entrypoint,
        external: ['lodash', 'lodash/function'],
        output: {
            name: 'schema-validator',
            file: pkg.module,
            format: 'es'
        }
    }
];