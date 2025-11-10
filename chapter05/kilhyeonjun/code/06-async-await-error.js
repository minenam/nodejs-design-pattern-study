/**
 * Async/Await 에러 처리
 * - try-catch로 통합 에러 처리
 * - 동기/비동기 에러 동일하게 처리
 * - finally 블록 활용
 */

console.log('=== Async/Await 에러 처리 ===\n')

function delay(ms, value) {
  return new Promise(resolve => setTimeout(() => resolve(value), ms))
}

function delayError(ms, message) {
  return new Promise((resolve, reject) => {
    setTimeout(() => reject(new Error(message)), ms)
  })
}

// try-catch 기본
console.log('--- 1. try-catch 기본 ---')

async function basicErrorHandling() {
  try {
    const result = await delayError(50, '비동기 에러 발생!')
    console.log('이 부분은 실행 안됨:', result)
  } catch (err) {
    console.log('에러 잡음:', err.message)
  }
}

basicErrorHandling().then(() => {
  console.log()
  console.log('--- 2. 동기/비동기 에러 통합 처리 ---')

  async function mixedErrors(throwSync) {
    try {
      if (throwSync) {
        // 동기 에러
        throw new Error('동기 에러!')
      }
      // 비동기 에러
      await delayError(50, '비동기 에러!')
    } catch (err) {
      console.log('catch가 모두 처리:', err.message)
    }
  }

  mixedErrors(true).then(() => {
    return mixedErrors(false)
  }).then(() => {
    console.log()
    console.log('--- 3. finally 블록 ---')

    async function withFinally(shouldFail) {
      let resource = null
      try {
        console.log('1. 리소스 할당')
        resource = { allocated: true }

        if (shouldFail) {
          throw new Error('작업 실패!')
        }

        await delay(50)
        console.log('2. 작업 성공')
      } catch (err) {
        console.log('3. 에러 처리:', err.message)
      } finally {
        if (resource) {
          console.log('4. 리소스 정리 (finally)')
          resource.allocated = false
        }
      }
    }

    withFinally(false).then(() => {
      console.log()
      return withFinally(true)
    }).then(() => {
      console.log()
      console.log('--- 4. 여러 await와 에러 ---')

      async function multipleAwaits() {
        try {
          console.log('Step 1 시작')
          await delay(30, 'success')
          console.log('Step 1 완료')

          console.log('Step 2 시작')
          await delayError(30, 'Step 2 실패!')
          console.log('이 부분은 실행 안됨')

          console.log('Step 3 시작')
          await delay(30)
          console.log('이 부분도 실행 안됨')
        } catch (err) {
          console.log('에러 발생 시점:', err.message)
        }
      }

      multipleAwaits().then(() => {
        console.log()
        console.log('--- 5. 에러 복구와 재시도 ---')

        async function retryOperation(maxRetries = 3) {
          let attempt = 0

          while (attempt < maxRetries) {
            try {
              attempt++
              console.log(`시도 ${attempt}/${maxRetries}`)

              // 2번째 시도에서 성공
              if (attempt < 2) {
                throw new Error('실패!')
              }

              await delay(30, 'success')
              console.log('성공!')
              return 'completed'
            } catch (err) {
              console.log(`  에러: ${err.message}`)

              if (attempt >= maxRetries) {
                console.log('  최대 재시도 횟수 초과')
                throw err // 재시도 실패
              }

              console.log('  재시도 대기...')
              await delay(50)
            }
          }
        }

        retryOperation().then(() => {
          console.log()
          console.log('--- 6. Promise 체인 vs async/await 에러 처리 비교 ---')

          console.log('Promise 체인:')
          delay(30, 1)
            .then(value => {
              console.log('  Step 1:', value)
              return delayError(30, '에러!')
            })
            .then(value => {
              console.log('  실행 안됨')
            })
            .catch(err => {
              console.log('  catch:', err.message)
              return 'recovered'
            })
            .then(value => {
              console.log('  복구됨:', value)
            })

          setTimeout(() => {
            console.log('\nasync/await:')
            async function asyncAwaitError() {
              try {
                const value1 = await delay(30, 1)
                console.log('  Step 1:', value1)

                const value2 = await delayError(30, '에러!')
                console.log('  실행 안됨')
              } catch (err) {
                console.log('  catch:', err.message)
                const recovered = 'recovered'
                console.log('  복구됨:', recovered)
              }
            }

            asyncAwaitError().then(() => {
              console.log()
              console.log('--- 7. 여러 Promise 중 일부만 에러 ---')

              async function partialErrors() {
                try {
                  const result1 = await delay(30, 'success 1')
                  console.log('첫 번째 성공:', result1)

                  // 두 번째는 에러
                  const result2 = await delayError(30, 'failed')
                  console.log('실행 안됨:', result2)

                  // 세 번째는 실행 안됨
                  const result3 = await delay(30, 'success 3')
                  console.log('실행 안됨:', result3)
                } catch (err) {
                  console.log('중간에 실패:', err.message)
                }
              }

              partialErrors().then(() => {
                console.log()
                console.log('--- 8. 에러 타입별 처리 ---')

                class ValidationError extends Error {
                  constructor(message) {
                    super(message)
                    this.name = 'ValidationError'
                  }
                }

                class NetworkError extends Error {
                  constructor(message) {
                    super(message)
                    this.name = 'NetworkError'
                  }
                }

                async function fetchData(errorType) {
                  if (errorType === 'validation') {
                    throw new ValidationError('잘못된 입력')
                  }
                  if (errorType === 'network') {
                    throw new NetworkError('연결 실패')
                  }
                  return { data: 'success' }
                }

                async function handleSpecificErrors() {
                  try {
                    await fetchData('validation')
                  } catch (err) {
                    if (err instanceof ValidationError) {
                      console.log('검증 에러:', err.message)
                      console.log('→ 입력 데이터 확인 필요')
                    } else if (err instanceof NetworkError) {
                      console.log('네트워크 에러:', err.message)
                      console.log('→ 재시도 필요')
                    } else {
                      console.log('알 수 없는 에러:', err)
                      throw err // 처리 못한 에러는 다시 throw
                    }
                  }
                }

                handleSpecificErrors().then(() => {
                  console.log()
                  console.log('=== 핵심 포인트 ===')
                  console.log('✅ try-catch로 동기/비동기 에러 통합 처리')
                  console.log('✅ finally는 항상 실행 (정리 작업)')
                  console.log('✅ 첫 번째 에러에서 즉시 catch로 이동')
                  console.log('✅ catch에서 에러 복구 가능')
                  console.log('✅ while + try-catch로 재시도 구현')
                  console.log('✅ Promise 체인보다 훨씬 직관적')
                })
              })
            }, 100)
          }, 100)
        })
      })
    })
  })
})

/*
예상 출력:
=== Async/Await 에러 처리 ===

--- 1. try-catch 기본 ---
에러 잡음: 비동기 에러 발생!

--- 2. 동기/비동기 에러 통합 처리 ---
catch가 모두 처리: 동기 에러!
catch가 모두 처리: 비동기 에러!

--- 3. finally 블록 ---
1. 리소스 할당
2. 작업 성공
4. 리소스 정리 (finally)

1. 리소스 할당
3. 에러 처리: 작업 실패!
4. 리소스 정리 (finally)

--- 4. 여러 await와 에러 ---
Step 1 시작
Step 1 완료
Step 2 시작
에러 발생 시점: Step 2 실패!

--- 5. 에러 복구와 재시도 ---
시도 1/3
  에러: 실패!
  재시도 대기...
시도 2/3
성공!

--- 6. Promise 체인 vs async/await 에러 처리 비교 ---
Promise 체인:
  Step 1: 1
  catch: 에러!
  복구됨: recovered

async/await:
  Step 1: 1
  catch: 에러!
  복구됨: recovered

--- 7. 여러 Promise 중 일부만 에러 ---
첫 번째 성공: success 1
중간에 실패: failed

--- 8. 에러 타입별 처리 ---
검증 에러: 잘못된 입력
→ 입력 데이터 확인 필요

=== 핵심 포인트 ===
✅ try-catch로 동기/비동기 에러 통합 처리
✅ finally는 항상 실행 (정리 작업)
✅ 첫 번째 에러에서 즉시 catch로 이동
✅ catch에서 에러 복구 가능
✅ while + try-catch로 재시도 구현
✅ Promise 체인보다 훨씬 직관적
*/
