/**
 * Compare an input string with one or more comparison strings
 *
 * @param input The input string
 * @param comparisons The comparison(s)
 * @param options The options:
 * - ignoreCase: If the comparison algorithm ignores cAsE
 * - allowInclusionCheck: If the comparison algorithm considers whole inclusions
 * - inclusionMinThreshold: The minimum match required to allow whole inclusions to pass
 */
export function compareStrings(
  input: string,
  comparisons: string | string[],
  options?: {
    ignoreCase?: boolean;
    allowInclusionCheck?: boolean;
    inclusionMinThreshold?: number;
  }
): number {
  // write defaults
  const mergedOptions = {
    ignoreCase: false,
    allowInclusionCheck: false,
    inclusionMinThreshold: 0.3,
    ...(options ?? {}),
  };

  function internalComparison(first: string, second: string) {
    // remove all whitespaces matching \s+ (any group of whitespaces between {1, ∞})
    let firstClean = (first ?? '').replace(/\s+/g, '');
    let secondClean = (second ?? '').replace(/\s+/g, '');

    if (mergedOptions.ignoreCase) {
      firstClean = firstClean.toLowerCase();
      secondClean = secondClean.toLowerCase();
    }

    // if strings are the same, return 1
    if (firstClean === secondClean) return 1;
    // if strings are not the same but the length of either is less than 2, return 0
    if (firstClean.length < 2 || secondClean.length < 2) return 0;

    const firstSections: { [key: string]: number } = {};
    for (let i = 0; i < firstClean.length - 1; i += 1) {
      // extract a section from the string, starting at i with a length of 2
      const sub = firstClean.substring(i, i + 2);
      // add the section to the list, if section exists more than once we increase a count
      firstSections[sub] = firstSections[sub] ? firstSections[sub] + 1 : 1;
    }

    let intersectionSize = 0;
    for (let i = 0; i < secondClean.length - 1; i += 1) {
      // extract a section from the string, starting at i with a length of 2
      const sub = secondClean.substring(i, i + 2);
      // get the count of this section we had in the first string
      const count = firstSections[sub] ? firstSections[sub] : 0;

      // if we found the section
      if (count > 0) {
        // we subtract one match
        firstSections[sub] = count - 1;
        // we increase the intersection by one
        intersectionSize += 1;
      }
    }

    // our factor of comparison is
    // the intersection multiplied by 2 (as we have 2 strings) divided by the length of both strings subtracted by the section size
    // example: first = cheese, second = chese
    // sections would be: { ch: 1, he: 1, ee: 1, es: 1, se: 1 }
    // intersections would be { ch: 1, he: 1, es: 1, se: 1 }
    // => ( 2.0 * 4 ) / ( 6 + 5 - 2) => 89% (0.8888...)
    let matchFactor =
      (2.0 * intersectionSize) / (firstClean.length + secondClean.length - 2);

    // check for inclusion
    // say we have just "antwerp 2022" entered, the normal match will rarely ever return more than 50%
    // as stickers and capsule names usually include more, but we can say, hey if u include this text, and match at least by 30% (default)
    // just assume we want to see you as item in the list
    if (
      mergedOptions.allowInclusionCheck &&
      matchFactor > mergedOptions.inclusionMinThreshold
    ) {
      const firstArg = mergedOptions.ignoreCase ? first.toLowerCase() : first;
      const secondArg = mergedOptions.ignoreCase ? second.toLowerCase() : second;

      if (
        firstArg.indexOf(secondArg) > -1 ||
        secondArg.indexOf(firstArg) > -1
      ) {
        matchFactor = 1;
      }
    }

    return matchFactor;
  }

  if (Array.isArray(comparisons)) {
    return Math.max(
      ...comparisons.map((comparison) => internalComparison(input, comparison))
    );
  }

  return internalComparison(input, comparisons);
}
