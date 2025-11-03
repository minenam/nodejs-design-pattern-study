# Chapter 03. 콜백과 이벤트

> **핵심 개념**
> - 동기: 순차적으로 처리
> - 비동기: 순차적이지 않음 (나중에 처리)  
> - 블로킹: 작업이 완료될 때까지 기다림
> - 논블로킹: 작업이 완료될 때까지 기다리지 않음

---

## 1. 클로저 (Closures)

클로저는 함수와 그 함수가 선언된 렉시컬 환경의 조합입니다.

```javascript
function createCallback(message) {
  return function(data) {
    console.log(`${message}: ${data}`);
  };
}

const successCallback = createCallback("Success");
processData("test", successCallback); // "Success: Processed: test"
```

**참고**: [MDN - Closures](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Closures)

---

## 2. 연속 전달 방식 (CPS)

### 비동기 연속 전달 방식

```javascript
function addAsync(a, b, callback) {
  setTimeout(() => callback(a + b), 1000);
}

console.log("Start");
addAsync(2, 3, (result) => {
  console.log(`Result: ${result}`);
});
console.log("End");
```

**특징:**
- 단순히 결과를 반환하는 것 대신 다른 함수(콜백 함수)에 결과를 전달
- 비동기 작업이 완료되면 실행은 비동기 함수에 제공된 콜백에서부터 재개
- 클로저 덕분에 콜백이 다른 시점과 다른 위치에서 호출되더라도 컨텍스트를 유지

### 비연속 전달(Non-CPS) 방식

```javascript
const result = [1, 3, 5].map((x) => x * 2);
console.log(result); // [2, 6, 10]
```

콜백은 배열 내 요소를 반복하는데만 사용하고 연산 결과를 전달하지 않습니다.

**참고**: [Continuation-passing style - Wikipedia](https://en.wikipedia.org/wiki/Continuation-passing_style)

---

## 3. Zalgo 문제

비동기와 동기 API를 명확하게 정의하지 않고 혼재되어 호출 결과가 예측할 수 없는 상황

```javascript
// 문제가 있는 코드
const cache = {};

function inconsistentRead(filename, callback) {
  if (cache[filename]) {
    callback(cache[filename]); // 동기적 호출
  } else {
    fs.readFile(filename, 'utf8', (err, data) => {
      cache[filename] = data;
      callback(data); // 비동기적 호출
    });
  }
}
```

### 해결책

**process.nextTick() 사용:**
```javascript
function consistentRead(filename, callback) {
  if (cache[filename]) {
    process.nextTick(() => callback(cache[filename]));
  } else {
    fs.readFile(filename, 'utf8', (err, data) => {
      cache[filename] = data;
      callback(data);
    });
  }
}
```

**참고**: [Designing APIs for Asynchrony](https://blog.izs.me/2013/08/designing-apis-for-asynchrony/)

---

## 4. process.nextTick() vs setImmediate()

### process.nextTick()
- 현재 진행중 작업의 완료 시점 뒤로 함수의 실행을 지연
- 콜백 인수를 받아 대기 중인 I/O 이벤트 대기열 앞에 삽입
- 지연된 콜백(마이크로태스크)는 현재 작업 완료되면 바로 실행
- **주의**: 재귀호출 시 I/O 기아(starvation) 현상 초래 가능

### setImmediate()
- 현재 이벤트 루프 사이클이 완료된 후 콜백을 실행
- I/O 이벤트 대기열 뒤에 콜백을 삽입

---

## 5. Node.js 콜백 규칙

### 콜백 위치
콜백은 항상 맨 마지막 인수로 사용

```javascript
readFile(filename, encoding, callback);
```

### 에러 우선 콜백 패턴 (Error-First Callback)

```javascript
fs.readFile("file.txt", (err, data) => {
  if (err) {
    // 에러 처리
  } else {
    // 정상 처리
  }
});
```

**규칙:**
- 첫 번째 인수는 에러 객체 또는 null
- 두 번째 인수는 정상 결과 값

### 에러 전파와 Fail-Fast

```javascript
function processData(data, callback) {
  if (!data) {
    callback(new Error('Data is required'));
    return;
  }
  
  // 처리 로직
  callback(null, result);
}
```

**Fail-Fast 접근법**: 에러가 발생하면 즉시 처리하고 종료

---

## 6. 이벤트 루프와 실행 순서

```javascript
console.log('1. 동기 코드 시작');

setTimeout(() => {
  console.log('4. setTimeout (매크로태스크)');
}, 0);

process.nextTick(() => {
  console.log('2. process.nextTick (마이크로태스크)');
});

setImmediate(() => {
  console.log('5. setImmediate (매크로태스크)');
});

Promise.resolve().then(() => {
  console.log('3. Promise.then (마이크로태스크)');
});

console.log('1. 동기 코드 끝');
```

**실행 순서:**
1. 동기 코드
2. 마이크로태스크 (nextTick, Promise)
3. 매크로태스크 (setTimeout, setImmediate)

---

## 7. 실무 패턴

### 순차 실행
```javascript
function sequentialExecution(tasks, callback) {
  let results = [];
  let currentIndex = 0;
  
  function executeNext() {
    if (currentIndex >= tasks.length) {
      callback(null, results);
      return;
    }
    
    const currentTask = tasks[currentIndex];
    currentTask((err, result) => {
      if (err) return callback(err);
      
      results.push(result);
      currentIndex++;
      executeNext();
    });
  }
  
  executeNext();
}
```

### 병렬 실행
```javascript
function parallelExecution(tasks, callback) {
  let results = [];
  let completed = 0;
  
  tasks.forEach((task, index) => {
    task((err, result) => {
      if (err) return callback(err);
      
      results[index] = result;
      completed++;
      
      if (completed === tasks.length) {
        callback(null, results);
      }
    });
  });
}
```

---

## 🎯 핵심 정리

1. **클로저**는 콜백에서 컨텍스트 유지의 핵심
2. **CPS**는 결과를 콜백으로 전달하는 패턴
3. **Zalgo 문제** 방지를 위해 일관된 비동기 동작 보장
4. **에러 우선 콜백**으로 일관된 에러 처리
5. **이벤트 루프** 이해로 실행 순서 예측
6. **순차/병렬 패턴**으로 복잡한 비동기 작업 제어

---

## 📚 참고 자료

- [MDN - Closures](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Closures)
- [Continuation-passing style - Wikipedia](https://en.wikipedia.org/wiki/Continuation-passing_style)  
- [Designing APIs for Asynchrony](https://blog.izs.me/2013/08/designing-apis-for-asynchrony/)
- [Node.js Event Loop](https://nodejs.org/en/docs/guides/event-loop-timers-and-nexttick/)
