/**
 * return vs return await 차이
 * - return: Promise를 그대로 반환
 * - return await: Promise를 기다린 후 값 반환
 * - 에러 처리에서의 중요한 차이점
 */

console.log('=== return vs return await ===\n')

function delayError(ms, message) {
  return new Promise((resolve, reject) => {
    setTimeout(() => reject(new Error(message)), ms)
  })
}

function delay(ms, value) {
  return new Promise(resolve => setTimeout(() => resolve(value), ms))
}

// 정상 케이스 (성공)
console.log('--- 1. 성공 케이스: 차이 없음 ---')

async function returnWithoutAwait() {
  return delay(50, 'success') // Promise를 그대로 반환
}

async function returnWithAwait() {
  return await delay(50, 'success') // 기다린 후 값 반환
}

Promise.all([
  returnWithoutAwait(),
  returnWithAwait()
]).then(results => {
  console.log('둘 다 같은 결과:', results)
})

setTimeout(() => {
  console.log()
  console.log('--- 2. 에러 케이스: 중요한 차이! ---')

  // return (await 없음): 로컬 try-catch가 에러를 잡지 못함
  async function errorNotCaught() {
    try {
      return delayError(50, 'Error in errorNotCaught') // await 없음!
    } catch (err) {
      console.log('  [로컬 catch] 이 부분은 실행되지 않음:', err.message)
    }
  }

  // return await: 로컬 try-catch가 에러를 잡음
  async function errorCaught() {
    try {
      return await delayError(50, 'Error in errorCaught') // await 있음!
    } catch (err) {
      console.log('  [로컬 catch] 에러 잡음:', err.message)
      return 'recovered in local catch'
    }
  }

  console.log('Case 1: return (await 없음)')
  errorNotCaught()
    .then(value => {
      console.log('  [호출자] then 실행:', value)
    })
    .catch(err => {
      console.log('  [호출자] catch가 에러 잡음:', err.message)
    })

  setTimeout(() => {
    console.log('\nCase 2: return await')
    errorCaught()
      .then(value => {
        console.log('  [호출자] then 실행:', value)
      })
      .catch(err => {
        console.log('  [호출자] catch 실행:', err.message)
      })

    setTimeout(() => {
      console.log()
      console.log('--- 3. 상세 분석 ---')

      console.log('\n[return delayError()]의 동작:')
      console.log('1. delayError()가 Promise를 반환')
      console.log('2. 그 Promise를 그대로 함수 밖으로 반환')
      console.log('3. try-catch 블록을 벗어남 (에러 검사 안함)')
      console.log('4. Promise가 reject되면 호출자에게 전파')

      console.log('\n[return await delayError()]의 동작:')
      console.log('1. delayError()가 Promise를 반환')
      console.log('2. await가 Promise가 settle될 때까지 기다림')
      console.log('3. Promise가 reject되면 에러를 throw')
      console.log('4. try-catch가 에러를 잡음')
      console.log('5. catch 블록 실행')

      setTimeout(() => {
        console.log()
        console.log('--- 4. 실전 예제: 데이터베이스 연결 ---')

        class Database {
          async connect() {
            console.log('  DB 연결 시도...')
            await delay(50)
            throw new Error('연결 실패!')
          }
        }

        // 잘못된 예: 에러가 로컬에서 잡히지 않음
        async function queryWithoutAwait() {
          const db = new Database()
          try {
            return db.connect() // await 없음!
          } catch (err) {
            console.log('  [잘못된 예] 로컬 정리 작업 - 실행 안됨')
            return null
          }
        }

        // 올바른 예: 에러를 로컬에서 처리
        async function queryWithAwait() {
          const db = new Database()
          try {
            return await db.connect() // await 있음!
          } catch (err) {
            console.log('  [올바른 예] 로컬 정리 작업 실행')
            console.log('  [올바른 예] DB 연결 실패 로깅:', err.message)
            return null
          }
        }

        console.log('잘못된 예 (return without await):')
        queryWithoutAwait()
          .then(result => console.log('  결과:', result))
          .catch(err => console.log('  호출자가 에러 처리:', err.message))

        setTimeout(() => {
          console.log('\n올바른 예 (return await):')
          queryWithAwait()
            .then(result => console.log('  결과:', result))
            .catch(err => console.log('  호출자 catch:', err.message))

          setTimeout(() => {
            console.log()
            console.log('--- 5. finally와의 관계 ---')

            async function withFinallyNoAwait() {
              try {
                return delay(50, 'success') // await 없음
              } finally {
                console.log('  finally 실행 (await 없음)')
                // return 직후 바로 실행됨
              }
            }

            async function withFinallyWithAwait() {
              try {
                return await delay(50, 'success') // await 있음
              } finally {
                console.log('  finally 실행 (await 있음)')
                // Promise가 resolve된 후 실행됨
              }
            }

            console.log('return without await + finally:')
            withFinallyNoAwait().then(() => {
              console.log()
              console.log('return await + finally:')
              withFinallyWithAwait().then(() => {
                console.log()
                console.log('--- 6. 성능 고려사항 ---')
                console.log('✓ return await는 약간의 오버헤드 추가')
                console.log('✓ 하지만 에러 처리/디버깅이 더 중요')
                console.log('✓ try-catch 안에서는 return await 사용 권장')
                console.log('✓ try-catch 밖에서는 return만으로 충분')

                setTimeout(() => {
                  console.log()
                  console.log('--- 7. ESLint 규칙 ---')
                  console.log('no-return-await: try-catch 밖에서 return await 금지')
                  console.log('하지만 try-catch 안에서는 예외!')

                  console.log()
                  console.log('=== 핵심 포인트 ===')
                  console.log('✅ return: Promise를 그대로 반환 (빠름)')
                  console.log('✅ return await: 기다린 후 값 반환 (안전)')
                  console.log('✅ try-catch 안에서는 return await 필수!')
                  console.log('✅ finally는 두 경우 모두 실행되지만 타이밍 다름')
                  console.log('✅ 에러 처리가 중요하면 return await 사용')
                }, 100)
              })
            })
          }, 200)
        }, 200)
      }, 100)
    }, 100)
  }, 100)
}, 100)

/*
예상 출력:
=== return vs return await ===

--- 1. 성공 케이스: 차이 없음 ---
둘 다 같은 결과: ['success', 'success']

--- 2. 에러 케이스: 중요한 차이! ---
Case 1: return (await 없음)
  [호출자] catch가 에러 잡음: Error in errorNotCaught

Case 2: return await
  [로컬 catch] 에러 잡음: Error in errorCaught
  [호출자] then 실행: recovered in local catch

--- 3. 상세 분석 ---

[return delayError()]의 동작:
1. delayError()가 Promise를 반환
2. 그 Promise를 그대로 함수 밖으로 반환
3. try-catch 블록을 벗어남 (에러 검사 안함)
4. Promise가 reject되면 호출자에게 전파

[return await delayError()]의 동작:
1. delayError()가 Promise를 반환
2. await가 Promise가 settle될 때까지 기다림
3. Promise가 reject되면 에러를 throw
4. try-catch가 에러를 잡음
5. catch 블록 실행

--- 4. 실전 예제: 데이터베이스 연결 ---
잘못된 예 (return without await):
  DB 연결 시도...
  호출자가 에러 처리: 연결 실패!

올바른 예 (return await):
  DB 연결 시도...
  [올바른 예] 로컬 정리 작업 실행
  [올바른 예] DB 연결 실패 로깅: 연결 실패!
  결과: null

--- 5. finally와의 관계 ---
return without await + finally:
  finally 실행 (await 없음)

return await + finally:
  finally 실행 (await 있음)

--- 6. 성능 고려사항 ---
✓ return await는 약간의 오버헤드 추가
✓ 하지만 에러 처리/디버깅이 더 중요
✓ try-catch 안에서는 return await 사용 권장
✓ try-catch 밖에서는 return만으로 충분

--- 7. ESLint 규칙 ---
no-return-await: try-catch 밖에서 return await 금지
하지만 try-catch 안에서는 예외!

=== 핵심 포인트 ===
✅ return: Promise를 그대로 반환 (빠름)
✅ return await: 기다린 후 값 반환 (안전)
✅ try-catch 안에서는 return await 필수!
✅ finally는 두 경우 모두 실행되지만 타이밍 다름
✅ 에러 처리가 중요하면 return await 사용
*/
