/**
 * Named Exports 패턴 (CommonJS)
 *
 * exports 객체에 여러 함수/변수를 추가하는 패턴
 * Node.js 코어 모듈(fs, path, util)에서 사용하는 방식
 */

// exports 객체에 속성 추가
exports.info = (message) => {
  console.log(`[INFO] ${message}`)
}

exports.warning = (message) => {
  console.log(`[WARNING] ${message}`)
}

exports.error = (message) => {
  console.error(`[ERROR] ${message}`)
}

exports.debug = (message) => {
  console.log(`[DEBUG] ${message}`)
}

// 상수도 export 가능
exports.LOG_LEVELS = {
  INFO: 'info',
  WARNING: 'warning',
  ERROR: 'error',
  DEBUG: 'debug'
}

// 클래스도 export 가능
exports.Logger = class Logger {
  constructor(prefix) {
    this.prefix = prefix
  }

  log(message) {
    console.log(`[${this.prefix}] ${message}`)
  }
}
