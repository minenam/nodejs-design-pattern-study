/**
 * Chapter 4: 연습 문제 4.2 - listNestedFiles
 *
 * 문제:
 * 디렉터리 경로를 입력으로 받아 모든 서브 디렉터리를
 * 비동기적으로 반복하며 발견되는 모든 파일을 반환
 *
 * 요구사항:
 * - 재귀적 디렉터리 탐색
 * - 콜백 지옥 회피
 * - 비동기 처리
 *
 * 실행: node 4.2-list-nested-files.js [directory]
 */

import fs from 'fs'
import path from 'path'

console.log("=== 연습 문제 4.2: 재귀적 파일 리스트 (listNestedFiles) ===\n")

/**
 * 디렉터리를 재귀적으로 탐색하여 모든 파일 목록 반환
 * @param {string} dir - 탐색할 디렉터리
 * @param {function} cb - 콜백 함수 (err, filesList)
 */
function listNestedFiles(dir, cb) {
  const allFiles = []

  // 디렉터리 읽기
  fs.readdir(dir, { withFileTypes: true }, (err, entries) => {
    if (err) {
      return cb(err)
    }

    if (entries.length === 0) {
      return cb(null, allFiles)
    }

    let completed = 0
    const totalEntries = entries.length

    entries.forEach((entry) => {
      const fullPath = path.join(dir, entry.name)

      if (entry.isDirectory()) {
        // 디렉터리면 재귀적으로 탐색
        listNestedFiles(fullPath, (err, nestedFiles) => {
          if (err) {
            return cb(err)
          }
          // 중첩된 파일들 추가
          allFiles.push(...nestedFiles)

          completed++
          if (completed === totalEntries) {
            cb(null, allFiles)
          }
        })
      } else if (entry.isFile()) {
        // 파일이면 리스트에 추가
        allFiles.push(fullPath)
        completed++

        if (completed === totalEntries) {
          cb(null, allFiles)
        }
      } else {
        // 심볼릭 링크 등 무시
        completed++
        if (completed === totalEntries) {
          cb(null, allFiles)
        }
      }
    })
  })
}

// 테스트 실행
const targetDir = process.argv[2] || process.cwd()

console.log(`📂 탐색 디렉터리: ${targetDir}\n`)

const startTime = Date.now()

listNestedFiles(targetDir, (err, files) => {
  if (err) {
    console.error('❌ 오류 발생:', err.message)
    process.exit(1)
  }

  const elapsed = Date.now() - startTime

  console.log(`\n✅ 탐색 완료! (${elapsed}ms)`)
  console.log(`📊 발견된 파일: ${files.length}개\n`)

  if (files.length > 0) {
    console.log('파일 목록:')

    // 너무 많으면 처음 20개만 표시
    const displayCount = Math.min(files.length, 20)

    files.slice(0, displayCount).forEach((file, index) => {
      console.log(`  ${index + 1}. ${file}`)
    })

    if (files.length > displayCount) {
      console.log(`  ... 그 외 ${files.length - displayCount}개 파일`)
    }
  } else {
    console.log('파일이 없습니다.')
  }
})

/**
 * 구현 특징:
 *
 * 1. ✅ 재귀적 탐색
 *    - 모든 서브 디렉터리 검색
 *
 * 2. ✅ 콜백 지옥 회피
 *    - 헬퍼 함수로 분리
 *    - 재귀로 간결하게 처리
 *
 * 3. ✅ 완료 카운터 사용
 *    - 모든 비동기 작업 추적
 *
 * 4. ✅ 에러 처리
 *    - 각 단계에서 에러 전파
 *
 * 개선 가능:
 * - TaskQueue를 사용한 동시성 제한
 * - 파일 필터링 옵션 추가
 * - 디렉터리 제외 옵션 추가
 *
 * 사용 예시:
 * listNestedFiles('/path/to/dir', (err, files) => {
 *   console.log('Total files:', files.length)
 * })
 */
