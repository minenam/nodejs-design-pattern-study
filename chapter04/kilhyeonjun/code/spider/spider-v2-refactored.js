/**
 * Chapter 4: 웹 스파이더 v2 - 리팩토링 버전
 *
 * 핵심 개념:
 * - 함수 모듈화
 * - Early return 적용
 * - 재사용 가능한 헬퍼 함수
 *
 * 개선 사항:
 * - saveFile, download 함수 분리
 * - 가독성 향상
 *
 * 실행: node spider-v2-refactored.js <URL>
 */

import fs from 'fs'
import path from 'path'
import superagent from 'superagent'
import mkdirp from 'mkdirp'
import { URL } from 'url'

const spidering = new Set()

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

// ✅ 개선: 파일 저장 함수 분리
function saveFile(filename, contents, callback) {
  mkdirp(path.dirname(filename), (err) => {
    if (err) {
      return callback(err) // Early return
    }
    fs.writeFile(filename, contents, callback)
  })
}

// ✅ 개선: 다운로드 함수 분리
function download(url, filename, callback) {
  console.log(`Downloading ${url}`)
  superagent.get(url).end((err, res) => {
    if (err) {
      return callback(err) // Early return
    }
    saveFile(filename, res.text, (err) => {
      if (err) {
        return callback(err) // Early return
      }
      console.log(`Downloaded and saved: ${url}`)
      callback(null, res.text)
    })
  })
}

// ✅ 개선: 리팩토링된 spider 함수
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
      // 파일이 없으면 다운로드
      return download(url, filename, (err, requestContent) => {
        if (err) {
          return callback(err)
        }
        spiderLinks(url, requestContent, nesting, callback)
      })
    }
    // 파일이 있으면 링크만 처리
    spiderLinks(url, fileContent, nesting, callback)
  })
}

// 링크 순차 처리
function spiderLinks(currentUrl, body, nesting, callback) {
  if (nesting === 0) {
    return process.nextTick(callback)
  }

  const links = getPageLinks(currentUrl, body)

  function iterate(index) {
    if (index === links.length) {
      return callback()
    }

    spider(links[index], nesting - 1, (err) => {
      if (err) {
        return callback(err)
      }
      iterate(index + 1)
    })
  }

  iterate(0)
}

// 실행
const url = process.argv[2] || 'https://example.com'
const nesting = process.argv[3] || 1

console.log(`Spider v2: 리팩토링 버전`)
console.log(`URL: ${url}`)
console.log(`Nesting: ${nesting}\n`)

spider(url, nesting, (err) => {
  if (err) {
    console.error(err)
    process.exit(1)
  }
  console.log('\nDownload complete')
})

/**
 * 개선 사항:
 * - ✅ 중첩 레벨 감소 (5단계 → 3단계)
 * - ✅ 재사용 가능한 함수 (saveFile, download)
 * - ✅ Early return으로 가독성 향상
 * - ✅ 테스트하기 쉬운 구조
 */
