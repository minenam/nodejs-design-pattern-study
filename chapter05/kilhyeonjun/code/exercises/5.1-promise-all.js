/**
 * 연습문제 5.1: Promise.all() 직접 구현
 *
 * 과제: 자신만의 Promise.all() 구현
 * - 프라미스 배열을 받아서 모든 프라미스가 이행되면 이행
 * - 하나라도 거부되면 즉시 거부
 * - 결과는 입력 순서대로 배열로 반환
 */

console.log('=== 연습문제 5.1: Promise.all() 구현 ===\n')

function delay(ms, value) {
  return new Promise(resolve => setTimeout(() => resolve(value), ms))
}

function delayError(ms, message) {
  return new Promise((resolve, reject) => {
    setTimeout(() => reject(new Error(message)), ms)
  })
}

// Promise.all() 구현
console.log('--- 1. Promise만 사용한 구현 ---\n')

function promiseAll(promises) {
  return new Promise((resolve, reject) => {
    const results = []
    let completed = 0

    // 빈 배열이면 즉시 해결
    if (promises.length === 0) {
      return resolve([])
    }

    promises.forEach((promise, index) => {
      // Promise가 아닌 값도 처리
      Promise.resolve(promise)
        .then(value => {
          results[index] = value // 순서 보장
          completed++

          if (completed === promises.length) {
            resolve(results)
          }
        })
        .catch(error => {
          reject(error) // 첫 번째 에러에서 즉시 거부
        })
    })
  })
}

console.log('테스트 1: 모두 성공')
promiseAll([
  delay(100, 'First'),
  delay(50, 'Second'),
  delay(150, 'Third')
]).then(results => {
  console.log('결과:', results)
  console.log('예상: ["First", "Second", "Third"]\n')

  console.log('테스트 2: 하나 실패')
  promiseAll([
    delay(100, 'Success 1'),
    delayError(80, 'Failed!'),
    delay(150, 'Success 2')
  ])
    .then(results => {
      console.log('성공 (실행 안됨):', results)
    })
    .catch(error => {
      console.log('실패:', error.message)
      console.log('예상: "Failed!"\n')

      console.log('테스트 3: 빈 배열')
      promiseAll([]).then(results => {
        console.log('결과:', results)
        console.log('예상: []\n')

        console.log('테스트 4: 일반 값 포함')
        promiseAll([
          42,
          delay(50, 'Async'),
          Promise.resolve('Resolved'),
          'Plain value'
        ]).then(results => {
          console.log('결과:', results)
          console.log('예상: [42, "Async", "Resolved", "Plain value"]\n')

          demonstrateAsyncAwait()
        })
      })
    })
})

function demonstrateAsyncAwait() {
  console.log('--- 2. async/await 사용한 구현 ---\n')

  async function promiseAllAsync(promises) {
    const results = []

    if (promises.length === 0) {
      return []
    }

    // map으로 모든 프라미스 시작
    const wrappedPromises = promises.map(async (promise, index) => {
      const value = await promise
      return { index, value }
    })

    // 모두 기다림
    const indexedResults = await Promise.all(wrappedPromises)

    // 순서대로 재배열
    indexedResults.forEach(({ index, value }) => {
      results[index] = value
    })

    return results
  }

  console.log('async/await 버전 테스트:')
  promiseAllAsync([
    delay(100, 'A'),
    delay(50, 'B'),
    delay(150, 'C')
  ]).then(results => {
    console.log('결과:', results)
    console.log('예상: ["A", "B", "C"]\n')

    demonstrateRace()
  })
}

function demonstrateRace() {
  console.log('--- 3. 보너스: Promise.race() 구현 ---\n')

  function promiseRace(promises) {
    return new Promise((resolve, reject) => {
      if (promises.length === 0) {
        return
      }

      promises.forEach(promise => {
        Promise.resolve(promise)
          .then(resolve) // 첫 번째 성공
          .catch(reject) // 첫 번째 실패
      })
    })
  }

  console.log('race 테스트:')
  promiseRace([
    delay(150, 'Slow'),
    delay(100, 'Medium'),
    delay(50, 'Fast')
  ]).then(result => {
    console.log('결과:', result)
    console.log('예상: "Fast"\n')

    demonstrateAllSettled()
  })
}

function demonstrateAllSettled() {
  console.log('--- 4. 보너스: Promise.allSettled() 구현 ---\n')

  function promiseAllSettled(promises) {
    return new Promise((resolve) => {
      const results = []
      let completed = 0

      if (promises.length === 0) {
        return resolve([])
      }

      promises.forEach((promise, index) => {
        Promise.resolve(promise)
          .then(value => {
            results[index] = { status: 'fulfilled', value }
          })
          .catch(reason => {
            results[index] = { status: 'rejected', reason }
          })
          .finally(() => {
            completed++
            if (completed === promises.length) {
              resolve(results)
            }
          })
      })
    })
  }

  console.log('allSettled 테스트:')
  promiseAllSettled([
    delay(100, 'Success 1'),
    delayError(80, 'Failed'),
    delay(120, 'Success 2')
  ]).then(results => {
    console.log('결과:')
    results.forEach((result, i) => {
      console.log(`  [${i}]:`, result)
    })
    console.log()

    console.log('=== 핵심 포인트 ===')
    console.log('✅ Promise.all(): forEach + 카운터 패턴')
    console.log('✅ 순서 보장: results[index] 사용')
    console.log('✅ 첫 번째 에러에서 즉시 reject')
    console.log('✅ Promise.resolve()로 일반 값 처리')
    console.log('✅ allSettled: finally로 항상 완료 카운트')
    console.log('✅ race: 첫 번째 settle된 것만 반환')
  })
}

/*
예상 출력:
=== 연습문제 5.1: Promise.all() 구현 ===

--- 1. Promise만 사용한 구현 ---

테스트 1: 모두 성공
결과: ["First", "Second", "Third"]
예상: ["First", "Second", "Third"]

테스트 2: 하나 실패
실패: Failed!
예상: "Failed!"

테스트 3: 빈 배열
결과: []
예상: []

테스트 4: 일반 값 포함
결과: [42, "Async", "Resolved", "Plain value"]
예상: [42, "Async", "Resolved", "Plain value"]

--- 2. async/await 사용한 구현 ---

async/await 버전 테스트:
결과: ["A", "B", "C"]
예상: ["A", "B", "C"]

--- 3. 보너스: Promise.race() 구현 ---

race 테스트:
결과: Fast
예상: "Fast"

--- 4. 보너스: Promise.allSettled() 구현 ---

allSettled 테스트:
결과:
  [0]: { status: 'fulfilled', value: 'Success 1' }
  [1]: { status: 'rejected', reason: Error: Failed }
  [2]: { status: 'fulfilled', value: 'Success 2' }

=== 핵심 포인트 ===
✅ Promise.all(): forEach + 카운터 패턴
✅ 순서 보장: results[index] 사용
✅ 첫 번째 에러에서 즉시 reject
✅ Promise.resolve()로 일반 값 처리
✅ allSettled: finally로 항상 완료 카운트
✅ race: 첫 번째 settle된 것만 반환
*/
