/* eslint-disable */
import { expect } from 'chai';
import { describe, it } from 'mocha';

import instanceOf from '../instanceOf';

describe('instanceOf', () => {
  it('fails with descriptive error message', () => {
    const warnedWith: string[] = [];
    const oldWarn = console.warn;
    console.warn = (str: string) => warnedWith.push(str);

    function getFoo(version: string) {
      class Foo {
        static ORIGIN_MODULE = 'foo-factory@' + version;
      }
      return Foo;
    }
    const Foo1 = getFoo('1.0');
    const Foo2 = getFoo('2.0');

    instanceOf(new Foo1(), Foo2);
    instanceOf(new Foo1(), Foo2); // should only log once

    expect(warnedWith).to.have.length(1);
    expect(warnedWith[0]).to.match(
      /Encountered graphql object from foo-factory@1\.0\./,
    );

    instanceOf(new Foo2(), Foo1);
    expect(warnedWith[1]).to.match(
      /Encountered graphql object from foo-factory@2\.0\./,
    );

    console.warn = oldWarn;
  });
});
