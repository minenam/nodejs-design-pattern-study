/**
 * Chapter 4: 웹 스파이더 v4 - 제한된 병렬 실행 버전 (TaskQueue)
 *
 * 핵심 개념:
 * - TaskQueue를 사용한 동시성 제한
 * - 안전하고 빠른 크롤링
 *
 * 실행: node spider-v4-limited.js <URL> [nesting] [concurrency]
 */

import fs from 'fs'
import path from 'path'
import superagent from 'superagent'
import mkdirp from 'mkdirp'
import { URL } from 'url'
import { EventEmitter } from 'events'

const spidering = new Set()

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

// 전역 다운로드 큐 (동시성 제한)
const concurrency = parseInt(process.argv[4]) || 2
const downloadQueue = new TaskQueue(concurrency)

function urlToFilename(url) {
  const parsedUrl = new URL(url)
  const urlPath = parsedUrl.pathname.split('/').filter(c => c !== '').join('/')
  let filename = path.join(parsedUrl.hostname, urlPath)
  if (!path.extname(filename).match(/htm/)) {
    filename += '.html'
  }
  return filename
}

function getPageLinks(currentUrl, body) {
  const links = []
  const regexLinks = /<a\s+(?:[^>]*?\s+)?href=["']([^"']+)["']/gi

  let match
  while ((match = regexLinks.exec(body)) !== null) {
    const link = match[1]
    if (link.startsWith('http')) {
      links.push(link)
    } else if (link.startsWith('/')) {
      const urlObj = new URL(currentUrl)
      links.push(`${urlObj.protocol}//${urlObj.host}${link}`)
    }
  }
  return links
}

function saveFile(filename, contents, callback) {
  mkdirp(path.dirname(filename), (err) => {
    if (err) {
      return callback(err)
    }
    fs.writeFile(filename, contents, callback)
  })
}

function download(url, filename, callback) {
  console.log(`Downloading ${url}`)
  superagent.get(url).end((err, res) => {
    if (err) {
      return callback(err)
    }
    saveFile(filename, res.text, (err) => {
      if (err) {
        return callback(err)
      }
      console.log(`Downloaded and saved: ${url}`)
      callback(null, res.text)
    })
  })
}

function spider(url, nesting, callback) {
  if (spidering.has(url)) {
    return process.nextTick(callback)
  }
  spidering.add(url)

  const filename = urlToFilename(url)

  fs.readFile(filename, 'utf8', (err, fileContent) => {
    if (err) {
      if (err.code !== 'ENOENT') {
        return callback(err)
      }
      return download(url, filename, (err, requestContent) => {
        if (err) {
          return callback(err)
        }
        spiderLinks(url, requestContent, nesting, callback)
      })
    }
    spiderLinks(url, fileContent, nesting, callback)
  })
}

// ✅ 개선: TaskQueue를 사용한 제한된 병렬 처리
function spiderLinks(currentUrl, body, nesting, callback) {
  if (nesting === 0) {
    return process.nextTick(callback)
  }

  const links = getPageLinks(currentUrl, body)
  if (links.length === 0) {
    return process.nextTick(callback)
  }

  let completed = 0
  let hasErrors = false

  links.forEach((link) => {
    // TaskQueue에 작업 추가 (동시성 자동 제한)
    downloadQueue.pushTask((done) => {
      spider(link, nesting - 1, (err) => {
        if (err) {
          hasErrors = true
          return callback(err)
        }
        if (++completed === links.length && !hasErrors) {
          callback()
        }
        done() // TaskQueue에 완료 알림
      })
    })
  })
}

// 실행
const url = process.argv[2] || 'https://example.com'
const nesting = parseInt(process.argv[3]) || 1

console.log(`Spider v4: 제한된 병렬 실행 버전 (TaskQueue)`)
console.log(`URL: ${url}`)
console.log(`Nesting: ${nesting}`)
console.log(`Concurrency: ${concurrency}\n`)

const startTime = Date.now()

// 에러 핸들링
downloadQueue.on('error', (err) => {
  console.error('Download error:', err.message)
})

spider(url, nesting, (err) => {
  if (err) {
    console.error(err)
    process.exit(1)
  }
  const elapsed = Date.now() - startTime
  console.log(`\nDownload complete in ${elapsed}ms`)
  console.log(`✅ TaskQueue로 안전하고 빠른 크롤링!`)
  console.log(`📊 동시성 제한: ${concurrency}`)
})

/**
 * 최종 개선 사항:
 * - ✅ TaskQueue로 동시성 제어
 * - ✅ 리소스 안전 사용
 * - ✅ 빠른 실행 시간
 * - ✅ 확장 가능한 구조
 * - ✅ 전역적인 동시성 관리
 *
 * 장점:
 * - 순차보다 빠름
 * - 무제한 병렬보다 안전
 * - 설정 가능한 동시성
 * - 재사용 가능한 TaskQueue
 */
