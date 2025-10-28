/**
 * ESM Default Export 사용 예제
 */

console.log('=== ESM Default Export Demo ===\n')

// 방법 1: Default export import (중괄호 없음!)
import Logger from './logger.mjs'

console.log('--- Default Export 사용 ---')
const appLogger = new Logger('APP')
appLogger.info('Application started')
appLogger.warn('Low memory warning')
appLogger.error('Failed to connect')
console.log('Logger stats:', appLogger.getStats())
console.log()

// 방법 2: Default + Named exports 혼합 import
import MyLogger, { createLogger, LOG_LEVELS, DEFAULT_CONFIG } from './logger.mjs'

console.log('--- Default + Named Exports 혼합 ---')
const dbLogger = new MyLogger('DB')  // Default export (이름 자유롭게)
const apiLogger = createLogger('API')  // Named export

dbLogger.log('Database connected')
apiLogger.log('API server started')
console.log()

console.log('Available log levels:', LOG_LEVELS)
console.log('Default config:', DEFAULT_CONFIG)
console.log()

// 방법 3: 원하는 이름으로 import 가능 (Default export)
import CustomLogger from './logger.mjs'

console.log('--- 다른 이름으로 import ---')
const customLogger = new CustomLogger('CUSTOM')
customLogger.info('Custom logger created')
console.log()

console.log('=== 핵심 포인트 ===')
console.log('✅ export default로 주요 export 지정')
console.log('✅ import 시 중괄호 없이 사용')
console.log('✅ import하는 쪽에서 이름 자유롭게 지정')
console.log('✅ Named exports와 혼합 사용 가능')
console.log('✅ 모듈당 하나의 default export만 가능')
console.log()

console.log('=== Default vs Named ===')
console.log('Default: import Logger from "./logger.mjs"')
console.log('Named:   import { Logger } from "./logger.mjs"')
console.log('Mixed:   import Logger, { createLogger } from "./logger.mjs"')
