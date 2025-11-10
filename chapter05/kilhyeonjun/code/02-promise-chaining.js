/**
 * Promise 체이닝
 * - then()이 새로운 Promise를 반환하는 원리
 * - 값 전달과 Promise 전달의 차이
 * - 체이닝을 통한 순차 실행
 */

console.log('=== Promise 체이닝 ===\n')

// 체이닝 기본 원리
console.log('--- 1. 값 반환 vs Promise 반환 ---')

// 값을 반환하면 그 값으로 이행된 Promise로 감싸짐
Promise.resolve(1)
  .then(value => {
    console.log('Step 1:', value) // 1
    return value + 1 // 값 반환
  })
  .then(value => {
    console.log('Step 2:', value) // 2
    return value + 1
  })
  .then(value => {
    console.log('Step 3:', value) // 3
  })

setTimeout(() => {
  console.log()
  console.log('--- 2. Promise 반환 (비동기 체이닝) ---')

  const delay = (ms, value) => {
    return new Promise(resolve => {
      setTimeout(() => {
        resolve(value)
      }, ms)
    })
  }

  console.log('시작 시간:', new Date().toLocaleTimeString())

  delay(100, 'First')
    .then(value => {
      console.log('첫 번째:', value, new Date().toLocaleTimeString())
      return delay(100, 'Second') // Promise 반환
    })
    .then(value => {
      console.log('두 번째:', value, new Date().toLocaleTimeString())
      return delay(100, 'Third') // Promise 반환
    })
    .then(value => {
      console.log('세 번째:', value, new Date().toLocaleTimeString())
      console.log('총 소요 시간: 약 300ms')
    })

  setTimeout(() => {
    console.log()
    console.log('--- 3. 체이닝에서 에러 처리 ---')

    Promise.resolve(10)
      .then(value => {
        console.log('Step 1:', value)
        return value * 2
      })
      .then(value => {
        console.log('Step 2:', value)
        throw new Error('중간에 에러!')
      })
      .then(value => {
        console.log('이 부분은 실행되지 않음', value)
      })
      .catch(error => {
        console.log('에러 잡음:', error.message)
        return 'recovered' // 에러 복구
      })
      .then(value => {
        console.log('복구 후 계속:', value)
      })

    setTimeout(() => {
      console.log()
      console.log('--- 4. 실전 예제: 데이터 변환 파이프라인 ---')

      // 가상의 API 호출들
      const fetchUser = (userId) => {
        return new Promise(resolve => {
          setTimeout(() => {
            resolve({ id: userId, name: 'John', teamId: 123 })
          }, 50)
        })
      }

      const fetchTeam = (teamId) => {
        return new Promise(resolve => {
          setTimeout(() => {
            resolve({ id: teamId, name: 'Engineering', projectIds: [1, 2, 3] })
          }, 50)
        })
      }

      const fetchProjects = (projectIds) => {
        return new Promise(resolve => {
          setTimeout(() => {
            resolve(projectIds.map(id => ({ id, name: `Project ${id}` })))
          }, 50)
        })
      }

      // 체이닝으로 순차 실행
      console.log('사용자 데이터 조회 시작...')

      fetchUser(1)
        .then(user => {
          console.log('1. 사용자 정보:', user.name)
          return fetchTeam(user.teamId)
        })
        .then(team => {
          console.log('2. 팀 정보:', team.name)
          return fetchProjects(team.projectIds)
        })
        .then(projects => {
          console.log('3. 프로젝트 목록:')
          projects.forEach(p => console.log(`   - ${p.name}`))
        })
        .catch(error => {
          console.error('데이터 조회 실패:', error.message)
        })

      setTimeout(() => {
        console.log()
        console.log('--- 5. 체이닝 규칙 정리 ---')

        // 다양한 반환 타입
        Promise.resolve('start')
          .then(value => {
            console.log('반환 타입 테스트:', value)
            // 경우 1: 값 반환
            return 42
          })
          .then(value => {
            console.log('값 반환 결과:', value, typeof value) // 42 'number'
            // 경우 2: Promise 반환
            return Promise.resolve('promise value')
          })
          .then(value => {
            console.log('Promise 반환 결과:', value) // 'promise value'
            // 경우 3: thenable 반환
            return {
              then: (resolve) => resolve('thenable value')
            }
          })
          .then(value => {
            console.log('Thenable 반환 결과:', value) // 'thenable value'
            // 경우 4: undefined 반환 (return 문 없음)
          })
          .then(value => {
            console.log('undefined 반환 결과:', value) // undefined
            // 경우 5: 에러 throw
            throw new Error('에러!')
          })
          .catch(error => {
            console.log('에러 catch:', error.message)
          })

        setTimeout(() => {
          console.log()
          console.log('=== 핵심 포인트 ===')
          console.log('✅ then()은 항상 새로운 Promise를 반환')
          console.log('✅ 값 반환 → Promise.resolve(값)으로 자동 감싸짐')
          console.log('✅ Promise 반환 → 그 Promise의 결과를 기다림')
          console.log('✅ 에러 발생 → 다음 catch까지 건너뜀')
          console.log('✅ catch에서 값 반환 → 에러 복구, 체인 계속')
        }, 100)
      }, 200)
    }, 100)
  }, 400)
}, 100)

/*
예상 출력:
=== Promise 체이닝 ===

--- 1. 값 반환 vs Promise 반환 ---
Step 1: 1
Step 2: 2
Step 3: 3

--- 2. Promise 반환 (비동기 체이닝) ---
시작 시간: [현재시간]
첫 번째: First [시간+100ms]
두 번째: Second [시간+200ms]
세 번째: Third [시간+300ms]
총 소요 시간: 약 300ms

--- 3. 체이닝에서 에러 처리 ---
Step 1: 10
Step 2: 20
에러 잡음: 중간에 에러!
복구 후 계속: recovered

--- 4. 실전 예제: 데이터 변환 파이프라인 ---
사용자 데이터 조회 시작...
1. 사용자 정보: John
2. 팀 정보: Engineering
3. 프로젝트 목록:
   - Project 1
   - Project 2
   - Project 3

--- 5. 체이닝 규칙 정리 ---
반환 타입 테스트: start
값 반환 결과: 42 number
Promise 반환 결과: promise value
Thenable 반환 결과: thenable value
undefined 반환 결과: undefined
에러 catch: 에러!

=== 핵심 포인트 ===
✅ then()은 항상 새로운 Promise를 반환
✅ 값 반환 → Promise.resolve(값)으로 자동 감싸짐
✅ Promise 반환 → 그 Promise의 결과를 기다림
✅ 에러 발생 → 다음 catch까지 건너뜀
✅ catch에서 값 반환 → 에러 복구, 체인 계속
*/
