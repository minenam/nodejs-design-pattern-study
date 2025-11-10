/**
 * Chapter 4: 콜백 지옥 (Callback Hell) 예제
 *
 * 핵심 개념:
 * - 깊게 중첩된 콜백의 문제점
 * - 가독성 저하
 * - 유지보수의 어려움
 *
 * 학습 목표:
 * - 콜백 지옥이 왜 문제인지 이해
 * - 리팩토링 필요성 인식
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

console.log("=== 콜백 지옥 (Callback Hell) 예제 ===\n")

// ❌ 나쁜 예: 콜백 지옥
// 3개의 파일을 순차적으로 읽고 내용을 결합하는 작업

const file1 = path.join(__dirname, 'testdata', 'file1.txt')
const file2 = path.join(__dirname, 'testdata', 'file2.txt')
const file3 = path.join(__dirname, 'testdata', 'file3.txt')

// 테스트 데이터 디렉토리 생성
if (!fs.existsSync(path.join(__dirname, 'testdata'))) {
  fs.mkdirSync(path.join(__dirname, 'testdata'))
  fs.writeFileSync(file1, 'First file content')
  fs.writeFileSync(file2, 'Second file content')
  fs.writeFileSync(file3, 'Third file content')
  console.log('✅ 테스트 데이터 생성 완료\n')
}

// 콜백 지옥 시작
fs.readFile(file1, 'utf8', (err, data1) => {
  if (err) {
    console.error('Error reading file1:', err)
    return
  }
  console.log('📖 파일 1 읽기 완료:', data1)

  // 첫 번째 중첩
  fs.readFile(file2, 'utf8', (err, data2) => {
    if (err) {
      console.error('Error reading file2:', err)
      return
    }
    console.log('📖 파일 2 읽기 완료:', data2)

    // 두 번째 중첩
    fs.readFile(file3, 'utf8', (err, data3) => {
      if (err) {
        console.error('Error reading file3:', err)
        return
      }
      console.log('📖 파일 3 읽기 완료:', data3)

      // 세 번째 중첩 - 결과 처리
      const combined = data1 + '\n' + data2 + '\n' + data3
      const outputFile = path.join(__dirname, 'testdata', 'combined.txt')

      // 네 번째 중첩 - 파일 쓰기
      fs.writeFile(outputFile, combined, (err) => {
        if (err) {
          console.error('Error writing file:', err)
          return
        }
        console.log('\n✅ 모든 작업 완료!')
        console.log('📄 결합된 내용이 combined.txt에 저장되었습니다.')

        // 다섯 번째 중첩 - 결과 확인
        fs.readFile(outputFile, 'utf8', (err, finalContent) => {
          if (err) {
            console.error('Error reading combined file:', err)
            return
          }
          console.log('\n📖 최종 결과:')
          console.log('─'.repeat(40))
          console.log(finalContent)
          console.log('─'.repeat(40))
        })
      })
    })
  })
})

console.log("❗ 주목: 코드가 오른쪽으로 계속 들여쓰기되는 '죽음의 피라미드' 형성\n")

/**
 * 문제점:
 *
 * 1. 가독성 저하
 *    - 코드의 흐름을 따라가기 어려움
 *    - 어디서 시작해서 어디서 끝나는지 파악하기 힘듦
 *
 * 2. 변수명 중복
 *    - 모든 콜백에서 'err' 변수 반복 사용
 *    - 실수로 잘못된 변수를 참조할 위험
 *
 * 3. 유지보수 어려움
 *    - 로직 수정 시 여러 단계를 거쳐야 함
 *    - 새로운 단계 추가 시 중첩이 더 깊어짐
 *
 * 4. 에러 처리 중복
 *    - 각 단계마다 동일한 에러 처리 패턴 반복
 *
 * 5. 클로저 남용
 *    - 각 단계마다 새로운 클로저 생성
 *    - 메모리 사용 증가
 *
 * 6. 테스트 어려움
 *    - 중첩된 로직을 단위 테스트하기 힘듦
 *
 * 해결책: 02-callback-best-practices.js 참조
 */
