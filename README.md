<h1 align="center">@jsheaven/perf</h1>

> Estimates the average runtime and time-complexity (big O notation) of (a)sync algorithms

<h2 align="center">User Stories</h2>

1. As a developer, I want to know what which algorithm of two or more algorithms is faster

<h2 align="center">Features</h2>

- ✅ Measures the runtime (duration) an algorithm (sync or async) takes
- ✅ Estimates the time complexity of an algorithm (sync or async) in big O notation
- ✅ Parallel execution using async generators
- ✅ Streaming implementation, chunked
- ✅ Available as a simple API
- ✅ Just `136 byte` nano sized (ESM, gizpped)
- ✅ Tree-shakable and side-effect free
- ✅ Runs on Windows, Mac, Linux, CI tested
- ✅ First class TypeScript support
- ✅ 100% Unit Test coverage

<h2 align="center">Example usage (API)</h2>

<h3 align="center">Setup</h3>

- yarn: `yarn add @jsheaven/perf`
- npm: `npm install @jsheaven/perf`

<h3 align="center">ESM</h3>

```ts
import { perf } from '@jsheaven/perf'

const result = await perf({
  foo: 'X',
})
```

<h3 align="center">CommonJS</h3>

```ts
const { perf } = require('@jsheaven/perf')

// same API like ESM variant
```

<h2 align="center">Time complexity estimation</h2>

Big O notation is a metric used in computer science to classify an algorithm based on its time and space complexity. It’s written as O(x) and is based on how the algorithm would scale with an increase or decrease in the amount of input data.

The time and space here is not based on the actual number of operations performed or the amount of memory used per se, but rather how the algorithm would scale with an increase or decrease in the amount of input data.

The notation represents how an algorithm will run in a worst-case scenario, in other words what the maximum time or space an algorithm could use is. The complexity is written as O(x), where x is the growth rate of the algorithm in regards to n, which is the amount of data input. Throughout the rest of this post, input will be referred to as n.

<img src="https://upload.wikimedia.org/wikipedia/commons/4/4e/Big-O_Cheatsheet.png" height="300px" />

<h3 align="center">Types of Big O Notations<h3>

There are seven common types of big O notations. These include:

1. O(1): Constant complexity.
2. O(logn): Logarithmic complexity.
3. O(n): Linear complexity.
4. O(nlogn): Loglinear complexity.
5. O(n^x): Polynomial complexity.
6. O(X^n): Exponential time.
7. O(n!): Factorial complexity.

<h4 align="center">O(1): Constant Complexity</h4>

O(1) is known as constant complexity. This implies that the amount of time or memory does not scale with n. For time complexity, this means that n is not iterated on or recursed. Generally, a value will be selected and returned, or a value will be operated on and returned.

> operations are linear,

```ts
const factorizeList = (n: number, list: Array<number>) => list[n] * 2
```

<h3 align="center">Accuracy</h2>

The accuracy of the algorithm for estimating the time complexity of an algorithm based on the runtime measurements obtained from a series of input sizes depends on several factors, including the quality of the data and the assumptions made by the algorithm.

The algorithm for estimating the time complexity uses a <a href="https://en.wikipedia.org/wiki/Logistic_regression" target="_blank">logarithmic regression</a> to fit a curve to the data points, where the input size is the independent variable and the runtime is the dependent variable. The slope of the curve is used to estimate the growth rate of the algorithm as the input size increases, and this growth rate is mapped to a time complexity based on a series of pre-defined ranges.

This algorithm works reasonably well for many types of algorithms, particularly those that exhibit a predictable, non-random pattern of growth as the input size increases. However, there are some types of algorithms that may not fit well with this approach, such as algorithms that exhibit a non-monotonic pattern of growth or have complex, non-linear behavior.

In general, the accuracy of the algorithm depends on the quality of the data obtained from the performance measurements, as well as the assumptions made about the nature of the growth pattern. To obtain accurate estimates of the time complexity, it is important to use a wide range of input sizes, choose input sizes that reflect the expected use case of the algorithm, and carefully consider the assumptions made about the nature of the growth pattern.

Despite these limitations, the algorithm for estimating the time complexity of an algorithm based on the runtime measurements can be a useful tool for gaining insight into the performance characteristics of an algorithm and making informed decisions about algorithm design and optimization.
