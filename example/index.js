import { perf } from '../dist/index.esm.js'

// call your algorithm from within the candidate fn() object
// the size is the input size - a number to use for scaling

// O(1): Constant complexity.
const incrementByOne = {
  name: 'LinearAdd',
  fn: async (size) => {
    function incrementByOne(num) {
      return num + 1
    }
    incrementByOne(size)
  },
}

// O(n^x): Polynomial complexity
const bubbleSort = {
  name: 'BubbleSort',
  fn: async (size) => {
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

// pass one or more algorithms
const measurement = await perf([incrementByOne, bubbleSort])

console.log('=== PERF: BubbleSort ===')
console.log('runtime duration', measurement['BubbleSort'].duration, 'ms')
console.log(JSON.stringify(measurement['BubbleSort'].estimatedDomains, null, 4))

console.log('=== PERF: LinearAdd ===')
console.log('runtime duration', measurement['LinearAdd'].duration, 'ms')
console.log(JSON.stringify(measurement['LinearAdd'].estimatedDomains, null, 4))
