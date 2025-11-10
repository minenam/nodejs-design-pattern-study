/**
 * Chapter 4: 콜백 모범 사례 (Callback Best Practices)
 *
 * 핵심 개념:
 * - Early Return 패턴
 * - 함수 모듈화
 * - 재사용 가능한 코드
 *
 * 학습 목표:
 * - 콜백 지옥을 피하는 방법 학습
 * - 가독성 높은 비동기 코드 작성
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

console.log("=== 콜백 모범 사례 예제 ===\n")

const file1 = path.join(__dirname, 'testdata', 'file1.txt')
const file2 = path.join(__dirname, 'testdata', 'file2.txt')
const file3 = path.join(__dirname, 'testdata', 'file3.txt')
const outputFile = path.join(__dirname, 'testdata', 'combined-refactored.txt')

// ✅ 좋은 예: 재사용 가능한 함수로 분리

/**
 * 파일을 읽는 함수
 * @param {string} filePath - 읽을 파일 경로
 * @param {function} callback - 콜백 함수 (err, data)
 */
function readFileContent(filePath, callback) {
  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      return callback(err) // ✅ Early Return
    }
    console.log(`📖 파일 읽기 완료: ${path.basename(filePath)}`)
    callback(null, data)
  })
}

/**
 * 여러 파일을 순차적으로 읽는 함수
 * @param {string[]} files - 파일 경로 배열
 * @param {function} callback - 콜백 함수 (err, contentsArray)
 */
function readMultipleFiles(files, callback) {
  const contents = []
  let index = 0

  function readNext() {
    if (index === files.length) {
      return callback(null, contents) // 모든 파일 읽기 완료
    }

    readFileContent(files[index], (err, data) => {
      if (err) {
        return callback(err) // ✅ Early Return
      }
      contents.push(data)
      index++
      readNext() // 다음 파일 읽기
    })
  }

  readNext()
}

/**
 * 내용을 결합하여 파일에 쓰는 함수
 * @param {string[]} contents - 내용 배열
 * @param {string} outputPath - 출력 파일 경로
 * @param {function} callback - 콜백 함수 (err)
 */
function combineAndWrite(contents, outputPath, callback) {
  const combined = contents.join('\n')

  fs.writeFile(outputPath, combined, (err) => {
    if (err) {
      return callback(err) // ✅ Early Return
    }
    console.log(`\n✅ 결합된 내용 저장 완료: ${path.basename(outputPath)}`)
    callback(null)
  })
}

/**
 * 메인 실행 함수
 */
function main() {
  const files = [file1, file2, file3]

  readMultipleFiles(files, (err, contents) => {
    if (err) {
      console.error('❌ 파일 읽기 오류:', err.message)
      return
    }

    combineAndWrite(contents, outputFile, (err) => {
      if (err) {
        console.error('❌ 파일 쓰기 오류:', err.message)
        return
      }

      // 결과 확인
      fs.readFile(outputFile, 'utf8', (err, finalContent) => {
        if (err) {
          console.error('❌ 결과 읽기 오류:', err.message)
          return
        }
        console.log('\n📖 최종 결과:')
        console.log('─'.repeat(40))
        console.log(finalContent)
        console.log('─'.repeat(40))
      })
    })
  })
}

// 실행
main()

/**
 * 개선 사항:
 *
 * 1. ✅ 가독성 향상
 *    - 각 함수가 명확한 역할을 가짐
 *    - 코드의 흐름을 쉽게 따라갈 수 있음
 *
 * 2. ✅ 재사용성
 *    - readFileContent, combineAndWrite 함수는 다른 곳에서도 사용 가능
 *
 * 3. ✅ 테스트 용이성
 *    - 각 함수를 독립적으로 테스트 가능
 *
 * 4. ✅ 유지보수 편의성
 *    - 로직 수정 시 해당 함수만 수정하면 됨
 *
 * 5. ✅ Early Return 패턴
 *    - 에러 발생 시 즉시 반환하여 중첩 감소
 *
 * 6. ✅ 명확한 함수명
 *    - 스택 트레이스에서 함수명이 표시되어 디버깅 용이
 */
