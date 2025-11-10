/**
 * 연습문제 5.4: 동시성 제한이 있는 비동기 map()
 *
 * 과제: Array.map()의 비동기 버전 구현
 * - mapAsync(iterable, callback, concurrency)
 * - 동시 실행 수 제한
 * - 입력 순서대로 결과 반환
 * - TaskQueue 직접 재사용 금지 (개념만 활용)
 */

console.log('=== 연습문제 5.4: 비동기 map() 구현 ===\n')

function delay(ms, value) {
  return new Promise(resolve => setTimeout(() => resolve(value), ms))
}

// 구현 1: Promise 기반
console.log('--- 1. Promise 기반 구현 ---\n')

function mapAsync(iterable, callback, concurrency) {
  return new Promise((resolve, reject) => {
    const results = []
    const iterator = iterable[Symbol.iterator]()
    let running = 0
    let index = 0
    let done = false

    function next() {
      while (running < concurrency && !done) {
        const item = iterator.next()

        if (item.done) {
          done = true
          // 모든 작업 완료 확인
          if (running === 0) {
            resolve(results)
          }
          return
        }

        const currentIndex = index++
        running++

        Promise.resolve(callback(item.value, currentIndex))
          .then(result => {
            results[currentIndex] = result
          })
          .catch(error => {
            reject(error)
          })
          .finally(() => {
            running--
            next()
          })
      }
    }

    next()
  })
}

// 테스트 데이터
const numbers = [1, 2, 3, 4, 5, 6, 7, 8]

console.log('테스트 1: 숫자 배열 변환 (동시성 3)')
const start1 = Date.now()

mapAsync(
  numbers,
  async (num) => {
    await delay(100)
    console.log(`  처리: ${num} -> ${num * 2}`)
    return num * 2
  },
  3
).then(results => {
  const elapsed = Date.now() - start1
  console.log('결과:', results)
  console.log(`소요: ${elapsed}ms (예상: 300ms - 8개를 3개씩)\n`)

  runTest2()
})

function runTest2() {
  console.log('테스트 2: 순서 보장 확인')

  const items = ['a', 'b', 'c', 'd', 'e']

  // 의도적으로 처리 시간 다르게
  mapAsync(
    items,
    async (item, index) => {
      const duration = (5 - index) * 50 // 뒤쪽이 더 빠름
      await delay(duration)
      console.log(`  ${item} 완료 (${duration}ms)`)
      return item.toUpperCase()
    },
    2
  ).then(results => {
    console.log('결과:', results)
    console.log('예상: ["A", "B", "C", "D", "E"] (순서 유지)\n')
    runTest3()
  })
}

function runTest3() {
  console.log('--- 2. async/await 버전 (더 간결) ---\n')

  async function mapAsyncAwait(iterable, callback, concurrency) {
    const array = Array.from(iterable)
    const results = []
    const executing = []

    for (let i = 0; i < array.length; i++) {
      const promise = Promise.resolve(callback(array[i], i))
        .then(result => {
          results[i] = result
        })

      executing.push(promise)

      if (executing.length >= concurrency) {
        await Promise.race(executing)
        // 완료된 것 제거
        executing.splice(
          executing.findIndex(p => p === promise),
          1
        )
      }
    }

    // 남은 작업 완료 대기
    await Promise.all(executing)
    return results
  }

  console.log('async/await 버전 테스트:')
  mapAsyncAwait(
    [10, 20, 30, 40],
    async (num) => {
      await delay(80)
      console.log(`  처리: ${num}`)
      return num / 10
    },
    2
  ).then(results => {
    console.log('결과:', results)
    console.log()
    runTest4()
  })
}

function runTest4() {
  console.log('--- 3. p-limit 스타일 구현 ---\n')

  function createMapAsync(concurrency) {
    return async function mapWithLimit(iterable, callback) {
      const array = Array.from(iterable)
      const results = []
      let index = 0

      async function processNext() {
        const currentIndex = index++
        if (currentIndex >= array.length) {
          return
        }

        const result = await callback(array[currentIndex], currentIndex)
        results[currentIndex] = result

        // 다음 작업 처리
        await processNext()
      }

      // 동시성 수만큼 시작
      const workers = Array(Math.min(concurrency, array.length))
        .fill(null)
        .map(() => processNext())

      await Promise.all(workers)
      return results
    }
  }

  const mapWith3 = createMapAsync(3)

  console.log('p-limit 스타일 테스트 (동시성 3):')
  mapWith3(
    [1, 2, 3, 4, 5, 6],
    async (num) => {
      await delay(100)
      console.log(`  ${num} 처리`)
      return num * num
    }
  ).then(results => {
    console.log('결과:', results)
    console.log()
    runTest5()
  })
}

function runTest5() {
  console.log('--- 4. 에러 처리 ---\n')

  async function mapAsyncWithErrors(iterable, callback, concurrency) {
    const array = Array.from(iterable)
    const results = []
    const executing = []

    for (let i = 0; i < array.length; i++) {
      const promise = (async () => {
        try {
          const result = await callback(array[i], i)
          results[i] = { status: 'fulfilled', value: result }
        } catch (error) {
          results[i] = { status: 'rejected', reason: error }
        }
      })()

      executing.push(promise)

      if (executing.length >= concurrency) {
        await Promise.race(executing)
        const completedIndex = executing.findIndex(
          async (p) => {
            try {
              await p
              return true
            } catch {
              return true
            }
          }
        )
        if (completedIndex >= 0) {
          executing.splice(completedIndex, 1)
        }
      }
    }

    await Promise.all(executing)
    return results
  }

  console.log('에러 처리 테스트:')
  mapAsyncWithErrors(
    [1, 2, 3, 4, 5],
    async (num) => {
      await delay(50)
      if (num === 3) {
        throw new Error(`Error at ${num}`)
      }
      return num * 10
    },
    2
  ).then(results => {
    console.log('결과:')
    results.forEach((result, i) => {
      if (result.status === 'fulfilled') {
        console.log(`  [${i}] 성공: ${result.value}`)
      } else {
        console.log(`  [${i}] 실패: ${result.reason.message}`)
      }
    })
    console.log()
    runTest6()
  })
}

function runTest6() {
  console.log('--- 5. 실전 예제: 파일 처리 ---\n')

  import('fs/promises').then(async (fsPromises) => {
    // mapAsync 최종 버전
    async function mapAsync(iterable, callback, concurrency) {
      const array = Array.from(iterable)
      const results = []
      let index = 0

      async function worker() {
        while (index < array.length) {
          const currentIndex = index++
          results[currentIndex] = await callback(array[currentIndex], currentIndex)
        }
      }

      const workers = Array(Math.min(concurrency, array.length))
        .fill(null)
        .map(() => worker())

      await Promise.all(workers)
      return results
    }

    // 가상 파일 생성
    const files = Array(5).fill(null).map((_, i) => `/tmp/file${i + 1}.txt`)

    console.log('1. 파일 쓰기 (동시성 3):')
    await mapAsync(
      files,
      async (file, i) => {
        const content = `File ${i + 1} content`
        await fsPromises.writeFile(file, content)
        console.log(`  ${file} 생성`)
        return file
      },
      3
    )

    console.log('\n2. 파일 읽기 (동시성 2):')
    const contents = await mapAsync(
      files,
      async (file) => {
        const content = await fsPromises.readFile(file, 'utf8')
        console.log(`  ${file} 읽음: ${content}`)
        return content
      },
      2
    )

    console.log('\n3. 파일 변환 (동시성 3):')
    await mapAsync(
      files,
      async (file, i) => {
        const content = await fsPromises.readFile(file, 'utf8')
        const transformed = content.toUpperCase()
        const newFile = `/tmp/transformed${i + 1}.txt`
        await fsPromises.writeFile(newFile, transformed)
        console.log(`  ${file} -> ${newFile}`)
        return newFile
      },
      3
    )

    console.log()
    runTest7()
  })
}

function runTest7() {
  console.log('--- 6. 성능 비교 ---\n')

  async function mapAsync(iterable, callback, concurrency) {
    const array = Array.from(iterable)
    const results = []
    let index = 0

    async function worker() {
      while (index < array.length) {
        const currentIndex = index++
        results[currentIndex] = await callback(array[currentIndex], currentIndex)
      }
    }

    const workers = Array(Math.min(concurrency, array.length))
      .fill(null)
      .map(() => worker())

    await Promise.all(workers)
    return results
  }

  const testData = Array(20).fill(null).map((_, i) => i + 1)

  async function runBenchmark() {
    // 순차
    console.log('순차 실행 (동시성 1):')
    const seq = Date.now()
    await mapAsync(testData, async (n) => delay(50, n), 1)
    console.log(`  소요: ${Date.now() - seq}ms (예상: 1000ms)\n`)

    // 동시성 5
    console.log('제한된 병렬 (동시성 5):')
    const lim = Date.now()
    await mapAsync(testData, async (n) => delay(50, n), 5)
    console.log(`  소요: ${Date.now() - lim}ms (예상: 200ms)\n`)

    // 무제한
    console.log('무제한 병렬 (동시성 20):')
    const unl = Date.now()
    await mapAsync(testData, async (n) => delay(50, n), 20)
    console.log(`  소요: ${Date.now() - unl}ms (예상: 50ms)\n`)

    console.log('=== 핵심 포인트 ===')
    console.log('✅ mapAsync: iterable을 비동기로 변환')
    console.log('✅ 동시성 제어로 리소스 관리')
    console.log('✅ 순서 보장: results[index] 사용')
    console.log('✅ Promise.race()로 슬롯 관리')
    console.log('✅ worker 패턴이 가장 간결')
    console.log('✅ 실무: p-map, p-limit 등 사용')
    console.log('✅ TaskQueue 개념을 map에 적용')
  }

  runBenchmark()
}

/*
예상 출력:
=== 연습문제 5.4: 비동기 map() 구현 ===

--- 1. Promise 기반 구현 ---

테스트 1: 숫자 배열 변환 (동시성 3)
  처리: 1 -> 2
  처리: 2 -> 4
  처리: 3 -> 6
  처리: 4 -> 8
  처리: 5 -> 10
  처리: 6 -> 12
  처리: 7 -> 14
  처리: 8 -> 16
결과: [2, 4, 6, 8, 10, 12, 14, 16]
소요: 300ms (예상: 300ms - 8개를 3개씩)

테스트 2: 순서 보장 확인
  e 완료 (50ms)
  d 완료 (100ms)
  c 완료 (150ms)
  b 완료 (200ms)
  a 완료 (250ms)
결과: ["A", "B", "C", "D", "E"]
예상: ["A", "B", "C", "D", "E"] (순서 유지)

--- 2. async/await 버전 (더 간결) ---

async/await 버전 테스트:
  처리: 10
  처리: 20
  처리: 30
  처리: 40
결과: [1, 2, 3, 4]

--- 3. p-limit 스타일 구현 ---

p-limit 스타일 테스트 (동시성 3):
  1 처리
  2 처리
  3 처리
  4 처리
  5 처리
  6 처리
결과: [1, 4, 9, 16, 25, 36]

--- 4. 에러 처리 ---

에러 처리 테스트:
결과:
  [0] 성공: 10
  [1] 성공: 20
  [2] 실패: Error at 3
  [3] 성공: 40
  [4] 성공: 50

--- 5. 실전 예제: 파일 처리 ---

1. 파일 쓰기 (동시성 3):
  /tmp/file1.txt 생성
  /tmp/file2.txt 생성
  /tmp/file3.txt 생성
  /tmp/file4.txt 생성
  /tmp/file5.txt 생성

2. 파일 읽기 (동시성 2):
  /tmp/file1.txt 읽음: File 1 content
  /tmp/file2.txt 읽음: File 2 content
  /tmp/file3.txt 읽음: File 3 content
  /tmp/file4.txt 읽음: File 4 content
  /tmp/file5.txt 읽음: File 5 content

3. 파일 변환 (동시성 3):
  /tmp/file1.txt -> /tmp/transformed1.txt
  /tmp/file2.txt -> /tmp/transformed2.txt
  /tmp/file3.txt -> /tmp/transformed3.txt
  /tmp/file4.txt -> /tmp/transformed4.txt
  /tmp/file5.txt -> /tmp/transformed5.txt

--- 6. 성능 비교 ---

순차 실행 (동시성 1):
  소요: 1000ms (예상: 1000ms)

제한된 병렬 (동시성 5):
  소요: 200ms (예상: 200ms)

무제한 병렬 (동시성 20):
  소요: 50ms (예상: 50ms)

=== 핵심 포인트 ===
✅ mapAsync: iterable을 비동기로 변환
✅ 동시성 제어로 리소스 관리
✅ 순서 보장: results[index] 사용
✅ Promise.race()로 슬롯 관리
✅ worker 패턴이 가장 간결
✅ 실무: p-map, p-limit 등 사용
✅ TaskQueue 개념을 map에 적용
*/
