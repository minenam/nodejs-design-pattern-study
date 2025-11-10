/**
 * Chapter 4: 웹 스파이더 v3 - 병렬 다운로드 버전
 *
 * 핵심 개념:
 * - 링크를 병렬로 다운로드
 * - 전체 실행 시간 단축
 *
 * 실행: node spider-v3-parallel.js <URL>
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
  // ✅ 경쟁 상태 방지
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

// ✅ 개선: 병렬 링크 처리
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

  // 모든 링크를 병렬로 처리
  links.forEach((link) => {
    spider(link, nesting - 1, (err) => {
      if (err) {
        hasErrors = true
        return callback(err)
      }
      if (++completed === links.length && !hasErrors) {
        callback()
      }
    })
  })
}

// 실행
const url = process.argv[2] || 'https://example.com'
const nesting = process.argv[3] || 1

console.log(`Spider v3: 병렬 다운로드 버전`)
console.log(`URL: ${url}`)
console.log(`Nesting: ${nesting}\n`)

const startTime = Date.now()

spider(url, nesting, (err) => {
  if (err) {
    console.error(err)
    process.exit(1)
  }
  const elapsed = Date.now() - startTime
  console.log(`\nDownload complete in ${elapsed}ms`)
  console.log('⚡ 병렬 처리로 실행 시간 단축!')
})

/**
 * 개선 사항:
 * - ✅ 링크를 병렬로 다운로드
 * - ✅ 전체 실행 시간 대폭 단축
 * - ✅ Set으로 경쟁 상태 방지
 *
 * 문제점:
 * - ❌ 무제한 병렬 실행
 * - ❌ 링크가 많으면 리소스 고갈 위험
 */
