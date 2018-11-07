import typescript from 'rollup-plugin-typescript2';

export default {
  input: './src/index.ts',
  output: [{
    file: './dist/kingx.js',
    format: 'umd',
    name: 'Kingx'
  }],
  plugins: [
    typescript(),
  ]
}