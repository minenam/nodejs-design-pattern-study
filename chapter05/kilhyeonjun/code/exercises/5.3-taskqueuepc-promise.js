/**
 * 연습문제 5.3: TaskQueuePC를 Promise만으로 구현
 *
 * 과제: 생산자-소비자 패턴을 async/await 없이 Promise만 사용
 * - 무한 루프에서 메모리 누수 주의!
 * - Promise 생성자와 체이닝만 사용
 * - async/await 키워드 금지
 */

console.log('=== 연습문제 5.3: TaskQueuePC Promise 구현 ===\n')

function delay(ms, value) {
  return new Promise(resolve => setTimeout(() => resolve(value), ms))
}

// 원본: async/await 버전 (참고용)
console.log('--- 1. 원본: async/await 버전 (참고) ---\n')

class TaskQueuePCAsync {
  constructor(concurrency) {
    this.taskQueue = []
    this.consumerQueue = []

    // 소비자 시작
    for (let i = 0; i < concurrency; i++) {
      this.consumer()
    }
  }

  async consumer() {
    while (true) {
      try {
        const task = await this.getNextTask()
        await task()
      } catch (err) {
        console.error('Consumer error:', err.message)
      }
    }
  }

  async getNextTask() {
    return new Promise((resolve) => {
      if (this.taskQueue.length !== 0) {
        return resolve(this.taskQueue.shift())
      }
      this.consumerQueue.push(resolve)
    })
  }

  runTask(task) {
    return new Promise((resolve, reject) => {
      const taskWrapper = () => {
        const taskPromise = task()
        taskPromise.then(resolve, reject)
        return taskPromise
      }

      if (this.consumerQueue.length !== 0) {
        const consumer = this.consumerQueue.shift()
        consumer(taskWrapper)
      } else {
        this.taskQueue.push(taskWrapper)
      }
    })
  }
}

console.log('원본 테스트 (동시성 2):')
const asyncQueue = new TaskQueuePCAsync(2)
const tasks1 = Array(4).fill(null).map((_, i) =>
  () => delay(100, `Task ${i + 1}`)
)

Promise.all(tasks1.map(task =>
  asyncQueue.runTask(() => task().then(result => {
    console.log(`  ${result} 완료`)
    return result
  }))
)).then(() => {
  console.log('모든 작업 완료\n')
  demonstratePromiseVersion()
})

function demonstratePromiseVersion() {
  console.log('--- 2. Promise만 사용한 구현 ---\n')

  class TaskQueuePCPromise {
    constructor(concurrency) {
      this.taskQueue = []
      this.consumerQueue = []

      // 소비자 시작
      for (let i = 0; i < concurrency; i++) {
        this.consumer()
      }
    }

    consumer() {
      // 무한 루프를 Promise 생성자로 감싸서 메모리 누수 방지
      return new Promise((resolve, reject) => {
        const processNext = () => {
          this.getNextTask()
            .then(task => {
              return task()
            })
            .then(() => {
              // 다음 작업 처리 (재귀 아님!)
              processNext()
            })
            .catch(err => {
              console.error('Consumer error:', err.message)
              // 에러 발생해도 계속
              processNext()
            })
        }

        processNext()
      })
    }

    getNextTask() {
      return new Promise((resolve) => {
        if (this.taskQueue.length !== 0) {
          return resolve(this.taskQueue.shift())
        }
        // 대기 중인 소비자로 등록
        this.consumerQueue.push(resolve)
      })
    }

    runTask(task) {
      return new Promise((resolve, reject) => {
        const taskWrapper = () => {
          const taskPromise = task()
          taskPromise.then(resolve, reject)
          return taskPromise
        }

        if (this.consumerQueue.length !== 0) {
          // 대기 중인 소비자 깨우기
          const consumer = this.consumerQueue.shift()
          consumer(taskWrapper)
        } else {
          // 작업 큐에 추가
          this.taskQueue.push(taskWrapper)
        }
      })
    }
  }

  console.log('Promise 버전 테스트 (동시성 2):')
  const promiseQueue = new TaskQueuePCPromise(2)
  const tasks2 = Array(6).fill(null).map((_, i) =>
    () => delay(100, `Task ${i + 1}`)
  )

  Promise.all(tasks2.map(task =>
    promiseQueue.runTask(() => task().then(result => {
      console.log(`  ${result} 완료`)
      return result
    }))
  )).then(() => {
    console.log('모든 작업 완료\n')
    demonstrateMemorySafe()
  })
}

function demonstrateMemorySafe() {
  console.log('--- 3. 메모리 안전 패턴 분석 ---\n')

  console.log('❌ 잘못된 패턴 (메모리 누수):')
  console.log('```javascript')
  console.log('consumer() {')
  console.log('  return this.getNextTask()')
  console.log('    .then(task => task())')
  console.log('    .then(() => this.consumer())  // ← return 재귀!')
  console.log('}')
  console.log('```')
  console.log('문제: 끊어지지 않는 Promise 체인\n')

  console.log('✓ 올바른 패턴 (메모리 안전):')
  console.log('```javascript')
  console.log('consumer() {')
  console.log('  return new Promise(() => {  // 외부 Promise로 감싸기')
  console.log('    const processNext = () => {')
  console.log('      this.getNextTask()')
  console.log('        .then(task => task())')
  console.log('        .then(() => processNext())  // 재귀이지만 안전')
  console.log('    }')
  console.log('    processNext()')
  console.log('  })')
  console.log('}')
  console.log('```')
  console.log('해결: Promise 생성자 안에서는 체인이 끊어짐\n')

  demonstrateComparison()
}

function demonstrateComparison() {
  console.log('--- 4. async/await vs Promise 비교 ---\n')

  console.log('async/await 버전:')
  console.log('✓ while(true)로 명확한 무한 루프')
  console.log('✓ 코드가 직관적')
  console.log('✓ 메모리 안전')
  console.log('✓ 가독성 최고')
  console.log()

  console.log('Promise 버전:')
  console.log('✓ Promise 생성자로 감싸기 필요')
  console.log('✓ 내부 함수로 재귀 패턴')
  console.log('✓ 복잡도 높음')
  console.log('✗ 가독성 낮음')
  console.log('✓ 하지만 여전히 동작함')
  console.log()

  demonstrateRealWorld()
}

function demonstrateRealWorld() {
  console.log('--- 5. 실전 예제: 작업 큐 시스템 ---\n')

  class JobQueue {
    constructor(workers) {
      this.taskQueue = []
      this.consumerQueue = []
      this.workers = workers

      console.log(`JobQueue 시작 (워커: ${workers}명)`)
      for (let i = 0; i < workers; i++) {
        this.startWorker(i + 1)
      }
    }

    startWorker(workerId) {
      return new Promise(() => {
        const work = () => {
          this.getNextJob()
            .then(job => {
              console.log(`  [Worker ${workerId}] 작업 시작: ${job.name}`)
              return job.execute()
            })
            .then(result => {
              console.log(`  [Worker ${workerId}] 작업 완료`)
              work() // 다음 작업
            })
            .catch(err => {
              console.log(`  [Worker ${workerId}] 에러: ${err.message}`)
              work() // 에러 발생해도 계속
            })
        }
        work()
      })
    }

    getNextJob() {
      return new Promise((resolve) => {
        if (this.taskQueue.length > 0) {
          resolve(this.taskQueue.shift())
        } else {
          this.consumerQueue.push(resolve)
        }
      })
    }

    addJob(name, fn) {
      return new Promise((resolve, reject) => {
        const job = {
          name,
          execute: () => {
            return fn().then(resolve, reject)
          }
        }

        if (this.consumerQueue.length > 0) {
          const worker = this.consumerQueue.shift()
          worker(job)
        } else {
          this.taskQueue.push(job)
        }
      })
    }
  }

  const jobQueue = new JobQueue(2)

  const jobs = [
    { name: 'Job 1', fn: () => delay(150, 'Result 1') },
    { name: 'Job 2', fn: () => delay(100, 'Result 2') },
    { name: 'Job 3', fn: () => delay(120, 'Result 3') },
    { name: 'Job 4', fn: () => delay(80, 'Result 4') }
  ]

  Promise.all(jobs.map(job =>
    jobQueue.addJob(job.name, job.fn)
  )).then(() => {
    console.log('\n모든 작업 완료!')
    console.log()
    console.log('=== 핵심 포인트 ===')
    console.log('✅ 생산자-소비자: taskQueue + consumerQueue')
    console.log('✅ 소비자는 코루틴처럼 동작')
    console.log('✅ Promise 생성자로 무한 루프 감싸기')
    console.log('✅ return 재귀는 메모리 누수!')
    console.log('✅ 내부 함수 재귀는 안전 (Promise 생성자 안)')
    console.log('✅ 실무에서는 async/await 사용 권장')
    console.log('✅ 양방향 큐로 효율적인 동기화')
  })
}

/*
예상 출력:
=== 연습문제 5.3: TaskQueuePC Promise 구현 ===

--- 1. 원본: async/await 버전 (참고) ---

원본 테스트 (동시성 2):
  Task 1 완료
  Task 2 완료
  Task 3 완료
  Task 4 완료
모든 작업 완료

--- 2. Promise만 사용한 구현 ---

Promise 버전 테스트 (동시성 2):
  Task 1 완료
  Task 2 완료
  Task 3 완료
  Task 4 완료
  Task 5 완료
  Task 6 완료
모든 작업 완료

--- 3. 메모리 안전 패턴 분석 ---

❌ 잘못된 패턴 (메모리 누수):
```javascript
consumer() {
  return this.getNextTask()
    .then(task => task())
    .then(() => this.consumer())  // ← return 재귀!
}
```
문제: 끊어지지 않는 Promise 체인

✓ 올바른 패턴 (메모리 안전):
```javascript
consumer() {
  return new Promise(() => {  // 외부 Promise로 감싸기
    const processNext = () => {
      this.getNextTask()
        .then(task => task())
        .then(() => processNext())  // 재귀이지만 안전
    }
    processNext()
  })
}
```
해결: Promise 생성자 안에서는 체인이 끊어짐

--- 4. async/await vs Promise 비교 ---

async/await 버전:
✓ while(true)로 명확한 무한 루프
✓ 코드가 직관적
✓ 메모리 안전
✓ 가독성 최고

Promise 버전:
✓ Promise 생성자로 감싸기 필요
✓ 내부 함수로 재귀 패턴
✓ 복잡도 높음
✗ 가독성 낮음
✓ 하지만 여전히 동작함

--- 5. 실전 예제: 작업 큐 시스템 ---

JobQueue 시작 (워커: 2명)
  [Worker 1] 작업 시작: Job 1
  [Worker 2] 작업 시작: Job 2
  [Worker 2] 작업 완료
  [Worker 2] 작업 시작: Job 3
  [Worker 1] 작업 완료
  [Worker 1] 작업 시작: Job 4
  [Worker 1] 작업 완료
  [Worker 2] 작업 완료

모든 작업 완료!

=== 핵심 포인트 ===
✅ 생산자-소비자: taskQueue + consumerQueue
✅ 소비자는 코루틴처럼 동작
✅ Promise 생성자로 무한 루프 감싸기
✅ return 재귀는 메모리 누수!
✅ 내부 함수 재귀는 안전 (Promise 생성자 안)
✅ 실무에서는 async/await 사용 권장
✅ 양방향 큐로 효율적인 동기화
*/
