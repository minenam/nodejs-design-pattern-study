/**
 * 병렬 실행 (Parallel Execution)
 * - Promise.all() - 모두 성공해야 성공
 * - Promise.allSettled() - 모든 결과 수집
 * - Promise.race() - 가장 빠른 것
 */

console.log('=== 병렬 실행 패턴 ===\n')

function delay(ms, value) {
  return new Promise(resolve => setTimeout(() => resolve(value), ms))
}

function delayError(ms, message) {
  return new Promise((resolve, reject) => {
    setTimeout(() => reject(new Error(message)), ms)
  })
}

console.log('--- 1. Promise.all() - 모두 성공 ---')

const tasks1 = [
  delay(100, 'Task 1'),
  delay(150, 'Task 2'),
  delay(80, 'Task 3')
]

const startTime1 = Date.now()
console.log('시작:', new Date().toLocaleTimeString())

Promise.all(tasks1).then(results => {
  const elapsed = Date.now() - startTime1
  console.log('모든 작업 완료:', results)
  console.log(`소요 시간: ${elapsed}ms (약 150ms - 가장 느린 것 기준)`)
  console.log()

  console.log('--- 2. Promise.all() - 하나라도 실패하면 전체 실패 ---')

  const tasks2 = [
    delay(100, 'Task 1'),
    delayError(80, 'Task 2 failed!'),
    delay(150, 'Task 3') // 이미 시작되었지만 결과는 무시됨
  ]

  const startTime2 = Date.now()
  Promise.all(tasks2)
    .then(results => {
      console.log('성공 (실행 안됨):', results)
    })
    .catch(error => {
      const elapsed = Date.now() - startTime2
      console.log('실패:', error.message)
      console.log(`소요 시간: ${elapsed}ms (약 80ms - 가장 빠른 실패 기준)`)
      console.log('※ 다른 작업은 계속 실행되지만 결과는 무시됨')
      console.log()

      setTimeout(() => {
        console.log('--- 3. Promise.allSettled() - 모든 결과 수집 ---')

        const tasks3 = [
          delay(100, 'Success 1'),
          delayError(80, 'Failed'),
          delay(120, 'Success 2')
        ]

        const startTime3 = Date.now()
        Promise.allSettled(tasks3).then(results => {
          const elapsed = Date.now() - startTime3
          console.log('모든 작업 완료 (성공/실패 무관):')
          results.forEach((result, index) => {
            if (result.status === 'fulfilled') {
              console.log(`  Task ${index + 1}: 성공 -`, result.value)
            } else {
              console.log(`  Task ${index + 1}: 실패 -`, result.reason.message)
            }
          })
          console.log(`소요 시간: ${elapsed}ms (약 120ms - 가장 느린 것 기준)`)
          console.log()

          setTimeout(() => {
            console.log('--- 4. Promise.race() - 가장 빠른 것 ---')

            const tasks4 = [
              delay(150, 'Slow'),
              delay(100, 'Medium'),
              delay(50, 'Fast')
            ]

            const startTime4 = Date.now()
            Promise.race(tasks4).then(result => {
              const elapsed = Date.now() - startTime4
              console.log('가장 빠른 작업:', result)
              console.log(`소요 시간: ${elapsed}ms (약 50ms)`)
              console.log('※ 다른 작업은 계속 실행되지만 결과는 무시됨')
              console.log()

              setTimeout(() => {
                console.log('--- 5. 실전 예제: 여러 API 동시 호출 ---')

                async function fetchUser(id) {
                  await delay(100)
                  return { id, name: `User${id}` }
                }

                async function fetchAllUsers() {
                  const userIds = [1, 2, 3, 4, 5]

                  console.log('순차 실행 (느림):')
                  const seqStart = Date.now()
                  const usersSeq = []
                  for (const id of userIds) {
                    const user = await fetchUser(id)
                    usersSeq.push(user)
                  }
                  const seqTime = Date.now() - seqStart
                  console.log(`  사용자 ${usersSeq.length}명 조회 완료`)
                  console.log(`  소요 시간: ${seqTime}ms (약 500ms)\n`)

                  console.log('병렬 실행 (빠름):')
                  const parStart = Date.now()
                  const promises = userIds.map(id => fetchUser(id))
                  const usersPar = await Promise.all(promises)
                  const parTime = Date.now() - parStart
                  console.log(`  사용자 ${usersPar.length}명 조회 완료`)
                  console.log(`  소요 시간: ${parTime}ms (약 100ms)`)
                  console.log(`  성능 향상: ${(seqTime / parTime).toFixed(1)}배\n`)
                }

                fetchAllUsers().then(() => {
                  console.log('--- 6. allSettled 활용: 부분 성공 처리 ---')

                  async function fetchMultipleAPIs() {
                    const apis = [
                      { name: 'Users API', fn: () => delay(50, { users: ['Alice', 'Bob'] }) },
                      { name: 'Posts API', fn: () => delayError(60, 'Posts API down') },
                      { name: 'Comments API', fn: () => delay(70, { comments: ['Great!'] }) }
                    ]

                    console.log('여러 API 동시 호출...')
                    const promises = apis.map(api => api.fn())
                    const results = await Promise.allSettled(promises)

                    const successData = {}
                    results.forEach((result, index) => {
                      const apiName = apis[index].name
                      if (result.status === 'fulfilled') {
                        console.log(`  ✓ ${apiName}: 성공`)
                        successData[apiName] = result.value
                      } else {
                        console.log(`  ✗ ${apiName}: 실패 - ${result.reason.message}`)
                      }
                    })

                    console.log('\n성공한 데이터:', successData)
                    return successData
                  }

                  fetchMultipleAPIs().then(() => {
                    console.log()
                    console.log('--- 7. race 활용: 타임아웃 구현 ---')

                    function timeout(ms) {
                      return new Promise((_, reject) => {
                        setTimeout(() => reject(new Error('Timeout!')), ms)
                      })
                    }

                    async function fetchWithTimeout(url, timeoutMs) {
                      const fetchTask = delay(150, `Data from ${url}`)
                      return Promise.race([
                        fetchTask,
                        timeout(timeoutMs)
                      ])
                    }

                    // 성공 케이스
                    console.log('타임아웃 200ms (성공):')
                    fetchWithTimeout('api.example.com', 200)
                      .then(data => console.log('  결과:', data))
                      .catch(err => console.log('  에러:', err.message))

                    // 실패 케이스
                    setTimeout(() => {
                      console.log('\n타임아웃 100ms (실패):')
                      fetchWithTimeout('api.example.com', 100)
                        .then(data => console.log('  결과:', data))
                        .catch(err => console.log('  에러:', err.message))

                      setTimeout(() => {
                        console.log()
                        console.log('--- 8. 혼합 전략: map + Promise.all ---')

                        import('fs/promises').then(async fsPromises => {
                          const files = [
                            '/tmp/parallel1.txt',
                            '/tmp/parallel2.txt',
                            '/tmp/parallel3.txt'
                          ]

                          // 파일 쓰기 (병렬)
                          console.log('파일 쓰기 (병렬)...')
                          const writePromises = files.map((file, i) =>
                            fsPromises.writeFile(file, `Content ${i + 1}`)
                          )
                          await Promise.all(writePromises)
                          console.log('모든 파일 쓰기 완료\n')

                          // 파일 읽기 (병렬)
                          console.log('파일 읽기 (병렬)...')
                          const readPromises = files.map(file =>
                            fsPromises.readFile(file, 'utf8')
                          )
                          const contents = await Promise.all(readPromises)
                          console.log('읽은 내용:', contents)

                          console.log()
                          console.log('=== 핵심 포인트 ===')
                          console.log('✅ Promise.all(): 모두 성공해야 성공')
                          console.log('✅ Promise.allSettled(): 모든 결과 수집')
                          console.log('✅ Promise.race(): 가장 빠른 것만')
                          console.log('✅ 독립적인 작업은 병렬로 실행')
                          console.log('✅ map + Promise.all = 강력한 조합')
                          console.log('✅ 타임아웃은 race로 구현')
                          console.log('✅ 부분 성공은 allSettled 사용')
                        })
                      }, 200)
                    }, 200)
                  })
                })
              }, 100)
            })
          }, 150)
        })
      }, 150)
    })
})

/*
예상 출력:
=== 병렬 실행 패턴 ===

--- 1. Promise.all() - 모두 성공 ---
시작: [시간]
모든 작업 완료: ['Task 1', 'Task 2', 'Task 3']
소요 시간: 150ms (약 150ms - 가장 느린 것 기준)

--- 2. Promise.all() - 하나라도 실패하면 전체 실패 ---
실패: Task 2 failed!
소요 시간: 80ms (약 80ms - 가장 빠른 실패 기준)
※ 다른 작업은 계속 실행되지만 결과는 무시됨

--- 3. Promise.allSettled() - 모든 결과 수집 ---
모든 작업 완료 (성공/실패 무관):
  Task 1: 성공 - Success 1
  Task 2: 실패 - Failed
  Task 3: 성공 - Success 2
소요 시간: 120ms (약 120ms - 가장 느린 것 기준)

--- 4. Promise.race() - 가장 빠른 것 ---
가장 빠른 작업: Fast
소요 시간: 50ms (약 50ms)
※ 다른 작업은 계속 실행되지만 결과는 무시됨

--- 5. 실전 예제: 여러 API 동시 호출 ---
순차 실행 (느림):
  사용자 5명 조회 완료
  소요 시간: 500ms (약 500ms)

병렬 실행 (빠름):
  사용자 5명 조회 완료
  소요 시간: 100ms (약 100ms)
  성능 향상: 5.0배

--- 6. allSettled 활용: 부분 성공 처리 ---
여러 API 동시 호출...
  ✓ Users API: 성공
  ✗ Posts API: 실패 - Posts API down
  ✓ Comments API: 성공

성공한 데이터: {
  'Users API': { users: ['Alice', 'Bob'] },
  'Comments API': { comments: ['Great!'] }
}

--- 7. race 활용: 타임아웃 구현 ---
타임아웃 200ms (성공):
  결과: Data from api.example.com

타임아웃 100ms (실패):
  에러: Timeout!

--- 8. 혼합 전략: map + Promise.all ---
파일 쓰기 (병렬)...
모든 파일 쓰기 완료

파일 읽기 (병렬)...
읽은 내용: ['Content 1', 'Content 2', 'Content 3']

=== 핵심 포인트 ===
✅ Promise.all(): 모두 성공해야 성공
✅ Promise.allSettled(): 모든 결과 수집
✅ Promise.race(): 가장 빠른 것만
✅ 독립적인 작업은 병렬로 실행
✅ map + Promise.all = 강력한 조합
✅ 타임아웃은 race로 구현
✅ 부분 성공은 allSettled 사용
*/
