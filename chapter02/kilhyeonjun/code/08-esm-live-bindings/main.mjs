/**
 * ESM Read-only Live Bindings 데모
 *
 * ESM의 export는 값의 복사가 아닌 live binding (참조)
 */

console.log('=== ESM Live Bindings Demo ===\n')

import { count, increment, decrement, reset, getCount, incrementMultiple } from './counter.mjs'

// 초기 값 확인
console.log('--- 초기 상태 ---')
console.log('[main.mjs] count:', count)  // 0
console.log('[main.mjs] getCount():', getCount())  // 0
console.log()

// increment 호출
console.log('--- increment() 호출 ---')
increment()
console.log('[main.mjs] count:', count)  // 1 (변경 반영!)
console.log()

// 여러 번 호출
console.log('--- increment() 3번 호출 ---')
increment()
increment()
increment()
console.log('[main.mjs] count:', count)  // 4 (모두 반영!)
console.log()

// decrement 호출
console.log('--- decrement() 호출 ---')
decrement()
console.log('[main.mjs] count:', count)  // 3
console.log()

// incrementMultiple 호출
console.log('--- incrementMultiple(5) 호출 ---')
incrementMultiple(5)
console.log('[main.mjs] count:', count)  // 8
console.log()

// ❌ count는 읽기 전용! 직접 수정 불가
console.log('--- count 직접 수정 시도 ---')
try {
  count++  // TypeError: Assignment to constant variable!
  console.log('count 수정 성공 (이 메시지는 출력되지 않음)')
} catch (error) {
  console.log('[main.mjs] 에러:', error.message)
  console.log('[main.mjs] count는 read-only!')
}
console.log()

// reset 호출
console.log('--- reset() 호출 ---')
reset()
console.log('[main.mjs] count:', count)  // 0
console.log()

console.log('=== 핵심 포인트 ===')
console.log('✅ export된 변수는 live binding (참조)')
console.log('✅ 모듈 내부에서 변경하면 즉시 반영됨')
console.log('✅ import한 쪽에서는 read-only')
console.log('✅ 직접 수정 시도 시 TypeError')
console.log('✅ CommonJS와의 차이점:')
console.log('   - CommonJS: 값의 복사 (변경 반영 안됨)')
console.log('   - ESM: Live binding (변경 즉시 반영)')
console.log()

console.log('=== CommonJS와 비교 ===')
console.log('CommonJS:')
console.log('  exports.count = 0')
console.log('  const { count } = require("./counter")')
console.log('  increment()  // count는 여전히 0 (복사본)')
console.log()
console.log('ESM:')
console.log('  export let count = 0')
console.log('  import { count } from "./counter.mjs"')
console.log('  increment()  // count는 1로 변경됨 (참조)')
