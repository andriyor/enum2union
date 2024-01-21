import util from 'node:util';
import fs from 'node:fs';

import { beforeAll, describe, it, expect, afterAll } from 'vitest';

import { transform } from '../src';
import { prepareTestCases } from './helper';

const exec = util.promisify(require('node:child_process').exec);

beforeAll(async () => {
  console.log('beforeAll');
  await transform({
    projectFiles: './test/test-project/without-helper/**/*.{tsx,ts}',
  });
  await transform({
    projectFiles: './test/test-project/with-helper/**/*.{tsx,ts}',
    helperDir: './test/test-project/with-helper/types',
  });
});

afterAll(async () => {
  await exec('git stash push -- test/test-project');
});

describe('enum2union', () => {
  console.log('prepareTestCases');
  const testCases = prepareTestCases();
  console.log('testCases');
  console.log(testCases);
  it.each(testCases)('module %s should be the same as %s module', (actual, expected) => {
    const methodFile = fs.readFileSync(actual, 'utf-8');
    const expectedMethodFile = fs.readFileSync(expected, 'utf-8');
    expect(methodFile).toEqual(expectedMethodFile);
  });
});
