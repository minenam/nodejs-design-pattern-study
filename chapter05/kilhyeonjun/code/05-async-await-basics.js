/**
 * Async/Await 기본
 * - async 함수 선언
 * - await 표현식
 * - Promise와의 관계
 */

console.log('=== Async/Await 기본 ===\n')

// delay 유틸리티
function delay(ms, value) {
  return new Promise(resolve => {
    setTimeout(() => resolve(value), ms)
  })
}

// async 함수 기본
console.log('--- 1. async 함수 선언 ---')

// async 함수는 항상 Promise를 반환
async function simpleAsync() {
  return 'Hello'
}

console.log('async 함수 반환값:', simpleAsync()) // Promise { 'Hello' }
simpleAsync().then(value => console.log('Promise 결과:', value))

setTimeout(() => {
  console.log()
  console.log('--- 2. await 표현식 ---')

  async function waitExample() {
    console.log('시작:', new Date().toLocaleTimeString())

    const result1 = await delay(100, 'First')
    console.log('첫 번째 완료:', result1, new Date().toLocaleTimeString())

    const result2 = await delay(100, 'Second')
    console.log('두 번째 완료:', result2, new Date().toLocaleTimeString())

    const result3 = await delay(100, 'Third')
    console.log('세 번째 완료:', result3, new Date().toLocaleTimeString())

    console.log('총 소요: 약 300ms')
    return 'Done'
  }

  waitExample().then(result => {
    console.log('최종 결과:', result)
  })

  setTimeout(() => {
    console.log()
    console.log('--- 3. Promise 체인 vs async/await 비교 ---')

    // Promise 체인 방식
    console.log('Promise 체인:')
    function promiseChain() {
      return delay(50, 1)
        .then(value => {
          console.log('  Step 1:', value)
          return delay(50, value + 1)
        })
        .then(value => {
          console.log('  Step 2:', value)
          return delay(50, value + 1)
        })
        .then(value => {
          console.log('  Step 3:', value)
          return value
        })
    }

    promiseChain().then(result => {
      console.log('  Promise 체인 결과:', result)
    })

    // async/await 방식 (같은 로직)
    setTimeout(() => {
      console.log('\nasync/await:')
      async function asyncAwait() {
        const value1 = await delay(50, 1)
        console.log('  Step 1:', value1)

        const value2 = await delay(50, value1 + 1)
        console.log('  Step 2:', value2)

        const value3 = await delay(50, value2 + 1)
        console.log('  Step 3:', value3)

        return value3
      }

      asyncAwait().then(result => {
        console.log('  async/await 결과:', result)
      })

      setTimeout(() => {
        console.log()
        console.log('--- 4. async 함수의 다양한 형태 ---')

        // 함수 선언
        async function namedFunction() {
          return await delay(10, 'named')
        }

        // 함수 표현식
        const functionExpression = async function() {
          return await delay(10, 'expression')
        }

        // 화살표 함수
        const arrowFunction = async () => {
          return await delay(10, 'arrow')
        }

        // 메소드
        const obj = {
          async method() {
            return await delay(10, 'method')
          }
        }

        // 클래스 메소드
        class MyClass {
          async classMethod() {
            return await delay(10, 'class')
          }
        }

        Promise.all([
          namedFunction(),
          functionExpression(),
          arrowFunction(),
          obj.method(),
          new MyClass().classMethod()
        ]).then(results => {
          console.log('모든 형태 결과:', results)
        })

        setTimeout(() => {
          console.log()
          console.log('--- 5. 반환값 자동 Promise 감싸기 ---')

          async function returnTypes() {
            // 값을 반환하면 자동으로 Promise.resolve()로 감싸짐
            console.log('테스트 시작')
          }

          async function returnValue() {
            return 42 // Promise.resolve(42)와 동일
          }

          async function returnPromise() {
            return Promise.resolve('already a promise')
          }

          async function returnAwaited() {
            return await Promise.resolve('awaited promise')
          }

          Promise.all([
            returnTypes(),
            returnValue(),
            returnPromise(),
            returnAwaited()
          ]).then(results => {
            console.log('반환값 테스트:', results)
          })

          setTimeout(() => {
            console.log()
            console.log('--- 6. 실전 예제: 데이터 페칭 ---')

            // 가상 API
            async function fetchUser(id) {
              await delay(50)
              return { id, name: 'John', age: 30 }
            }

            async function fetchPosts(userId) {
              await delay(50)
              return [
                { id: 1, title: 'Post 1', userId },
                { id: 2, title: 'Post 2', userId }
              ]
            }

            async function fetchComments(postId) {
              await delay(50)
              return [
                { id: 1, text: 'Comment 1', postId },
                { id: 2, text: 'Comment 2', postId }
              ]
            }

            // Promise 체인 (복잡함)
            async function getUserDataPromiseChain(userId) {
              console.log('Promise 체인 방식:')
              return fetchUser(userId)
                .then(user => {
                  console.log('  사용자:', user.name)
                  return fetchPosts(user.id)
                })
                .then(posts => {
                  console.log('  게시글 수:', posts.length)
                  return fetchComments(posts[0].id)
                })
                .then(comments => {
                  console.log('  댓글 수:', comments.length)
                  return comments
                })
            }

            getUserDataPromiseChain(1).then(() => {
              console.log()
              // async/await (간단함)
              async function getUserDataAsyncAwait(userId) {
                console.log('async/await 방식:')
                const user = await fetchUser(userId)
                console.log('  사용자:', user.name)

                const posts = await fetchPosts(user.id)
                console.log('  게시글 수:', posts.length)

                const comments = await fetchComments(posts[0].id)
                console.log('  댓글 수:', comments.length)

                return comments
              }

              getUserDataAsyncAwait(1).then(() => {
                console.log()
                console.log('=== 핵심 포인트 ===')
                console.log('✅ async 함수는 항상 Promise를 반환')
                console.log('✅ await는 Promise가 해결될 때까지 일시 정지')
                console.log('✅ 반환값은 자동으로 Promise.resolve()로 감싸짐')
                console.log('✅ 동기 코드처럼 읽기 쉬움')
                console.log('✅ Promise 체인보다 훨씬 간결')
                console.log('✅ await는 async 함수 안에서만 사용 가능')
              })
            })
          }, 100)
        }, 100)
      }, 200)
    }, 200)
  }, 400)
}, 100)

/*
예상 출력:
=== Async/Await 기본 ===

--- 1. async 함수 선언 ---
async 함수 반환값: Promise { 'Hello' }
Promise 결과: Hello

--- 2. await 표현식 ---
시작: [시간]
첫 번째 완료: First [시간+100ms]
두 번째 완료: Second [시간+200ms]
세 번째 완료: Third [시간+300ms]
총 소요: 약 300ms
최종 결과: Done

--- 3. Promise 체인 vs async/await 비교 ---
Promise 체인:
  Step 1: 1
  Step 2: 2
  Step 3: 3
  Promise 체인 결과: 3

async/await:
  Step 1: 1
  Step 2: 2
  Step 3: 3
  async/await 결과: 3

--- 4. async 함수의 다양한 형태 ---
모든 형태 결과: ['named', 'expression', 'arrow', 'method', 'class']

--- 5. 반환값 자동 Promise 감싸기 ---
테스트 시작
반환값 테스트: [undefined, 42, 'already a promise', 'awaited promise']

--- 6. 실전 예제: 데이터 페칭 ---
Promise 체인 방식:
  사용자: John
  게시글 수: 2
  댓글 수: 2

async/await 방식:
  사용자: John
  게시글 수: 2
  댓글 수: 2

=== 핵심 포인트 ===
✅ async 함수는 항상 Promise를 반환
✅ await는 Promise가 해결될 때까지 일시 정지
✅ 반환값은 자동으로 Promise.resolve()로 감싸짐
✅ 동기 코드처럼 읽기 쉬움
✅ Promise 체인보다 훨씬 간결
✅ await는 async 함수 안에서만 사용 가능
*/
