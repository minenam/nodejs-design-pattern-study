/**
 * Substack Pattern (함수 내보내기 패턴)
 *
 * 단일 함수를 주 기능으로 export하고,
 * 부가 기능들은 함수의 속성으로 추가하는 패턴
 *
 * 명명: James Halliday (@substack)가 대중화
 * 사용 예: express(), debug(), request()
 */

// 주 기능: 기본 로그 함수
module.exports = (message) => {
  const timestamp = new Date().toISOString()
  console.log(`[${timestamp}] [INFO] ${message}`)
}

// 부가 기능: 함수의 속성으로 추가
module.exports.verbose = (message) => {
  const timestamp = new Date().toISOString()
  console.log(`[${timestamp}] [VERBOSE] ${message}`)
}

module.exports.error = (message) => {
  const timestamp = new Date().toISOString()
  console.error(`[${timestamp}] [ERROR] ${message}`)
}

module.exports.warn = (message) => {
  const timestamp = new Date().toISOString()
  console.log(`[${timestamp}] [WARN] ${message}`)
}

// 설정 기능도 추가 가능
module.exports.setPrefix = (prefix) => {
  module.exports.prefix = prefix
}

module.exports.getPrefix = () => {
  return module.exports.prefix || 'DEFAULT'
}

// 초기 prefix
module.exports.prefix = 'APP'
