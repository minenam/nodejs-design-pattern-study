/**
 * Promisify - 콜백을 Promise로 변환
 * - Node.js 콜백 규약
 * - 직접 구현한 promisify
 * - util.promisify() 사용
 */

import { randomBytes } from 'crypto'
import { readFile, writeFile } from 'fs'
import { promisify } from 'util'

console.log('=== Promisify: 콜백을 Promise로 ===\n')

// Node.js 콜백 규약
console.log('--- 1. Node.js 콜백 규약 ---')
console.log('✓ 콜백은 항상 마지막 인자')
console.log('✓ 에러는 콜백의 첫 번째 인자 (err)')
console.log('✓ 결과는 에러 다음 인자로 전달')
console.log()

// 콜백 방식 (전통적)
console.log('--- 2. 콜백 방식 (Chapter 4) ---')

randomBytes(32, (err, buffer) => {
  if (err) {
    console.error('콜백 에러:', err)
    return
  }
  console.log('콜백 결과:', buffer.toString('hex').substring(0, 16) + '...')
})

setTimeout(() => {
  console.log()
  console.log('--- 3. 직접 구현한 promisify ---')

  // 범용 promisify 함수
  function myPromisify(callbackBasedApi) {
    return function promisified(...args) {
      return new Promise((resolve, reject) => {
        const newArgs = [
          ...args,
          function callback(err, result) {
            if (err) {
              return reject(err)
            }
            resolve(result)
          }
        ]
        callbackBasedApi(...newArgs)
      })
    }
  }

  // randomBytes를 promisify
  const randomBytesP = myPromisify(randomBytes)

  randomBytesP(32)
    .then(buffer => {
      console.log('직접 만든 promisify 결과:', buffer.toString('hex').substring(0, 16) + '...')
    })
    .catch(err => {
      console.error('에러:', err)
    })

  setTimeout(() => {
    console.log()
    console.log('--- 4. util.promisify() 사용 (권장) ---')

    // Node.js 내장 promisify 사용
    const randomBytesPromise = promisify(randomBytes)
    const readFilePromise = promisify(readFile)
    const writeFilePromise = promisify(writeFile)

    randomBytesPromise(16)
      .then(buffer => {
        console.log('util.promisify 결과:', buffer.toString('hex'))
        return buffer
      })
      .then(buffer => {
        // 파일에 쓰기
        const data = `Random data: ${buffer.toString('hex')}\n`
        return writeFilePromise('/tmp/test-promisify.txt', data)
      })
      .then(() => {
        console.log('파일 쓰기 완료')
        return readFilePromise('/tmp/test-promisify.txt', 'utf8')
      })
      .then(content => {
        console.log('파일 읽기 결과:', content.trim())
      })
      .catch(err => {
        console.error('체인 에러:', err.message)
      })

    setTimeout(() => {
      console.log()
      console.log('--- 5. fs.promises 사용 (더 권장) ---')

      // Node.js 10+ 에서는 promises 버전 직접 제공
      import('fs/promises').then(fsPromises => {
        return fsPromises.writeFile('/tmp/test-fs-promises.txt', 'Hello from fs.promises!')
          .then(() => {
            console.log('fs.promises로 파일 쓰기 완료')
            return fsPromises.readFile('/tmp/test-fs-promises.txt', 'utf8')
          })
          .then(content => {
            console.log('fs.promises로 파일 읽기:', content)
          })

        setTimeout(() => {
          console.log()
          console.log('--- 6. 여러 결과값 처리 ---')

          // 일부 콜백은 여러 결과를 반환 (err, result1, result2, ...)
          // promisify는 기본적으로 첫 번째 결과만 반환

          function multiResultCallback(arg, callback) {
            setTimeout(() => {
              callback(null, 'result1', 'result2', 'result3')
            }, 10)
          }

          // 기본 promisify는 첫 번째 결과만
          const promisified = promisify(multiResultCallback)
          promisified('test').then(result => {
            console.log('기본 promisify (첫 번째만):', result) // 'result1'
          })

          // 모든 결과를 배열로 받으려면 커스텀 구현 필요
          function promisifyMulti(fn) {
            return function (...args) {
              return new Promise((resolve, reject) => {
                fn(...args, (err, ...results) => {
                  if (err) return reject(err)
                  resolve(results) // 배열로 반환
                })
              })
            }
          }

          const promisifiedMulti = promisifyMulti(multiResultCallback)
          promisifiedMulti('test').then(results => {
            console.log('커스텀 promisify (전체 배열):', results)
          })

          setTimeout(() => {
            console.log()
            console.log('--- 7. 실전 예제: 체이닝으로 파일 처리 ---')

            import('fs/promises').then(fsPromises => {
              const inputFile = '/tmp/input.txt'
              const outputFile = '/tmp/output.txt'

              // 1. 파일 쓰기
              return fsPromises.writeFile(inputFile, 'Hello World\nNode.js Design Patterns\nPromises are awesome!')
                .then(() => {
                  console.log('1. 입력 파일 생성')
                  // 2. 파일 읽기
                  return fsPromises.readFile(inputFile, 'utf8')
                })
                .then(content => {
                  console.log('2. 파일 읽기 완료')
                  // 3. 데이터 변환
                  const lines = content.split('\n')
                  const transformed = lines.map(line => line.toUpperCase()).join('\n')
                  return transformed
                })
                .then(transformed => {
                  console.log('3. 데이터 변환 완료')
                  // 4. 결과 파일 쓰기
                  return fsPromises.writeFile(outputFile, transformed)
                })
                .then(() => {
                  console.log('4. 출력 파일 저장')
                  // 5. 검증
                  return fsPromises.readFile(outputFile, 'utf8')
                })
                .then(result => {
                  console.log('5. 최종 결과:')
                  console.log(result)
                })
                .catch(err => {
                  console.error('파일 처리 에러:', err.message)
                })

              setTimeout(() => {
                console.log()
                console.log('=== 핵심 포인트 ===')
                console.log('✅ promisify: 콜백 API를 Promise로 변환')
                console.log('✅ util.promisify() 사용 권장')
                console.log('✅ fs.promises 같은 내장 Promise API 우선')
                console.log('✅ 체이닝으로 복잡한 비동기 흐름 간단하게')
                console.log('✅ 콜백 지옥 → Promise 체인으로 개선')
              }, 200)
            })
          }, 100)
        }, 100)
      })
    }, 100)
  }, 100)
}, 100)

/*
예상 출력:
=== Promisify: 콜백을 Promise로 ===

--- 1. Node.js 콜백 규약 ---
✓ 콜백은 항상 마지막 인자
✓ 에러는 콜백의 첫 번째 인자 (err)
✓ 결과는 에러 다음 인자로 전달

--- 2. 콜백 방식 (Chapter 4) ---
콜백 결과: a1b2c3d4e5f6g7h8...

--- 3. 직접 구현한 promisify ---
직접 만든 promisify 결과: 1a2b3c4d5e6f7g8h...

--- 4. util.promisify() 사용 (권장) ---
util.promisify 결과: [16바이트 hex 문자열]
파일 쓰기 완료
파일 읽기 결과: Random data: [hex 문자열]

--- 5. fs.promises 사용 (더 권장) ---
fs.promises로 파일 쓰기 완료
fs.promises로 파일 읽기: Hello from fs.promises!

--- 6. 여러 결과값 처리 ---
기본 promisify (첫 번째만): result1
커스텀 promisify (전체 배열): ['result1', 'result2', 'result3']

--- 7. 실전 예제: 체이닝으로 파일 처리 ---
1. 입력 파일 생성
2. 파일 읽기 완료
3. 데이터 변환 완료
4. 출력 파일 저장
5. 최종 결과:
HELLO WORLD
NODE.JS DESIGN PATTERNS
PROMISES ARE AWESOME!

=== 핵심 포인트 ===
✅ promisify: 콜백 API를 Promise로 변환
✅ util.promisify() 사용 권장
✅ fs.promises 같은 내장 Promise API 우선
✅ 체이닝으로 복잡한 비동기 흐름 간단하게
✅ 콜백 지옥 → Promise 체인으로 개선
*/
