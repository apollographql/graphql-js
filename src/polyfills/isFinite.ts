const isFinite: (num: any) => boolean =
  Number.isFinite ||
  function(value) {
    return typeof value === 'number' && isFinite(value);
  };
export default isFinite;
