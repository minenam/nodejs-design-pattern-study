/**
 * 모듈 B (순환 종속성 예제)
 */

console.log('b.js: 실행 시작')

// 초기 exports 설정
exports.loaded = false

console.log('b.js: a.js를 require합니다')
const a = require('./a')  // 순환 종속성 발생!

// a 모듈의 상태 확인
console.log('b.js: a 모듈을 받았습니다')
console.log('b.js: a.loaded =', a.loaded)  // false! (불완전한 exports)

// 최종 exports 설정
module.exports = {
  a,
  loaded: true,
  message: 'I am module B'
}

console.log('b.js: 실행 완료 (loaded = true)')
