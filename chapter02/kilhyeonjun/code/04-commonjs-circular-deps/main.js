/**
 * CommonJS 순환 종속성 데모
 */

console.log('=== CommonJS Circular Dependencies Demo ===\n')

console.log('main.js: a.js를 require합니다\n')
const a = require('./a')

console.log('\n--- 모듈 로딩 완료 ---\n')

// 결과 확인
console.log('=== 최종 상태 확인 ===')
console.log('a.loaded:', a.loaded)  // true
console.log('a.message:', a.message)  // I am module A
console.log()

console.log('a.b.loaded:', a.b.loaded)  // true
console.log('a.b.message:', a.b.message)  // I am module B
console.log()

console.log('a.b.a.loaded:', a.b.a.loaded)  // false (!)
console.log('a.b.a.message:', a.b.a.message)  // undefined
console.log()

console.log('=== 왜 a.b.a.loaded가 false인가? ===')
console.log('1. main.js가 a.js를 require')
console.log('2. a.js 시작: exports.loaded = false')
console.log('3. a.js가 b.js를 require')
console.log('4. b.js 시작: exports.loaded = false')
console.log('5. b.js가 a.js를 require')
console.log('6. a.js는 이미 캐시에 있음!')
console.log('7. 현재 a.js의 exports 반환 → { loaded: false }')
console.log('8. b.js 완료: { a: { loaded: false }, loaded: true }')
console.log('9. a.js 완료: { b: {...}, loaded: true }')
console.log()

console.log('=== 핵심 포인트 ===')
console.log('✅ 순환 종속성 감지 시 불완전한 exports 반환')
console.log('✅ 캐싱 덕분에 무한 루프 방지')
console.log('❌ 하지만 예상치 못한 동작 발생 가능')
console.log('⚠️  순환 종속성은 피하는 것이 좋음')
