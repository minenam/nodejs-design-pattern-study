/**
 * Named Exports 패턴 사용 예제
 */

console.log('=== CommonJS Named Exports Demo ===\n')

// 방법 1: 전체 모듈 가져오기
const logger = require('./logger')

console.log('--- 전체 모듈 사용 ---')
logger.info('This is an info message')
logger.warning('This is a warning message')
logger.error('This is an error message')
logger.debug('This is a debug message')
console.log()

// 방법 2: 구조 분해로 필요한 것만 가져오기
const { info, error, LOG_LEVELS } = require('./logger')

console.log('--- 구조 분해 사용 ---')
info('Destructured info')
error('Destructured error')
console.log('Available log levels:', LOG_LEVELS)
console.log()

// 방법 3: 클래스 사용
const { Logger } = require('./logger')

console.log('--- Logger 클래스 사용 ---')
const appLogger = new Logger('APP')
const dbLogger = new Logger('DB')

appLogger.log('Application started')
dbLogger.log('Database connected')
console.log()

console.log('=== 핵심 포인트 ===')
console.log('✅ 여러 함수/클래스를 exports에 추가')
console.log('✅ 명확한 API 제공')
console.log('✅ 구조 분해를 통한 선택적 import')
console.log('✅ Node.js 코어 모듈과 동일한 패턴')
