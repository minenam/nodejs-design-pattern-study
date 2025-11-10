/**
 * Chapter 4: TaskQueue 클래스 구현
 *
 * 핵심 개념:
 * - EventEmitter 기반 작업 큐
 * - 재사용 가능한 동시성 제어 추상화
 *
 * 학습 목표:
 * - TaskQueue 클래스 구현 방법
 * - EventEmitter 활용
 * - 전역적인 동시성 관리
 */

import { EventEmitter } from 'events'

console.log("=== TaskQueue 클래스 구현 ===\n")

// ✅ TaskQueue 클래스 정의
class TaskQueue extends EventEmitter {
  constructor(concurrency) {
    super()
    this.concurrency = concurrency
    this.running = 0
    this.queue = []
  }

  pushTask(task) {
    this.queue.push(task)
    process.nextTick(this.next.bind(this))
    return this
  }

  next() {
    if (this.running === 0 && this.queue.length === 0) {
      return this.emit('empty')
    }

    while (this.running < this.concurrency && this.queue.length) {
      const task = this.queue.shift()
      task((err) => {
        if (err) {
          this.emit('error', err)
        }
        this.running--
        process.nextTick(this.next.bind(this))
      })
      this.running++
    }
  }

  getStats() {
    return {
      running: this.running,
      queued: this.queue.length,
      total: this.running + this.queue.length
    }
  }
}

// 테스트 1: 기본 사용
console.log("📋 테스트 1: 기본 TaskQueue 사용\n")

const queue1 = new TaskQueue(2)

// 이벤트 리스너 등록
queue1.on('error', (err) => {
  console.error('❌ 작업 실패:', err.message)
})

queue1.on('empty', () => {
  console.log('\n🎉 모든 작업 완료!\n')
  // 테스트 2 실행
  setTimeout(() => runTest2(), 500)
})

// 작업 추가
console.log('📌 5개 작업 추가 (동시성: 2)\n')

for (let i = 1; i <= 5; i++) {
  queue1.pushTask((done) => {
    const delay = Math.random() * 200 + 100
    console.log(`⚙️  Task ${i} 시작... (${delay.toFixed(0)}ms)`)

    setTimeout(() => {
      console.log(`✅ Task ${i} 완료`)
      done()
    }, delay)
  })
}

// 테스트 2: 통계 정보
function runTest2() {
  console.log('─'.repeat(60))
  console.log("📋 테스트 2: 통계 정보 확인\n")

  const queue2 = new TaskQueue(3)
  let completedCount = 0

  queue2.on('empty', () => {
    console.log('\n🎉 모든 작업 완료!\n')
    // 테스트 3 실행
    setTimeout(() => runTest3(), 500)
  })

  // 실시간 통계 출력
  const statsInterval = setInterval(() => {
    const stats = queue2.getStats()
    console.log(`📊 [통계] 실행 중: ${stats.running}, 대기 중: ${stats.queued}, 전체: ${stats.total}`)

    if (stats.total === 0) {
      clearInterval(statsInterval)
    }
  }, 100)

  console.log('📌 10개 작업 추가 (동시성: 3)\n')

  for (let i = 1; i <= 10; i++) {
    queue2.pushTask((done) => {
      setTimeout(() => {
        completedCount++
        console.log(`✅ Task ${i} 완료 (${completedCount}/10)`)
        done()
      }, Math.random() * 100 + 50)
    })
  }
}

// 테스트 3: 에러 처리
function runTest3() {
  console.log('─'.repeat(60))
  console.log("📋 테스트 3: 에러 처리\n")

  const queue3 = new TaskQueue(2)
  let successCount = 0
  let errorCount = 0

  queue3.on('error', (err) => {
    errorCount++
    console.error(`❌ 작업 실패 (${errorCount}개): ${err.message}`)
  })

  queue3.on('empty', () => {
    console.log(`\n📊 최종 결과:`)
    console.log(`   성공: ${successCount}개`)
    console.log(`   실패: ${errorCount}개`)
    console.log('\n✅ 에러 처리 테스트 완료!\n')

    // 테스트 4 실행
    setTimeout(() => runTest4(), 500)
  })

  console.log('📌 5개 작업 추가 (일부는 실패)\n')

  for (let i = 1; i <= 5; i++) {
    queue3.pushTask((done) => {
      setTimeout(() => {
        // Task 3과 5는 실패
        if (i === 3 || i === 5) {
          console.log(`❌ Task ${i} 실패 발생`)
          done(new Error(`Task ${i} failed`))
        } else {
          successCount++
          console.log(`✅ Task ${i} 성공`)
          done()
        }
      }, 50)
    })
  }
}

// 테스트 4: 동적 작업 추가
function runTest4() {
  console.log('─'.repeat(60))
  console.log("📋 테스트 4: 동적 작업 추가\n")

  const queue4 = new TaskQueue(2)
  let taskCount = 0

  queue4.on('empty', () => {
    console.log('\n🎉 모든 작업 완료!\n')
    // 테스트 5 실행
    setTimeout(() => runTest5(), 500)
  })

  console.log('📌 초기 3개 작업 추가\n')

  for (let i = 1; i <= 3; i++) {
    taskCount++
    const taskId = taskCount

    queue4.pushTask((done) => {
      console.log(`⚙️  Task ${taskId} 시작`)

      setTimeout(() => {
        console.log(`✅ Task ${taskId} 완료`)

        // Task 완료 시 새로운 작업 추가 (Task 1, 2만)
        if (taskId <= 2) {
          taskCount++
          const newTaskId = taskCount
          console.log(`   ↳ Task ${taskId}이(가) Task ${newTaskId}을(를) 추가함`)

          queue4.pushTask((done2) => {
            setTimeout(() => {
              console.log(`✅ Task ${newTaskId} 완료 (동적 추가됨)`)
              done2()
            }, 100)
          })
        }

        done()
      }, 100)
    })
  }
}

// 테스트 5: 체이닝과 재사용
function runTest5() {
  console.log('─'.repeat(60))
  console.log("📋 테스트 5: 체이닝과 재사용\n")

  const queue5 = new TaskQueue(2)

  queue5
    .on('error', (err) => {
      console.error('❌ 에러:', err.message)
    })
    .on('empty', () => {
      console.log('\n🎉 첫 번째 배치 완료!')
      console.log('📌 두 번째 배치 시작...\n')

      // 동일한 큐를 재사용
      queue5
        .pushTask((done) => {
          console.log('⚙️  Batch 2 - Task 1')
          setTimeout(() => {
            console.log('✅ Batch 2 - Task 1 완료')
            done()
          }, 50)
        })
        .pushTask((done) => {
          console.log('⚙️  Batch 2 - Task 2')
          setTimeout(() => {
            console.log('✅ Batch 2 - Task 2 완료')
            done()
          }, 50)
        })
    })

  // 체이닝 방식으로 작업 추가
  console.log('📌 첫 번째 배치 (체이닝)\n')

  queue5
    .pushTask((done) => {
      console.log('⚙️  Batch 1 - Task 1')
      setTimeout(() => {
        console.log('✅ Batch 1 - Task 1 완료')
        done()
      }, 100)
    })
    .pushTask((done) => {
      console.log('⚙️  Batch 1 - Task 2')
      setTimeout(() => {
        console.log('✅ Batch 1 - Task 2 완료')
        done()
      }, 100)
    })
    .pushTask((done) => {
      console.log('⚙️  Batch 1 - Task 3')
      setTimeout(() => {
        console.log('✅ Batch 1 - Task 3 완료')
        done()
      }, 100)
    })

  // empty 이벤트 후에 자동으로 두 번째 배치 실행됨
  queue5.once('empty', () => {
    console.log('\n🎉 두 번째 배치 완료!')
    console.log('\n✅ 모든 TaskQueue 테스트 완료!')
  })
}

/**
 * TaskQueue 클래스의 특징:
 *
 * 핵심 기능:
 * 1. 동시성 제어
 *    - concurrency 매개변수로 제한
 *    - running 카운터로 추적
 *
 * 2. 이벤트 발생
 *    - 'empty': 모든 작업 완료
 *    - 'error': 작업 실패
 *
 * 3. 메서드 체이닝
 *    - pushTask()가 this 반환
 *    - 유창한(fluent) API
 *
 * 장점:
 * - ✅ 재사용 가능한 추상화
 * - ✅ EventEmitter 기반으로 유연함
 * - ✅ 전역적인 동시성 제어
 * - ✅ 체이닝 지원
 * - ✅ 동적 작업 추가 가능
 *
 * 사용 시나리오:
 * - 웹 크롤러 (전역 동시 요청 제한)
 * - 파일 처리 파이프라인
 * - API 배치 작업
 * - 이미지 처리
 * - 데이터베이스 마이그레이션
 *
 * 개선 가능성:
 * - 우선순위 큐 지원
 * - 작업 취소 기능
 * - 타임아웃 처리
 * - 진행률 추적
 * - Promise 기반 API
 */
