import { jest } from '@jest/globals'
import {
  AveragedTestResultPerSize,
  perf,
  AlgorithmCandidate,
  defaultSizes,
  perfStreamed,
  AveragedIntermediateTestResultPerSize,
  AveragedUnionTestResultPerSize,
} from '../dist/index.esm'

describe('perf', () => {
  it('is defined', () => {
    expect(perf).toBeDefined()
  })
})

const shuffleArrayFisherYates = (array: Array<any>) => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    const temp = array[i]
    array[i] = array[j]
    array[j] = temp
  }
  return array
}

// Algo with error
const linearAddError: AlgorithmCandidate = {
  name: 'linearAdd',
  fn: async (size: number) => {
    function incrementByOne(num: number): number {
      if (num > 1) throw new Error('ugh')
      return num + 1
    }
    incrementByOne(size)
  },
}

// 1) O(1): Constant complexity.
const linearAdd: AlgorithmCandidate = {
  name: 'linearAdd',
  fn: async (size: number) => {
    function incrementByOne(num: number): number {
      return num + 1
    }
    incrementByOne(size)
  },
}

const linearMultiply: AlgorithmCandidate = {
  name: 'linearMultiply',
  fn: async (size: number) => {
    function incrementByOne(num: number): number {
      return num + 1 * 567 * num
    }
    incrementByOne(size)
  },
}

// 2) O(logn): Logarithmic complexity.
const logarithmicBinarySearch: AlgorithmCandidate = {
  name: 'logBinSearchOlogn',
  fn: async (size: number) => {
    const needle = Math.random()
    const haystack = Array.from({ length: size }, () => Math.random())
    haystack.push(needle)

    function binarySearch(array: number[], target: number): number {
      let low = 0
      let high = array.length - 1

      while (low <= high) {
        const mid = Math.floor((low + high) / 2)

        if (array[mid] === target) {
          return mid
        } else if (array[mid] < target) {
          low = mid + 1
        } else {
          high = mid - 1
        }
      }

      return -1
    }
    binarySearch(haystack, needle)
  },
}

// 3) O(n): Linear complexity.
const linearSumArray: AlgorithmCandidate = {
  name: 'linearSumArray',
  fn: async (size: number) => {
    const haystack = Array.from({ length: size }, () => Math.random())
    function sumArray(array: number[]): number {
      let sum = 0
      for (let i = 0; i < array.length; i++) {
        sum += array[i]
      }
      return sum
    }
    sumArray(haystack)
  },
}

// 4) O(nlogn): Loglinear complexity.
const logLinearMergeSort: AlgorithmCandidate = {
  name: 'logLinearMergeSort',
  fn: async (size: number) => {
    const haystack = Array.from({ length: size }, () => Math.random())
    function countInversions(array: number[]): number {
      const mergeSort = (array: number[], temp: number[], left: number, right: number): number => {
        let inversions = 0
        if (left < right) {
          const mid = Math.floor((left + right) / 2)
          inversions += mergeSort(array, temp, left, mid)
          inversions += mergeSort(array, temp, mid + 1, right)
          inversions += merge(array, temp, left, mid + 1, right)
        }
        return inversions
      }

      const merge = (array: number[], temp: number[], left: number, mid: number, right: number): number => {
        let i = left
        let j = mid
        let k = left
        let inversions = 0

        while (i <= mid - 1 && j <= right) {
          if (array[i] <= array[j]) {
            temp[k++] = array[i++]
          } else {
            temp[k++] = array[j++]
            inversions += mid - i
          }
        }

        while (i <= mid - 1) {
          temp[k++] = array[i++]
        }

        while (j <= right) {
          temp[k++] = array[j++]
        }

        for (i = left; i <= right; i++) {
          array[i] = temp[i]
        }

        return inversions
      }

      const temp = new Array(array.length)
      return mergeSort(array, temp, 0, array.length - 1)
    }
    countInversions(haystack)
  },
}

// 4) O(nlogn): Loglinear complexity. (2)
const quickSort: AlgorithmCandidate = {
  name: 'QuickSort',
  fn: async (size: number) => {
    const arr = Array.from({ length: size }).map(() => Math.random())

    const partition = (arr: number[], low: number, high: number): number => {
      const pivot = arr[high]
      let i = low - 1

      for (let j = low; j < high; j++) {
        if (arr[j] < pivot) {
          i++
          const temp = arr[i]
          arr[i] = arr[j]
          arr[j] = temp
        }
      }

      const temp = arr[i + 1]
      arr[i + 1] = arr[high]
      arr[high] = temp

      return i + 1
    }

    const quickSort = (arr: number[], low: number, high: number): void => {
      if (low < high) {
        const pi = partition(arr, low, high)
        quickSort(arr, low, pi - 1)
        quickSort(arr, pi + 1, high)
      }
    }

    quickSort(arr, 0, arr.length - 1)
  },
}

// 5) O(n^x): Polynomial complexity.
const polynominalFindDuplicates: AlgorithmCandidate = {
  name: 'polynominalFindDuplicates',
  fn: async (size: number) => {
    const haystack = shuffleArrayFisherYates(Array.from({ length: size }, () => Math.random().toString()))
    function findDuplicates(array: string[]): string[] {
      const result: string[] = []
      for (let i = 0; i < array.length; i++) {
        for (let j = i + 1; j < array.length; j++) {
          if (array[i] === array[j] && !result.includes(array[i])) {
            result.push(array[i])
          }
        }
      }
      return result
    }
    findDuplicates([...haystack, ...haystack])
  },
}

// 5) O(n^x): Polynomial complexity. (2)
const bubbleSort: AlgorithmCandidate = {
  name: 'BubbleSort',
  fn: async (size: number) => {
    const arr = Array.from({ length: size }).map(() => Math.random())
    for (let i = 0; i < arr.length; i++) {
      for (let j = 0; j < arr.length - 1; j++) {
        if (arr[j] > arr[j + 1]) {
          const tmp = arr[j]
          arr[j] = arr[j + 1]
          arr[j + 1] = tmp
        }
      }
    }
  },
}

// 6) O(X^n): Exponential time.
const exponentialFibonacci: AlgorithmCandidate = {
  name: 'exponentialFibonacci',
  fn: async (size: number) => {
    function fibonacci(n: number): number {
      if (n <= 1) {
        return n
      }
      return fibonacci(n - 1) + fibonacci(n - 2)
    }
    fibonacci(size)
  },
}

// 7) O(n!): Factorial complexity.
const fractionalPermuteArray: AlgorithmCandidate = {
  name: 'fractionalPermuteArray',
  fn: async (size: number) => {
    const haystack = Array.from({ length: size }, () => Math.random())
    function permuteArray(array: number[]): number[][] {
      if (array.length <= 1) {
        return [array]
      }

      const result: number[][] = []
      for (let i = 0; i < array.length; i++) {
        const [first] = array.splice(i, 1)
        const perms = permuteArray(array)
        for (let j = 0; j < perms.length; j++) {
          result.push([first, ...perms[j]])
        }
        array.splice(i, 0, first)
      }
      return result
    }
    permuteArray(haystack)
  },
}

describe('perf', () => {
  it('measures fractional complexity', async () => {
    const algorithms: AlgorithmCandidate[] = [fractionalPermuteArray]

    const data = await perf(algorithms, [1, 2, 5, 7], false, 10, 40000, 10)

    expect(data).toBeDefined()
    expect(Object.keys(data).length).toBe(1)

    const fractionalPermuteArrayResult: AveragedTestResultPerSize = data[fractionalPermuteArray.name]
    expect(fractionalPermuteArrayResult).toBeDefined()
    expect(fractionalPermuteArrayResult.complexity).toBe(1)
    expect(fractionalPermuteArrayResult.estimatedDomains[0].scientificNotation).toBe('O(n!)')
    expect(fractionalPermuteArrayResult.estimatedDomains[0].rating).toBe('abysmal')
    expect(fractionalPermuteArrayResult.estimatedDomains[0].description).toBe('Factorial Complexity')
  })

  it('measures exponential time complexity, warm', async () => {
    const algorithms: AlgorithmCandidate[] = [exponentialFibonacci]

    const data = await perf(algorithms, [1, 2, 5, 10, 15], true, 10, 40000, 10)

    expect(data).toBeDefined()
    expect(Object.keys(data).length).toBe(1)

    const exponentialFibonacciResult: AveragedTestResultPerSize = data[exponentialFibonacci.name]
    expect(exponentialFibonacciResult).toBeDefined()
    expect(exponentialFibonacciResult.complexity).toBeGreaterThan(0.5)
    expect(exponentialFibonacciResult.complexity).toBeLessThan(1)
    expect(exponentialFibonacciResult.estimatedDomains[0].scientificNotation).toBe('O(Xⁿ)')
    expect(exponentialFibonacciResult.estimatedDomains[0].rating).toBe('atrocious')
    expect(exponentialFibonacciResult.estimatedDomains[0].description).toBe('Exponential Time')
  })

  it('measures polynominal time complexity, warm', async () => {
    const algorithms: AlgorithmCandidate[] = [polynominalFindDuplicates]

    const data = await perf(
      algorithms,
      [1, 2, 5, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 150, 200],
      true,
      100,
      40000,
      100,
    )

    expect(data).toBeDefined()
    expect(Object.keys(data).length).toBe(1)

    const polynominalFindDuplicatesResult: AveragedTestResultPerSize = data[polynominalFindDuplicates.name]
    expect(polynominalFindDuplicatesResult).toBeDefined()
    expect(polynominalFindDuplicatesResult.complexity).toBeGreaterThan(0.28)
    expect(polynominalFindDuplicatesResult.complexity).toBeLessThan(0.45)
    expect(polynominalFindDuplicatesResult.estimatedDomains[0].scientificNotation).toBe('O(nˣ)')
    expect(polynominalFindDuplicatesResult.estimatedDomains[0].rating).toBe('disastrous')
    expect(polynominalFindDuplicatesResult.estimatedDomains[0].description).toBe('Polynomial Complexity')
  })

  it('should measure performance of sorting algorithms, cold IMPACT, 100 iteration', async () => {
    const algorithms: AlgorithmCandidate[] = [bubbleSort, quickSort]

    const data = await perf(algorithms, defaultSizes, false, 10, 40000)

    console.log('bubbel + quick data IMPACT 10, cold', data)

    expect(data).toBeDefined()
    expect(Object.keys(data).length).toBe(2)

    const bubbleSortResult: AveragedTestResultPerSize = data[bubbleSort.name]
    expect(bubbleSortResult).toBeDefined()
    expect(bubbleSortResult.complexity).toBeGreaterThan(0.28)
    expect(bubbleSortResult.complexity).toBeLessThan(0.5)

    const quickSortResult: AveragedTestResultPerSize = data[quickSort.name]
    expect(quickSortResult).toBeDefined()
    expect(quickSortResult.complexity).toBeGreaterThan(0.17)
    expect(quickSortResult.complexity).toBeLessThan(0.3)
  })

  it('should measure performance of sorting algorithms, warm', async () => {
    const algorithms: AlgorithmCandidate[] = [bubbleSort, quickSort]

    const data = await perf(algorithms, defaultSizes, true, 100, 30000)

    console.log('bubbel + quick data 100, warm', data)

    expect(data).toBeDefined()
    expect(Object.keys(data).length).toBe(2)

    const bubbleSortResult: AveragedTestResultPerSize = data[bubbleSort.name]
    expect(bubbleSortResult).toBeDefined()
    expect(bubbleSortResult.complexity).toBeGreaterThan(0.3)
    expect(bubbleSortResult.complexity).toBeLessThan(0.39)

    const quickSortResult: AveragedTestResultPerSize = data[quickSort.name]
    expect(quickSortResult).toBeDefined()
    expect(quickSortResult.complexity).toBeGreaterThan(0.22)
    expect(quickSortResult.complexity).toBeLessThan(0.26)
  })

  it('measures logLinear time complexity', async () => {
    const algorithms: AlgorithmCandidate[] = [logLinearMergeSort]

    const data = await perf(algorithms, defaultSizes, true, 100, 30000)

    console.log('logLinearMergeSortResult', data)

    expect(data).toBeDefined()
    expect(Object.keys(data).length).toBe(1)

    const logLinearMergeSortResult: AveragedTestResultPerSize = data[logLinearMergeSort.name]
    expect(logLinearMergeSortResult).toBeDefined()
    expect(logLinearMergeSortResult.complexity).toBeGreaterThan(0.2)
    expect(logLinearMergeSortResult.complexity).toBeLessThan(0.3)
  })

  it('measures linear complexity', async () => {
    const algorithms: AlgorithmCandidate[] = [linearSumArray]

    const data = await perf(algorithms, defaultSizes, true, 100, 30000)

    console.log('linearSumArray', data)

    expect(data).toBeDefined()
    expect(Object.keys(data).length).toBe(1)

    const linearSumArrayResult: AveragedTestResultPerSize = data[linearSumArray.name]
    expect(linearSumArrayResult).toBeDefined()
    expect(linearSumArrayResult.complexity).toBeGreaterThan(0.2)
    expect(linearSumArrayResult.complexity).toBeLessThan(0.28)
  })

  it('measures logarithmic complexity', async () => {
    const algorithms: AlgorithmCandidate[] = [logarithmicBinarySearch]

    const data = await perf(algorithms, defaultSizes, true, 100, 30000)

    console.log('logarithmicBinarySearchResult', data)

    expect(data).toBeDefined()
    expect(Object.keys(data).length).toBe(1)

    const logarithmicBinarySearchResult: AveragedTestResultPerSize = data[logarithmicBinarySearch.name]
    expect(logarithmicBinarySearchResult).toBeDefined()
    expect(logarithmicBinarySearchResult.complexity).toBeGreaterThan(0.15)
    expect(logarithmicBinarySearchResult.complexity).toBeLessThan(0.25)
  })

  it('measures constant complexity', async () => {
    const algorithms: AlgorithmCandidate[] = [linearAdd]

    const data = await perf(algorithms, [...defaultSizes, 10000, 100000], true, 100, 30000)

    console.log('linearAdd', data)

    expect(data).toBeDefined()
    expect(Object.keys(data).length).toBe(1)

    const linearAddResult: AveragedTestResultPerSize = data[linearAdd.name]
    expect(linearAddResult).toBeDefined()
    expect(linearAddResult.complexity).toBeGreaterThanOrEqual(0)
    expect(linearAddResult.complexity).toBeLessThan(0.05)
  })

  it('measures constant complexity - linearMultiplyResult', async () => {
    const algorithms: AlgorithmCandidate[] = [linearMultiply]

    const data = await perf(algorithms, [...defaultSizes, 10000, 100000], true, 100, 30000)

    console.log('linearMultiplyResult', data)

    expect(data).toBeDefined()
    expect(Object.keys(data).length).toBe(1)

    const linearMultiplyResult: AveragedTestResultPerSize = data[linearMultiply.name]
    expect(linearMultiplyResult).toBeDefined()
    expect(linearMultiplyResult.complexity).toBeGreaterThanOrEqual(0)
    expect(linearMultiplyResult.complexity).toBeLessThan(0.04)
  })

  it('handles errors in algorithms', async () => {
    const algorithms: AlgorithmCandidate[] = [linearAddError]

    const data = await perf(algorithms, [1, 2], true, 1, 30000)

    console.log('linearAddErrorResult', data)

    expect(data).toBeDefined()
    expect(Object.keys(data).length).toBe(1)

    // measurements should be disregarded because catching Errors kills performance

    const linearAddErrorResult: AveragedTestResultPerSize = data[linearAddError.name]
    expect(linearAddErrorResult).toBeDefined()
  })

  it('does not measure complexity when sizes.length < 2', async () => {
    const algorithms: AlgorithmCandidate[] = [linearMultiply]

    const data = await perf(algorithms, [1], true, 100, 30000)

    console.log('linearMultiplyResult', data)

    expect(data).toBeDefined()
    expect(Object.keys(data).length).toBe(1)

    const linearMultiplyResult: AveragedTestResultPerSize = data[linearMultiply.name]
    expect(linearMultiplyResult).toBeDefined()
    expect(linearMultiplyResult.complexity).toEqual(NaN)
  })

  it('handles timeout', async () => {
    const algorithms: AlgorithmCandidate[] = [bubbleSort]

    const data = await perf(algorithms, defaultSizes, false, 100, 200, 10)

    expect(data).toBeDefined()
    expect(Object.keys(data).length).toBe(1)

    const bubbleSortResult: AveragedTestResultPerSize = data[bubbleSort.name]
    expect(bubbleSortResult).toBeDefined()
  })

  it('can call perfStream directly without much arguments', async () => {
    const algorithms: AlgorithmCandidate[] = [linearAdd]

    const data = await perf(algorithms, defaultSizes)

    expect(data).toBeDefined()
    expect(Object.keys(data).length).toBe(1)

    const linearAddResult: AveragedTestResultPerSize = data[linearAdd.name]
    expect(linearAddResult).toBeDefined()
  })

  it('can call perfStream directly without much arguments', async () => {
    const algorithms: AlgorithmCandidate[] = [linearAdd]
    const generator = perfStreamed(algorithms, defaultSizes) as AsyncGenerator<
      AveragedIntermediateTestResultPerSize,
      void,
      AveragedUnionTestResultPerSize
    >

    for await (const result of generator as any) {
      if (result.done) {
        expect(result.value).toBeDefined()
      }
    }
  })

  it('can compare what equals variant is faster: comparing two JSON.stringify()s or using Jests toEqual()', async () => {
    const jestEquals: AlgorithmCandidate = {
      name: 'JestEquals',
      fn: async (size: number) => {
        const haystack = Array.from({ length: size }, () => Math.random())
        expect({
          numbers: haystack,
          foo: 'bar',
          abc: 123,
          bar: {
            deeper: haystack,
          },
        }).toEqual({
          numbers: haystack,
          foo: 'bar',
          abc: 123,
          bar: {
            deeper: haystack,
          },
        })
      },
    }
    const jsonStringifyEquals: AlgorithmCandidate = {
      name: 'JsonStringifyEquals',
      fn: async (size: number) => {
        const haystack = Array.from({ length: size }, () => Math.random())

        JSON.stringify({
          numbers: haystack,
          foo: 'bar',
          abc: 123,
          bar: {
            deeper: haystack,
          },
        }) ===
          JSON.stringify({
            numbers: haystack,
            foo: 'bar',
            abc: 123,
            bar: {
              deeper: haystack,
            },
          })
      },
    }

    const algorithms: AlgorithmCandidate[] = [jestEquals, jsonStringifyEquals]

    const data = await perf(algorithms, defaultSizes, false, 1000, 30000, 10)

    expect(data).toBeDefined()
    expect(Object.keys(data).length).toBe(2)

    const jestEqualsResult: AveragedTestResultPerSize = data[jestEquals.name]
    expect(jestEqualsResult).toBeDefined()

    console.log('jestEqualsResult', jestEqualsResult, jestEqualsResult.estimatedDomains)

    const jsonStringifyEqualsResult: AveragedTestResultPerSize = data[jsonStringifyEquals.name]
    expect(jsonStringifyEqualsResult).toBeDefined()

    console.log('jsonStringifyEqualsResult', jsonStringifyEqualsResult, jsonStringifyEqualsResult.estimatedDomains)
  })

  it('will provide the call index to the algorithm function, optionally', async () => {
    const algorithms: AlgorithmCandidate[] = [{
      name: 'callTest',
      fn: async(size: number, call: number) => {
        expect(size).toBeGreaterThan(-1)
        expect(call).toBeGreaterThan(-1)
      }
    }]
    const generator = perfStreamed(algorithms, defaultSizes) as AsyncGenerator<
      AveragedIntermediateTestResultPerSize,
      void,
      AveragedUnionTestResultPerSize
    >

    for await (const result of generator as any) {
      if (result.done) {
        expect(result.value).toBeDefined()
      }
    }
  })

  it('chunk size optimizer will never pass > 0 duration and must end up using the default chunkSize 10', async () => {
    const data = await perf([{
      name: 'nop',
      fn: async (size: number) => {
         // nop
      }
    }], [...defaultSizes, 10000, 100000], true, 100, 30000, true)

    console.log('chunk size optimizer nop', data)

    expect(data).toBeDefined()
    expect(Object.keys(data).length).toBe(1)

    const nopResult: AveragedTestResultPerSize = data["nop"]
    expect(nopResult).toBeDefined()
    expect(nopResult.complexity).toBeLessThan(0.05) // may lead to a tiny signal in complexity, due to many factors
    expect(nopResult.duration).toBeLessThan(0.05) // may take a hundredth of a millisecond to run so many NOP instructions
  })
})
