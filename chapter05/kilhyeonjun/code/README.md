# Chapter 5 코드 예제

Promise와 Async/Await를 사용한 비동기 제어 흐름 실습 코드입니다.

## 📁 파일 구조

```
code/
├── 01-promise-basics.js           # Promise 기본 개념과 상태
├── 02-promise-chaining.js          # Promise 체이닝과 값 전달
├── 03-promise-error-handling.js    # Promise 에러 처리 패턴
├── 04-promisify.js                 # 콜백을 Promise로 변환
├── 05-async-await-basics.js        # async/await 기본 문법
├── 06-async-await-error.js         # async/await 에러 처리
├── 07-return-vs-return-await.js    # return과 return await 차이
├── 08-sequential-execution.js      # 순차 실행 패턴
├── 09-parallel-execution.js        # 병렬 실행 패턴
├── 10-limited-parallel.js          # 제한된 병렬 실행 (TaskQueue)
├── 11-infinite-promise-loop.js     # 무한 Promise 체인 문제와 해결
├── exercises/                      # 연습 문제 (p204)
│   ├── 5.1-promise-all.js         # Promise.all() 직접 구현
│   ├── 5.2-taskqueue-async.js     # TaskQueue를 async/await로 변환
│   ├── 5.3-taskqueuepc-promise.js # TaskQueuePC를 Promise로 구현
│   └── 5.4-map-async.js           # 비동기 map() 함수 구현
└── testdata/                       # 자동 생성되는 테스트 파일
```

---

## 🚀 실행 방법

### 준비사항

Node.js 버전 확인:
```bash
node --version  # v14.0.0 이상 (async/await 지원)
```

### 기본 예제 실행

각 예제 파일은 `node` 명령어로 직접 실행할 수 있습니다.

```bash
# Promise 기본
node 01-promise-basics.js
node 02-promise-chaining.js
node 03-promise-error-handling.js
node 04-promisify.js

# async/await 기본
node 05-async-await-basics.js
node 06-async-await-error.js
node 07-return-vs-return-await.js

# 제어 흐름 패턴
node 08-sequential-execution.js
node 09-parallel-execution.js
node 10-limited-parallel.js

# 고급 주제
node 11-infinite-promise-loop.js
```

### 연습 문제 실행 (p204)

```bash
cd exercises

# 연습 5.1: Promise.all() 구현
node 5.1-promise-all.js

# 연습 5.2: TaskQueue async/await 버전
node 5.2-taskqueue-async.js

# 연습 5.3: TaskQueuePC Promise 버전
node 5.3-taskqueuepc-promise.js

# 연습 5.4: 비동기 map() 구현
node 5.4-map-async.js
```

---

## 📚 학습 포인트

### 01. `01-promise-basics.js`

- **개념**: Promise의 세 가지 상태(pending, fulfilled, rejected)와 기본 메소드(then, catch, finally) 사용법
- **학습 목표**:
  - Promise 생성자와 resolve/reject 이해
  - then 체이닝으로 비동기 작업 연결
  - catch로 에러 처리
  - finally로 정리 작업 수행
- **실행 예시**:
  ```bash
  node 01-promise-basics.js
  ```
- **예상 출력**:
  ```
  === Promise 기본 상태와 메소드 ===

  --- 1. Promise 상태 ---
  Pending Promise 상태: Promise { <pending> }
  Fulfilled Promise: Promise { '성공 값' }
  Rejected Promise: Promise { <rejected> Error: 실패 이유 }

  --- 2. then() 메소드 ---
  이행값: 42
  체이닝된 값: 84
  실패 (then 두번째 인자): 에러 발생
  ...
  ```
- **핵심**:
  - Promise는 한 번 settled(fulfilled 또는 rejected)되면 상태가 바뀌지 않음
  - then()은 항상 새로운 Promise를 반환하여 체이닝 가능
  - catch()는 then(undefined, onRejected)의 편의 문법

---

### 02. `02-promise-chaining.js`

- **개념**: Promise 체이닝을 통한 순차적 비동기 작업 처리와 값 전달 메커니즘
- **학습 목표**:
  - 체이닝에서 값을 다음 then으로 전달하는 방법
  - Promise를 반환하면 자동으로 펼쳐지는 특성 이해
  - 여러 단계의 비동기 작업을 직선형 코드로 작성
- **실행 예시**:
  ```bash
  node 02-promise-chaining.js
  ```
- **예상 출력**:
  ```
  === Promise 체이닝 ===

  --- 1. 기본 체이닝 ---
  단계 1: 초기값 10
  단계 2: 20
  단계 3: 30
  최종 결과: 30

  --- 2. Promise 반환 시 자동 펼치기 ---
  시작: 1
  비동기 처리 후: 2
  또 다른 비동기 처리 후: 3
  ...
  ```
- **핵심**:
  - then 핸들러가 값을 반환하면 그 값으로 이행되는 Promise 생성
  - then 핸들러가 Promise를 반환하면 그 Promise의 결과를 기다림
  - 콜백 지옥 없이 순차적 비동기 코드 작성 가능

---

### 03. `03-promise-error-handling.js`

- **개념**: Promise에서 발생하는 에러를 처리하고 복구하는 다양한 패턴
- **학습 목표**:
  - catch를 사용한 에러 처리
  - 에러 복구 후 체인 계속하기
  - finally로 정리 작업 보장
  - then의 두 번째 인자 vs catch의 차이
- **실행 예시**:
  ```bash
  node 03-promise-error-handling.js
  ```
- **예상 출력**:
  ```
  === Promise 에러 처리 ===

  --- 1. catch로 에러 잡기 ---
  에러 발생: Something went wrong
  에러 복구됨
  복구 후 계속: recovered

  --- 2. then의 두 번째 인자 ---
  성공 처리: 42
  에러 처리: Failed

  --- 3. 에러 전파 ---
  첫 번째 then: 1
  중간에 에러 발생!
  에러 catch: 중간에 에러 발생!
  ...
  ```
- **핵심**:
  - 에러는 catch를 만날 때까지 체인을 따라 전파됨
  - catch에서 값을 반환하면 에러 복구 가능
  - finally는 성공/실패 관계없이 항상 실행
  - UnhandledPromiseRejection 방지를 위해 항상 catch 추가

---

### 04. `04-promisify.js`

- **개념**: 콜백 기반 API를 Promise를 반환하는 함수로 변환(promisification)
- **학습 목표**:
  - 자체 promisify 함수 구현 이해
  - Node.js util.promisify() 사용법
  - fs.promises 같은 내장 Promise API 활용
- **실행 예시**:
  ```bash
  node 04-promisify.js
  ```
- **예상 출력**:
  ```
  === Promisify: 콜백을 Promise로 ===

  --- 1. 직접 구현한 promisify ---
  랜덤 바이트: <Buffer ...>

  --- 2. util.promisify() 사용 ---
  랜덤 바이트 (util): <Buffer ...>

  --- 3. fs.promises 사용 ---
  파일 쓰기 완료
  파일 내용: Hello, Promise!
  ...
  ```
- **핵심**:
  - Node.js 콜백 규약: callback(err, result)
  - 레거시 API를 Promise로 변환하여 async/await 사용 가능
  - util.promisify()는 Node.js v8부터 내장 지원
  - fs, crypto 등 많은 모듈이 Promise 버전 제공

---

### 05. `05-async-await-basics.js`

- **개념**: async 함수와 await 표현식의 기본 문법과 동작 원리
- **학습 목표**:
  - async 함수는 항상 Promise를 반환
  - await는 Promise가 해결될 때까지 실행 일시 정지
  - 동기 코드처럼 읽히지만 비동기로 실행
  - Promise 체인보다 훨씬 간결하고 읽기 쉬움
- **실행 예시**:
  ```bash
  node 05-async-await-basics.js
  ```
- **예상 출력**:
  ```
  === Async/Await 기본 ===

  --- 1. async 함수 선언 ---
  async 함수 반환값: Promise { 'Hello' }
  Promise 결과: Hello

  --- 2. await 표현식 ---
  시작: 10:30:00
  첫 번째 완료: First 10:30:00
  두 번째 완료: Second 10:30:00
  세 번째 완료: Third 10:30:00
  총 소요: 약 300ms
  최종 결과: Done
  ...
  ```
- **핵심**:
  - async function은 자동으로 반환값을 Promise.resolve()로 감쌈
  - await는 async 함수 안에서만 사용 가능
  - await는 실행을 일시 정지하지만 블로킹은 아님 (이벤트 루프는 계속 실행)
  - 여러 형태로 선언 가능: 함수 선언, 표현식, 화살표 함수, 메소드

---

### 06. `06-async-await-error.js`

- **개념**: async/await에서 try...catch를 사용한 통일된 에러 처리
- **학습 목표**:
  - 동기/비동기 에러를 동일한 catch 블록에서 처리
  - finally 블록으로 정리 작업 보장
  - Promise.catch()보다 직관적인 에러 처리
- **실행 예시**:
  ```bash
  node 06-async-await-error.js
  ```
- **예상 출력**:
  ```
  === async/await 에러 처리 ===

  --- 1. try...catch로 에러 잡기 ---
  에러 발생: Failed after 100ms
  finally 블록: 항상 실행

  --- 2. 동기/비동기 에러 통합 처리 ---
  동기 에러 catch: 동기 에러!
  비동기 에러 catch: 비동기 에러!

  --- 3. 여러 await에서 에러 ---
  Step 1 완료
  Step 2 에러 발생!
  에러: Step 2에서 실패
  ...
  ```
- **핵심**:
  - try 블록 안의 모든 await에서 발생한 에러를 catch에서 처리
  - 동기 코드와 비동기 코드의 에러 처리 방식이 완전히 동일
  - finally는 try/catch와 관계없이 항상 실행
  - 콜백 방식보다 훨씬 간단하고 명확

---

### 07. `07-return-vs-return-await.js`

- **개념**: async 함수에서 `return`과 `return await`의 중요한 차이점
- **학습 목표**:
  - return만 하면 로컬 try...catch에서 에러를 잡지 못함
  - return await해야 에러가 로컬에서 처리됨
  - 언제 await를 사용해야 하는지 판단
- **실행 예시**:
  ```bash
  node 07-return-vs-return-await.js
  ```
- **예상 출력**:
  ```
  === return vs return await ===

  --- 1. return (await 없음) - 에러가 밖으로 ---
  테스트 1: return delayError(100)
  에러가 밖에서 잡힘: Error after 100ms

  --- 2. return await - 에러가 안에서 ---
  테스트 2: return await delayError(100)
  에러가 안에서 잡힘: Error after 100ms
  복구된 값 반환

  --- 3. 실전 예제 ---
  함수 내부에서 처리: API 에러
  기본값 반환: { data: 'default' }
  ...
  ```
- **핵심**:
  - `return promise`는 그 promise를 그대로 반환 (에러 처리 건너뜀)
  - `return await promise`는 promise를 기다렸다가 값을 반환 (try...catch 적용)
  - 로컬에서 에러를 처리하려면 반드시 await 필요
  - ESLint 규칙: no-return-await (일반적으로는 불필요하지만 try...catch에서는 필요)

---

### 08. `08-sequential-execution.js`

- **개념**: 여러 비동기 작업을 순서대로 하나씩 실행하는 패턴
- **학습 목표**:
  - for 루프 + Promise 체인
  - reduce()를 사용한 함수형 접근
  - async/await + for 루프 (가장 권장)
  - 순차 실행의 장단점과 사용 시기
- **실행 예시**:
  ```bash
  node 08-sequential-execution.js
  ```
- **예상 출력**:
  ```
  === 순차 실행 패턴 ===

  --- 1. for 루프 + Promise 체인 ---
  시작: 10:30:00
    완료: Task 1
    완료: Task 2
    완료: Task 3
    완료: Task 4
    완료: Task 5
  모든 작업 완료: ['Task 1', 'Task 2', 'Task 3', 'Task 4', 'Task 5']
  총 소요 시간: 500ms (약 500ms)

  --- 3. async/await + for 루프 (가장 간결) ---
  시작: 10:30:00
    완료: Task 1
    완료: Task 2
    완료: Task 3
  총 소요 시간: 500ms
  ...
  ```
- **핵심**:
  - 순차 실행 시간 = 각 작업 시간의 합
  - 작업 간 의존성이 있을 때 사용
  - async/await + for 루프가 가장 읽기 쉽고 권장됨
  - 에러 발생 시 나머지 작업은 실행되지 않음

---

### 09. `09-parallel-execution.js`

- **개념**: 여러 비동기 작업을 동시에 실행하여 전체 시간 단축
- **학습 목표**:
  - Promise.all()로 병렬 실행
  - map()으로 Promise 배열 생성
  - 순차 실행 대비 성능 향상
  - Promise.race(), Promise.allSettled() 활용
- **실행 예시**:
  ```bash
  node 09-parallel-execution.js
  ```
- **예상 출력**:
  ```
  === 병렬 실행 패턴 ===

  --- 1. Promise.all() 기본 ---
  시작: 10:30:00
    Task 1 시작
    Task 2 시작
    Task 3 시작
    Task 1 완료
    Task 2 완료
    Task 3 완료
  모든 작업 완료: ['Result 1', 'Result 2', 'Result 3']
  총 소요 시간: 100ms (가장 긴 작업)

  --- 2. Promise.race() ---
  가장 빠른 결과: Fast (50ms)

  --- 3. Promise.allSettled() ---
  모든 결과: [
    { status: 'fulfilled', value: 'Success 1' },
    { status: 'rejected', reason: Error: Failed },
    { status: 'fulfilled', value: 'Success 2' }
  ]
  ...
  ```
- **핵심**:
  - 병렬 실행 시간 = 가장 긴 작업의 시간
  - 작업 간 의존성이 없을 때 사용
  - Promise.all()은 하나라도 실패하면 전체 실패
  - Promise.allSettled()는 모든 결과를 반환 (실패 포함)
  - 순차 대비 3~10배 이상 빠를 수 있음

---

### 10. `10-limited-parallel.js`

- **개념**: 동시 실행 개수를 제한하여 리소스를 보호하는 TaskQueue 패턴
- **학습 목표**:
  - TaskQueue 클래스 구현 원리
  - queue와 running 카운터로 동시성 제어
  - API 레이트 리밋, DB 연결 제한 등 실무 활용
  - p-limit 같은 라이브러리 사용법
- **실행 예시**:
  ```bash
  node 10-limited-parallel.js
  ```
- **예상 출력**:
  ```
  === 제한된 병렬 실행 ===

  --- 1. TaskQueue 기본 사용 ---
  동시성 2로 제한된 실행 시작...
  예상 시간: 600ms (2개씩 3번)
    Task 1 시작: 10:30:00.000
    Task 2 시작: 10:30:00.001
    Task 1 완료: 10:30:00.200
    Task 3 시작: 10:30:00.201
    Task 2 완료: 10:30:00.202
    Task 4 시작: 10:30:00.203
    Task 3 완료: 10:30:00.400
    Task 5 시작: 10:30:00.401
  총 소요 시간: 600ms

  --- 5. 동시성별 성능 비교 ---
  10개 작업, 각 100ms:
  동시성 1: 1000ms (순차)
  동시성 2: 500ms
  동시성 5: 200ms
  동시성 10: 100ms (전체 병렬)
  ...
  ```
- **핵심**:
  - 동시 실행 수를 concurrency로 제한
  - CPU/메모리 리소스 보호
  - API 레이트 리밋 준수
  - 실무에서는 p-limit, p-queue 같은 검증된 라이브러리 사용 권장
  - 적절한 동시성 값은 테스트로 결정

---

### 11. `11-infinite-promise-loop.js`

- **개념**: 무한 재귀 Promise 체인의 메모리 누수 문제와 해결 방법
- **학습 목표**:
  - 재귀 + return이 왜 위험한지 이해
  - Promise 체인이 메모리에서 해제되지 않는 이유
  - while 루프 + await로 안전하게 구현
  - Promise/A+ 스펙의 한계 이해
- **실행 예시**:
  ```bash
  node 11-infinite-promise-loop.js
  ```
- **예상 출력**:
  ```
  === 무한 재귀 Promise 체인 문제 ===

  --- 1. 문제: 메모리 누수 패턴 ---
  ※ 실제로는 실행하지 말 것! (데모용 설명만)

  잘못된 예 1: return과 재귀 호출
  문제점:
  - 각 Promise가 다음 Promise에 의존
  - 끊어지지 않는 Promise 체인 생성
  - 메모리에서 해제되지 않음

  --- 4. 해결 방법 3: async/await + while (권장!) ---
  async/await + while 버전:
    Tick 1
    Tick 2
    Tick 3
    Tick 4
    Tick 5
    결과: 완료

  장점:
    ✓ 메모리 안전
    ✓ 에러 자동 전파
    ✓ 가장 읽기 쉬움
    ✓ break/continue 사용 가능
  ...
  ```
- **핵심**:
  - 재귀 호출 + return = 메모리 누수!
  - Promise 체인은 자동으로 메모리에서 해제되지 않음
  - 무한 루프는 while + await 사용 (재귀 금지)
  - 서버 폴링, 이벤트 처리 등 실무 패턴 적용
  - async/await에서도 재귀는 여전히 위험

---

## 🎯 추천 학습 순서

### 1단계: Promise 기초 (1~3일차)
1. **01-promise-basics.js** - Promise 상태와 메소드
2. **02-promise-chaining.js** - 체이닝 마스터
3. **03-promise-error-handling.js** - 에러 처리 패턴
4. **04-promisify.js** - 콜백 변환

**목표**: Promise의 기본 개념과 API 완전 이해

### 2단계: Async/Await 기초 (4~5일차)
5. **05-async-await-basics.js** - async/await 기본
6. **06-async-await-error.js** - 에러 처리
7. **07-return-vs-return-await.js** - 함정 피하기

**목표**: async/await 문법 숙달 및 Promise와의 관계 이해

### 3단계: 제어 흐름 패턴 (6~8일차)
8. **08-sequential-execution.js** - 순차 실행
9. **09-parallel-execution.js** - 병렬 실행
10. **10-limited-parallel.js** - 제한된 병렬

**목표**: 실무에서 가장 많이 사용하는 패턴 마스터

### 4단계: 고급 주제 (9일차)
11. **11-infinite-promise-loop.js** - 메모리 안전

**목표**: 함정 피하기 및 메모리 관리

### 5단계: 종합 연습 (10~14일차)
- **exercises/5.1-promise-all.js** - 내부 동작 이해
- **exercises/5.2-taskqueue-async.js** - 코드 변환 연습
- **exercises/5.3-taskqueuepc-promise.js** - 복잡한 패턴 구현
- **exercises/5.4-map-async.js** - 실무 유틸리티

**목표**: 배운 내용을 실전 문제에 적용

---

## 💡 실습 팁

### 코드 수정해보기

1. **동시성 조절**:
   ```javascript
   // 10-limited-parallel.js에서
   const queue = new TaskQueue(2)  // 2 → 5로 변경
   // 실행 시간이 어떻게 바뀌는지 관찰
   ```

2. **타이밍 변경**:
   ```javascript
   // 09-parallel-execution.js에서
   const tasks = [
     () => delay(300, 'Slow'),    // 100 → 300
     () => delay(100, 'Medium'),
     () => delay(50, 'Fast')
   ]
   // 가장 긴 작업이 전체 시간 결정하는지 확인
   ```

3. **에러 시나리오 추가**:
   ```javascript
   // 08-sequential-execution.js에서
   const tasks = [
     () => delay(100, 'Task 1'),
     () => Promise.reject(new Error('Task 2 failed')),
     () => delay(100, 'Task 3')  // 실행되지 않음
   ]
   ```

4. **Chapter 4와 비교**:
   - 동일한 작업을 콜백, Promise, async/await로 구현
   - 코드 가독성, 에러 처리, 코드 길이 비교
   - 콜백 지옥 vs 직선형 코드 체감

### 디버깅 팁

```javascript
// Promise 상태 확인
const p = delay(1000, 'result')
console.log(p)  // Promise { <pending> }
setTimeout(() => console.log(p), 1100)  // Promise { 'result' }

// 실행 순서 확인
console.log('1. 동기 코드')
Promise.resolve().then(() => console.log('3. 마이크로태스크'))
console.log('2. 동기 코드')
// 출력: 1 → 2 → 3

// 타이밍 측정
const start = Date.now()
await someAsyncOperation()
console.log(`소요 시간: ${Date.now() - start}ms`)
```

---

## 🔧 문제 해결

### UnhandledPromiseRejection

**에러**:
```
(node:12345) UnhandledPromiseRejectionWarning: Error: Something failed
```

**원인**: Promise가 reject되었는데 catch 핸들러가 없음

**해결**:
```javascript
// 잘못된 예
promise()  // catch 없음!

// 올바른 예
promise()
  .catch(err => console.error(err))

// 또는
try {
  await promise()
} catch (err) {
  console.error(err)
}
```

### Memory Leaks (메모리 누수)

**증상**: 프로그램이 점점 느려지고 결국 크래시

**원인**: 무한 재귀 Promise 체인

**해결**:
```javascript
// 잘못된 예
function leaking() {
  return promise().then(() => leaking())  // ❌
}

// 올바른 예
async function notLeaking() {
  while (true) {  // ✅
    await promise()
  }
}
```

### return vs return await 혼동

**문제**: try...catch에서 에러를 못 잡음

**해결**:
```javascript
// ❌ 에러를 못 잡음
async function bad() {
  try {
    return asyncOp()  // await 없음!
  } catch (err) {
    console.log('여기 안 옴')
  }
}

// ✅ 에러를 잡음
async function good() {
  try {
    return await asyncOp()  // await 있음!
  } catch (err) {
    console.log('여기 옴')
  }
}
```

---

## 📖 참고 자료

### 공식 문서

- **MDN Promise**: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise
- **MDN async function**: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/async_function
- **Promise/A+ 스펙**: https://promisesaplus.com/
- **Node.js util.promisify()**: https://nodejs.org/api/util.html#utilpromisifyoriginal
- **Node.js fs.promises**: https://nodejs.org/api/fs.html#promises-api

### 추천 라이브러리

**동시성 제어**:
- **p-limit**: 간단하고 가벼운 동시성 제한
  ```bash
  npm install p-limit
  ```
  ```javascript
  import pLimit from 'p-limit'
  const limit = pLimit(2)
  const promises = urls.map(url => limit(() => fetch(url)))
  await Promise.all(promises)
  ```

- **p-queue**: 우선순위, 타임아웃 등 고급 기능
- **p-map**: 비동기 map()
- **p-retry**: 실패 시 자동 재시도

---

## 🌟 다음 단계

### Chapter 6 예고: 스트림 (Streams)

Promise와 async/await를 마스터했다면 이제 스트림으로 넘어갈 준비가 되었습니다!

**스트림이 중요한 이유**:
- 대용량 데이터를 메모리 효율적으로 처리
- 비동기 반복 (for await...of)
- 백프레셔(backpressure)로 리소스 제어
- Node.js 생태계의 핵심 개념

---

## ✅ 학습 체크리스트

### Promise 기초
- [ ] Promise의 세 가지 상태 이해 (pending, fulfilled, rejected)
- [ ] Promise 생성자 사용법
- [ ] then, catch, finally 사용법
- [ ] Promise 체이닝 원리
- [ ] 에러 전파 메커니즘

### async/await
- [ ] async 함수는 항상 Promise 반환
- [ ] await는 async 함수 안에서만 사용
- [ ] try...catch로 에러 처리
- [ ] return vs return await 차이
- [ ] 반환값 자동 Promise 감싸기

### 제어 흐름
- [ ] 순차 실행 구현 (for, reduce, async/await)
- [ ] 병렬 실행 구현 (Promise.all())
- [ ] 제한된 병렬 실행 (TaskQueue)
- [ ] 순차 vs 병렬 성능 차이 이해
- [ ] 적절한 패턴 선택 기준

### 고급 주제
- [ ] promisification 원리
- [ ] 무한 재귀 Promise 체인 문제
- [ ] while + await로 안전한 무한 루프
- [ ] Promise/A+ 스펙의 한계 이해
- [ ] 메모리 안전한 비동기 코드 작성

### 연습 문제
- [ ] Promise.all() 직접 구현
- [ ] TaskQueue async/await 변환
- [ ] TaskQueuePC Promise 구현
- [ ] 비동기 map() 함수 구현

### 실무 적용
- [ ] Chapter 4 콜백 코드와 비교 분석
- [ ] 실무 코드에 async/await 적용
- [ ] 적절한 에러 처리 전략 수립
- [ ] 동시성 제어로 리소스 관리
- [ ] p-limit 같은 라이브러리 활용
