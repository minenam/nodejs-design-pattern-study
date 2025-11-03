# Node.js Design Patterns

## Chapter 3 - 콜백과 이벤트

Node.js 비동기 프로그래밍의 두 가지 기본 요소인 콜백 (Callback)과 이벤트 (Event) 에 대해 탐구하는 챕터

- 콜백 패턴 : 어떻게 동작하며 Node.js에서 사용되는 관례는 무엇인지 그리고 매우 흔한 위험요소를 어떻게 다룰 것인가.
- 관찰자 패턴 : Node.js에서 EventEmitter 클래스를 사용하여 구현을 어떻게 할 것인가.

## 콜백 패턴 (The Callback Pattern)

콜백은 Node.js 비동기 처리의 가장 기본적인 요소

### 핵심 개념

- CPS (Continuation Passing Style) : 함수의 결과를 `return` 키워드로 직접 반환하는 대신, 작업 완료 후 함수의 마지막 인자로 콜백 함수를 전달하는 방식

- 비동기 CPS : Node.js 에서의 핵심. `setTimeout` 예제처럼, 비동기 함수는 즉시 반환되어 이벤트 루프에 제어권을 넘기고, 작업이 완료되면 나중에 콜백이 실행됨

```ts
function asyncOperation(a, b, callback) {
  setTimeout(() => callback(a + b), 1000);
}

console.log("before asyncOperation");
asyncOperation(1, 2, (result) => {
  console.log("asyncOperation result: ", result);
});
console.log("after asyncOperation");

// 실행 결과
// 1. before asyncOperation
// 2. after asyncOperation
// 3. asyncOperation result: 3
```

- Node.js 콜백 규칙

1. 콜백은 마지막 인자로 -> 비동기 함수에 콜백을 전달할 때 항상 마지막 인자로 전달
2. 에러는 첫번째 인자 -> 콜백 함수 자체의 첫 번째 인자는 항상 에러 객체 (`err`). 작업이 성공하면 이 값은 `null` 또는 `undefined`

### 주요 위험요소 -> Zalgo 를 피해라 (일관성 없는 비동기)

가장 위험한 함정은 어떤 상황에서는 동기적으로, 어떤 상황에서는 비동기적으로 콜백을 호출하는 함수를 만드는 것.

#### 문제점 -> 예를 들어, 캐시 함수를 만들 때

- Case 1 : 캐시에 데이터가 없으면 비동기 I/O 작업 후 콜백을 비동기적으로 호출
- Case 2 : 캐시에 데이터가 있으면 동기적으로 콜백을 즉시 호출

#### 결과 (Zalgo) -> 이는 예측 불가능한 실행 순서를 만듬

콜백을 등록하는 코드가 실행되기도 전에 동기적 콜백이 먼저 실행되어 버릴 수 있음

```ts
function cache(key, callback) {
  if (cache[key]) {
    callback(null, cache[key]);
  } else {
    asyncOperation(key, (err, data) => {
      if (err) callback(err);
      cache[key] = data;
      callback(null, data);
    });
  }
}

// 1) 첫 호출
cache("foo", (err, data) => {
  console.log("callback1:", data);
});

// 2) 이후, 조금 뒤 또 호출
cache("foo", (err, data) => {
  console.log("callback2:", data);
});

// 실행 결과
// 1. 첫 호출: cache["foo"] = undefined -> asyncOperation 시작. callback1은 나중에 실행
// 2. async가 끝나면 cache["foo"] = data 저장
// 3. 이후, 또 호출: cache["foo"] = data -> 즉시 callback2 즉시(동기) 실행 -> 바로 console.log("callback2:", data) 실행
// 4. callback1 실행 -> console.log("callback1:", data) 실행
```

#### 해결책

1. 항상 비동기로 작성하기 (권장)

동기적으로 완료되더라도 `process.nextTick` or `setImmediate`을 사용하여 비동기적으로 처리
콜백 실행을 다음 이벤트 루프 사이클로 미루어 항상 비동기성을 보장

2. 항상 동기로 작성하기 (권장하지 않음)

`fs.readFileSync` 처럼 항상 동기적으로 동작하게 처리
but, 이는 이벤트 루프를 블로킹하므로 신중하게 사용

### 에러 처리

- 에러 전파

비동기 콜백 내부에서 발생한 에러는 `try...catch` 로 잡을 수 없음. `if(err) { return callback(err) }` 처럼 콜백 내부에서 명시적으로 다음 콜백 체인에 에러를 전달해야 함

- Uncaught Exceptions

콜백 내부에서 `throw` 를 사용하면 에러는 이벤트 루프까지 전파되어 프로세스를 다운시킴

- `process.on('uncaughtException', ...)`

프로세스 종료 전 마지막 정리 작업을 할 수 잇지만, 애플리케이션 실행을 계속하는 것은 위험

## 옵저버 패턴과 EventEmitter

콜백이 일대일 결과 통지에 가깝다면, 옵저버 패턴은 일대다 결과 통지에 사용

### 핵심 개념

- EventEmitter -> Node.js 의 `events` 모듈에 내장된 옵저버 패턴 구현체

- 주요 메서드

  - `on(eventName, listener)` : 이벤트 리스너 등록
  - `once(eventName, listener)` : 한 번만 실행되는 이벤트 리스너 등록
  - `emit(eventName, ...args)` : 이벤트 발생시켜 등록된 모든 리스너를 (등록된 순서대로) 실행
  - `removeListener(eventName, listener)` : 이벤트 리스너 제거

- 객체 확장 -> `EventEmitter`를 `extends` 하여 이벤트를 발생시키는 객체로 만들 수 있음 (ex. HTTP 서버, 스트림)

### 주요 위험요소 및 규칙

#### `error` 이벤트 처리

`error` 이벤트는 특별한 이벤트로 취급. 만약 `error` 이벤트가 발생했는데 등록된 리스너가 하나도 없으면, Node.js 프로세스가 예외를 던지며 다운됨. 항상 `error` 이벤트를 처리하는 리스너를 등록하는 것이 좋음.

#### 메모리 누수

이벤트 리스너(콜백)은 클로저. 만약 리스너를 계속 추가하고 제거하지 않으면 (EX. 요청마다 `.on()`을 호출), 해당 리스너와 리스너가 참조하는 모든 것이 메모리에서 해제되지 않아 누수가 발생함

- `EventEmitter` 는 기본적으로 한 이벤트에 10개 이상의 리스너가 등록되면 메모리 누수 가능성을 경고함 (해당 한도는 `setMaxListeners` 메서드로 변경 가능)

#### 동기 vs 비동기이벤트

콜백과 마찬가지로, Zalgo를 피하기 위해 이벤트를 발생시킬 때도 항상 비동기적으로 `emit` 하는 것이 좋음

## 그럼 콜백 vs EventEmitter 는 언제 사용해야 할까?

### 콜백 사용

비동기 작업의 최종 결과(성공 또는 실패)를 딱 한 번 전달해야 할 때 적합

### EventEmitter 사용

여러 번 발생할 수 있는 일을 알릴 때 (EX. `data` 이벤트)

여러 종류의 서로 다른 이벤트를 알릴 때 (EX. `connection`, `data`, `error` 등)

## Lesson & Learned

1. **콜백을 사용한다 !== 비동기 처리를 한다**

   콜백은 단지 "나중에 실행할 함수를 전달"하는 패턴.
   비동기는 "이벤트 루프와 I/O"가 관여.

   ```javascript
   // 동기 콜백
   [1, 2, 3].map((x) => x * 2); // 즉시 실행

   // 비동기 콜백
   fs.readFile("file.txt", callback); // 나중에 실행
   ```

2. **JS의 콜백 = 일급 클래스 객체 + 클로저**

   ```javascript
   function createReader(filename) {
     let data = null; // 클로저로 캡처됨

     return function (callback) {
       // 함수를 리턴 (일급 객체)
       fs.readFile(filename, (err, result) => {
         data = result; // 외부 스코프 접근 (클로저)
         callback(err, data);
       });
     };
   }
   ```

   이 두 특성이 CPS(Continuation Passing Style)를 가능하게 함

3. **EventEmitter의 메모리 누수**

   ```javascript
   // ❌ 매 요청마다 리스너 추가
   app.get('/api', (req, res) => {
       emitter.on('data', handler); // 누수!
   });

   // ✅ 적절한 시점에 제거
   const handler = () => { ... };
   emitter.on('data', handler);
   // ...
   emitter.removeListener('data', handler);
   ```

   리스너는 클로저 → 참조하는 모든 것을 메모리에 유지

## 궁금한 것 (더 찾아볼 내용들)

1. EventEmitter는 생각보다 비즈니스 로직 간 디커플링하기도 좋아보이는데, 실패에 대한 추적이나 에러 핸들링을 어떻게 해야 안정적으로 사용할 수 있을까?
2. EventLoop 의 동작 방식
3. EventLoop vs V8 -> 이 둘은 어떻게 싱글 스레드에서 동작을 하는 것일까?
