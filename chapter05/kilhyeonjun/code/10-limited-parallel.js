/**
 * 제한된 병렬 실행 (Limited Parallel Execution)
 * - TaskQueue 클래스 구현
 * - 동시성 제어
 * - 실제 사용 예제
 */

console.log('=== 제한된 병렬 실행 ===\n')

function delay(ms, value) {
  return new Promise(resolve => setTimeout(() => resolve(value), ms))
}

// TaskQueue 구현 (Chapter 5)
class TaskQueue {
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

console.log('--- 1. TaskQueue 기본 사용 ---')

const queue = new TaskQueue(2) // 동시 실행 2개로 제한

const tasks = [
  () => delay(200, 'Task 1'),
  () => delay(200, 'Task 2'),
  () => delay(200, 'Task 3'),
  () => delay(200, 'Task 4'),
  () => delay(200, 'Task 5')
]

console.log('동시성 2로 제한된 실행 시작...')
console.log('예상 시간: 600ms (2개씩 3번)')
const startTime = Date.now()

Promise.all(tasks.map((task, i) => {
  return queue.runTask(() => {
    console.log(`  Task ${i + 1} 시작:`, new Date().toLocaleTimeString())
    return task().then(result => {
      console.log(`  Task ${i + 1} 완료:`, new Date().toLocaleTimeString())
      return result
    })
  })
})).then(results => {
  const elapsed = Date.now() - startTime
  console.log('모든 작업 완료:', results)
  console.log(`총 소요 시간: ${elapsed}ms\n`)

  console.log('--- 2. 동시성 제한의 필요성 ---')
  console.log('✓ CPU/메모리 리소스 보호')
  console.log('✓ API 레이트 리밋 준수')
  console.log('✓ 데이터베이스 연결 제한')
  console.log('✓ 네트워크 대역폭 관리')
  console.log()

  setTimeout(() => {
    console.log('--- 3. 실전 예제: 파일 다운로드 ---')

    import('fs/promises').then(async fsPromises => {
      // 가상 다운로드 함수
      async function downloadFile(url, filename) {
        console.log(`  다운로드 시작: ${url}`)
        await delay(300) // 네트워크 지연 시뮬레이션
        const content = `Downloaded from ${url}`
        await fsPromises.writeFile(filename, content)
        console.log(`  다운로드 완료: ${url} -> ${filename}`)
        return filename
      }

      const urls = [
        'http://example.com/file1.txt',
        'http://example.com/file2.txt',
        'http://example.com/file3.txt',
        'http://example.com/file4.txt',
        'http://example.com/file5.txt'
      ]

      const downloadQueue = new TaskQueue(2) // 동시 다운로드 2개

      console.log('파일 다운로드 시작 (동시 2개)...')
      const dlStart = Date.now()

      const downloads = urls.map((url, i) => {
        const filename = `/tmp/download${i + 1}.txt`
        return downloadQueue.runTask(() => downloadFile(url, filename))
      })

      await Promise.all(downloads)
      const dlTime = Date.now() - dlStart
      console.log(`모든 다운로드 완료 (${dlTime}ms)\n`)

      console.log('--- 4. 에러 처리와 TaskQueue ---')

      const tasksWithError = [
        () => delay(100, 'Success 1'),
        () => delay(100, 'Success 2'),
        () => Promise.reject(new Error('Failed!')),
        () => delay(100, 'Success 3')
      ]

      const errorQueue = new TaskQueue(2)

      console.log('에러가 있는 작업들 실행...')
      const results = await Promise.allSettled(
        tasksWithError.map((task, i) =>
          errorQueue.runTask(task).catch(err => {
            console.log(`  Task ${i + 1} 실패:`, err.message)
            throw err
          })
        )
      )

      const succeeded = results.filter(r => r.status === 'fulfilled').length
      const failed = results.filter(r => r.status === 'rejected').length
      console.log(`성공: ${succeeded}, 실패: ${failed}\n`)

      console.log('--- 5. 동시성별 성능 비교 ---')

      async function testConcurrency(concurrency, taskCount, taskDuration) {
        const testQueue = new TaskQueue(concurrency)
        const testTasks = Array(taskCount).fill(null).map((_, i) =>
          () => delay(taskDuration, `Task ${i + 1}`)
        )

        const start = Date.now()
        await Promise.all(testTasks.map(task => testQueue.runTask(task)))
        const elapsed = Date.now() - start

        const batches = Math.ceil(taskCount / concurrency)
        const expected = batches * taskDuration
        console.log(`동시성 ${concurrency}: ${elapsed}ms (예상: ${expected}ms)`)
      }

      console.log('10개 작업, 각 100ms:')
      await testConcurrency(1, 10, 100)  // 순차
      await testConcurrency(2, 10, 100)  // 2개씩
      await testConcurrency(5, 10, 100)  // 5개씩
      await testConcurrency(10, 10, 100) // 전체 병렬

      console.log()
      console.log('--- 6. TaskQueue vs 무제한 병렬 ---')

      // 무제한 병렬
      console.log('무제한 병렬 (20개 작업):')
      const unlimitedStart = Date.now()
      const unlimitedTasks = Array(20).fill(null).map((_, i) =>
        delay(100, `Task ${i + 1}`)
      )
      await Promise.all(unlimitedTasks)
      const unlimitedTime = Date.now() - unlimitedStart
      console.log(`  소요 시간: ${unlimitedTime}ms`)
      console.log(`  동시 실행: 20개 (리소스 부담 큼)\n`)

      // TaskQueue 사용
      console.log('TaskQueue (20개 작업, 동시성 5):')
      const limitedQueue = new TaskQueue(5)
      const limitedStart = Date.now()
      const limitedTasks = Array(20).fill(null).map((_, i) =>
        () => delay(100, `Task ${i + 1}`)
      )
      await Promise.all(limitedTasks.map(task => limitedQueue.runTask(task)))
      const limitedTime = Date.now() - limitedStart
      console.log(`  소요 시간: ${limitedTime}ms`)
      console.log(`  동시 실행: 최대 5개 (리소스 절약)\n`)

      console.log('--- 7. 실무 권장사항 ---')
      console.log('✓ 직접 구현보다 npm 패키지 사용 권장')
      console.log('  - p-limit: 간단하고 가벼움')
      console.log('  - p-queue: 우선순위, 타임아웃 등 고급 기능')
      console.log('✓ 적절한 동시성 값 찾기')
      console.log('  - CPU 집약적: CPU 코어 수')
      console.log('  - I/O 집약적: 10~100 (테스트 필요)')
      console.log('  - API 호출: API 레이트 리밋 고려')

      console.log()
      console.log('--- 8. p-limit 스타일 간단 구현 ---')

      function createLimit(concurrency) {
        const queue = new TaskQueue(concurrency)
        return (fn) => queue.runTask(fn)
      }

      const limit = createLimit(3)

      console.log('p-limit 스타일 사용:')
      const simpleTasks = [1, 2, 3, 4, 5, 6].map(i =>
        limit(() => {
          console.log(`  작업 ${i} 실행`)
          return delay(150, i)
        })
      )

      const simpleResults = await Promise.all(simpleTasks)
      console.log('결과:', simpleResults)

      console.log()
      console.log('=== 핵심 포인트 ===')
      console.log('✅ TaskQueue: 동시 실행 작업 수 제한')
      console.log('✅ queue + running 카운터로 제어')
      console.log('✅ 리소스 보호 및 레이트 리밋 준수')
      console.log('✅ 실무에서는 p-limit 같은 라이브러리 사용')
      console.log('✅ 적절한 동시성 값은 테스트로 결정')
      console.log('✅ Promise.all()과 함께 사용')
    })
  }, 700)
})

/*
예상 출력:
=== 제한된 병렬 실행 ===

--- 1. TaskQueue 기본 사용 ---
동시성 2로 제한된 실행 시작...
예상 시간: 600ms (2개씩 3번)
  Task 1 시작: [시간]
  Task 2 시작: [시간]
  Task 1 완료: [시간+200ms]
  Task 3 시작: [시간+200ms]
  Task 2 완료: [시간+200ms]
  Task 4 시작: [시간+200ms]
  Task 3 완료: [시간+400ms]
  Task 5 시작: [시간+400ms]
  Task 4 완료: [시간+400ms]
  Task 5 완료: [시간+600ms]
모든 작업 완료: ['Task 1', 'Task 2', 'Task 3', 'Task 4', 'Task 5']
총 소요 시간: 600ms

--- 2. 동시성 제한의 필요성 ---
✓ CPU/메모리 리소스 보호
✓ API 레이트 리밋 준수
✓ 데이터베이스 연결 제한
✓ 네트워크 대역폭 관리

--- 3. 실전 예제: 파일 다운로드 ---
파일 다운로드 시작 (동시 2개)...
  다운로드 시작: http://example.com/file1.txt
  다운로드 시작: http://example.com/file2.txt
  다운로드 완료: http://example.com/file1.txt -> /tmp/download1.txt
  다운로드 시작: http://example.com/file3.txt
  다운로드 완료: http://example.com/file2.txt -> /tmp/download2.txt
  다운로드 시작: http://example.com/file4.txt
  다운로드 완료: http://example.com/file3.txt -> /tmp/download3.txt
  다운로드 시작: http://example.com/file5.txt
  다운로드 완료: http://example.com/file4.txt -> /tmp/download4.txt
  다운로드 완료: http://example.com/file5.txt -> /tmp/download5.txt
모든 다운로드 완료 (900ms)

--- 4. 에러 처리와 TaskQueue ---
에러가 있는 작업들 실행...
  Task 3 실패: Failed!
성공: 3, 실패: 1

--- 5. 동시성별 성능 비교 ---
10개 작업, 각 100ms:
동시성 1: 1000ms (예상: 1000ms)
동시성 2: 500ms (예상: 500ms)
동시성 5: 200ms (예상: 200ms)
동시성 10: 100ms (예상: 100ms)

--- 6. TaskQueue vs 무제한 병렬 ---
무제한 병렬 (20개 작업):
  소요 시간: 100ms
  동시 실행: 20개 (리소스 부담 큼)

TaskQueue (20개 작업, 동시성 5):
  소요 시간: 400ms
  동시 실행: 최대 5개 (리소스 절약)

--- 7. 실무 권장사항 ---
✓ 직접 구현보다 npm 패키지 사용 권장
  - p-limit: 간단하고 가벼움
  - p-queue: 우선순위, 타임아웃 등 고급 기능
✓ 적절한 동시성 값 찾기
  - CPU 집약적: CPU 코어 수
  - I/O 집약적: 10~100 (테스트 필요)
  - API 호출: API 레이트 리밋 고려

--- 8. p-limit 스타일 간단 구현 ---
p-limit 스타일 사용:
  작업 1 실행
  작업 2 실행
  작업 3 실행
  작업 4 실행
  작업 5 실행
  작업 6 실행
결과: [1, 2, 3, 4, 5, 6]

=== 핵심 포인트 ===
✅ TaskQueue: 동시 실행 작업 수 제한
✅ queue + running 카운터로 제어
✅ 리소스 보호 및 레이트 리밋 준수
✅ 실무에서는 p-limit 같은 라이브러리 사용
✅ 적절한 동시성 값은 테스트로 결정
✅ Promise.all()과 함께 사용
*/
