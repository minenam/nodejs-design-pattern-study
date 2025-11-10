/**
 * Chapter 4: 웹 스파이더 v1 - 콜백 지옥 버전
 *
 * 핵심 개념:
 * - 기본적인 웹 크롤러 구현
 * - 콜백 지옥 문제 시연
 *
 * 실행: node spider-v1.js <URL>
 */

import fs from 'fs'
import path from 'path'
import superagent from 'superagent'
import mkdirp from 'mkdirp'
import { URL } from 'url'

const spidering = new Set()

// URL을 파일명으로 변환
function urlToFilename(url) {
  const parsedUrl = new URL(url)
  const urlPath = parsedUrl.pathname.split('/').filter(c => c !== '').join('/')
  let filename = path.join(parsedUrl.hostname, urlPath)
  if (!path.extname(filename).match(/htm/)) {
    filename += '.html'
  }
  return filename
}

// 페이지에서 링크 추출
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

// ❌ 나쁜 예: 콜백 지옥
function spider(url, nesting, callback) {
  if (spidering.has(url)) {
    return process.nextTick(callback)
  }
  spidering.add(url)

  const filename = urlToFilename(url)

  // 중첩 레벨 1
  fs.readFile(filename, 'utf8', (err, fileContent) => {
    if (err) {
      if (err.code !== 'ENOENT') {
        return callback(err)
      }

      // 중첩 레벨 2
      console.log(`Downloading ${url}`)
      superagent.get(url).end((err, res) => {
        if (err) {
          return callback(err)
        }

        // 중첩 레벨 3
        mkdirp(path.dirname(filename), (err) => {
          if (err) {
            return callback(err)
          }

          // 중첩 레벨 4
          fs.writeFile(filename, res.text, (err) => {
            if (err) {
              return callback(err)
            }

            console.log(`Downloaded and saved: ${url}`)

            // 중첩 레벨 5 - 링크 처리
            spiderLinks(url, res.text, nesting, callback)
          })
        })
      })
    } else {
      // 중첩 레벨 2
      spiderLinks(url, fileContent, nesting, callback)
    }
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

console.log(`Spider v1: 콜백 지옥 버전`)
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
 * 문제점:
 * - 깊은 콜백 중첩 (5단계 이상)
 * - 가독성 매우 낮음
 * - 유지보수 어려움
 */
