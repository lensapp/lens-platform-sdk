// eslint-disable-next-line no-promise-executor-return
export const timeout = async (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
