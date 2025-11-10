/**
 * 연습문제 5.2: TaskQueue를 async/await로 변환
 *
 * 과제: Promise 기반 TaskQueue를 async/await로 리팩토링
 * - 원래 기능 유지
 * - async/await 패턴 활용
 * - 가독성 향상
 */

console.log('=== 연습문제 5.2: TaskQueue async/await 변환 ===\n')

function delay(ms, value) {
  return new Promise(resolve => setTimeout(() => resolve(value), ms))
}

// 원본: Promise 기반 TaskQueue
console.log('--- 1. 원본: Promise 기반 TaskQueue ---\n')

class TaskQueuePromise {
  constructor(concurrency) {
    this.concurrency = concurrency
    this.running = 0
    this.queue = []
  }

  runTask(task) {
    return new Promise((resolve, reject) => {
      this.queue.push(() => {
        return task().then(resolve, reject)
      })
      process.nextTick(this.next.bind(this))
    })
  }

  next() {
    while (this.running < this.concurrency && this.queue.length) {
      const task = this.queue.shift()
      task().finally(() => {
        this.running--
        this.next()
      })
      this.running++
    }
  }
}

const promiseQueue = new TaskQueuePromise(2)
const tasks1 = [
  () => delay(100, 'Task 1'),
  () => delay(100, 'Task 2'),
  () => delay(100, 'Task 3'),
  () => delay(100, 'Task 4')
]

console.log('Promise 버전 실행:')
const start1 = Date.now()
Promise.all(tasks1.map(task =>
  promiseQueue.runTask(() => task().then(result => {
    console.log(`  ${result} 완료`)
    return result
  }))
)).then(() => {
  console.log(`소요: ${Date.now() - start1}ms\n`)
  demonstrateAsyncAwait()
})

function demonstrateAsyncAwait() {
  console.log('--- 2. async/await 변환 버전 ---\n')

  class TaskQueueAsync {
    constructor(concurrency) {
      this.concurrency = concurrency
      this.running = 0
      this.queue = []
    }

    async runTask(task) {
      return new Promise((resolve, reject) => {
        this.queue.push(async () => {
          try {
            const result = await task()
            resolve(result)
          } catch (err) {
            reject(err)
          }
        })
        process.nextTick(() => this.next())
      })
    }

    async next() {
      while (this.running < this.concurrency && this.queue.length) {
        const task = this.queue.shift()
        this.running++

        // 비동기로 실행
        task()
          .finally(() => {
            this.running--
            this.next()
          })
      }
    }
  }

  const asyncQueue = new TaskQueueAsync(2)
  const tasks2 = [
    () => delay(100, 'Task 1'),
    () => delay(100, 'Task 2'),
    () => delay(100, 'Task 3'),
    () => delay(100, 'Task 4')
  ]

  console.log('async/await 버전 실행:')
  const start2 = Date.now()
  Promise.all(tasks2.map(task =>
    asyncQueue.runTask(async () => {
      const result = await task()
      console.log(`  ${result} 완료`)
      return result
    })
  )).then(() => {
    console.log(`소요: ${Date.now() - start2}ms\n`)
    demonstrateCleanVersion()
  })
}

function demonstrateCleanVersion() {
  console.log('--- 3. 더 깔끔한 버전 ---\n')

  class TaskQueueClean {
    constructor(concurrency) {
      this.concurrency = concurrency
      this.running = 0
      this.queue = []
    }

    async runTask(task) {
      // Promise 래퍼 생성
      const taskWrapper = this.createTaskWrapper(task)
      this.queue.push(taskWrapper)
      this.processQueue()
      return taskWrapper.promise
    }

    createTaskWrapper(task) {
      let resolve, reject
      const promise = new Promise((res, rej) => {
        resolve = res
        reject = rej
      })

      const execute = async () => {
        try {
          const result = await task()
          resolve(result)
        } catch (err) {
          reject(err)
        }
      }

      return { promise, execute }
    }

    async processQueue() {
      while (this.running < this.concurrency && this.queue.length) {
        const taskWrapper = this.queue.shift()
        this.running++

        taskWrapper.execute().finally(() => {
          this.running--
          this.processQueue()
        })
      }
    }
  }

  const cleanQueue = new TaskQueueClean(2)
  const tasks3 = Array(6).fill(null).map((_, i) =>
    () => delay(100, `Task ${i + 1}`)
  )

  console.log('Clean 버전 실행 (6개 작업, 동시성 2):')
  const start3 = Date.now()
  Promise.all(tasks3.map(task =>
    cleanQueue.runTask(async () => {
      const result = await task()
      console.log(`  ${result} 완료`)
      return result
    })
  )).then(() => {
    console.log(`소요: ${Date.now() - start3}ms (예상: 300ms)\n`)
    demonstrateErrorHandling()
  })
}

function demonstrateErrorHandling() {
  console.log('--- 4. 에러 처리 개선 ---\n')

  class TaskQueueWithError {
    constructor(concurrency) {
      this.concurrency = concurrency
      this.running = 0
      this.queue = []
    }

    async runTask(task) {
      return new Promise((resolve, reject) => {
        this.queue.push(async () => {
          try {
            const result = await task()
            resolve(result)
          } catch (err) {
            reject(err)
          }
        })
        this.processNext()
      })
    }

    async processNext() {
      while (this.running < this.concurrency && this.queue.length) {
        const task = this.queue.shift()
        this.running++

        // 에러가 발생해도 큐는 계속 처리
        task()
          .catch(err => {
            console.log(`  에러 발생: ${err.message}`)
          })
          .finally(() => {
            this.running--
            this.processNext()
          })
      }
    }
  }

  const errorQueue = new TaskQueueWithError(2)
  const tasksWithError = [
    () => delay(100, 'Success 1'),
    () => Promise.reject(new Error('Failed!')),
    () => delay(100, 'Success 2'),
    () => delay(100, 'Success 3')
  ]

  console.log('에러 처리 테스트:')
  Promise.allSettled(tasksWithError.map(task =>
    errorQueue.runTask(task)
  )).then(results => {
    const succeeded = results.filter(r => r.status === 'fulfilled')
    console.log(`성공: ${succeeded.length}개\n`)

    demonstrateComparison()
  })
}

function demonstrateComparison() {
  console.log('--- 5. Promise vs async/await 비교 ---\n')

  console.log('Promise 버전:')
  console.log('✓ 콜백 패턴 (.then, .catch)')
  console.log('✓ Promise 생성자 직접 사용')
  console.log('✓ 체이닝 필요')
  console.log('✗ 가독성 낮음')
  console.log()

  console.log('async/await 버전:')
  console.log('✓ 동기 코드처럼 읽힘')
  console.log('✓ try-catch 에러 처리')
  console.log('✓ 코드 간결')
  console.log('✓ 가독성 높음')
  console.log('✓ Promise 생성자 필요시 여전히 사용')
  console.log()

  console.log('--- 6. 실전 활용 예제 ---\n')

  class ImageProcessor {
    constructor(concurrency) {
      this.queue = new TaskQueueClean(concurrency)
    }

    async processImage(imagePath) {
      return this.queue.runTask(async () => {
        console.log(`  이미지 처리 시작: ${imagePath}`)
        await delay(150) // 이미지 처리 시뮬레이션
        console.log(`  이미지 처리 완료: ${imagePath}`)
        return `processed_${imagePath}`
      })
    }

    async processBatch(imagePaths) {
      console.log(`${imagePaths.length}개 이미지 일괄 처리 시작...`)
      const results = await Promise.all(
        imagePaths.map(path => this.processImage(path))
      )
      console.log('일괄 처리 완료!')
      return results
    }
  }

  class TaskQueueClean {
    constructor(concurrency) {
      this.concurrency = concurrency
      this.running = 0
      this.queue = []
    }

    async runTask(task) {
      return new Promise((resolve, reject) => {
        this.queue.push(async () => {
          try {
            const result = await task()
            resolve(result)
          } catch (err) {
            reject(err)
          }
        })
        this.processQueue()
      })
    }

    async processQueue() {
      while (this.running < this.concurrency && this.queue.length) {
        const task = this.queue.shift()
        this.running++
        task().finally(() => {
          this.running--
          this.processQueue()
        })
      }
    }
  }

  const processor = new ImageProcessor(3)
  const images = ['img1.jpg', 'img2.jpg', 'img3.jpg', 'img4.jpg', 'img5.jpg']

  processor.processBatch(images).then(results => {
    console.log('처리된 이미지:', results.length, '개\n')

    console.log('=== 핵심 포인트 ===')
    console.log('✅ async/await로 가독성 크게 향상')
    console.log('✅ try-catch로 에러 처리 간소화')
    console.log('✅ Promise 생성자는 필요시 계속 사용')
    console.log('✅ 동기 코드처럼 읽히지만 비동기로 실행')
    console.log('✅ 복잡한 로직도 직관적으로 표현')
    console.log('✅ 실무에서는 p-limit 같은 라이브러리 사용 권장')
  })
}

/*
예상 출력:
=== 연습문제 5.2: TaskQueue async/await 변환 ===

--- 1. 원본: Promise 기반 TaskQueue ---

Promise 버전 실행:
  Task 1 완료
  Task 2 완료
  Task 3 완료
  Task 4 완료
소요: 200ms

--- 2. async/await 변환 버전 ---

async/await 버전 실행:
  Task 1 완료
  Task 2 완료
  Task 3 완료
  Task 4 완료
소요: 200ms

--- 3. 더 깔끔한 버전 ---

Clean 버전 실행 (6개 작업, 동시성 2):
  Task 1 완료
  Task 2 완료
  Task 3 완료
  Task 4 완료
  Task 5 완료
  Task 6 완료
소요: 300ms (예상: 300ms)

--- 4. 에러 처리 개선 ---

에러 처리 테스트:
  에러 발생: Failed!
성공: 3개

--- 5. Promise vs async/await 비교 ---

Promise 버전:
✓ 콜백 패턴 (.then, .catch)
✓ Promise 생성자 직접 사용
✓ 체이닝 필요
✗ 가독성 낮음

async/await 버전:
✓ 동기 코드처럼 읽힘
✓ try-catch 에러 처리
✓ 코드 간결
✓ 가독성 높음
✓ Promise 생성자 필요시 여전히 사용

--- 6. 실전 활용 예제 ---

5개 이미지 일괄 처리 시작...
  이미지 처리 시작: img1.jpg
  이미지 처리 시작: img2.jpg
  이미지 처리 시작: img3.jpg
  이미지 처리 완료: img1.jpg
  이미지 처리 시작: img4.jpg
  이미지 처리 완료: img2.jpg
  이미지 처리 시작: img5.jpg
  이미지 처리 완료: img3.jpg
  이미지 처리 완료: img4.jpg
  이미지 처리 완료: img5.jpg
일괄 처리 완료!
처리된 이미지: 5 개

=== 핵심 포인트 ===
✅ async/await로 가독성 크게 향상
✅ try-catch로 에러 처리 간소화
✅ Promise 생성자는 필요시 계속 사용
✅ 동기 코드처럼 읽히지만 비동기로 실행
✅ 복잡한 로직도 직관적으로 표현
✅ 실무에서는 p-limit 같은 라이브러리 사용 권장
*/
