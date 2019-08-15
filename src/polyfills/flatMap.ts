const flatMap = (Array.prototype as any).flatMap
  ? <T, U>(
      list: ReadonlyArray<T>,
      fn: (item: T, index: number) => ReadonlyArray<U> | U,
    ): U[] => {
      return (Array.prototype as any).flatMap.call(list, fn);
    }
  : <T, U>(
      list: ReadonlyArray<T>,
      fn: (item: T, index: number) => ReadonlyArray<U> | U,
    ): U[] => {
      let result: U[] = [];
      for (let i = 0; i < list.length; i++) {
        const value = fn(list[i], i);
        if (Array.isArray(value)) {
          result = result.concat(value);
        } else {
          result.push(value as U);
        }
      }
      return result;
    };
export default flatMap;
