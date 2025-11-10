/**
 * Chapter 4: 연습 문제 4.1 - concatFiles
 *
 * 문제:
 * 2개 이상의 텍스트 파일과 목적 파일을 받아서
 * 파일들의 내용을 순서대로 목적 파일에 복사하는 함수 작성
 *
 * 요구사항:
 * - Rest 파라미터 사용
 * - 파일 순서 유지
 * - 콜백 스타일
 *
 * 실행: node 4.1-concat-files.js
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

console.log("=== 연습 문제 4.1: 파일 연결 (concatFiles) ===\n")

/**
 * 여러 파일을 순서대로 연결하여 목적 파일에 저장
 * @param {...string} args - 소스 파일들..., 목적 파일, 콜백
 */
function concatFiles(...args) {
  // 콜백은 마지막 인자
  const callback = args[args.length - 1]
  // 목적 파일은 마지막에서 두 번째 인자
  const dest = args[args.length - 2]
  // 소스 파일들은 나머지
  const srcFiles = args.slice(0, args.length - 2)

  if (srcFiles.length < 2) {
    return callback(new Error('At least 2 source files are required'))
  }

  const contents = []
  let index = 0

  // 순차적으로 파일 읽기
  function readNext() {
    if (index === srcFiles.length) {
      // 모든 파일을 읽었으면 목적 파일에 쓰기
      const combined = contents.join('')
      fs.writeFile(dest, combined, 'utf8', (err) => {
        if (err) {
          return callback(err)
        }
        callback(null, `Concatenated ${srcFiles.length} files into ${dest}`)
      })
      return
    }

    const srcFile = srcFiles[index]
    console.log(`📖 읽는 중: ${path.basename(srcFile)}`)

    fs.readFile(srcFile, 'utf8', (err, data) => {
      if (err) {
        return callback(err)
      }
      contents.push(data)
      index++
      readNext()
    })
  }

  readNext()
}

// 테스트 데이터 준비
const testDir = path.join(__dirname, '..', 'testdata')
const file1 = path.join(testDir, 'file1.txt')
const file2 = path.join(testDir, 'file2.txt')
const file3 = path.join(testDir, 'file3.txt')
const dest = path.join(testDir, 'concatenated.txt')

// 테스트 실행
console.log('📌 3개 파일 연결 시작...\n')

concatFiles(file1, file2, file3, dest, (err, message) => {
  if (err) {
    console.error('❌ 오류 발생:', err.message)
    process.exit(1)
  }

  console.log(`\n✅ ${message}`)

  // 결과 확인
  fs.readFile(dest, 'utf8', (err, content) => {
    if (err) {
      console.error('❌ 결과 읽기 오류:', err.message)
      return
    }

    console.log('\n📄 결합된 내용:')
    console.log('─'.repeat(40))
    console.log(content)
    console.log('─'.repeat(40))

    console.log('\n💡 파일 순서가 유지되었는지 확인하세요!')
  })
})

/**
 * 구현 특징:
 *
 * 1. ✅ Rest 파라미터 사용
 *    - ...args로 가변 인자 처리
 *
 * 2. ✅ 순차 읽기
 *    - 파일 순서 유지
 *
 * 3. ✅ 에러 처리
 *    - 각 단계에서 에러 전파
 *
 * 4. ✅ 간결한 구현
 *    - 콜백 지옥 회피
 *
 * 사용 예시:
 * concatFiles('file1.txt', 'file2.txt', 'dest.txt', (err, msg) => {
 *   console.log(msg)
 * })
 */
