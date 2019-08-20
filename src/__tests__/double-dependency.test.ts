import * as shelljs from 'shelljs';
import { join } from 'path';

import { expect } from 'chai';
import { describe, it } from 'mocha';

describe('graphql-js module', () => {
  it('allows interop between two versions of iteslf', () => {
    const warn = console.warn;
    const warnedWith = [];
    console.warn = message => warnedWith.push(message);
    const root = shelljs.pwd().stdout;

    const g1Path = 'dist';
    const g2Path = 'dist1';

    shelljs.cp('-r', g1Path, g2Path);

    const g1 = require(join(root, g1Path));
    const g2 = require(join(root, g2Path));

    const obj = new g1.GraphQLObjectType({
      name: 'Dog',
      fields: { id: { type: g1.GraphQLString } },
    });

    expect(g1.isObjectType(obj)).to.be.true;
    expect(g2.isObjectType(obj)).to.be.true;
    expect(warnedWith[0]).to.include(
      'Using GraphQLObjectType "Dog" from another module or realm.',
    );
    expect(warnedWith[1]).to.be.undefined;
    console.warn = warn;
  }).timeout(5000);
});
