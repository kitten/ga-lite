import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import buble from '@rollup/plugin-buble';
import babel from '@rollup/plugin-babel';
import { terser } from 'rollup-plugin-terser';
import compiler from '@ampproject/rollup-plugin-closure-compiler';

export const externalModules = ['dns', 'fs', 'path', 'url'];
if (pkg.peerDependencies)
  externalModules.push(...Object.keys(pkg.peerDependencies));
if (pkg.dependencies)
  externalModules.push(...Object.keys(pkg.dependencies));

const externalPredicate = new RegExp(`^(${externalModules.join('|')})($|/)`);

const config = {
  input: {
    'ga-lite': './src/ga-lite.js',
  },
  onwarn() {},
  external: id => externalPredicate.test(id),
  treeshake: {
    unknownGlobalSideEffects: false,
    tryCatchDeoptimization: false,
    moduleSideEffects: false,
  },
};

const plugins = [
  resolve({
    extensions: ['.js', '.jsx', '.ts', '.tsx'],
    mainFields: ['module', 'jsnext', 'main'],
    preferBuiltins: false,
    browser: true,
  }),

  commonjs({
    ignoreGlobal: true,
    include: /\/node_modules\//,
    namedExports: {},
  }),

  buble({
    transforms: {
      unicodeRegExp: false,
      dangerousForOf: true,
      dangerousTaggedTemplateString: true,
      asyncAwait: false,
    },
    objectAssign: 'Object.assign',
  }),

  babel({
    babelrc: false,
    extensions: ['js', 'jsx', 'ts', 'tsx'],
    babelHelpers: 'bundled',
    presets: [],
    plugins: [
      'babel-plugin-closure-elimination',
      '@babel/plugin-transform-object-assign',
    ].filter(Boolean),
  }),

  compiler({
    formatting: 'PRETTY_PRINT',
    compilation_level: 'SIMPLE_OPTIMIZATIONS',
  }),

  terser({
    warnings: true,
    ecma: 5,
    keep_fnames: true,
    ie8: false,
    compress: {
      hoist_vars: false,
      hoist_funs: false,
      pure_getters: true,
      toplevel: true,
      booleans_as_integers: false,
      keep_fnames: true,
      keep_fargs: true,
      if_return: false,
      ie8: false,
      sequences: false,
      loops: false,
      conditionals: false,
      join_vars: false,
    },
    mangle: false,
    output: {
      beautify: true,
      braces: true,
      indent_level: 2,
    },
  }),
];

const output = (format = 'cjs', extension = '.js') => ({
  chunkFileNames: '[hash]' + extension,
  entryFileNames: '[name]' + extension,
  dir: './dist',
  exports: 'named',
  externalLiveBindings: false,
  sourcemap: true,
  esModule: false,
  indent: false,
  freeze: false,
  strict: false,
  format,
});

export default [
  {
    ...config,
    shimMissingExports: true,
    plugins,
    output: [output('esm', '.es.js'), output('cjs', '.js')],
  },
];
