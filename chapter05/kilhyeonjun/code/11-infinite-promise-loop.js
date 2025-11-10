/**
 * 무한 재귀 Promise 해결 체인의 문제
 * - 메모리 누수 발생 원인
 * - 잘못된 패턴과 올바른 패턴
 * - async/await로 안전하게 구현
 */

console.log('=== 무한 재귀 Promise 체인 문제 ===\n')

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

console.log('--- 1. 문제: 메모리 누수 패턴 ---')
console.log('※ 실제로는 실행하지 말 것! (데모용 설명만)\n')

console.log('잘못된 예 1: return과 재귀 호출')
console.log('```javascript')
console.log('function leakingLoop() {')
console.log('  return delay(1)')
console.log('    .then(() => {')
console.log('      console.log(`Tick ${Date.now()}`)')
console.log('      return leakingLoop()  // ← 문제!')
console.log('    })')
console.log('}')
console.log('```\n')

console.log('문제점:')
console.log('- 각 Promise가 다음 Promise에 의존')
console.log('- 끊어지지 않는 Promise 체인 생성')
console.log('- 메모리에서 해제되지 않음')
console.log('- 결국 메모리 부족으로 크래시\n')

console.log('--- 2. 해결 방법 1: return 제거 ---')

let count1 = 0
function nonLeakingLoop1() {
  delay(100)
    .then(() => {
      console.log(`  Tick ${++count1}`)
      if (count1 < 5) {
        nonLeakingLoop1() // return 없음!
      } else {
        console.log('  완료\n')
        demonstrateMethod2()
      }
    })
}

console.log('return 없는 버전:')
nonLeakingLoop1()

function demonstrateMethod2() {
  console.log('--- 3. 해결 방법 2: Promise 생성자로 감싸기 ---')

  let count2 = 0
  function nonLeakingLoop2() {
    return new Promise((resolve, reject) => {
      (function internalLoop() {
        delay(100)
          .then(() => {
            console.log(`  Tick ${++count2}`)
            if (count2 < 5) {
              internalLoop() // 내부 루프 계속
            } else {
              resolve('완료')
            }
          })
          .catch(err => {
            reject(err) // 에러 전파 가능
          })
      })()
    })
  }

  console.log('Promise 생성자로 감싼 버전:')
  nonLeakingLoop2()
    .then(result => {
      console.log('  결과:', result)
      console.log()
      demonstrateMethod3()
    })
}

function demonstrateMethod3() {
  console.log('--- 4. 해결 방법 3: async/await + while (권장!) ---')

  async function nonLeakingLoopAsync() {
    let count = 0
    while (count < 5) {
      await delay(100)
      console.log(`  Tick ${++count}`)
    }
    return '완료'
  }

  console.log('async/await + while 버전:')
  nonLeakingLoopAsync()
    .then(result => {
      console.log('  결과:', result)
      console.log()
      console.log('장점:')
      console.log('  ✓ 메모리 안전')
      console.log('  ✓ 에러 자동 전파')
      console.log('  ✓ 가장 읽기 쉬움')
      console.log('  ✓ break/continue 사용 가능')
      console.log()
      demonstrateAsyncAwaitPitfall()
    })
}

function demonstrateAsyncAwaitPitfall() {
  console.log('--- 5. 주의: async/await도 재귀는 위험! ---')
  console.log('※ 실행하지 말 것! (설명만)\n')

  console.log('잘못된 예:')
  console.log('```javascript')
  console.log('async function leakingLoopAsync() {')
  console.log('  await delay(1)')
  console.log('  console.log(`Tick ${Date.now()}`)')
  console.log('  return leakingLoopAsync()  // ← 여전히 문제!')
  console.log('}')
  console.log('```\n')

  console.log('재귀 호출은 스택을 계속 쌓음')
  console.log('→ async/await에서도 while 루프 사용!\n')

  setTimeout(() => {
    console.log('--- 6. 실전 예제: 무한 폴링 ---')

    let pollCount = 0
    async function pollServer() {
      console.log('서버 폴링 시작...')
      while (pollCount < 5) { // 실제로는 true
        await delay(200)
        pollCount++
        console.log(`  폴링 #${pollCount}: 서버 상태 확인`)

        // 실제로는 API 호출
        // const status = await fetch('/api/status')
      }
      console.log('폴링 완료 (실제로는 무한 루프)\n')
    }

    pollServer().then(() => {
      console.log('--- 7. 실전 예제: 이벤트 처리 루프 ---')

      class EventProcessor {
        constructor() {
          this.events = []
          this.running = false
        }

        async start() {
          this.running = true
          console.log('이벤트 처리 시작...')

          // 메모리 안전한 무한 루프
          while (this.running) {
            if (this.events.length > 0) {
              const event = this.events.shift()
              console.log(`  이벤트 처리: ${event}`)
            }
            await delay(100) // 다음 체크까지 대기
          }

          console.log('이벤트 처리 종료\n')
        }

        addEvent(event) {
          this.events.push(event)
        }

        stop() {
          this.running = false
        }
      }

      const processor = new EventProcessor()

      // 이벤트 추가
      processor.addEvent('Event 1')
      setTimeout(() => processor.addEvent('Event 2'), 150)
      setTimeout(() => processor.addEvent('Event 3'), 300)
      setTimeout(() => processor.stop(), 500)

      processor.start().then(() => {
        console.log('--- 8. 비교: 재귀 vs 반복 ---')

        console.log('재귀 (위험):')
        console.log('- 각 호출이 스택에 쌓임')
        console.log('- Promise 체인이 끊어지지 않음')
        console.log('- 메모리 누수 발생')
        console.log('- 디버깅 어려움\n')

        console.log('반복 (안전):')
        console.log('- while 루프는 스택 재사용')
        console.log('- await가 현재 위치에서 대기')
        console.log('- 메모리 안전')
        console.log('- 디버깅 쉬움\n')

        setTimeout(() => {
          console.log('--- 9. 메모리 프로파일링 (개념) ---')
          console.log('재귀 패턴:')
          console.log('  메모리: ↗↗↗ (계속 증가)')
          console.log('  Promise 체인 길이: ∞')
          console.log('  결국: 💥 크래시\n')

          console.log('while 패턴:')
          console.log('  메모리: ─── (일정)')
          console.log('  스택 깊이: 1')
          console.log('  안정적: ✓\n')

          console.log('--- 10. finally와 무한 루프 ---')

          let loopCount = 0
          async function loopWithCleanup() {
            try {
              console.log('리소스 할당...')
              const resource = { allocated: true }

              while (loopCount < 3) {
                await delay(100)
                console.log(`  루프 ${++loopCount}`)
              }

              console.log('정상 종료')
            } catch (err) {
              console.log('에러:', err.message)
            } finally {
              console.log('리소스 정리 (finally)')
            }
          }

          loopWithCleanup().then(() => {
            console.log()
            console.log('=== 핵심 포인트 ===')
            console.log('✅ 재귀 + return = 메모리 누수!')
            console.log('✅ return 제거 = 에러 전파 안됨')
            console.log('✅ Promise 생성자 = 에러 처리 가능')
            console.log('✅ async/await + while = 최고! (권장)')
            console.log('✅ 무한 루프는 while, 재귀 금지')
            console.log('✅ break로 루프 종료 가능')
            console.log('✅ try-catch-finally로 안전하게')
            console.log()
            console.log('=== Promise/A+ 스펙의 한계 ===')
            console.log('- Promise 체인은 메모리에서 자동 해제 안됨')
            console.log('- 모든 Promise 구현에서 동일한 문제')
            console.log('- 해결: 재귀 대신 반복 사용')
          })
        }, 600)
      })
    })
  }, 100)
}

/*
예상 출력:
=== 무한 재귀 Promise 체인 문제 ===

--- 1. 문제: 메모리 누수 패턴 ---
※ 실제로는 실행하지 말 것! (데모용 설명만)

잘못된 예 1: return과 재귀 호출
```javascript
function leakingLoop() {
  return delay(1)
    .then(() => {
      console.log(`Tick ${Date.now()}`)
      return leakingLoop()  // ← 문제!
    })
}
```

문제점:
- 각 Promise가 다음 Promise에 의존
- 끊어지지 않는 Promise 체인 생성
- 메모리에서 해제되지 않음
- 결국 메모리 부족으로 크래시

--- 2. 해결 방법 1: return 제거 ---
return 없는 버전:
  Tick 1
  Tick 2
  Tick 3
  Tick 4
  Tick 5
  완료

--- 3. 해결 방법 2: Promise 생성자로 감싸기 ---
Promise 생성자로 감싼 버전:
  Tick 1
  Tick 2
  Tick 3
  Tick 4
  Tick 5
  결과: 완료

--- 4. 해결 방법 3: async/await + while (권장!) ---
async/await + while 버전:
  Tick 1
  Tick 2
  Tick 3
  Tick 4
  Tick 5
  결과: 완료

장점:
  ✓ 메모리 안전
  ✓ 에러 자동 전파
  ✓ 가장 읽기 쉬움
  ✓ break/continue 사용 가능

--- 5. 주의: async/await도 재귀는 위험! ---
※ 실행하지 말 것! (설명만)

잘못된 예:
```javascript
async function leakingLoopAsync() {
  await delay(1)
  console.log(`Tick ${Date.now()}`)
  return leakingLoopAsync()  // ← 여전히 문제!
}
```

재귀 호출은 스택을 계속 쌓음
→ async/await에서도 while 루프 사용!

--- 6. 실전 예제: 무한 폴링 ---
서버 폴링 시작...
  폴링 #1: 서버 상태 확인
  폴링 #2: 서버 상태 확인
  폴링 #3: 서버 상태 확인
  폴링 #4: 서버 상태 확인
  폴링 #5: 서버 상태 확인
폴링 완료 (실제로는 무한 루프)

--- 7. 실전 예제: 이벤트 처리 루프 ---
이벤트 처리 시작...
  이벤트 처리: Event 1
  이벤트 처리: Event 2
  이벤트 처리: Event 3
이벤트 처리 종료

--- 8. 비교: 재귀 vs 반복 ---
재귀 (위험):
- 각 호출이 스택에 쌓임
- Promise 체인이 끊어지지 않음
- 메모리 누수 발생
- 디버깅 어려움

반복 (안전):
- while 루프는 스택 재사용
- await가 현재 위치에서 대기
- 메모리 안전
- 디버깅 쉬움

--- 9. 메모리 프로파일링 (개념) ---
재귀 패턴:
  메모리: ↗↗↗ (계속 증가)
  Promise 체인 길이: ∞
  결국: 💥 크래시

while 패턴:
  메모리: ─── (일정)
  스택 깊이: 1
  안정적: ✓

--- 10. finally와 무한 루프 ---
리소스 할당...
  루프 1
  루프 2
  루프 3
정상 종료
리소스 정리 (finally)

=== 핵심 포인트 ===
✅ 재귀 + return = 메모리 누수!
✅ return 제거 = 에러 전파 안됨
✅ Promise 생성자 = 에러 처리 가능
✅ async/await + while = 최고! (권장)
✅ 무한 루프는 while, 재귀 금지
✅ break로 루프 종료 가능
✅ try-catch-finally로 안전하게

=== Promise/A+ 스펙의 한계 ===
- Promise 체인은 메모리에서 자동 해제 안됨
- 모든 Promise 구현에서 동일한 문제
- 해결: 재귀 대신 반복 사용
*/
