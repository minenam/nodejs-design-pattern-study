/**
 * Chapter 4: 순차 실행 (Sequential Execution)
 *
 * 핵심 개념:
 * - 작업을 하나씩 순서대로 실행
 * - 이전 작업의 결과를 다음 작업에 전달
 *
 * 학습 목표:
 * - 순차 실행 패턴 이해
 * - 작업 간 데이터 전달 방법
 */

console.log("=== 순차 실행 패턴 예제 ===\n")

/**
 * 시뮬레이션: 비동기 작업
 * @param {string} taskName - 작업 이름
 * @param {number} delay - 지연 시간 (ms)
 * @param {function} callback - 콜백 함수
 */
function asyncTask(taskName, delay, callback) {
  console.log(`📌 ${taskName} 시작...`)

  setTimeout(() => {
    const result = `${taskName} 완료 (${delay}ms)`
    console.log(`✅ ${result}`)
    callback(null, result)
  }, delay)
}

// ✅ 패턴 1: 명시적 순차 실행
console.log("📋 패턴 1: 명시적 순차 실행\n")

function task1(callback) {
  asyncTask('Task 1', 100, (err, result) => {
    if (err) {
      return callback(err)
    }
    // Task 2로 결과 전달
    task2(result, callback)
  })
}

function task2(previousResult, callback) {
  console.log(`   ↳ Task 2가 받은 데이터: "${previousResult}"`)
  asyncTask('Task 2', 100, (err, result) => {
    if (err) {
      return callback(err)
    }
    // Task 3으로 결과 전달
    task3(result, callback)
  })
}

function task3(previousResult, callback) {
  console.log(`   ↳ Task 3가 받은 데이터: "${previousResult}"`)
  asyncTask('Task 3', 100, (err, result) => {
    if (err) {
      return callback(err)
    }
    // 최종 결과 반환
    callback(null, result)
  })
}

// 실행
task1((err, finalResult) => {
  if (err) {
    console.error('❌ 오류 발생:', err)
    return
  }
  console.log(`\n🎉 최종 결과: "${finalResult}"\n`)

  // 패턴 2 실행
  runPattern2()
})

// ✅ 패턴 2: 일반화된 순차 실행 함수
function runPattern2() {
  console.log('─'.repeat(60))
  console.log("📋 패턴 2: 일반화된 순차 실행 함수\n")

  /**
   * 여러 작업을 순차적으로 실행하는 헬퍼 함수
   * @param {function[]} tasks - 작업 함수 배열
   * @param {function} finalCallback - 최종 콜백
   */
  function runSequentially(tasks, finalCallback) {
    function iterate(index, previousResult) {
      if (index === tasks.length) {
        return finalCallback(null, previousResult)
      }

      const task = tasks[index]
      task(previousResult, (err, result) => {
        if (err) {
          return finalCallback(err)
        }
        iterate(index + 1, result)
      })
    }

    iterate(0, null)
  }

  // 작업 정의
  const tasks = [
    (prevResult, callback) => {
      asyncTask('Sequential Task 1', 50, callback)
    },
    (prevResult, callback) => {
      console.log(`   ↳ 이전 결과: "${prevResult}"`)
      asyncTask('Sequential Task 2', 50, callback)
    },
    (prevResult, callback) => {
      console.log(`   ↳ 이전 결과: "${prevResult}"`)
      asyncTask('Sequential Task 3', 50, callback)
    }
  ]

  // 실행
  runSequentially(tasks, (err, finalResult) => {
    if (err) {
      console.error('❌ 오류 발생:', err)
      return
    }
    console.log(`\n🎉 최종 결과: "${finalResult}"\n`)

    // 패턴 3 실행
    runPattern3()
  })
}

// ✅ 패턴 3: Waterfall 패턴 (결과 누적)
function runPattern3() {
  console.log('─'.repeat(60))
  console.log("📋 패턴 3: Waterfall 패턴 (결과 누적)\n")

  function waterfall(tasks, finalCallback) {
    function iterate(index, ...args) {
      if (index === tasks.length) {
        return finalCallback(null, ...args)
      }

      const task = tasks[index]
      task(...args, (err, ...results) => {
        if (err) {
          return finalCallback(err)
        }
        iterate(index + 1, ...results)
      })
    }

    iterate(0)
  }

  // 작업 정의: 각 작업이 이전 결과를 받아 처리
  const tasks = [
    (callback) => {
      console.log('🔢 초기값 설정: 10')
      setTimeout(() => callback(null, 10), 50)
    },
    (value, callback) => {
      const result = value * 2
      console.log(`🔢 ${value} × 2 = ${result}`)
      setTimeout(() => callback(null, result), 50)
    },
    (value, callback) => {
      const result = value + 5
      console.log(`🔢 ${value} + 5 = ${result}`)
      setTimeout(() => callback(null, result), 50)
    },
    (value, callback) => {
      const result = value / 5
      console.log(`🔢 ${value} ÷ 5 = ${result}`)
      setTimeout(() => callback(null, result), 50)
    }
  ]

  // 실행
  waterfall(tasks, (err, finalResult) => {
    if (err) {
      console.error('❌ 오류 발생:', err)
      return
    }
    console.log(`\n🎉 최종 결과: ${finalResult}`)
    console.log('\n✅ 모든 순차 실행 패턴 완료!')
  })
}

/**
 * 순차 실행의 특징:
 *
 * 장점:
 * - ✅ 순서가 보장됨
 * - ✅ 이전 작업의 결과를 다음 작업에 전달 가능
 * - ✅ 로직이 단순하고 명확
 * - ✅ 디버깅이 쉬움
 *
 * 단점:
 * - ❌ 실행 시간이 길어짐 (작업 시간의 합)
 * - ❌ 병렬 실행 가능한 작업도 순차적으로 실행
 * - ❌ 일부 작업의 실패가 전체 흐름을 중단시킴
 *
 * 사용 시기:
 * - 작업 간 의존성이 있을 때
 * - 순서가 중요할 때
 * - 리소스를 순차적으로 접근해야 할 때
 */
