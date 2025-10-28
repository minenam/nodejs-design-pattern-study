/**
 * Substack Pattern 사용 예제
 */

console.log('=== CommonJS Substack Pattern Demo ===\n')

const log = require('./logger')

// ✅ 주 기능: 함수를 직접 호출
console.log('--- 주 기능 (기본 로그) ---')
log('This is the main logging function')
log('Another log message')
console.log()

// ✅ 부가 기능: 함수의 속성으로 접근
console.log('--- 부가 기능 (verbose, error, warn) ---')
log.verbose('Verbose debugging information')
log.error('Something went wrong!')
log.warn('Warning: Check your configuration')
console.log()

// ✅ 설정 기능
console.log('--- 설정 기능 ---')
console.log('Current prefix:', log.getPrefix())
log.setPrefix('CUSTOM')
console.log('Updated prefix:', log.getPrefix())
console.log()

// ✅ 명확한 진입점
console.log('--- 사용법 비교 ---')
console.log('Substack 패턴: log("message")  # 간결!')
console.log('Named Exports: logger.info("message")  # 네임스페이스 필요')
console.log()

// ✅ 함수 자체도 객체
console.log('--- 함수는 객체 ---')
console.log('typeof log:', typeof log)  // function
console.log('typeof log.verbose:', typeof log.verbose)  // function
console.log('log.prefix:', log.prefix)  // APP
console.log()

console.log('=== 핵심 포인트 ===')
console.log('✅ 명확한 주 진입점 (log 함수)')
console.log('✅ 최소 외부 인터페이스 (Small Surface Area)')
console.log('✅ 단일 책임 원칙 (SRP) 준수')
console.log('✅ express(), debug() 등에서 사용하는 패턴')
console.log('✅ 간결한 API')
