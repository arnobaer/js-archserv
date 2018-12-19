import json from 'rollup-plugin-json';
import { uglify } from 'rollup-plugin-uglify';

export default {
  input: 'src/archserv.js',
  output: {
    file: 'dist/archserv.js',
    name: 'archserv',
    format: 'iife'
  },
  plugins: [ json(), uglify() ]
};
