// @flow strict

import { expect } from 'chai';
import { describe, it } from 'mocha';

import instanceOf from '../instanceOf';

describe('instanceOf', () => {
  it('fails with descriptive error message', () => {
    let calledWith = [];
    const warn = console.warn;
    console.warn = message => calledWith.push(message);

    function getFoo() {
      class Foo {}
      return Foo;
    }

    function getBar() {
      return Bar;
    }

    const Foo1 = getFoo();
    const Foo2 = getFoo();

    class Bar {}
    const bar = new Bar();

    expect(calledWith[0]).to.be.undefined;
    expect(instanceOf(new Foo1(), Foo2)).to.be.true;
    expect(calledWith[0]).to.not.be.undefined;
    expect(instanceOf(new Foo2(), Foo1)).to.be.true;
    expect(calledWith[1]).to.be.undefined; // only warn once

    expect(instanceOf(bar, Foo1)).to.be.false;
    console.warn = warn;
  });
});
