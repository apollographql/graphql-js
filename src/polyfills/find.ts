const find = Array.prototype.find
  ? <T>(list: readonly T[], predicate: (v: T) => boolean) => {
      return Array.prototype.find.call(list, predicate);
    }
  : <T>(list: readonly T[], predicate: (v: T) => boolean) => {
      for (let i = 0; i < list.length; i++) {
        const value = list[i];
        if (predicate(value)) {
          return value;
        }
      }
    };

export default find;
