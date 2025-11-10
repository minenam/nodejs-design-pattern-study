/**
 * Chapter 4: 순차 반복 (Sequential Iteration)
 *
 * 핵심 개념:
 * - 컬렉션의 각 요소를 순차적으로 비동기 처리
 * - Iterator 패턴 활용
 *
 * 학습 목표:
 * - 동적 작업 목록의 순차 처리
 * - 재귀를 사용한 반복 구현
 */

console.log("=== 순차 반복 패턴 예제 ===\n")

/**
 * 시뮬레이션: 비동기 작업
 */
function processItem(item, index, callback) {
  const delay = Math.random() * 100 + 50
  console.log(`📌 항목 ${index + 1} 처리 시작: "${item}"`)

  setTimeout(() => {
    const result = `${item} (처리됨)`
    console.log(`✅ 항목 ${index + 1} 완료: "${result}" [${delay.toFixed(0)}ms]`)
    callback(null, result)
  }, delay)
}

// ✅ 패턴 1: 기본 순차 반복
console.log("📋 패턴 1: 기본 순차 반복\n")

const items1 = ['Apple', 'Banana', 'Cherry', 'Date', 'Elderberry']

function iterateSequentially(items, callback) {
  const results = []

  function iterate(index) {
    if (index === items.length) {
      return callback(null, results)
    }

    processItem(items[index], index, (err, result) => {
      if (err) {
        return callback(err)
      }
      results.push(result)
      iterate(index + 1) // 다음 항목으로
    })
  }

  iterate(0) // 시작
}

const startTime1 = Date.now()
iterateSequentially(items1, (err, results) => {
  if (err) {
    console.error('❌ 오류 발생:', err)
    return
  }
  const elapsed = Date.now() - startTime1
  console.log(`\n🎉 모든 항목 처리 완료! (총 ${elapsed}ms)`)
  console.log('📊 결과:', results)

  // 패턴 2 실행
  setTimeout(() => runPattern2(), 500)
})

// ✅ 패턴 2: forEach 스타일 순차 반복
function runPattern2() {
  console.log('\n' + '─'.repeat(60))
  console.log("📋 패턴 2: forEach 스타일 순차 반복\n")

  /**
   * 배열의 각 요소에 비동기 작업을 순차적으로 적용
   * @param {Array} array - 처리할 배열
   * @param {function} iterator - 각 요소에 적용할 함수 (item, callback)
   * @param {function} finalCallback - 최종 콜백
   */
  function forEachSeries(array, iterator, finalCallback) {
    function iterate(index) {
      if (index === array.length) {
        return finalCallback()
      }

      iterator(array[index], index, (err) => {
        if (err) {
          return finalCallback(err)
        }
        iterate(index + 1)
      })
    }

    iterate(0)
  }

  const items2 = ['Task 1', 'Task 2', 'Task 3', 'Task 4']
  const startTime2 = Date.now()

  forEachSeries(
    items2,
    (item, index, callback) => {
      processItem(item, index, callback)
    },
    (err) => {
      if (err) {
        console.error('❌ 오류 발생:', err)
        return
      }
      const elapsed = Date.now() - startTime2
      console.log(`\n🎉 forEach 스타일 완료! (총 ${elapsed}ms)`)

      // 패턴 3 실행
      setTimeout(() => runPattern3(), 500)
    }
  )
}

// ✅ 패턴 3: map 스타일 순차 반복
function runPattern3() {
  console.log('\n' + '─'.repeat(60))
  console.log("📋 패턴 3: map 스타일 순차 반복 (결과 수집)\n")

  /**
   * 배열의 각 요소를 변환하여 새로운 배열 생성
   * @param {Array} array - 원본 배열
   * @param {function} iterator - 변환 함수 (item, callback)
   * @param {function} finalCallback - 최종 콜백 (err, results)
   */
  function mapSeries(array, iterator, finalCallback) {
    const results = []

    function iterate(index) {
      if (index === array.length) {
        return finalCallback(null, results)
      }

      iterator(array[index], index, (err, transformed) => {
        if (err) {
          return finalCallback(err)
        }
        results.push(transformed)
        iterate(index + 1)
      })
    }

    iterate(0)
  }

  const numbers = [1, 2, 3, 4, 5]
  const startTime3 = Date.now()

  console.log('🔢 원본 배열:', numbers)
  console.log('🎯 목표: 각 숫자를 제곱하여 새 배열 생성\n')

  mapSeries(
    numbers,
    (num, index, callback) => {
      setTimeout(() => {
        const result = num * num
        console.log(`✅ ${num}² = ${result}`)
        callback(null, result)
      }, 50)
    },
    (err, results) => {
      if (err) {
        console.error('❌ 오류 발생:', err)
        return
      }
      const elapsed = Date.now() - startTime3
      console.log(`\n🎉 map 스타일 완료! (총 ${elapsed}ms)`)
      console.log('📊 결과 배열:', results)

      // 패턴 4 실행
      setTimeout(() => runPattern4(), 500)
    }
  )
}

// ✅ 패턴 4: filter 스타일 순차 반복
function runPattern4() {
  console.log('\n' + '─'.repeat(60))
  console.log("📋 패턴 4: filter 스타일 순차 반복\n")

  /**
   * 조건을 만족하는 요소만 필터링
   * @param {Array} array - 원본 배열
   * @param {function} predicate - 조건 함수 (item, callback)
   * @param {function} finalCallback - 최종 콜백 (err, filtered)
   */
  function filterSeries(array, predicate, finalCallback) {
    const filtered = []

    function iterate(index) {
      if (index === array.length) {
        return finalCallback(null, filtered)
      }

      predicate(array[index], (err, shouldInclude) => {
        if (err) {
          return finalCallback(err)
        }
        if (shouldInclude) {
          filtered.push(array[index])
        }
        iterate(index + 1)
      })
    }

    iterate(0)
  }

  const numbers2 = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
  const startTime4 = Date.now()

  console.log('🔢 원본 배열:', numbers2)
  console.log('🎯 목표: 짝수만 필터링\n')

  filterSeries(
    numbers2,
    (num, callback) => {
      setTimeout(() => {
        const isEven = num % 2 === 0
        console.log(`${num} → ${isEven ? '✅ 짝수' : '❌ 홀수'}`)
        callback(null, isEven)
      }, 30)
    },
    (err, filtered) => {
      if (err) {
        console.error('❌ 오류 발생:', err)
        return
      }
      const elapsed = Date.now() - startTime4
      console.log(`\n🎉 filter 스타일 완료! (총 ${elapsed}ms)`)
      console.log('📊 필터링된 배열:', filtered)
      console.log('\n✅ 모든 순차 반복 패턴 완료!')
    }
  )
}

/**
 * 순차 반복의 특징:
 *
 * 장점:
 * - ✅ 동적 크기의 컬렉션 처리 가능
 * - ✅ 순서 보장
 * - ✅ 메모리 효율적 (한 번에 하나만 처리)
 * - ✅ 진행 상황 추적 용이
 *
 * 단점:
 * - ❌ 전체 실행 시간이 길어짐
 * - ❌ 첫 번째 작업이 느리면 전체가 느려짐
 *
 * 사용 시기:
 * - 순서가 중요한 배치 처리
 * - 리소스 제약이 있는 경우
 * - 각 작업이 이전 작업의 결과에 의존하는 경우
 *
 * 실전 예시:
 * - 웹 크롤링 (링크를 하나씩 순회)
 * - 데이터베이스 마이그레이션
 * - 파일 처리 파이프라인
 */
