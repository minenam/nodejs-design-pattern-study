/**
 * ESM Named Exports 사용 예제
 */

console.log('=== ESM Named Exports Demo ===\n')

// 방법 1: 구조 분해 import
import { info, warning, error, debug, LOG_LEVELS } from './logger.mjs'

console.log('--- 구조 분해 import ---')
info('This is an info message')
warning('This is a warning message')
error('This is an error message')
debug('This is a debug message')
console.log('Available log levels:', LOG_LEVELS)
console.log()

// 방법 2: 별칭 사용
import { info as logInfo, error as logError } from './logger.mjs'

console.log('--- 별칭 사용 ---')
logInfo('Using alias for info')
logError('Using alias for error')
console.log()

// 방법 3: 전체 import (namespace import)
import * as logger from './logger.mjs'

console.log('--- 전체 import (namespace) ---')
logger.info('Using namespace import')
logger.warning('Another message')
console.log('Logger version:', logger.VERSION)
console.log('Logger author:', logger.AUTHOR)
console.log()

// 방법 4: 클래스 사용
import { Logger } from './logger.mjs'

console.log('--- Logger 클래스 사용 ---')
const appLogger = new Logger('APP')
const dbLogger = new Logger('DB')

appLogger.log('Application started')
appLogger.info('Processing request')
dbLogger.log('Database connected')
console.log()

console.log('=== 핵심 포인트 ===')
console.log('✅ export 키워드로 명시적 export')
console.log('✅ import 시 중괄호 { } 사용')
console.log('✅ 구조 분해, 별칭, 전체 import 모두 가능')
console.log('✅ 정적 분석 가능 → 트리 쉐이킹')
console.log('✅ CommonJS보다 명확한 의존성')
