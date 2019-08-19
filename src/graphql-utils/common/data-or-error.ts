export function dataOrError(result: any, nullData: boolean = false) {
  if (!result) {
    return null;
  }
  const { code, message, reason } = result;
  if (code) {
    return { code, message, reason, __typename: "KnownError" };
  }
  return nullData ? null : result.data || null;
}
