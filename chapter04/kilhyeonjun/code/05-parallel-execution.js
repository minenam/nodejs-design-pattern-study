/**
 * Chapter 4: 병렬 실행 (Parallel Execution)
 *
 * 핵심 개념:
 * - 여러 비동기 작업을 동시에 실행
 * - 완료 카운터를 사용한 동기화
 *
 * 학습 목표:
 * - Node.js의 동시성 이해
 * - 병렬 실행 패턴 구현
 * - 순차 vs 병렬 성능 비교
 */

console.log("=== 병렬 실행 패턴 예제 ===\n")

/**
 * 시뮬레이션: 비동기 작업
 */
function downloadFile(url, callback) {
  const delay = Math.random() * 200 + 100
  console.log(`📥 다운로드 시작: ${url}`)

  setTimeout(() => {
    const data = `Content from ${url}`
    console.log(`✅ 다운로드 완료: ${url} [${delay.toFixed(0)}ms]`)
    callback(null, data)
  }, delay)
}

// ✅ 패턴 1: 기본 병렬 실행
console.log("📋 패턴 1: 기본 병렬 실행 (무제한)\n")

const urls1 = [
  'https://api.example.com/users',
  'https://api.example.com/posts',
  'https://api.example.com/comments',
  'https://api.example.com/albums',
  'https://api.example.com/photos'
]

function downloadAllParallel(urls, callback) {
  const results = []
  let completed = 0
  let hasErrors = false

  urls.forEach((url, index) => {
    downloadFile(url, (err, data) => {
      if (err) {
        if (!hasErrors) {
          hasErrors = true
          return callback(err)
        }
        return
      }

      results[index] = data
      completed++

      if (completed === urls.length) {
        callback(null, results)
      }
    })
  })
}

const startTime1 = Date.now()
downloadAllParallel(urls1, (err, results) => {
  if (err) {
    console.error('❌ 오류 발생:', err)
    return
  }
  const elapsed = Date.now() - startTime1
  console.log(`\n🎉 모든 다운로드 완료! (총 ${elapsed}ms)`)
  console.log(`📊 다운로드된 항목: ${results.length}개\n`)

  // 패턴 2 실행
  setTimeout(() => runPattern2(), 500)
})

// ✅ 패턴 2: 순차 vs 병렬 성능 비교
function runPattern2() {
  console.log('─'.repeat(60))
  console.log("📋 패턴 2: 순차 vs 병렬 성능 비교\n")

  const urls2 = [
    'https://example.com/1',
    'https://example.com/2',
    'https://example.com/3',
    'https://example.com/4'
  ]

  // 순차 실행
  function downloadSequentially(urls, callback) {
    const results = []

    function iterate(index) {
      if (index === urls.length) {
        return callback(null, results)
      }

      downloadFile(urls[index], (err, data) => {
        if (err) {
          return callback(err)
        }
        results.push(data)
        iterate(index + 1)
      })
    }

    iterate(0)
  }

  console.log('🔄 순차 실행 시작...\n')
  const seqStart = Date.now()

  downloadSequentially(urls2, (err, results) => {
    if (err) {
      console.error('❌ 순차 실행 오류:', err)
      return
    }
    const seqElapsed = Date.now() - seqStart
    console.log(`\n✅ 순차 실행 완료: ${seqElapsed}ms\n`)

    // 병렬 실행
    console.log('⚡ 병렬 실행 시작...\n')
    const parStart = Date.now()

    downloadAllParallel(urls2, (err, results) => {
      if (err) {
        console.error('❌ 병렬 실행 오류:', err)
        return
      }
      const parElapsed = Date.now() - parStart
      console.log(`\n✅ 병렬 실행 완료: ${parElapsed}ms\n`)

      // 성능 비교
      const improvement = ((seqElapsed - parElapsed) / seqElapsed * 100).toFixed(1)
      console.log('📊 성능 비교:')
      console.log(`   순차 실행: ${seqElapsed}ms`)
      console.log(`   병렬 실행: ${parElapsed}ms`)
      console.log(`   개선율: ${improvement}% 빠름! 🚀\n`)

      // 패턴 3 실행
      setTimeout(() => runPattern3(), 500)
    })
  })
}

// ✅ 패턴 3: 병렬 실행 with 인덱스 보존
function runPattern3() {
  console.log('─'.repeat(60))
  console.log("📋 패턴 3: 병렬 실행 (인덱스 보존)\n")

  /**
   * 결과 배열의 순서를 보장하는 병렬 실행
   */
  function parallelWithOrder(tasks, callback) {
    const results = new Array(tasks.length)
    let completed = 0
    let hasErrors = false

    tasks.forEach((task, index) => {
      task((err, result) => {
        if (err) {
          if (!hasErrors) {
            hasErrors = true
            return callback(err)
          }
          return
        }

        results[index] = result // 인덱스 보존
        completed++

        if (completed === tasks.length) {
          callback(null, results)
        }
      })
    })
  }

  const tasks = [
    (cb) => {
      setTimeout(() => {
        console.log('✅ Task 3 완료 (가장 먼저)')
        cb(null, 'Result 3')
      }, 50)
    },
    (cb) => {
      setTimeout(() => {
        console.log('✅ Task 1 완료 (두 번째)')
        cb(null, 'Result 1')
      }, 100)
    },
    (cb) => {
      setTimeout(() => {
        console.log('✅ Task 2 완료 (마지막)')
        cb(null, 'Result 2')
      }, 150)
    }
  ]

  console.log('📌 작업 실행 중... (완료 순서는 무작위)\n')

  parallelWithOrder(tasks, (err, results) => {
    if (err) {
      console.error('❌ 오류 발생:', err)
      return
    }
    console.log('\n📊 결과 배열 (원래 순서 보존):')
    results.forEach((result, index) => {
      console.log(`   [${index}]: ${result}`)
    })
    console.log('\n✅ 모든 병렬 실행 패턴 완료!')
  })
}

/**
 * 병렬 실행의 특징:
 *
 * Node.js의 동시성:
 * - Node.js는 단일 스레드이지만 논블로킹 I/O로 동시성 구현
 * - 이벤트 루프가 여러 비동기 작업을 관리
 * - I/O 작업은 백그라운드에서 병렬로 처리됨
 *
 * 장점:
 * - ✅ 전체 실행 시간 대폭 단축
 * - ✅ CPU와 I/O 리소스를 효율적으로 활용
 * - ✅ 독립적인 작업에 최적
 *
 * 단점:
 * - ❌ 순서 보장 안 됨 (완료 순서 예측 불가)
 * - ❌ 경쟁 상태(Race Condition) 발생 가능
 * - ❌ 무제한 병렬 실행 시 리소스 고갈 위험
 * - ❌ 에러 처리 복잡 (첫 번째 에러만 처리 가능)
 *
 * 주의사항:
 * - 동일한 리소스에 접근하는 경우 경쟁 상태 주의
 * - 너무 많은 작업을 동시에 실행하면 시스템 부하
 * - 제한된 병렬 실행 패턴 고려 (07-limited-parallel-execution.js)
 *
 * 사용 시기:
 * - 독립적인 I/O 작업 (파일 읽기, API 호출 등)
 * - 순서가 중요하지 않은 경우
 * - 전체 실행 시간을 최소화해야 할 때
 *
 * 실전 예시:
 * - 여러 API 동시 호출
 * - 다중 파일 다운로드
 * - 이미지 일괄 처리
 */
