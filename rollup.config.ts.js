import typescript from 'rollup-plugin-typescript2';

export default {
  input: './tsSrc/index.ts',
  output: [{
    file: 'tsDist/king.js',
    format: 'umd',
    name: 'King'
  }],
  plugins: [
    typescript(),
  ]
}