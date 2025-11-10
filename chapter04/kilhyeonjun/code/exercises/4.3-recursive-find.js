/**
 * Chapter 4: 연습 문제 4.3 - recursiveFind
 *
 * 문제:
 * 디렉터리에서 특정 키워드를 포함한 파일을 재귀적으로 검색하는
 * recursiveFind(dir, keyword, cb) 함수를 작성하세요.
 *
 * 요구사항:
 * - 디렉터리를 재귀적으로 탐색
 * - 키워드를 포함한 파일 목록 반환
 * - 제한된 병렬 실행 사용 (동시성 제어)
 *
 * 실행: node 4.3-recursive-find.js <directory> <keyword> [concurrency]
 */

import fs from 'fs'
import path from 'path'
import { EventEmitter } from 'events'

// TaskQueue 클래스
class TaskQueue extends EventEmitter {
  constructor(concurrency) {
    super()
    this.concurrency = concurrency
    this.running = 0
    this.queue = []
  }

  pushTask(task) {
    this.queue.push(task)
    process.nextTick(this.next.bind(this))
    return this
  }

  next() {
    if (this.running === 0 && this.queue.length === 0) {
      return this.emit('empty')
    }

    while (this.running < this.concurrency && this.queue.length) {
      const task = this.queue.shift()
      task((err) => {
        if (err) {
          this.emit('error', err)
        }
        this.running--
        process.nextTick(this.next.bind(this))
      })
      this.running++
    }
  }
}

/**
 * 재귀적으로 파일을 검색하는 함수
 * @param {string} dir - 검색할 디렉터리
 * @param {string} keyword - 검색할 키워드
 * @param {function} cb - 콜백 함수 (err, matchedFiles)
 */
function recursiveFind(dir, keyword, cb) {
  const matchedFiles = []
  const queue = new TaskQueue(5) // 동시성 5
  let pendingTasks = 0

  queue.on('error', (err) => {
    cb(err)
  })

  queue.on('empty', () => {
    if (pendingTasks === 0) {
      cb(null, matchedFiles)
    }
  })

  // 디렉터리 탐색
  function explore(dirPath) {
    pendingTasks++

    queue.pushTask((done) => {
      fs.readdir(dirPath, { withFileTypes: true }, (err, entries) => {
        if (err) {
          pendingTasks--
          done(err)
          return
        }

        let completed = 0
        const totalEntries = entries.length

        if (totalEntries === 0) {
          pendingTasks--
          done()
          return
        }

        entries.forEach((entry) => {
          const fullPath = path.join(dirPath, entry.name)

          if (entry.isDirectory()) {
            // 디렉터리면 재귀 탐색
            explore(fullPath)
            completed++

            if (completed === totalEntries) {
              pendingTasks--
              done()
            }
          } else if (entry.isFile()) {
            // 파일이면 내용 확인
            pendingTasks++

            queue.pushTask((fileDone) => {
              fs.readFile(fullPath, 'utf8', (err, content) => {
                pendingTasks--

                if (err) {
                  // 읽기 오류는 무시하고 계속
                  completed++
                  if (completed === totalEntries) {
                    pendingTasks--
                    done()
                  }
                  fileDone()
                  return
                }

                // 키워드 포함 여부 확인
                if (content.includes(keyword)) {
                  console.log(`✅ Match found: ${fullPath}`)
                  matchedFiles.push(fullPath)
                }

                completed++
                if (completed === totalEntries) {
                  pendingTasks--
                  done()
                }
                fileDone()
              })
            })
          } else {
            // 기타 (심볼릭 링크 등) 무시
            completed++
            if (completed === totalEntries) {
              pendingTasks--
              done()
            }
          }
        })
      })
    })
  }

  // 탐색 시작
  explore(dir)
}

// 실행
const directory = process.argv[2] || process.cwd()
const keyword = process.argv[3] || 'TODO'
const concurrency = parseInt(process.argv[4]) || 5

console.log(`=== Recursive Find ===`)
console.log(`Directory: ${directory}`)
console.log(`Keyword: "${keyword}"`)
console.log(`Concurrency: ${concurrency}\n`)

const startTime = Date.now()

recursiveFind(directory, keyword, (err, matchedFiles) => {
  if (err) {
    console.error('❌ Error:', err.message)
    process.exit(1)
  }

  const elapsed = Date.now() - startTime

  console.log(`\n${'='.repeat(60)}`)
  console.log(`🎉 Search complete in ${elapsed}ms`)
  console.log(`📊 Found ${matchedFiles.length} file(s) containing "${keyword}"\n`)

  if (matchedFiles.length > 0) {
    console.log('Matched files:')
    matchedFiles.forEach((file, index) => {
      console.log(`  ${index + 1}. ${file}`)
    })
  } else {
    console.log('No files matched.')
  }
})

/**
 * 구현 특징:
 *
 * 1. ✅ 재귀적 디렉터리 탐색
 *    - 모든 서브디렉터리 검색
 *
 * 2. ✅ 제한된 병렬 실행
 *    - TaskQueue로 동시성 제어
 *    - 리소스 안전 사용
 *
 * 3. ✅ 비동기 파일 읽기
 *    - 논블로킹 I/O
 *
 * 4. ✅ 에러 처리
 *    - 읽기 실패한 파일은 무시
 *
 * 사용 예시:
 * node 4.3-recursive-find.js . "TODO" 5
 * node 4.3-recursive-find.js /path/to/dir "console.log" 10
 */
