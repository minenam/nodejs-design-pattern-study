/**
 * Promise 에러 처리
 * - 에러 전파 메커니즘
 * - catch 위치에 따른 차이
 * - 동기/비동기 에러 통합 처리
 */

console.log('=== Promise 에러 처리 ===\n')

// 에러 전파 메커니즘
console.log('--- 1. 에러 자동 전파 ---')

Promise.resolve(1)
  .then(value => {
    console.log('Step 1:', value)
    throw new Error('Step 1에서 에러!')
  })
  .then(value => {
    console.log('이 부분은 건너뜀 (Step 2)')
  })
  .then(value => {
    console.log('이 부분도 건너뜀 (Step 3)')
  })
  .catch(error => {
    console.log('에러 잡음:', error.message)
  })

setTimeout(() => {
  console.log()
  console.log('--- 2. catch 위치의 중요성 ---')

  // catch 이후 체인 계속 가능
  Promise.reject(new Error('초기 에러'))
    .catch(error => {
      console.log('첫 번째 catch:', error.message)
      return 'recovered'
    })
    .then(value => {
      console.log('복구 후 실행:', value)
      return 'next value'
    })
    .then(value => {
      console.log('계속 실행:', value)
    })

  setTimeout(() => {
    console.log()
    console.log('--- 3. catch 중간에 배치 ---')

    Promise.resolve(1)
      .then(value => {
        console.log('Step 1:', value)
        throw new Error('에러 A')
      })
      .catch(error => {
        console.log('중간 catch:', error.message)
        return 2 // 복구
      })
      .then(value => {
        console.log('Step 2 (복구됨):', value)
        throw new Error('에러 B')
      })
      .then(value => {
        console.log('이 부분은 실행 안됨')
      })
      .catch(error => {
        console.log('마지막 catch:', error.message)
      })

    setTimeout(() => {
      console.log()
      console.log('--- 4. 동기 vs 비동기 에러 ---')

      // 동기 에러도 Promise로 자동 감싸짐
      new Promise((resolve, reject) => {
        throw new Error('생성자 안에서 동기 에러') // 자동으로 reject 됨
      })
        .catch(error => {
          console.log('생성자 동기 에러 catch:', error.message)
        })

      // then 핸들러 안의 동기 에러
      Promise.resolve()
        .then(() => {
          throw new Error('then 안에서 동기 에러')
        })
        .catch(error => {
          console.log('then 동기 에러 catch:', error.message)
        })

      // 비동기 에러
      Promise.resolve()
        .then(() => {
          return new Promise((resolve, reject) => {
            setTimeout(() => {
              reject(new Error('비동기 에러'))
            }, 10)
          })
        })
        .catch(error => {
          console.log('비동기 에러 catch:', error.message)
        })

      setTimeout(() => {
        console.log()
        console.log('--- 5. catch 없으면? (UnhandledPromiseRejection) ---')

        // 경고: 실제로는 하지 말 것!
        // Node.js는 unhandledRejection 이벤트 발생
        Promise.reject(new Error('처리되지 않은 에러'))
          .then(value => console.log('실행 안됨'))

        // 이벤트 리스너로 전역 처리 (디버깅용)
        process.on('unhandledRejection', (reason, promise) => {
          console.log('⚠️ 처리되지 않은 Promise 거부:')
          console.log('   이유:', reason.message)
        })

        setTimeout(() => {
          console.log()
          console.log('--- 6. 실전 패턴: 에러 타입별 처리 ---')

          class NetworkError extends Error {
            constructor(message) {
              super(message)
              this.name = 'NetworkError'
            }
          }

          class ValidationError extends Error {
            constructor(message) {
              super(message)
              this.name = 'ValidationError'
            }
          }

          const fetchData = (shouldFail) => {
            return new Promise((resolve, reject) => {
              setTimeout(() => {
                if (shouldFail === 'network') {
                  reject(new NetworkError('서버에 연결할 수 없습니다'))
                } else if (shouldFail === 'validation') {
                  reject(new ValidationError('잘못된 데이터 형식'))
                } else {
                  resolve({ data: 'success' })
                }
              }, 10)
            })
          }

          // 에러 타입별로 다르게 처리
          fetchData('network')
            .catch(error => {
              if (error instanceof NetworkError) {
                console.log('네트워크 에러 처리:', error.message)
                return { data: 'cached' } // 캐시 사용
              }
              throw error // 다른 에러는 다시 throw
            })
            .catch(error => {
              if (error instanceof ValidationError) {
                console.log('검증 에러 처리:', error.message)
                return { data: 'default' }
              }
              throw error
            })
            .catch(error => {
              console.log('알 수 없는 에러:', error)
            })

          setTimeout(() => {
            console.log()
            console.log('--- 7. finally와 에러 처리 조합 ---')

            let connection = null

            Promise.resolve()
              .then(() => {
                console.log('1. 데이터베이스 연결 시도...')
                connection = { connected: true }
                return connection
              })
              .then(() => {
                console.log('2. 쿼리 실행...')
                throw new Error('쿼리 실패!')
              })
              .then(() => {
                console.log('3. 이 부분은 실행 안됨')
              })
              .catch(error => {
                console.log('4. 에러 처리:', error.message)
              })
              .finally(() => {
                if (connection) {
                  console.log('5. 연결 종료 (finally)')
                  connection.connected = false
                }
              })

            setTimeout(() => {
              console.log()
              console.log('=== 핵심 포인트 ===')
              console.log('✅ 에러는 자동으로 체인을 따라 전파됨')
              console.log('✅ catch는 체인 중간 어디든 배치 가능')
              console.log('✅ catch 후 값 반환하면 체인 복구됨')
              console.log('✅ 동기/비동기 에러 모두 catch로 처리')
              console.log('✅ catch 없으면 unhandledRejection 발생')
              console.log('✅ finally는 성공/실패 관계없이 실행')
            }, 100)
          }, 100)
        }, 100)
      }, 50)
    }, 100)
  }, 100)
}, 100)

/*
예상 출력:
=== Promise 에러 처리 ===

--- 1. 에러 자동 전파 ---
Step 1: 1
에러 잡음: Step 1에서 에러!

--- 2. catch 위치의 중요성 ---
첫 번째 catch: 초기 에러
복구 후 실행: recovered
계속 실행: next value

--- 3. catch 중간에 배치 ---
Step 1: 1
중간 catch: 에러 A
Step 2 (복구됨): 2
마지막 catch: 에러 B

--- 4. 동기 vs 비동기 에러 ---
생성자 동기 에러 catch: 생성자 안에서 동기 에러
then 동기 에러 catch: then 안에서 동기 에러
비동기 에러 catch: 비동기 에러

--- 5. catch 없으면? (UnhandledPromiseRejection) ---
⚠️ 처리되지 않은 Promise 거부:
   이유: 처리되지 않은 에러

--- 6. 실전 패턴: 에러 타입별 처리 ---
네트워크 에러 처리: 서버에 연결할 수 없습니다

--- 7. finally와 에러 처리 조합 ---
1. 데이터베이스 연결 시도...
2. 쿼리 실행...
4. 에러 처리: 쿼리 실패!
5. 연결 종료 (finally)

=== 핵심 포인트 ===
✅ 에러는 자동으로 체인을 따라 전파됨
✅ catch는 체인 중간 어디든 배치 가능
✅ catch 후 값 반환하면 체인 복구됨
✅ 동기/비동기 에러 모두 catch로 처리
✅ catch 없으면 unhandledRejection 발생
✅ finally는 성공/실패 관계없이 실행
*/
