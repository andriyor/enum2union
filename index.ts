import path from 'path';

console.log('process.cwd()');
console.log(process.cwd());

const relativePath = path.relative(`${process.cwd()}/test/test-project`, path.resolve('./test/test-project'));
console.log(relativePath);
