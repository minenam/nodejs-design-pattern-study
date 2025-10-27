/**
 * ESM Named Exports 패턴
 *
 * export 키워드를 사용하여 여러 함수/변수/클래스를 export
 */

// 함수 export
export function info(message) {
  console.log(`[INFO] ${message}`)
}

export function warning(message) {
  console.log(`[WARNING] ${message}`)
}

export function error(message) {
  console.error(`[ERROR] ${message}`)
}

export function debug(message) {
  console.log(`[DEBUG] ${message}`)
}

// 상수 export
export const LOG_LEVELS = {
  INFO: 'info',
  WARNING: 'warning',
  ERROR: 'error',
  DEBUG: 'debug'
}

// 클래스 export
export class Logger {
  constructor(prefix) {
    this.prefix = prefix
  }

  log(message) {
    console.log(`[${this.prefix}] ${message}`)
  }

  info(message) {
    console.log(`[${this.prefix}] [INFO] ${message}`)
  }
}

// 여러 개를 한번에 export도 가능
const VERSION = '1.0.0'
const AUTHOR = 'Your Name'

export { VERSION, AUTHOR }
