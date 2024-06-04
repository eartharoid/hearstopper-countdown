import { chunkify } from '../src/utils.js';

const arr = new Array(100).fill(0).map((_, i) => i + 1);
const chunks = chunkify(arr);
console.log(chunks);