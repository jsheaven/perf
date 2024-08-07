import { info, warn } from '@jsheaven/status-message'

export const defaultSizes = [
  1, 2, 5, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 150, 200, 300, 400, 500, 600, 700, 800, 900, 1000,
]

export type AlgorithmFn = (size: number, calls: number) => Promise<void>

export type TestResult = {
  name: string
  duration: number
  size: number
}
export const test = async (name: string, fn: AlgorithmFn, size: number, calls: number): Promise<TestResult> => {
  const startTime = process.hrtime()
  try {
    await fn(size, calls)
  } catch (error) {
    console.error(error)
    warn('TEST_ERROR', `Test "${name}" execution failed (size: "${size}"). Measurement might be inaccurate.`)
  }
  const endTime = process.hrtime(startTime)
  const duration = endTime[0] * 1000 + endTime[1] / 1000000
  return { name, duration, size }
}

export type PerformanceRating =
  | 'abysmal'
  | 'atrocious'
  | 'disastrous'
  | 'bad'
  | 'fair'
  | 'good'
  | 'excellent'
  | 'unknown'

export interface ComplexityDomain {
  scientificNotation: string
  description: string
  rating: PerformanceRating
}

export const estimateComplexityInBigONotation = (complexity: number): Array<ComplexityDomain> => {
  const candidates: Array<ComplexityDomain> = []

  // 0.97 - 1: fractional
  if (complexity >= 0.97 && complexity <= 1) {
    candidates.push({
      description: 'Factorial Complexity',
      rating: 'abysmal',
      scientificNotation: 'O(n!)',
    })
  }

  // 0.5 - 0.97: exponential
  if (complexity >= 0.5 && complexity <= 0.97) {
    candidates.push({
      description: 'Exponential Time',
      rating: 'atrocious',
      scientificNotation: 'O(Xⁿ)',
    })
  }

  // 0.3 - 0.5: polynominal
  if (complexity >= 0.3 && complexity <= 0.5) {
    candidates.push({
      description: 'Polynomial Complexity',
      rating: 'disastrous',
      scientificNotation: 'O(nˣ)',
    })
  }

  // 0.2 - 0.3: loglinear
  if (complexity >= 0.2 && complexity <= 0.3) {
    candidates.push({
      description: 'Loglinear Complexity',
      rating: 'bad',
      scientificNotation: 'O(n log n)',
    })
  }

  // 0.2 - 0.28: linear
  if (complexity >= 0.2 && complexity <= 0.28) {
    candidates.push({
      description: 'Linear Complexity',
      rating: 'fair',
      scientificNotation: 'O(n)',
    })
  }

  // 0.1 - 0.25: logarithmic
  if (complexity >= 0.1 && complexity <= 0.25) {
    candidates.push({
      description: 'Logarithmic Complexity',
      rating: 'good',
      scientificNotation: 'O(log n)',
    })
  }

  // 0 - 0.1: constant
  if (complexity >= 0 && complexity <= 0.1) {
    candidates.push({
      description: 'Constant Complexity',
      rating: 'excellent',
      scientificNotation: 'O(1)',
    })
  }
  return candidates
}

export interface AlgorithmCandidate {
  name: string
  fn: AlgorithmFn
}

export interface AveragedTestResult {
  averageDuration: number
  calls: number
  complexity: number
}

export interface RuntimeState {
  pause: boolean
}

export interface AveragedTestResultPerSize {
  complexity: number
  duration: number
  estimatedDomains: Array<ComplexityDomain>
}

export interface AveragedUnionTestResultPerSize {
  [algorithmName: string]: AveragedTestResultPerSize
}

export interface AveragedIntermediateTestResultPerSize {
  done: boolean
  value: AveragedUnionTestResultPerSize
}

export const getGrowthRate = (durations: number[]): number => {
  const logArray = durations.map((x) => Math.log(x))
  const n = logArray.length
  const sumX = logArray.reduce((acc, val, i) => acc + i, 0)
  const sumY = logArray.reduce((acc, val) => acc + val, 0)
  const sumXY = logArray.reduce((acc, val, i) => acc + i * val, 0)
  const sumXX = logArray.reduce((acc, val, i) => acc + i * i, 0)
  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX)
  return Math.min(Math.max(slope, 0), 1)
}

export const get25Percent = (iterations: number) => iterations / 4 - 1

export const filterFirst25Percent = (results: Array<TestResult>, iterations: number) =>
  results.filter((r, i) => i > get25Percent(iterations))

export async function* perfStreamed(
  algorithms: Array<AlgorithmCandidate>,
  sizes: Array<number> = defaultSizes,
  warm: boolean = true,
  iterations: number = 100,
  maxExecutionTime = 30000,
  chunkSize = 10,
  invocationOverheadDuration = 0,
): AsyncGenerator<AveragedIntermediateTestResultPerSize, void, AveragedUnionTestResultPerSize> {
  if (sizes.length < 2) {
    warn('SIZES', 'Time complexity measurement disabled: Growth rate cannot be calculated with < 2 sizes')
  }
  let timePassed = 0
  let startTime = performance.now()
  const averagedResult: AveragedUnionTestResultPerSize = {}

  for (const { name, fn } of algorithms) {
    info(
      'TEST',
      `${name} (input sizes: [${sizes}], each ${iterations} iterations, ${chunkSize} in parallel, timeout after ${
        maxExecutionTime / 1000
      }s)...`,
    )
    averagedResult[name] = {
      complexity: 0,
    } as any

    let averageDurations = []
    for (const size of sizes) {
      let calls = 0

      const resultsPerSize: Array<TestResult> = []

      for await (const chunk of chunkedAsyncTimes(iterations, chunkSize)) {
        const testResults = await Promise.all(
          chunk.map(async () => {
            const { duration } = await test(name, fn, size, calls)
            calls++

            return { name, size, duration }
          }),
        )

        resultsPerSize.push(...testResults)

        if (timePassed < maxExecutionTime) {
          yield { done: false, value: averagedResult }
        }
        const now = performance.now()
        timePassed += now - startTime
        startTime = now

        if (timePassed >= maxExecutionTime) {
          warn('MAX_EXECUTION_TIME', 'Maximum execution time exceeded. Yielding incomplete measurement result')
          yield { done: true, value: averagedResult }
        }
      }

      let duration = 0

      // disregard the first 25% of a test run due to optimizer magic
      const results = warm ? filterFirst25Percent(resultsPerSize, iterations) : resultsPerSize
      results.forEach((r) => (duration += r.duration))

      const warmSubtrahend = warm ? get25Percent(iterations) : 0
      // prevent division by zero in *rare* cases where the average invocation overhead duration is higher than the measured duration
      const adjustedDuration = Math.max(duration - invocationOverheadDuration, 0.0000000001);

      averageDurations.push(((adjustedDuration) / (calls - warmSubtrahend)))

      // correct the number calls that were measured / counted in
      calls -= warmSubtrahend
    }

    averagedResult[name].duration = averageDurations.reduce((a, b) => a + b, 0)
    averagedResult[name].complexity = getGrowthRate(averageDurations)
    averagedResult[name].estimatedDomains = estimateComplexityInBigONotation(averagedResult[name].complexity)
    averageDurations = []
  }
  yield { done: true, value: averagedResult }
}

export async function* chunkedAsyncTimes(count: number, chunkSize: number): AsyncGenerator<Array<number>> {
  const chunks = Math.ceil(count / chunkSize)
  for (let i = 0; i < chunks; i++) {
    const start = i * chunkSize
    const end = start + chunkSize
    const chunk = []
    for (let j = start; j < end && j < count; j++) {
      chunk.push(j)
    }
    yield chunk
  }
}

export async function perf(
  algorithms: Array<AlgorithmCandidate>,
  sizes: Array<number> = defaultSizes,
  warm = true,
  iterations = 100,
  maxExecutionTime = 30000,
  chunkSize: number | boolean = true, 
): Promise<AveragedUnionTestResultPerSize> {


  let invocationOverheadDuration = 0;
  for (let i=0; i<100; i++) {

    const invokationOverheadGenerator = perfStreamed([{
      name: 'nop',
      fn: async (size: number) => {
        // nop
      }
    }], sizes, warm, iterations, maxExecutionTime, 1)
    
    for await (const result of invokationOverheadGenerator) {
      if (result.done) {
        Object.keys(result.value).forEach((key) => {
          const { duration } = result.value[key]
          if (i >= 25) { // warm up cut off, JIT optimizer magic
            invocationOverheadDuration += duration
          }
        });
      }
    }
  }
  // average invocation overhead duration, with warm up cut off
  invocationOverheadDuration = invocationOverheadDuration / 75;

    // test ticket sizes from 1 to 101 in steps of 10 to find the magic batch size that yields precise time measurements
  if (typeof chunkSize === 'boolean' && chunkSize === true) {
    let continueOptimization = true
    let testChunkSize = 1
    while (continueOptimization) {
      const generatorWarm = perfStreamed(algorithms, sizes, warm, iterations, maxExecutionTime, testChunkSize)

      const warmResults = []
      for await (const result of generatorWarm) {
        if (result.done) {
          Object.keys(result.value).forEach((key) => {
            const { duration } = result.value[key]
            warmResults.push(duration)
          });
        }
      }

      const zeroResults = warmResults.filter((d) => d < 0.01)
    
      if ( zeroResults.length === 0) {
        continueOptimization = false;
        chunkSize = testChunkSize
      } else {
        testChunkSize += 10
      }
    }

    if (testChunkSize > 1000) {
      warn('CHUNK_SIZE', 'Chunk size optimization failed. Using default chunk size of 10')
      chunkSize = 10
      continueOptimization = false;
    }
  }

  const generator = perfStreamed(algorithms, sizes, warm, iterations, maxExecutionTime, typeof chunkSize === "number" ? chunkSize : 10, invocationOverheadDuration)

  for await (const result of generator) {
    if (result.done) {
      return result.value
    }
  }
}
