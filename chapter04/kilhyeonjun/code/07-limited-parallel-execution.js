/**
 * Chapter 4: 제한된 병렬 실행 (Limited Parallel Execution)
 *
 * 핵심 개념:
 * - 동시에 실행되는 작업 수를 제한
 * - 리소스 관리와 시스템 안정성 보장
 *
 * 학습 목표:
 * - 동시성 제한의 필요성 이해
 * - 제한된 병렬 실행 패턴 구현
 * - 순차/병렬/제한된 병렬 비교
 */

console.log("=== 제한된 병렬 실행 패턴 예제 ===\n")

/**
 * 시뮬레이션: 비동기 작업
 */
function heavyTask(taskId, callback) {
  const delay = Math.random() * 200 + 100
  const startTime = Date.now()

  console.log(`⚙️  Task ${taskId} 시작... (예상 ${delay.toFixed(0)}ms)`)

  setTimeout(() => {
    const actualDelay = Date.now() - startTime
    console.log(`✅ Task ${taskId} 완료 (${actualDelay}ms)`)
    callback(null, `Result ${taskId}`)
  }, delay)
}

// ✅ 패턴 1: 기본 제한된 병렬 실행
console.log("📋 패턴 1: 기본 제한된 병렬 실행\n")

function limitedParallel(tasks, concurrency, callback) {
  let running = 0
  let completed = 0
  let index = 0
  const results = []
  let hasErrors = false

  function next() {
    // 모든 작업이 완료되었는지 확인
    if (completed === tasks.length) {
      return callback(null, results)
    }

    // 동시성 한계 내에서 작업 시작
    while (running < concurrency && index < tasks.length) {
      const currentIndex = index
      const task = tasks[index++]

      task((err, result) => {
        if (err) {
          if (!hasErrors) {
            hasErrors = true
            return callback(err)
          }
          return
        }

        results[currentIndex] = result
        completed++
        running--
        next() // 다음 작업 시작
      })

      running++
    }
  }

  next()
}

// 테스트: 10개 작업, 동시성 3
const tasks1 = []
for (let i = 1; i <= 10; i++) {
  tasks1.push((cb) => heavyTask(i, cb))
}

console.log(`📊 총 작업: ${tasks1.length}개, 동시성 제한: 3\n`)
const startTime1 = Date.now()

limitedParallel(tasks1, 3, (err, results) => {
  if (err) {
    console.error('❌ 오류 발생:', err)
    return
  }
  const elapsed = Date.now() - startTime1
  console.log(`\n🎉 모든 작업 완료! (총 ${elapsed}ms)`)
  console.log(`📊 결과: ${results.length}개 항목\n`)

  // 패턴 2 실행
  setTimeout(() => runPattern2(), 1000)
})

// ✅ 패턴 2: 동시성 비교 (순차 vs 제한 vs 무제한)
function runPattern2() {
  console.log('─'.repeat(60))
  console.log("📋 패턴 2: 동시성 비교\n")

  // 순차 실행
  function sequential(tasks, callback) {
    const results = []
    let index = 0

    function iterate() {
      if (index === tasks.length) {
        return callback(null, results)
      }

      const task = tasks[index++]
      task((err, result) => {
        if (err) {
          return callback(err)
        }
        results.push(result)
        iterate()
      })
    }

    iterate()
  }

  // 무제한 병렬 실행
  function unlimited(tasks, callback) {
    const results = []
    let completed = 0

    tasks.forEach((task, index) => {
      task((err, result) => {
        if (err) {
          return callback(err)
        }
        results[index] = result
        if (++completed === tasks.length) {
          callback(null, results)
        }
      })
    })
  }

  // 테스트 작업 생성
  function createTasks(count) {
    const tasks = []
    for (let i = 1; i <= count; i++) {
      tasks.push((cb) => heavyTask(i, cb))
    }
    return tasks
  }

  const taskCount = 6

  console.log(`🔄 1. 순차 실행 (동시성: 1)\n`)
  const seqStart = Date.now()

  sequential(createTasks(taskCount), (err) => {
    if (err) {
      console.error('❌ 순차 실행 오류:', err)
      return
    }
    const seqElapsed = Date.now() - seqStart
    console.log(`\n   ⏱️  순차 실행 시간: ${seqElapsed}ms\n`)

    setTimeout(() => {
      console.log(`⚡ 2. 제한된 병렬 실행 (동시성: 2)\n`)
      const limStart = Date.now()

      limitedParallel(createTasks(taskCount), 2, (err) => {
        if (err) {
          console.error('❌ 제한된 병렬 오류:', err)
          return
        }
        const limElapsed = Date.now() - limStart
        console.log(`\n   ⏱️  제한된 병렬 시간: ${limElapsed}ms\n`)

        setTimeout(() => {
          console.log(`🚀 3. 무제한 병렬 실행\n`)
          const unlStart = Date.now()

          unlimited(createTasks(taskCount), (err) => {
            if (err) {
              console.error('❌ 무제한 병렬 오류:', err)
              return
            }
            const unlElapsed = Date.now() - unlStart
            console.log(`\n   ⏱️  무제한 병렬 시간: ${unlElapsed}ms\n`)

            // 비교 결과
            console.log('📊 성능 비교:')
            console.log(`   순차 실행:       ${seqElapsed}ms (가장 느림)`)
            console.log(`   제한된 병렬:     ${limElapsed}ms (균형)`)
            console.log(`   무제한 병렬:     ${unlElapsed}ms (가장 빠름)`)
            console.log('\n💡 제한된 병렬은 성능과 안정성의 균형을 제공합니다!\n')

            // 패턴 3 실행
            setTimeout(() => runPattern3(), 1000)
          })
        }, 500)
      })
    }, 500)
  })
}

// ✅ 패턴 3: 동시성 제한 실습
function runPattern3() {
  console.log('─'.repeat(60))
  console.log("📋 패턴 3: 동시성 제한 효과 실습\n")

  /**
   * 실시간 모니터링이 가능한 제한된 병렬 실행
   */
  function limitedWithMonitoring(tasks, concurrency, callback) {
    let running = 0
    let completed = 0
    let index = 0
    const results = []
    let maxRunning = 0

    function next() {
      // 최대 동시 실행 수 기록
      if (running > maxRunning) {
        maxRunning = running
      }

      if (completed === tasks.length) {
        console.log(`\n📊 통계:`)
        console.log(`   설정된 동시성: ${concurrency}`)
        console.log(`   최대 동시 실행: ${maxRunning}`)
        console.log(`   ✅ 동시성 제한이 올바르게 작동했습니다!`)
        return callback(null, results)
      }

      while (running < concurrency && index < tasks.length) {
        const currentIndex = index
        const task = tasks[index++]

        console.log(`   📈 현재 실행 중: ${running + 1}/${concurrency}`)

        task((err, result) => {
          if (err) {
            return callback(err)
          }

          results[currentIndex] = result
          completed++
          running--
          console.log(`   📉 현재 실행 중: ${running}/${concurrency}`)
          next()
        })

        running++
      }
    }

    next()
  }

  // 테스트: 동시성 2로 제한
  const tasks3 = []
  for (let i = 1; i <= 5; i++) {
    tasks3.push((cb) => {
      setTimeout(() => {
        console.log(`   ✅ Task ${i} 완료`)
        cb(null, `Result ${i}`)
      }, 100)
    })
  }

  console.log('동시성 제한: 2개\n')
  limitedWithMonitoring(tasks3, 2, (err) => {
    if (err) {
      console.error('❌ 오류 발생:', err)
      return
    }
    console.log('\n✅ 모든 제한된 병렬 실행 패턴 완료!')
  })
}

/**
 * 제한된 병렬 실행의 필요성:
 *
 * 1. 리소스 관리
 *    - 파일 디스크립터 한계
 *    - 메모리 사용 제한
 *    - CPU 사용률 제어
 *
 * 2. 외부 서비스 보호
 *    - API Rate Limiting 준수
 *    - DoS 공격 방지
 *    - 서버 부하 분산
 *
 * 3. 안정성 보장
 *    - 시스템 크래시 방지
 *    - 예측 가능한 성능
 *    - 우아한 성능 저하
 *
 * 동시성 설정 가이드:
 *
 * - CPU 집약 작업: os.cpus().length
 * - I/O 작업: 5-10
 * - 외부 API: 서버 정책에 따라 1-5
 * - 파일 작업: 10-20
 * - 데이터베이스: 커넥션 풀 크기에 따라
 *
 * 장점:
 * - ✅ 순차보다 빠름
 * - ✅ 무제한 병렬보다 안전
 * - ✅ 리소스 사용 예측 가능
 * - ✅ 시스템 안정성 보장
 *
 * 단점:
 * - ❌ 무제한 병렬보다 느림
 * - ❌ 구현이 복잡
 * - ❌ 최적 동시성 찾기 어려움
 *
 * 실전 예시:
 * - 웹 크롤링 (사이트당 1-2 요청)
 * - 파일 일괄 처리
 * - API 배치 작업
 * - 이미지 처리 파이프라인
 */
