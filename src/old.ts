/*
export const estimateComplexity = (results: Array<TestResult>): number => {
  const x = results.map((r) => Math.log(r.size))
  const y = results.map((r) => Math.log(r.duration))
  const sumX = x.reduce((a, b) => a + b)
  const sumY = y.reduce((a, b) => a + b)
  const sumXY = x.map((x, i) => x * y[i]).reduce((a, b) => a + b)
  const sumXX = x.map((x) => x * x).reduce((a, b) => a + b)
  const n = results.length
  return (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX)
}
*/

/*
          const x = resultsPerSize.map((r) => Math.log(r.size))
          const y = resultsPerSize.map((r) => Math.log(r.duration))
          const sumX = x.reduce((a, b) => a + b)
          const sumY = y.reduce((a, b) => a + b)
          const sumXY = x.map((x, i) => x * y[i]).reduce((a, b) => a + b)
          const sumXX = x.map((x) => x * x).reduce((a, b) => a + b)
          */

/*
          const x = resultsPerSize.reduce((sum, r) => sum + Math.log(r.size), 0)
          const y = resultsPerSize.reduce((sum, r) => sum + Math.log(r.duration), 0)
          const xy = resultsPerSize.reduce((sum, r) => sum + Math.log(r.size) * Math.log(r.duration), 0)
          const xx = resultsPerSize.reduce((sum, r) => sum + Math.pow(Math.log(r.size), 2), 0)
           totalComplexity += (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX)
          */

/*
export async function* asyncTimes(count: number): AsyncGenerator<number> {
  for (let i = 0; i < count; i++) {
    yield i
  }
}

export async function* perf(
  algorithms: Array<AlgorithmCandidate>,
  state: RuntimeState,
  sizes: Array<Size> = defaultSizes,
  iterations: number = 1000,
  maxExecutionTime = 30000,
  updateFrequency = 10,
): AsyncGenerator<AveragedUnionTestResultPerSize> {
  let timePassed = 0
  const averagedResult: AveragedUnionTestResultPerSize = {}

  for (const { name, fn } of algorithms) {
    averagedResult[name] = {}
    for (const size of sizes) {
      const sizeName = SizeKeys.find((key) => Size[key] === size)

      averagedResult[name][sizeName] = {
        averageComplexity: 0,
        averageDuration: 0,
        calls: 0,
      }

      const resultsPerSize: Array<TestResult> = []

      for await (const result of asyncTimes(iterations)) {
        if (state.pause || timePassed >= maxExecutionTime) {
          yield averagedResult
        }

        const { duration } = await test(name, fn, size)
        timePassed += duration
        resultsPerSize.push({ name, size, duration })

        if (timePassed < maxExecutionTime && result % updateFrequency === 0) {
          const { sumX, sumY, sumXX, sumXY } = resultsPerSize.reduce(
            (acc, r) => ({
              sumX: acc.sumX + Math.log(r.size),
              sumY: acc.sumY + Math.log(r.duration),
              sumXX: acc.sumXX + Math.log(r.size) ** 2,
              sumXY: acc.sumXY + Math.log(r.size) * Math.log(r.duration),
            }),
            { sumX: 0, sumY: 0, sumXX: 0, sumXY: 0 },
          )
          const n = resultsPerSize.length
          const averageDuration = resultsPerSize.reduce((sum, { duration }) => sum + duration, 0) / n
          const averageComplexity = (n * sumXY - sumX * sumY) / (n * sumXX - sumX ** 2)
          averagedResult[name][sizeName].calls++
          averagedResult[name][sizeName].averageDuration += averageDuration / averagedResult[name][sizeName].calls
          averagedResult[name][sizeName].averageComplexity += averageComplexity / averagedResult[name][sizeName].calls
        }
      }
    }
  }
  return averagedResult
}
*/
