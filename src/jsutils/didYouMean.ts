// @flow strict

const MAX_SUGGESTIONS = 5;

/**
 * Given [ A, B, C ] return ' Did you mean A, B, or C?'.
 */
export default function didYouMean(suggestions: ReadonlyArray<string>): string;
export default function didYouMean(
  subMessage: string,
  suggestions: ReadonlyArray<string>,
): string;
export default function didYouMean(firstArg: any, secondArg?: any) {
  const [subMessage, suggestions] =
    typeof firstArg === 'string'
      ? [firstArg, secondArg]
      : [undefined, firstArg];

  let message = ' Did you mean ';
  if (subMessage) {
    message += subMessage + ' ';
  }

  switch (suggestions.length) {
    case 0:
      return '';
    case 1:
      return message + suggestions[0] + '?';
    case 2:
      return message + suggestions[0] + ' or ' + suggestions[1] + '?';
  }

  const selected = suggestions.slice(0, MAX_SUGGESTIONS);
  const lastItem = selected.pop();
  return message + selected.join(', ') + ', or ' + lastItem + '?';
}
