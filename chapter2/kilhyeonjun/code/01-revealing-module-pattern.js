/**
 * 노출식 모듈 패턴 (Revealing Module Pattern)
 *
 * IIFE(Immediately Invoked Function Expression)를 사용하여
 * 모듈 시스템 없이도 은닉성과 네임스페이스를 제공합니다.
 */

const counterModule = (() => {
  // 비공개 변수
  let count = 0
  const maxCount = 100

  // 비공개 함수
  const validateCount = (value) => {
    if (value < 0) {
      throw new Error('Count cannot be negative')
    }
    if (value > maxCount) {
      throw new Error(`Count cannot exceed ${maxCount}`)
    }
  }

  const logChange = (action, oldValue, newValue) => {
    console.log(`[${action}] ${oldValue} → ${newValue}`)
  }

  // 공개 인터페이스
  return {
    increment() {
      const oldValue = count
      count++
      validateCount(count)
      logChange('INCREMENT', oldValue, count)
      return count
    },

    decrement() {
      const oldValue = count
      count--
      validateCount(count)
      logChange('DECREMENT', oldValue, count)
      return count
    },

    reset() {
      const oldValue = count
      count = 0
      logChange('RESET', oldValue, count)
      return count
    },

    getCount() {
      return count
    },

    getMax() {
      return maxCount
    }
  }
})()

// 사용 예제
console.log('=== Revealing Module Pattern Demo ===\n')

console.log('초기 count:', counterModule.getCount())
console.log('최대 count:', counterModule.getMax())
console.log()

// ✅ 공개 메서드 사용 가능
counterModule.increment()
counterModule.increment()
counterModule.increment()
console.log('현재 count:', counterModule.getCount())
console.log()

counterModule.decrement()
console.log('현재 count:', counterModule.getCount())
console.log()

// ✅ 비공개 변수 접근 시도
console.log('count 변수에 직접 접근:', counterModule.count)  // undefined
console.log('validateCount 함수 접근:', counterModule.validateCount)  // undefined
console.log()

// ✅ 여러 번 호출해도 같은 인스턴스
console.log('카운터 상태는 유지됩니다:')
counterModule.increment()
console.log('현재 count:', counterModule.getCount())
console.log()

counterModule.reset()
console.log('최종 count:', counterModule.getCount())
console.log()

console.log('=== 핵심 포인트 ===')
console.log('✅ 비공개 변수(count, maxCount)는 외부 접근 불가')
console.log('✅ 비공개 함수(validateCount, logChange)는 외부 접근 불가')
console.log('✅ 공개 인터페이스만 사용 가능')
console.log('✅ 전역 네임스페이스 오염 방지')
console.log('✅ 진정한 캡슐화 구현')
