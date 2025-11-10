# "return" vs "return await" 딥다이브

> async 함수에서 try-catch가 제대로 동작하지 않는다면? return await의 모든 것

---

## 📌 TL;DR (3줄 요약)

```javascript
// ❌ try-catch에서 에러 안잡힘
async function bad() {
  try {
    return someAsyncOp();  // await 없음
  } catch (e) {
    console.log('실행 안됨!');
  }
}

// ✅ try-catch가 제대로 동작
async function good() {
  try {
    return await someAsyncOp();  // await 추가
  } catch (e) {
    console.log('에러 잡힘!');
  }
}
```

**핵심 규칙:**
- ✅ **try-catch 안에서는 `return await` 필수**
- ✅ **finally 블록이 있으면 `return await` 필수**
- ✅ **using/await using 이후면 `return await` 필수**
- ⚪ 그 외에는 `return`만 써도 OK (성능 차이 없음)

**ESLint 설정:**
```json
{
  "@typescript-eslint/return-await": ["error", "in-try-catch"]
}
```

---

## 1. 문제 상황: try-catch가 작동하지 않는다

### 실제 프로덕션 버그

```javascript
// 데이터베이스 연결 함수
async function connectDB() {
  try {
    return db.connect();  // ❌ await 없음!
  } catch (error) {
    // 연결 실패 시 여기서 잡아야 하는데...
    logger.error('DB 연결 실패:', error);
    return null;
  }
}

// 사용
const conn = await connectDB();
// 🔥 문제: db.connect()가 실패해도 catch가 실행 안됨!
// 🔥 로그가 안남아서 디버깅 불가능
// 🔥 null 대신 rejected Promise가 그대로 전파
// 🔥 서비스 500 에러 발생
```

### 왜 catch가 실행 안될까?

```javascript
// 실제 실행 순서
async function connectDB() {
  try {
    const promise = db.connect();  // 1. Promise 생성 (pending)
    return promise;                // 2. Promise를 그대로 반환
    // 3. 함수 종료 → try-catch 블록 벗어남
  } catch (error) {
    // 4. Promise가 나중에 reject되어도 이미 try-catch 밖
    // 5. catch 실행 안됨!
  }
}
```

**핵심:** `return promise`는 Promise가 settle되기 전에 함수를 종료시킴

---

## 2. 해결: return await 사용

### 올바른 코드

```javascript
async function connectDB() {
  try {
    return await db.connect();  // ✅ await 추가
  } catch (error) {
    // ✅ 이제 제대로 실행됨!
    logger.error('DB 연결 실패:', error);
    return null;
  }
}
```

### 동작 원리

```javascript
async function connectDB() {
  try {
    const promise = db.connect();     // 1. Promise 생성
    const result = await promise;     // 2. Promise가 settle될 때까지 대기
    // 3a. fulfilled → result에 값 할당
    // 3b. rejected → throw Error (catch로 이동!)
    return result;                    // 4. 값 반환
  } catch (error) {
    // 5. await가 throw한 에러를 여기서 잡음
    logger.error('DB 연결 실패:', error);
    return null;
  }
}
```

**핵심:** `await`는 Promise rejection을 동기적 throw로 변환함

---

## 3. 핵심 메커니즘

### 이벤트 루프 관점

```javascript
// Pattern 1: return (await 없음)
async function pattern1() {
  try {
    return somePromise();
  } catch (e) { /* 실행 안됨 */ }
}

// 실행 흐름:
// Call Stack: pattern1() → return promise → 함수 종료
// → try-catch 벗어남
// → (나중에) Promise rejected → 상위로 전파
```

```javascript
// Pattern 2: return await
async function pattern2() {
  try {
    return await somePromise();
  } catch (e) { /* 실행됨! */ }
}

// 실행 흐름:
// Call Stack: pattern2() → await → 함수 중단 (suspend)
// → Promise settled → 함수 재개 (resume)
// → rejected → throw → catch 실행
```

### Stack Trace 차이

```javascript
async function level3() { throw new Error('Error!'); }
async function level2() { return level3(); }        // await 없음
async function level1() { return level2(); }        // await 없음

// Stack trace:
// Error: Error!
//     at level3
//     at async level1  ← level2가 사라짐!
```

```javascript
async function level3() { throw new Error('Error!'); }
async function level2() { return await level3(); }  // await 추가
async function level1() { return await level2(); }  // await 추가

// Stack trace:
// Error: Error!
//     at level3
//     at async level2  ← 나타남!
//     at async level1
```

---

## 4. ESLint 규칙의 변천사

### 과거 (2018-2022): no-return-await

**주장:** "`return await`는 불필요한 마이크로태스크를 추가해서 느리다"

```javascript
// ESLint가 에러로 표시하던 코드
async function foo() {
  return await bar();  // ❌ ESLint 에러
}
```

### 현재 (2023-2025): 규칙 Deprecated

**이유:**
1. **성능 주장이 틀렸음**: ECMA-262 스펙 변경으로 `return await`도 single microtask
2. **오히려 더 빠름**: 일부 벤치마크에서 `return await`가 빠름
3. **정확성이 더 중요**: try-catch 버그가 더 심각한 문제

**ESLint Issue #17345 벤치마크:**
```
return await: 2 microtasks
return:       3 microtasks  ← 더 느림!
```

### TypeScript-ESLint의 접근

```json
{
  // 권장 설정 1: try-catch에서만 강제
  "@typescript-eslint/return-await": ["error", "in-try-catch"],

  // 권장 설정 2: 항상 사용 (가장 일관적)
  "@typescript-eslint/return-await": ["error", "always"]
}
```

---

## 5. 실전 패턴

### 패턴 1: try-catch (return await 필수)

```javascript
async function apiCall() {
  try {
    return await fetch('/api/data');  // ✅ 필수
  } catch (error) {
    logError(error);
    throw new CustomError('API 호출 실패');
  }
}
```

### 패턴 2: finally (return await 필수)

```javascript
async function withCleanup() {
  const resource = await acquireResource();
  try {
    return await doWork(resource);  // ✅ 필수
  } finally {
    await resource.release();  // doWork 완료 후 실행 보장
  }
}
```

### 패턴 3: using (return await 필수)

```javascript
async function withUsing() {
  await using file = await openFile('data.txt');
  return await file.read();  // ✅ 필수 (file 자동 close 전에 읽기 완료)
}
```

### 패턴 4: 일반 케이스 (return만 써도 OK)

```javascript
async function simpleCase() {
  return someAsyncOp();  // ⚪ OK (try-catch, finally, using 없음)
}
```

### 의사 결정 테이블

| 상황 | 사용 | 이유 |
|------|------|------|
| try-catch 안 | `return await` | catch가 에러를 잡아야 함 |
| finally 있음 | `return await` | finally 실행 순서 보장 |
| using 이후 | `return await` | 리소스 정리 순서 보장 |
| 위 3가지 아님 | `return` | 간결성 (성능 동일) |

---

## 6. 실무 예제

### Express 미들웨어

```javascript
// ❌ 잘못된 예
app.use(async (req, res, next) => {
  try {
    return handleRequest(req, res);  // await 없음
  } catch (error) {
    // 에러 처리 안됨!
    res.status(500).json({ error: error.message });
  }
});

// ✅ 올바른 예
app.use(async (req, res, next) => {
  try {
    return await handleRequest(req, res);  // await 추가
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

### Database Transaction

```javascript
async function updateUser(userId, data) {
  const transaction = await db.beginTransaction();
  try {
    await user.update(userId, data);
    await audit.log(userId, 'updated');
    return await transaction.commit();  // ✅ 필수
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
}
```

### API 호출 with Retry

```javascript
async function fetchWithRetry(url, retries = 3) {
  try {
    return await fetch(url);  // ✅ 필수
  } catch (error) {
    if (retries > 0) {
      console.log(`Retry ${retries}...`);
      return await fetchWithRetry(url, retries - 1);
    }
    throw error;
  }
}
```

---

## 7. 체크리스트

### 코드 작성 시

```typescript
async function myFunction() {
  // ✅ try-catch 있나? → return await 사용
  try {
    return await asyncOp();
  } catch (e) {
    handleError(e);
  }

  // ✅ finally 있나? → return await 사용
  try {
    return await asyncOp();
  } finally {
    cleanup();
  }

  // ✅ using 사용 중? → return await 사용
  await using resource = await acquire();
  return await resource.use();

  // ⚪ 위 경우가 아니면 → return만 써도 OK
  return asyncOp();
}
```

### ESLint 설정

**.eslintrc.json:**
```json
{
  "extends": [
    "plugin:@typescript-eslint/strict-type-checked"
  ],
  "rules": {
    // 권장: try-catch에서만 강제
    "@typescript-eslint/return-await": ["error", "in-try-catch"],

    // 또는: 항상 사용 (더 일관적)
    // "@typescript-eslint/return-await": ["error", "always"],

    // 구식 규칙 끄기
    "no-return-await": "off"
  }
}
```

### 코드 리뷰 체크포인트

- [ ] try-catch 안에 `return somePromise()` 패턴 있는지 확인
- [ ] finally 블록과 함께 사용되는 async 함수 확인
- [ ] using/await using 사용 시 return await 확인
- [ ] ESLint 설정에 `@typescript-eslint/return-await` 활성화 확인
- [ ] 프로젝트에 구식 `no-return-await` 규칙 제거 확인

---

## 8. 빠른 참조

### 문제 증상

```
✗ try-catch에서 에러가 안잡힘
✗ 로그가 누락됨
✗ Stack trace가 불완전함
✗ finally가 너무 일찍 실행됨
✗ using 리소스가 너무 일찍 정리됨
```

### 해결 방법

```javascript
// Before
try {
  return someAsyncOp();
} catch (e) { /* 실행 안됨 */ }

// After
try {
  return await someAsyncOp();
} catch (e) { /* 실행됨! */ }
```

### 핵심 원리

- `return promise`: Promise를 그대로 반환 → try-catch 벗어남
- `return await promise`: Promise를 기다림 → rejection을 throw로 변환 → catch 실행

---

## 참고 자료

### 필수 읽기
- [Jake Archibald: await vs return vs return await](https://jakearchibald.com/2017/await-vs-return-vs-return-await/)
- [ESLint Issue #17345: return await is faster](https://github.com/eslint/eslint/issues/17345)
- [TypeScript-ESLint: return-await rule](https://typescript-eslint.io/rules/return-await/)

### 공식 문서
- [MDN: async function](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/async_function)
- [MDN: await operator](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/await)
- [ECMA-262: AsyncFunctionStart](https://tc39.es/ecma262/#sec-async-functions-abstract-operations-async-function-start)

### 추가 학습
- Event Loop와 Microtask Queue
- Promise resolution 과정
- V8 엔진의 async/await 최적화

---

## 마무리

**기억할 3가지:**

1. **try-catch 안에서는 무조건 `return await`**
2. **ESLint 설정: `@typescript-eslint/return-await: "in-try-catch"`**
3. **성능은 걱정 마세요 (차이 없음)**

이제 더 이상 try-catch에서 에러를 놓치는 일이 없을 것입니다! 🎉
