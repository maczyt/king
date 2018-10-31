export default {
  input: 'src/index.js',
  output: [{
    file: 'dist/king.js',
    format: 'umd',
    name: 'King'
  }],
  // plugins: [
  //   resolve(),
  //   babel({
  //     exclude: 'node_modules/**'
  //   })
  // ],
}