/**
 * Chapter 4: 경쟁 상태 (Race Conditions)
 *
 * 핵심 개념:
 * - 여러 비동기 작업이 동일한 리소스에 접근할 때 발생하는 문제
 * - 상호 배제(Mutual Exclusion)를 통한 해결
 *
 * 학습 목표:
 * - 경쟁 상태의 원인과 문제점 이해
 * - Set/Map을 사용한 해결 방법
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

console.log("=== 경쟁 상태 (Race Conditions) 예제 ===\n")

// 테스트 디렉토리 설정
const testDir = path.join(__dirname, 'race-test')
if (!fs.existsSync(testDir)) {
  fs.mkdirSync(testDir)
}

/**
 * 시뮬레이션: 파일 다운로드 및 캐시
 */
function simulateDownload(url, delay) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(`Content from ${url} (downloaded after ${delay}ms)`)
    }, delay)
  })
}

// ❌ 문제 코드: 경쟁 상태가 발생하는 함수
async function downloadWithoutProtection(url, callback) {
  const filename = path.join(testDir, url.replace(/[^a-z0-9]/gi, '_') + '.txt')

  console.log(`📥 [${url}] 다운로드 시작...`)

  // 파일이 이미 존재하는지 확인
  fs.readFile(filename, 'utf8', async (err, fileContent) => {
    if (err) {
      if (err.code !== 'ENOENT') {
        return callback(err)
      }

      // ⚠️ 경쟁 상태 발생 지점!
      // 여러 요청이 동시에 여기까지 도달할 수 있음
      console.log(`   ↳ [${url}] 캐시 없음, 다운로드 중...`)

      try {
        const delay = Math.random() * 200 + 100
        const content = await simulateDownload(url, delay)

        fs.writeFile(filename, content, (err) => {
          if (err) {
            return callback(err)
          }
          console.log(`   ✅ [${url}] 다운로드 및 저장 완료`)
          callback(null, content)
        })
      } catch (error) {
        callback(error)
      }
    } else {
      console.log(`   ✅ [${url}] 캐시에서 읽음`)
      callback(null, fileContent)
    }
  })
}

// 테스트 1: 경쟁 상태 발생 시연
console.log("🔴 테스트 1: 경쟁 상태 발생 (문제 상황)\n")

const url1 = 'https://example.com/page1'

// 동일한 URL을 3번 동시에 요청
let completed1 = 0
const startTime1 = Date.now()

for (let i = 0; i < 3; i++) {
  downloadWithoutProtection(url1, (err, content) => {
    if (err) {
      console.error(`❌ 오류 [요청 ${i + 1}]:`, err.message)
    }
    if (++completed1 === 3) {
      const elapsed = Date.now() - startTime1
      console.log(`\n⚠️  문제 발생! 동일한 파일을 3번 다운로드했습니다. (${elapsed}ms)`)
      console.log('💡 해결책: 상호 배제 패턴 적용 필요\n')

      // 테스트 2 실행
      setTimeout(() => runTest2(), 1000)
    }
  })
}

/**
 * 경쟁 상태 문제점:
 *
 * 1. 중복 다운로드
 *    - 동일한 리소스를 여러 번 다운로드
 *    - 네트워크 대역폭 낭비
 *
 * 2. 파일 충돌
 *    - 동시에 같은 파일에 쓰기 시도
 *    - 데이터 손상 가능성
 *
 * 3. 메모리 낭비
 *    - 불필요한 작업 중복 실행
 */

// ✅ 해결 코드: Set을 사용한 상호 배제
function runTest2() {
  console.log('─'.repeat(60))
  console.log("🟢 테스트 2: Set을 사용한 상호 배제 (해결)\n")

  const downloading = new Set()

  async function downloadWithProtection(url, callback) {
    const filename = path.join(testDir, url.replace(/[^a-z0-9]/gi, '_') + '_protected.txt')

    console.log(`📥 [${url}] 다운로드 시작...`)

    // ✅ 이미 다운로드 중인지 확인
    if (downloading.has(url)) {
      console.log(`   ⏳ [${url}] 이미 다운로드 중, 대기...`)
      // 실전에서는 EventEmitter로 완료 이벤트 대기
      return callback(null, null) // 간단히 null 반환
    }

    downloading.add(url) // 다운로드 중으로 표시

    fs.readFile(filename, 'utf8', async (err, fileContent) => {
      if (err) {
        if (err.code !== 'ENOENT') {
          downloading.delete(url)
          return callback(err)
        }

        console.log(`   ↳ [${url}] 캐시 없음, 다운로드 중...`)

        try {
          const delay = Math.random() * 200 + 100
          const content = await simulateDownload(url, delay)

          fs.writeFile(filename, content, (err) => {
            downloading.delete(url) // 완료 후 제거

            if (err) {
              return callback(err)
            }
            console.log(`   ✅ [${url}] 다운로드 및 저장 완료`)
            callback(null, content)
          })
        } catch (error) {
          downloading.delete(url)
          callback(error)
        }
      } else {
        downloading.delete(url)
        console.log(`   ✅ [${url}] 캐시에서 읽음`)
        callback(null, fileContent)
      }
    })
  }

  const url2 = 'https://example.com/page2'
  let completed2 = 0
  const startTime2 = Date.now()

  // 동일한 URL을 3번 동시에 요청
  for (let i = 0; i < 3; i++) {
    downloadWithProtection(url2, (err, content) => {
      if (err) {
        console.error(`❌ 오류 [요청 ${i + 1}]:`, err.message)
      }
      if (++completed2 === 3) {
        const elapsed = Date.now() - startTime2
        console.log(`\n✅ 해결! 파일을 1번만 다운로드했습니다. (${elapsed}ms)`)
        console.log('💡 Set을 사용하여 중복 작업 방지 성공!\n')

        // 테스트 3 실행
        setTimeout(() => runTest3(), 1000)
      }
    })
  }
}

// ✅ 개선: EventEmitter를 사용한 완벽한 해결책
function runTest3() {
  console.log('─'.repeat(60))
  console.log("🟢 테스트 3: EventEmitter를 사용한 완벽한 해결책\n")

  const { EventEmitter } = await import('events')
  const downloadEmitter = new EventEmitter()
  const downloading = new Set()

  async function downloadWithEmitter(url, callback) {
    const filename = path.join(testDir, url.replace(/[^a-z0-9]/gi, '_') + '_emitter.txt')

    console.log(`📥 [${url}] 다운로드 시작...`)

    // 이미 다운로드 중이면 완료 이벤트 대기
    if (downloading.has(url)) {
      console.log(`   ⏳ [${url}] 이미 다운로드 중, 완료 대기...`)
      downloadEmitter.once(`done:${url}`, (content) => {
        console.log(`   ✅ [${url}] 다른 요청 완료, 결과 재사용`)
        callback(null, content)
      })
      return
    }

    downloading.add(url)

    fs.readFile(filename, 'utf8', async (err, fileContent) => {
      if (err) {
        if (err.code !== 'ENOENT') {
          downloading.delete(url)
          downloadEmitter.emit(`done:${url}`, null)
          return callback(err)
        }

        console.log(`   ↳ [${url}] 캐시 없음, 다운로드 중...`)

        try {
          const delay = Math.random() * 200 + 100
          const content = await simulateDownload(url, delay)

          fs.writeFile(filename, content, (err) => {
            downloading.delete(url)

            if (err) {
              downloadEmitter.emit(`done:${url}`, null)
              return callback(err)
            }
            console.log(`   ✅ [${url}] 다운로드 및 저장 완료`)
            downloadEmitter.emit(`done:${url}`, content) // 대기 중인 요청에 알림
            callback(null, content)
          })
        } catch (error) {
          downloading.delete(url)
          downloadEmitter.emit(`done:${url}`, null)
          callback(error)
        }
      } else {
        downloading.delete(url)
        console.log(`   ✅ [${url}] 캐시에서 읽음`)
        downloadEmitter.emit(`done:${url}`, fileContent)
        callback(null, fileContent)
      }
    })
  }

  const url3 = 'https://example.com/page3'
  let completed3 = 0
  const startTime3 = Date.now()

  // 동일한 URL을 5번 동시에 요청
  for (let i = 0; i < 5; i++) {
    downloadWithEmitter(url3, (err, content) => {
      if (err) {
        console.error(`❌ 오류 [요청 ${i + 1}]:`, err.message)
      }
      if (++completed3 === 5) {
        const elapsed = Date.now() - startTime3
        console.log(`\n✅ 완벽! 5개 요청을 1번의 다운로드로 처리 (${elapsed}ms)`)
        console.log('💡 EventEmitter로 대기 중인 요청들도 결과 공유!\n')
        console.log('✅ 모든 경쟁 상태 테스트 완료!')
      }
    })
  }
}

/**
 * 경쟁 상태 해결 방법:
 *
 * 1. Set/Map을 사용한 상호 배제
 *    - ✅ 중복 작업 방지
 *    - ❌ 대기 중인 요청은 null 반환
 *
 * 2. EventEmitter 사용
 *    - ✅ 중복 작업 방지
 *    - ✅ 대기 중인 요청들도 결과 공유
 *    - ✅ 완벽한 해결책
 *
 * 3. Promise 캐싱
 *    - Promise를 캐시하여 재사용
 *    - 가장 현대적인 방법
 *
 * 핵심 원칙:
 * - 동일한 리소스에 대한 동시 접근 제어
 * - 작업 시작 전에 중복 여부 확인
 * - 작업 완료 후 상태 정리
 */
