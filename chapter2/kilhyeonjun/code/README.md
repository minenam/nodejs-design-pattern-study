# Chapter 2 코드 예제

Chapter 2의 핵심 개념을 실습할 수 있는 코드 예제 모음입니다.

## 📁 파일 구조

```
code/
├── 01-revealing-module-pattern.js       # IIFE를 활용한 모듈 패턴
├── 02-commonjs-named-exports/           # CommonJS Named Exports
│   ├── logger.js
│   └── main.js
├── 03-commonjs-substack-pattern/        # Substack Pattern (함수 내보내기)
│   ├── logger.js
│   └── main.js
├── 04-commonjs-circular-deps/           # 순환 종속성 (CommonJS)
│   ├── a.js
│   ├── b.js
│   └── main.js
├── 05-esm-named-exports/                # ESM Named Exports
│   ├── logger.mjs
│   └── main.mjs
├── 06-esm-default-exports/              # ESM Default Exports
│   ├── logger.mjs
│   └── main.mjs
├── 07-esm-dynamic-imports/              # Dynamic Imports (다국어 예제)
│   ├── strings-en.mjs
│   ├── strings-ko.mjs
│   └── main.mjs
├── 08-esm-live-bindings/                # Read-only Live Bindings
│   ├── counter.mjs
│   └── main.mjs
├── package.json
└── README.md
```

---

## 🚀 실행 방법

### 준비사항

Node.js 버전 확인:
```bash
node --version  # v18.0.0 이상 권장
```

### npm scripts 사용 (권장)

```bash
# 1. Revealing Module Pattern
npm run 01

# 2. CommonJS Named Exports
npm run 02

# 3. CommonJS Substack Pattern
npm run 03

# 4. CommonJS 순환 종속성
npm run 04

# 5. ESM Named Exports
npm run 05

# 6. ESM Default Exports
npm run 06

# 7. ESM Dynamic Imports (영어)
npm run 07-en

# 7. ESM Dynamic Imports (한글)
npm run 07-ko

# 8. ESM Live Bindings
npm run 08
```

### 직접 실행

**CommonJS 예제**:
```bash
node 01-revealing-module-pattern.js
node 02-commonjs-named-exports/main.js
node 03-commonjs-substack-pattern/main.js
node 04-commonjs-circular-deps/main.js
```

**ESM 예제**:
```bash
node 05-esm-named-exports/main.mjs
node 06-esm-default-exports/main.mjs
node 07-esm-dynamic-imports/main.mjs en
node 07-esm-dynamic-imports/main.mjs ko
node 08-esm-live-bindings/main.mjs
```

---

## 📚 학습 포인트

### 01. Revealing Module Pattern (노출식 모듈 패턴)

**개념**:
- IIFE(즉시 실행 함수)를 사용한 모듈 패턴
- 모듈 시스템 없이도 은닉성 제공

**학습 목표**:
- 비공개 변수와 공개 인터페이스 구분
- 전역 네임스페이스 오염 방지
- 진정한 캡슐화 구현

**예상 출력**:
```
초기 count: 0
[INCREMENT] 0 → 1
[INCREMENT] 1 → 2
...
```

---

### 02. CommonJS Named Exports

**개념**:
- `exports` 객체에 여러 함수/변수 추가
- Node.js 코어 모듈과 동일한 패턴

**학습 목표**:
- `exports.함수명` 사용법
- 구조 분해를 통한 선택적 import
- 클래스와 상수 export

**예상 출력**:
```
[INFO] This is an info message
[WARNING] This is a warning message
...
```

---

### 03. CommonJS Substack Pattern

**개념**:
- 함수를 주 export로, 부가 기능은 속성으로 추가
- `express()`, `debug()` 등에서 사용

**학습 목표**:
- `module.exports = 함수` 사용법
- 함수 속성 추가 방법
- 명확한 주 진입점 설계

**예상 출력**:
```
[2025-01-15T...] [INFO] This is the main logging function
[2025-01-15T...] [VERBOSE] Verbose debugging information
...
```

---

### 04. CommonJS 순환 종속성

**개념**:
- a.js ↔ b.js 상호 참조
- 불완전한 exports 반환

**학습 목표**:
- 순환 종속성 발생 시 동작 이해
- 캐싱 메커니즘 이해
- 왜 일부 값이 undefined인지 파악

**예상 출력**:
```
a.js: 실행 시작
a.js: b.js를 require합니다
b.js: 실행 시작
b.js: a.js를 require합니다
b.js: a.loaded = false  (불완전한 exports!)
...
```

**핵심 관찰**:
- `a.loaded`는 `true`
- `a.b.loaded`도 `true`
- 하지만 `a.b.a.loaded`는 `false` (!!)

---

### 05. ESM Named Exports

**개념**:
- `export` 키워드로 명시적 export
- 정적 분석 가능 → 트리 쉐이킹

**학습 목표**:
- `export function` 사용법
- `import { }` 구조 분해
- 별칭과 전체 import

**예상 출력**:
```
[INFO] This is an info message
[WARNING] This is a warning message
...
```

---

### 06. ESM Default Exports

**개념**:
- `export default`로 주요 export 지정
- Named exports와 혼합 사용

**학습 목표**:
- Default vs Named exports 차이
- 혼합 사용 방법
- import 시 이름 자유롭게 지정

**예상 출력**:
```
[1] [2025-01-15T...] [APP] INFO: Application started
[2] [2025-01-15T...] [APP] WARN: Low memory warning
...
```

---

### 07. ESM Dynamic Imports

**개념**:
- `import()` 함수로 동적 로딩
- 조건부 및 지연 로딩

**학습 목표**:
- 런타임 모듈 경로 결정
- async/await와 함께 사용
- 다국어 지원 구현

**예상 출력 (영어)**:
```
선택된 언어: en
HELLO: Hello
GOODBYE: Goodbye
...
```

**예상 출력 (한글)**:
```
선택된 언어: ko
HELLO: 안녕하세요
GOODBYE: 안녕히 가세요
...
```

---

### 08. ESM Live Bindings

**개념**:
- export된 변수는 참조 (값의 복사 X)
- 읽기 전용 (read-only)

**학습 목표**:
- CommonJS와의 차이점 이해
- 변경 사항 즉시 반영 확인
- 직접 수정 시 에러 확인

**예상 출력**:
```
[main.mjs] count: 0
[counter.mjs] count incremented to 1
[main.mjs] count: 1  (변경 반영!)
...
[main.mjs] 에러: Assignment to constant variable.
```

---

## 🎯 추천 학습 순서

1. **01 → Revealing Module Pattern**
   - 모듈의 기본 개념 이해

2. **02 → 03 → CommonJS 패턴**
   - Named Exports와 Substack Pattern 비교

3. **04 → 순환 종속성**
   - CommonJS의 한계 체험

4. **05 → 06 → ESM 기본**
   - Named vs Default exports 이해

5. **07 → Dynamic Imports**
   - 런타임 로딩의 장점

6. **08 → Live Bindings**
   - ESM과 CommonJS의 핵심 차이

---

## ⚠️ 주의사항

### .mjs vs .js

- **`.mjs`**: 항상 ESM으로 처리
- **`.js`**: `package.json`의 `"type"` 필드에 따라 결정
  - `"type": "module"` → ESM
  - `"type": "commonjs"` 또는 없음 → CommonJS

### 현재 설정

`package.json`:
```json
{
  "type": "module"
}
```

- `.mjs` 파일: ESM으로 실행
- `.js` 파일: **CommonJS로 실행하려면 확장자를 `.cjs`로 변경 필요**

### CommonJS 예제 실행 시

CommonJS 예제(01-04)는 내부적으로 CommonJS 문법 사용:
```bash
node 02-commonjs-named-exports/main.js
```

Node.js가 해당 파일 내 `require()`를 인식하고 올바르게 실행합니다.

---

## 🔧 문제 해결

### ERR_REQUIRE_ESM

**에러**:
```
Error [ERR_REQUIRE_ESM]: require() of ES Module not supported
```

**원인**: CommonJS에서 ESM 모듈을 `require()`로 불러오려 함

**해결**:
1. 동적 import 사용: `const module = await import('./module.mjs')`
2. 또는 해당 모듈을 CommonJS로 변경

### SyntaxError: Cannot use import statement

**에러**:
```
SyntaxError: Cannot use import statement outside a module
```

**원인**: `.js` 파일에서 ESM 문법 사용했으나 `package.json`에 `"type": "module"` 없음

**해결**:
1. 파일 확장자를 `.mjs`로 변경
2. 또는 `package.json`에 `"type": "module"` 추가

---

## 💡 실습 팁

### 코드 수정해보기

1. **Named Exports 추가**:
   - `logger.js`에 새로운 로그 레벨 추가해보기

2. **Substack Pattern 확장**:
   - 설정 기능 추가해보기

3. **순환 종속성 해결**:
   - 공통 모듈 분리하여 해결해보기

4. **Dynamic Imports 활용**:
   - 새로운 언어 추가해보기
   - 조건부 로딩 시나리오 추가

5. **Live Bindings 실험**:
   - 여러 변수 export하고 동작 확인

### 디버깅

각 예제에 `console.log()` 추가하여 실행 흐름 확인:

```javascript
// 예: CommonJS 순환 종속성
console.log('현재 위치:', __filename)
console.log('캐시 확인:', require.cache)
```

---

## 📖 참고 자료

- **Node.js Modules**: https://nodejs.org/api/modules.html
- **Node.js ECMAScript Modules**: https://nodejs.org/api/esm.html
- **MDN Import**: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/import
- **MDN Export**: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/export

---

## 🎓 학습 체크리스트

- [ ] Revealing Module Pattern으로 은닉성 구현
- [ ] CommonJS Named Exports 사용
- [ ] Substack Pattern 이해
- [ ] 순환 종속성 문제 경험
- [ ] ESM Named Exports 사용
- [ ] ESM Default Exports 사용
- [ ] Dynamic Imports로 조건부 로딩
- [ ] Live Bindings 특성 이해
- [ ] CommonJS vs ESM 차이점 정리
- [ ] 실무 적용 방안 고민
