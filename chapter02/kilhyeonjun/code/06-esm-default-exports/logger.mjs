/**
 * ESM Default Export 패턴
 *
 * export default를 사용하여 주요 export 지정
 * Named exports와 혼합 사용 가능
 */

// Default export: Logger 클래스
export default class Logger {
  constructor(name) {
    this.name = name
    this.count = 0
  }

  log(message) {
    this.count++
    const timestamp = new Date().toISOString()
    console.log(`[${this.count}] [${timestamp}] [${this.name}] ${message}`)
  }

  info(message) {
    this.log(`INFO: ${message}`)
  }

  error(message) {
    this.log(`ERROR: ${message}`)
  }

  warn(message) {
    this.log(`WARN: ${message}`)
  }

  getStats() {
    return {
      name: this.name,
      totalLogs: this.count
    }
  }
}

// Named exports: 부가 기능
export function createLogger(name) {
  return new Logger(name)
}

export const LOG_LEVELS = ['INFO', 'WARN', 'ERROR']

export const DEFAULT_CONFIG = {
  maxLogs: 1000,
  enableTimestamp: true
}
