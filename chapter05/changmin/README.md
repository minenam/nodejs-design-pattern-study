# Node.js Design Patterns

## Chapter 5 - Promise 그리고 Async/Await와 함께 하는 비동기 제어 흐름 패턴

콜백의 한계를 극복하고 더 나은 비동기 프로그래밍을 위한 두 가지 핵심 개념인 **Promise**와 **Async/Await**를 다루는 챕터

### 핵심 내용

- Promise : 비동기 작업의 최종 결과(또는 에러)를 담는 객체
- Async/Await : Promise 위에 구축된 syntactic sugar, 비동기 코드를 동기 코드처럼 작성 가능

---

## 1. Promise

### 1.1 Promise란?

- **정의**: 비동기 작업의 최종 결과(또는 에러)를 담는 객체
- **상태(States)**
  - `pending`: 비동기 작업이 아직 완료되지 않음
  - `fulfilled`: 작업이 성공적으로 완료됨
  - `rejected`: 작업이 에러와 함께 종료됨
  - `settled`: fulfilled 또는 rejected 상태 (최종 상태)

### 1.2 Promise의 주요 특징

```javascript
// 콜백 기반 코드
asyncOperation(arg, (err, result) => {
  if (err) {
    // 에러 처리
  }
  // 결과 처리
});

// Promise 기반 코드
asyncOperationPromise(arg)
  .then((result) => {
    // 결과 처리
  )}
  .catch((err) => {
    // 에러 처리
  });
```

### 1.3 Promise Chain

- `then()` 메서드는 새로운 Promise를 반환
- 체이닝을 통한 순차적 실행 가능
- 에러가 자동으로 체인을 따라 전파

```javascript
asyncOperationPromise(arg)
  .then((result1) => {
    return asyncOperationPromise(arg2); // 다른 Promise 반환
  })
  .then((result2) => {
    return "done"; // 값 반환
  })
  .catch((err) => {
    // 체인 전체의 에러를 여기서 처리
  });
```

### 1.4 Promise API

#### 정적 메서드

- `Promise.resolve(value)`: 값을 Promise로 변환
- `Promise.reject(error)`: 거부된 Promise 생성
- `Promise.all(promises)`: 모든 Promise가 완료될 때까지 대기
- `Promise.allSettled(promises)`: 모든 Promise가 settled될 때까지 대기
- `Promise.race(promises)`: 가장 먼저 settled되는 Promise 반환

#### 인스턴스 메서드

- `promise.then(onFulfilled, onRejected)`: Promise 체이닝의 핵심
- `promise.catch(onRejected)`: 에러 처리 (`.then(undefined, onRejected)`의 축약)
- `promise.finally(onFinally)`: 성공/실패와 관계없이 실행

### 1.5 Promise 생성

```javascript
function delay(milliseconds) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve(new Date());
    }, milliseconds);
  });
}
```

### 1.6 Promisification

콜백 기반 함수를 Promise 반환 함수로 변환

```javascript
function promisify(callbackBasedApi) {
  return function promisified(...args) {
    return new Promise((resolve, reject) => {
      const newArgs = [
        ...args,
        function (err, result) {
          if (err) {
            return reject(err);
          }
          resolve(result);
        },
      ];
      callbackBasedApi(...newArgs);
    });
  };
}
```

---

## 2. 비동기 제어 흐름 패턴 with Promises

### 2.1 순차 실행 (Sequential Execution)

```javascript
function spiderLinks(currentUrl, content, nesting) {
  let promise = Promise.resolve();
  const links = getPageLinks(currentUrl, content);

  // 동적으로 Promise 체인 구축
  for (const link of links) {
    promise = promise.then(() => spider(link, nesting - 1));
  }

  return promise;
}
```

**패턴**: 루프를 사용하여 동적으로 Promise 체인 구축

### 2.2 병렬 실행 (Parallel Execution)

```javascript
function spiderLinks(currentUrl, content, nesting) {
  const links = getPageLinks(currentUrl, content);
  const promises = links.map((link) => spider(link, nesting - 1));
  return Promise.all(promises); // 모든 작업이 완료될 때까지 대기
}
```

### 2.3 제한된 병렬 실행 (Limited Parallel Execution)

TaskQueue 클래스 구현

```javascript
class TaskQueue {
  constructor(concurrency) {
    this.concurrency = concurrency;
    this.running = 0;
    this.queue = [];
  }

  runTask(task) {
    return new Promise((resolve, reject) => {
      this.queue.push(() => {
        return task().then(resolve, reject);
      });
      process.nextTick(this.next.bind(this));
    });
  }

  next() {
    while (this.running < this.concurrency && this.queue.length) {
      const task = this.queue.shift();
      task().finally(() => {
        this.running--;
        this.next();
      });
      this.running++;
    }
  }
}
```

---

## 3. Async/Await

### 3.1 Async/Await란?

- Promise 위에 구축된 syntactic sugar
- 비동기 코드를 동기 코드처럼 작성 가능
- **async 함수**: 항상 Promise를 반환
- **await 표현식**: Promise가 resolve될 때까지 함수 실행을 "일시 중지"

### 3.2 기본 사용법

```javascript
// async 함수 정의
async function playingWithDelays() {
  console.log("Delaying...", new Date());
  const dateAfterOneSecond = await delay(1000);
  console.log(dateAfterOneSecond);

  const dateAfterThreeSeconds = await delay(3000);
  console.log(dateAfterThreeSeconds);

  return "done";
}

// async 함수 호출
playingWithDelays().then((result) => {
  console.log(`Result: ${result}`);
});
```

### 3.3 에러 처리

#### 통합된 try...catch

```javascript
async function playingWithErrors(throwSyncError) {
  try {
    if (throwSyncError) {
      throw new Error("Synchronous error"); // 동기 에러
    }
    await delayError(1000); // 비동기 에러 (Promise rejection)
  } catch (err) {
    // 동기와 비동기 에러 모두 여기서 처리
    console.error(`Error: ${err.message}`);
  } finally {
    console.log("Done");
  }
}
```

#### "return" vs "return await" 주의사항

```javascript
// 잘못된 예: 로컬 catch가 작동하지 않음
async function errorNotCaught() {
  try {
    return delayError(1000); // await 없음!
  } catch (err) {
    console.error("Never executed");
  }
}

// 올바른 예: 로컬 catch가 작동함
async function errorCaught() {
  try {
    return await delayError(1000); // await 사용!
  } catch (err) {
    console.error("Error caught locally");
  }
}
```

### 3.4 비동기 제어 흐름 with Async/Await

#### 순차 실행

```javascript
async function spiderLinks(currentUrl, content, nesting) {
  const links = getPageLinks(currentUrl, content);

  // 간단한 for 루프로 순차 실행
  for (const link of links) {
    await spider(link, nesting - 1);
  }
}
```

#### 병렬 실행

```javascript
async function spiderLinks(currentUrl, content, nesting) {
  const links = getPageLinks(currentUrl, content);
  const promises = links.map((link) => spider(link, nesting - 1));

  // Promise.all과 함께 사용
  return Promise.all(promises);
}
```

#### Array.forEach 안티패턴

```javascript
// 잘못된 예: forEach는 async 함수를 기다리지 않음
links.forEach(async (link) => {
  await spider(link, nesting - 1); // 병렬로 실행됨!
});

// 올바른 예: for...of 루프 사용
for (const link of links) {
  await spider(link, nesting - 1); // 순차적으로 실행됨
}
```

---

## 4. Web Spider 예제 비교

### 콜백 버전

```javascript
function download(url, filename, cb) {
  superagent.get(url).end((err, res) => {
    if (err) return cb(err);
    mkdirp(dirname(filename), (err) => {
      if (err) return cb(err);
      fs.writeFile(filename, res.text, (err) => {
        if (err) return cb(err);
        cb(null, res.text);
      });
    });
  });
}
```

### Promise 버전

```javascript
function download(url, filename) {
  let content;
  return superagent
    .get(url)
    .then((res) => {
      content = res.text;
      return mkdirpPromises(dirname(filename));
    })
    .then(() => fsPromises.writeFile(filename, content))
    .then(() => content);
}
```

### Async/Await 버전

```javascript
async function download(url, filename) {
  const { text: content } = await superagent.get(url);
  await mkdirpPromises(dirname(filename));
  await fsPromises.writeFile(filename, content);
  return content;
}
```

---

## 5. 핵심 장점 비교

| 특징          | Callbacks            | Promises            | Async/Await          |
| ------------- | -------------------- | ------------------- | -------------------- |
| **가독성**    | 낮음 (Callback Hell) | 중간 (체이닝)       | 높음 (동기 코드처럼) |
| **에러 처리** | 수동 전파 필요       | 자동 전파           | try...catch 통합     |
| **코드 길이** | 길고 복잡            | 중간                | 짧고 간결            |
| **디버깅**    | 어려움               | 중간                | 쉬움                 |
| **제어 흐름** | 복잡한 패턴 필요     | Promise 조합자 사용 | 일반 제어문 사용     |

---

## 6. 생산자-소비자 패턴 (Producer-Consumer)

제한된 병렬 실행을 위한 패턴

```javascript
class TaskQueuePC {
  constructor(concurrency) {
    this.taskQueue = [];
    this.consumerQueue = [];

    // 소비자 생성
    for (let i = 0; i < concurrency; i++) {
      this.consumer();
    }
  }

  async consumer() {
    while (true) {
      const task = await this.getNextTask();
      await task();
    }
  }

  async getNextTask() {
    return new Promise((resolve) => {
      if (this.taskQueue.length !== 0) {
        return resolve(this.taskQueue.shift());
      }
      this.consumerQueue.push(resolve); // 소비자를 "sleep"
    });
  }

  runTask(task) {
    if (this.consumerQueue.length !== 0) {
      const consumer = this.consumerQueue.shift();
      consumer(task); // 소비자를 "wake up"
    } else {
      this.taskQueue.push(task);
    }
  }
}
```

---

## 결론

Promise와 Async/Await는 Node.js에서 비동기 프로그래밍을 획기적으로 개선한 기능.
콜백의 복잡성을 해결하고, 더 읽기 쉽고 유지보수가 용이한 코드를 작성할 수 있게 해줌.
특히 Async/Await는 현재 Node.js에서 비동기 코드를 작성하는 표준이 되었으며, Promise와 함께 사용하면 모든 비동기 제어 흐름 패턴을 우아하게 구현할 수 있음.
