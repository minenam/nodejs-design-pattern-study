/**
 * Promise 기본 개념
 * - Promise의 세 가지 상태: pending, fulfilled, rejected
 * - then, catch, finally 사용법
 */

console.log('=== Promise 기본 상태와 메소드 ===\n')

// Promise의 세 가지 상태
console.log('--- 1. Promise 상태 ---')

// pending 상태: 비동기 작업이 완료되지 않음
const pendingPromise = new Promise((resolve, reject) => {
  // 아무것도 하지 않음 - 계속 pending 상태
})
console.log('Pending Promise 상태:', pendingPromise) // Promise { <pending> }

// fulfilled 상태: 작업이 성공적으로 완료됨
const fulfilledPromise = Promise.resolve('성공 값')
console.log('Fulfilled Promise:', fulfilledPromise) // Promise { '성공 값' }

// rejected 상태: 작업이 에러와 함께 종료됨
const rejectedPromise = Promise.reject(new Error('실패 이유'))
console.log('Rejected Promise:', rejectedPromise) // Promise { <rejected> Error: 실패 이유 }
console.log()

// 에러 방지를 위해 catch 추가
rejectedPromise.catch(() => {})

// then() 메소드 사용
console.log('--- 2. then() 메소드 ---')

Promise.resolve(42)
  .then(value => {
    console.log('이행값:', value) // 42
    return value * 2
  })
  .then(value => {
    console.log('체이닝된 값:', value) // 84
  })

// then의 두 번째 인자로 에러 처리
Promise.reject(new Error('에러 발생'))
  .then(
    value => console.log('성공:', value),
    error => console.log('실패 (then 두번째 인자):', error.message)
  )

setTimeout(() => {
  console.log()
  console.log('--- 3. catch() 메소드 ---')

  // catch()는 then(undefined, onRejected)의 편의 문법
  Promise.reject(new Error('또 다른 에러'))
    .catch(error => {
      console.log('catch로 잡은 에러:', error.message)
    })

  // 체인 중간의 에러도 catch가 잡음
  Promise.resolve(10)
    .then(value => {
      console.log('첫 번째 then:', value)
      throw new Error('중간에 에러!')
    })
    .then(value => {
      console.log('이 부분은 실행되지 않음')
    })
    .catch(error => {
      console.log('체인 중간 에러 catch:', error.message)
      return '복구된 값'
    })
    .then(value => {
      console.log('에러 복구 후:', value)
    })

  setTimeout(() => {
    console.log()
    console.log('--- 4. finally() 메소드 ---')

    // finally는 성공/실패 여부와 관계없이 실행됨
    Promise.resolve('성공')
      .then(value => console.log('성공 케이스:', value))
      .finally(() => console.log('finally: 성공 케이스 정리 작업'))

    Promise.reject(new Error('실패'))
      .catch(error => console.log('실패 케이스:', error.message))
      .finally(() => console.log('finally: 실패 케이스 정리 작업'))

    setTimeout(() => {
      console.log()
      console.log('--- 5. Promise 생성자 ---')

      // 비동기 작업을 Promise로 감싸기
      const delay = (ms) => {
        return new Promise((resolve, reject) => {
          if (ms < 0) {
            reject(new Error('시간은 양수여야 합니다'))
          }
          setTimeout(() => {
            resolve(`${ms}ms 지연 완료`)
          }, ms)
        })
      }

      console.log('딜레이 시작...')
      delay(100)
        .then(result => {
          console.log(result)
          return delay(100)
        })
        .then(result => {
          console.log(result)
          return delay(-100) // 에러 발생
        })
        .catch(error => {
          console.log('에러:', error.message)
        })
        .finally(() => {
          console.log('모든 작업 완료')
        })

      setTimeout(() => {
        console.log()
        console.log('=== 핵심 포인트 ===')
        console.log('✅ Promise 세 가지 상태: pending, fulfilled, rejected')
        console.log('✅ then(onFulfilled, onRejected): 프라미스 체이닝')
        console.log('✅ catch(onRejected): 에러 처리 전용')
        console.log('✅ finally(onFinally): 정리 작업 (결과 무관)')
        console.log('✅ Promise는 한 번 settled되면 상태가 바뀌지 않음')
      }, 500)
    }, 100)
  }, 100)
}, 100)

/*
예상 출력:
=== Promise 기본 상태와 메소드 ===

--- 1. Promise 상태 ---
Pending Promise 상태: Promise { <pending> }
Fulfilled Promise: Promise { '성공 값' }
Rejected Promise: Promise { <rejected> Error: 실패 이유 }

--- 2. then() 메소드 ---
이행값: 42
체이닝된 값: 84
실패 (then 두번째 인자): 에러 발생

--- 3. catch() 메소드 ---
catch로 잡은 에러: 또 다른 에러
첫 번째 then: 10
체인 중간 에러 catch: 중간에 에러!
에러 복구 후: 복구된 값

--- 4. finally() 메소드 ---
성공 케이스: 성공
finally: 성공 케이스 정리 작업
실패 케이스: 실패
finally: 실패 케이스 정리 작업

--- 5. Promise 생성자 ---
딜레이 시작...
100ms 지연 완료
100ms 지연 완료
에러: 시간은 양수여야 합니다
모든 작업 완료

=== 핵심 포인트 ===
✅ Promise 세 가지 상태: pending, fulfilled, rejected
✅ then(onFulfilled, onRejected): 프라미스 체이닝
✅ catch(onRejected): 에러 처리 전용
✅ finally(onFinally): 정리 작업 (결과 무관)
✅ Promise는 한 번 settled되면 상태가 바뀌지 않음
*/
