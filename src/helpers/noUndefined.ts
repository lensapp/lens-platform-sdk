/**
 * Check if value is undefined with type predictions.
 *
 * ```ts
 * const array: (string | undefined)[] = ['some', undefined];
 * const filteredArray: string[] = array.filter(notUndefined);
 * ```
 *
 * modified from https://www.typescriptlang.org/docs/handbook/advanced-types.html#user-defined-type-guards
 */
function notUndefined<TestValue>(value: TestValue | undefined): value is TestValue {
  if (value === undefined) {
    return false;
  }

  return true;
}

export default notUndefined;
