export interface PerfOptions {
  foo: string
}

export const perf = async ({ foo }: PerfOptions) => {
  console.log('Running perf, --foo', foo)
}
