/**
 * ESM Dynamic Imports 데모
 *
 * import() 함수를 사용한 동적 모듈 로딩
 * - 조건부 로딩
 * - 지연 로딩 (Lazy Loading)
 * - 코드 분할 (Code Splitting)
 */

console.log('=== ESM Dynamic Imports Demo ===\n')

// 지원하는 언어 목록
const SUPPORTED_LANGUAGES = ['en', 'ko']

// 커맨드 라인 인자로 언어 선택
const selectedLanguage = process.argv[2] || 'en'

console.log(`선택된 언어: ${selectedLanguage}`)

if (!SUPPORTED_LANGUAGES.includes(selectedLanguage)) {
  console.error(`지원하지 않는 언어입니다: ${selectedLanguage}`)
  console.error(`지원 언어: ${SUPPORTED_LANGUAGES.join(', ')}`)
  process.exit(1)
}

// 동적 import: 런타임에 모듈 경로 결정
const translationModule = `./strings-${selectedLanguage}.mjs`

console.log(`모듈 로딩: ${translationModule}\n`)

try {
  // import()는 Promise를 반환
  const strings = await import(translationModule)

  console.log('--- 로드된 문자열 ---')
  console.log('HELLO:', strings.HELLO)
  console.log('GOODBYE:', strings.GOODBYE)
  console.log('WELCOME:', strings.WELCOME)
  console.log('ERROR_MESSAGE:', strings.ERROR_MESSAGE)
  console.log('SUCCESS_MESSAGE:', strings.SUCCESS_MESSAGE)
  console.log()

  // 조건부 동적 로딩 예제
  console.log('--- 조건부 로딩 ---')

  const loadModule = async (condition) => {
    if (condition) {
      const module = await import('./strings-en.mjs')
      return module
    } else {
      const module = await import('./strings-ko.mjs')
      return module
    }
  }

  const conditionalStrings = await loadModule(false)
  console.log('조건부로 로드된 모듈:', conditionalStrings.HELLO)
  console.log()

  console.log('=== 핵심 포인트 ===')
  console.log('✅ import() 함수는 Promise 반환')
  console.log('✅ await 또는 .then() 사용')
  console.log('✅ 런타임에 모듈 경로 결정 가능')
  console.log('✅ 조건부 로딩 가능')
  console.log('✅ 지연 로딩으로 초기 로딩 시간 단축')
  console.log('✅ 코드 분할 (Code Splitting)')
  console.log()

  console.log('=== 사용 예제 ===')
  console.log('node main.mjs en  # 영어로 실행')
  console.log('node main.mjs ko  # 한글로 실행')

} catch (error) {
  console.error('모듈 로딩 실패:', error.message)
  process.exit(1)
}
