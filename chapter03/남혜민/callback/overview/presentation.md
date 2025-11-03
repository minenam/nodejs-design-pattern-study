# Node.js 디자인 패턴 바이블 Chapter 3
## 콜백과 이벤트 - 심화 발표 자료

---

## 📋 목차

1. [콜백 패턴의 핵심 개념](#1-콜백-패턴의-핵심-개념)
2. [클로저와 콜백의 관계](#2-클로저와-콜백의-관계)
3. [연속 전달 방식 (CPS) 심화](#3-연속-전달-방식-cps-심화)
4. [Zalgo 문제와 해결책](#4-zalgo-문제와-해결책)
5. [Node.js 콜백 규칙과 패턴](#5-nodejs-콜백-규칙과-패턴)
6. [이벤트 루프와 콜백 실행](#6-이벤트-루프와-콜백-실행)
7. [콜백 패턴의 한계와 해결방안](#7-콜백-패턴의-한계와-해결방안)
8. [실무 적용 사례](#8-실무-적용-사례)

---

## 1. 콜백 패턴의 핵심 개념

### 1.1 동기 vs 비동기의 본질

**동기 처리의 특징:**
- 코드가 순차적으로 실행
- 하나의 작업이 완료될 때까지 다음 작업 대기
- 예측 가능한 실행 흐름
- 블로킹 I/O로 인한 성능 저하 가능

**비동기 처리의 특징:**
- 작업을 시작하고 즉시 다음 코드 실행
- 작업 완료 시 콜백 함수로 결과 처리
- 논블로킹 I/O로 높은 동시성 달성
- 실행 순서가 예측하기 어려움

### 1.2 콜백의 정의와 역할

> **콜백(Callback)**은 다른 함수에 인수로 전달되어, 특정 시점에 호출되는 함수입니다.

**콜백의 핵심 역할:**
1. **제어 흐름 관리**: 비동기 작업 완료 후 실행할 로직 정의
2. **결과 전달**: 비동기 작업의 결과를 받아 처리
3. **에러 처리**: 작업 중 발생한 오류를 적절히 처리
4. **컨텍스트 유지**: 클로저를 통해 호출 시점의 환경 보존

---

## 2. 클로저와 콜백의 관계

### 2.1 클로저의 메커니즘

클로저는 함수와 그 함수가 선언된 렉시컬 환경의 조합으로, 콜백 패턴에서 핵심적인 역할을 합니다.

**클로저가 해결하는 문제:**
- 비동기 콜백이 실행될 때 원래 컨텍스트에 접근
- 함수 스코프 밖의 변수에 대한 지속적인 참조
- 데이터 캡슐화와 프라이빗 변수 구현

### 2.2 콜백에서의 클로저 활용

```javascript
function createAsyncProcessor(config) {
  const { timeout, retries, onSuccess } = config;
  let attemptCount = 0;
  
  return function processData(data, callback) {
    attemptCount++; // 클로저로 상태 유지
    
    setTimeout(() => {
      if (Math.random() > 0.7 && attemptCount <= retries) {
        // 재시도 로직
        processData(data, callback);
      } else {
        onSuccess(`처리 완료: ${data} (시도: ${attemptCount}회)`);
        callback(null, data);
      }
    }, timeout);
  };
}
```

### 2.3 메모리 관리 고려사항

**클로저 사용 시 주의점:**
- 불필요한 변수 참조로 인한 메모리 누수
- 순환 참조 문제
- 가비지 컬렉션 방해 요소

---

## 3. 연속 전달 방식 (CPS) 심화

### 3.1 CPS의 이론적 배경

**연속 전달 방식(Continuation-Passing Style)**은 함수형 프로그래밍에서 나온 개념으로, 함수가 값을 직접 반환하는 대신 "다음에 할 일"을 나타내는 연속(continuation) 함수에 결과를 전달하는 방식입니다.

### 3.2 CPS의 장점과 특징

**장점:**
1. **명시적 제어 흐름**: 다음 실행될 코드가 명확히 표현됨
2. **비동기 처리 자연스러움**: 콜백이 자연스럽게 연속을 표현
3. **에러 처리 일관성**: 모든 결과가 콜백을 통해 전달됨
4. **합성 가능성**: 여러 CPS 함수를 쉽게 조합 가능

**특징:**
- 함수가 값을 반환하지 않음 (void 함수)
- 모든 결과는 콜백 함수로 전달
- 스택 프레임이 누적되지 않음 (꼬리 호출 최적화)

### 3.3 CPS 변환 예제

**직접 스타일 → CPS 변환:**

```javascript
// 직접 스타일 (Direct Style)
function add(a, b) {
  return a + b;
}

function multiply(a, b) {
  return a * b;
}

function calculate(x, y) {
  const sum = add(x, y);
  const result = multiply(sum, 2);
  return result;
}

// CPS 스타일 변환
function addCPS(a, b, callback) {
  callback(a + b);
}

function multiplyCPS(a, b, callback) {
  callback(a * b);
}

function calculateCPS(x, y, callback) {
  addCPS(x, y, (sum) => {
    multiplyCPS(sum, 2, (result) => {
      callback(result);
    });
  });
}
```

---

## 4. Zalgo 문제와 해결책

### 4.1 Zalgo 문제의 본질

**Zalgo**는 Isaac Z. Schlueter가 명명한 안티패턴으로, 함수가 때로는 동기적으로, 때로는 비동기적으로 동작하여 예측 불가능한 상황을 만드는 것을 의미합니다.

### 4.2 Zalgo가 발생하는 상황

```javascript
// 문제가 있는 코드
const cache = new Map();

function inconsistentRead(filename, callback) {
  if (cache.has(filename)) {
    // 동기적 실행 - 즉시 콜백 호출
    callback(cache.get(filename));
  } else {
    // 비동기적 실행 - 나중에 콜백 호출
    fs.readFile(filename, 'utf8', (err, data) => {
      cache.set(filename, data);
      callback(data);
    });
  }
}
```

### 4.3 Zalgo의 위험성

**예측 불가능한 동작:**
```javascript
let isCallbackCalled = false;

inconsistentRead('file.txt', (data) => {
  isCallbackCalled = true;
  console.log('콜백 실행됨');
});

if (!isCallbackCalled) {
  console.log('콜백이 아직 실행되지 않음');
}
// 캐시 상태에 따라 출력이 달라짐!
```

### 4.4 해결책과 모범 사례

**1. process.nextTick() 사용:**
```javascript
function consistentRead(filename, callback) {
  if (cache.has(filename)) {
    process.nextTick(() => callback(cache.get(filename)));
  } else {
    fs.readFile(filename, 'utf8', (err, data) => {
      cache.set(filename, data);
      callback(data);
    });
  }
}
```

**2. setImmediate() 사용:**
```javascript
function consistentReadImmediate(filename, callback) {
  if (cache.has(filename)) {
    setImmediate(() => callback(cache.get(filename)));
  } else {
    fs.readFile(filename, 'utf8', (err, data) => {
      cache.set(filename, data);
      callback(data);
    });
  }
}
```

### 4.5 process.nextTick vs setImmediate

| 특성 | process.nextTick | setImmediate |
|------|------------------|--------------|
| 실행 시점 | 현재 페이즈 완료 직후 | 다음 이벤트 루프 사이클 |
| 우선순위 | 매우 높음 (마이크로태스크) | 낮음 (매크로태스크) |
| I/O 기아 위험 | 있음 | 없음 |
| 사용 권장 | 일관성 보장 시 | 일반적인 지연 실행 |

---

## 5. Node.js 콜백 규칙과 패턴

### 5.1 에러 우선 콜백 (Error-First Callback)

Node.js의 핵심 규칙으로, 모든 콜백의 첫 번째 매개변수는 에러 객체입니다.

**규칙:**
1. 첫 번째 인수: 에러 객체 또는 null/undefined
2. 두 번째 인수부터: 실제 결과 데이터
3. 에러가 있으면 결과 데이터는 무시
4. 에러가 없으면 첫 번째 인수는 null

### 5.2 에러 처리 패턴

**기본 패턴:**
```javascript
function processData(data, callback) {
  if (!data) {
    callback(new Error('데이터가 필요합니다'));
    return;
  }
  
  try {
    const result = heavyProcessing(data);
    callback(null, result);
  } catch (error) {
    callback(error);
  }
}
```

**에러 전파 패턴:**
```javascript
function chainedOperation(input, callback) {
  step1(input, (err, result1) => {
    if (err) {
      callback(err); // 에러 전파
      return;
    }
    
    step2(result1, (err, result2) => {
      if (err) {
        callback(err); // 에러 전파
        return;
      }
      
      callback(null, result2);
    });
  });
}
```

### 5.3 Fail-Fast 원칙

**빠른 실패(Fail-Fast)** 접근법은 에러를 조기에 발견하고 즉시 처리하는 방식입니다.

**장점:**
- 디버깅이 쉬워짐
- 리소스 낭비 방지
- 시스템 안정성 향상
- 명확한 에러 메시지 제공

---

## 6. 이벤트 루프와 콜백 실행

### 6.1 이벤트 루프의 구조

Node.js의 이벤트 루프는 여러 페이즈로 구성되어 있습니다:

```
┌───────────────────────────┐
┌─>│           timers          │  ← setTimeout, setInterval
│  └─────────────┬─────────────┘
│  ┌─────────────┴─────────────┐
│  │     pending callbacks     │  ← I/O 콜백 (TCP 에러 등)
│  └─────────────┬─────────────┘
│  ┌─────────────┴─────────────┐
│  │       idle, prepare       │  ← 내부적으로만 사용
│  └─────────────┬─────────────┘
│  ┌─────────────┴─────────────┐
│  │           poll            │  ← 새로운 I/O 이벤트 가져오기
│  └─────────────┬─────────────┘
│  ┌─────────────┴─────────────┐
│  │           check           │  ← setImmediate 콜백
│  └─────────────┬─────────────┘
│  ┌─────────────┴─────────────┐
└──┤      close callbacks      │  ← socket.on('close', ...)
   └───────────────────────────┘
```

### 6.2 마이크로태스크 vs 매크로태스크

**마이크로태스크 (Microtask):**
- `process.nextTick()`
- `Promise.then()`, `Promise.catch()`, `Promise.finally()`
- `queueMicrotask()`

**매크로태스크 (Macrotask):**
- `setTimeout()`, `setInterval()`
- `setImmediate()`
- I/O 콜백
- UI 렌더링 (브라우저)

### 6.3 실행 우선순위

1. **동기 코드** 실행
2. **마이크로태스크 큐** 완전히 비우기
3. **매크로태스크** 하나 실행
4. 2-3 반복

### 6.4 I/O 기아 현상

`process.nextTick()`을 재귀적으로 호출하면 I/O 기아가 발생할 수 있습니다:

```javascript
// 위험한 코드
function recursiveNextTick() {
  process.nextTick(recursiveNextTick);
}

recursiveNextTick();

// 이 setTimeout은 절대 실행되지 않음
setTimeout(() => {
  console.log('이 코드는 실행되지 않습니다');
}, 0);
```

---

## 7. 콜백 패턴의 한계와 해결방안

### 7.1 콜백 지옥 (Callback Hell)

**문제점:**
- 중첩된 콜백으로 인한 가독성 저하
- 에러 처리의 복잡성
- 디버깅의 어려움
- 코드 재사용성 저하

**콜백 지옥 예제:**
```javascript
getData(function(a) {
  getMoreData(a, function(b) {
    getMoreData(b, function(c) {
      getMoreData(c, function(d) {
        getMoreData(d, function(e) {
          // 피라미드 오브 둠 (Pyramid of Doom)
        });
      });
    });
  });
});
```

### 7.2 해결 방안

**1. 함수 분리와 명명:**
```javascript
function handleA(a) {
  getMoreData(a, handleB);
}

function handleB(b) {
  getMoreData(b, handleC);
}

function handleC(c) {
  // 처리 로직
}

getData(handleA);
```

**2. 유틸리티 라이브러리 사용:**
- **async.js**: 비동기 제어 흐름 라이브러리
- **lodash**: 함수형 프로그래밍 유틸리티

**3. Promise와 async/await:**
```javascript
// Promise 체이닝
getData()
  .then(getMoreData)
  .then(getMoreData)
  .then(getMoreData)
  .catch(handleError);

// async/await
async function processData() {
  try {
    const a = await getData();
    const b = await getMoreData(a);
    const c = await getMoreData(b);
    return c;
  } catch (error) {
    handleError(error);
  }
}
```

### 7.3 콜백 패턴의 한계

1. **제어 역전 (Inversion of Control)**
   - 콜백 함수의 실행을 외부에 위임
   - 콜백이 호출되지 않을 위험
   - 콜백이 여러 번 호출될 위험

2. **에러 처리의 복잡성**
   - 각 단계마다 에러 처리 필요
   - 에러 전파의 복잡성
   - try-catch로 잡을 수 없는 비동기 에러

3. **합성의 어려움**
   - 여러 비동기 작업을 조합하기 어려움
   - 조건부 실행의 복잡성
   - 병렬 처리의 어려움

---

## 8. 실무 적용 사례

### 8.1 웹 서버에서의 콜백 활용

**Express.js 미들웨어 패턴:**
```javascript
function authMiddleware(req, res, next) {
  validateToken(req.headers.authorization, (err, user) => {
    if (err) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    req.user = user;
    next(); // 다음 미들웨어로 제어 전달
  });
}

app.get('/protected', authMiddleware, (req, res) => {
  res.json({ message: `Hello, ${req.user.name}` });
});
```

### 8.2 데이터베이스 연동

**MongoDB 콜백 패턴:**
```javascript
function findUserById(id, callback) {
  db.collection('users').findOne({ _id: id }, (err, user) => {
    if (err) {
      callback(err);
      return;
    }
    
    if (!user) {
      callback(new Error('User not found'));
      return;
    }
    
    callback(null, user);
  });
}
```

### 8.3 파일 시스템 작업

**파일 처리 파이프라인:**
```javascript
function processFile(inputPath, outputPath, callback) {
  fs.readFile(inputPath, 'utf8', (err, data) => {
    if (err) return callback(err);
    
    const processed = transformData(data);
    
    fs.writeFile(outputPath, processed, (err) => {
      if (err) return callback(err);
      
      callback(null, { 
        input: inputPath, 
        output: outputPath, 
        size: processed.length 
      });
    });
  });
}
```

### 8.4 성능 최적화 기법

**1. 콜백 캐싱:**
```javascript
const memoize = (fn) => {
  const cache = new Map();
  
  return function(key, callback) {
    if (cache.has(key)) {
      process.nextTick(() => callback(null, cache.get(key)));
      return;
    }
    
    fn(key, (err, result) => {
      if (err) return callback(err);
      
      cache.set(key, result);
      callback(null, result);
    });
  };
};
```

**2. 배치 처리:**
```javascript
function batchProcess(items, batchSize, processor, callback) {
  let processed = 0;
  let results = [];
  
  function processBatch(startIndex) {
    const batch = items.slice(startIndex, startIndex + batchSize);
    
    if (batch.length === 0) {
      return callback(null, results);
    }
    
    let batchCompleted = 0;
    
    batch.forEach((item, index) => {
      processor(item, (err, result) => {
        if (err) return callback(err);
        
        results[startIndex + index] = result;
        batchCompleted++;
        
        if (batchCompleted === batch.length) {
          processBatch(startIndex + batchSize);
        }
      });
    });
  }
  
  processBatch(0);
}
```

---

## 🎯 핵심 정리

### 콜백 패턴의 핵심 원칙

1. **일관성**: 항상 비동기적으로 동작하도록 보장
2. **에러 우선**: 첫 번째 매개변수는 항상 에러 객체
3. **단일 호출**: 콜백은 정확히 한 번만 호출
4. **빠른 실패**: 에러는 즉시 전파하고 처리
5. **클로저 활용**: 컨텍스트 유지를 위한 클로저 적극 활용

### 주의사항

- **Zalgo 문제** 방지를 위한 일관된 비동기 동작
- **메모리 누수** 방지를 위한 적절한 참조 관리
- **I/O 기아** 방지를 위한 적절한 마이크로태스크 사용
- **콜백 지옥** 방지를 위한 함수 분리와 명명

### 현대적 대안

콜백 패턴의 한계를 극복하기 위해 다음과 같은 대안들이 등장했습니다:

- **Promise**: 콜백 지옥 해결과 에러 처리 개선
- **async/await**: 동기적 코드처럼 작성 가능
- **Observable**: 스트림 기반 비동기 처리
- **Generator**: 코루틴 기반 비동기 제어

---

## 📚 참고 자료

- [MDN - Closures](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Closures)
- [Continuation-passing style - Wikipedia](https://en.wikipedia.org/wiki/Continuation-passing_style)
- [Designing APIs for Asynchrony - Isaac Z. Schlueter](https://blog.izs.me/2013/08/designing-apis-for-asynchrony/)
- [Node.js Event Loop Guide](https://nodejs.org/en/docs/guides/event-loop-timers-and-nexttick/)
- [JavaScript Event Loop Explained](https://javascript.info/event-loop)
- [Callback Hell - callbackhell.com](http://callbackhell.com/)

---

*이 자료는 Node.js 디자인 패턴 바이블 3장을 기반으로 작성되었으며, 실무에서의 경험과 최신 동향을 반영하여 보완되었습니다.*
