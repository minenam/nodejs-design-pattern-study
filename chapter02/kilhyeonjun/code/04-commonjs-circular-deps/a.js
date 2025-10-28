/**
 * 모듈 A (순환 종속성 예제)
 */

console.log('a.js: 실행 시작')

// 초기 exports 설정
exports.loaded = false

console.log('a.js: b.js를 require합니다')
const b = require('./b')

// b 모듈의 상태 확인
console.log('a.js: b 모듈을 받았습니다')
console.log('a.js: b.loaded =', b.loaded)

// 최종 exports 설정
module.exports = {
  b,
  loaded: true,
  message: 'I am module A'
}

console.log('a.js: 실행 완료 (loaded = true)')
