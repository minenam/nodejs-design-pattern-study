# Chapter 03. 콜백과 이벤트 - 심화 학습 자료

> [!INFO]
> **핵심 개념**
> - 동기: 순차적으로 처리
> - 비동기: 순차적이지 않음 (나중에 처리)
> - 블로킹: 작업이 완료될 때까지 기다림
> - 논블로킹: 작업이 완료될 때까지 기다리지 않음

## 1. 콜백 패턴의 이해

### 1.1 클로저 (Closures)

클로저는 함수와 그 함수가 선언된 렉시컬 환경의 조합입니다. 콜백 패턴에서 핵심적인 역할을 합니다.

```javascript
// 클로저 기본 예제
function outerFunction(x) {
  // 외부 함수의 변수
  return function innerFunction(y) {
    // 내부 함수에서 외부 함수의 변수에 접근
    return x + y;
  };
}

const addFive = outerFunction(5);
console.log(addFive(3)); // 8

// 콜백에서의 클로저 활용
function createCallback(message) {
  return function(data) {
    console.log(`${message}: ${data}`);
  };
}

const successCallback = createCallback("Success");
const errorCallback = createCallback("Error");

// 비동기 작업에서 클로저 활용
function processData(data, callback) {
  setTimeout(() => {
    if (data) {
      callback(null, `Processed: ${data}`);
    } else {
      callback(new Error("No data provided"));
    }
  }, 1000);
}

processData("test", successCallback); // "Success: Processed: test"
```

### 1.2 함수형 프로그래밍 - 연속 전달 방식 (CPS, Continuation-Passing Style)

CPS는 함수가 값을 직접 반환하는 대신 콜백 함수에 결과를 전달하는 프로그래밍 스타일입니다.

#### 1.2.1 비동기 연속 전달 방식

```javascript
// 기본 CPS 예제
function addAsync(a, b, callback) {
  setTimeout(() => callback(a + b), 1000);
}

console.log("Start");
addAsync(2, 3, (result) => {
  console.log(`Result: ${result}`);
});
console.log("End");

// 실제 파일 시스템 예제
const fs = require('fs');

function readFileAsync(filename, callback) {
  fs.readFile(filename, 'utf8', (err, data) => {
    if (err) {
      callback(err, null);
    } else {
      callback(null, data);
    }
  });
}

// 체이닝 예제
function processFile(filename, callback) {
  readFileAsync(filename, (err, data) => {
    if (err) {
      callback(err);
      return;
    }
    
    // 데이터 처리
    const processedData = data.toUpperCase();
    callback(null, processedData);
  });
}
```

**CPS의 특징:**
- 단순히 결과를 반환하는 것 대신 다른 함수(콜백 함수)에 결과를 전달
- 비동기 작업이 완료되면 실행은 비동기 함수에 제공된 콜백에서부터 재개
- 실행은 이벤트 루프에서 시작되어 새로운 스택을 가짐
- 클로저 덕분에 콜백이 다른 시점과 다른 위치에서 호출되더라도 비동기 함수의 호출자 컨텍스트를 유지

#### 1.2.2 비연속 전달(Non-CPS) 방식

```javascript
// 동기적 처리 - 직접 반환
const result = [1, 3, 5].map((x) => x * 2);
console.log(result); // [2, 6, 10]

// 함수형 프로그래밍에서의 콜백 활용
const numbers = [1, 2, 3, 4, 5];

// filter, map, reduce 등은 Non-CPS
const evenNumbers = numbers.filter(n => n % 2 === 0);
const doubled = numbers.map(n => n * 2);
const sum = numbers.reduce((acc, n) => acc + n, 0);

console.log({ evenNumbers, doubled, sum });
```

### 1.3 Zalgo 문제와 해결책

Zalgo는 비동기와 동기 API를 명확하게 정의하지 않고 혼재하여 호출 결과가 예측할 수 없는 상황을 말합니다.

```javascript
// 문제가 있는 코드 - Zalgo 패턴
const cache = {};

function inconsistentRead(filename, callback) {
  if (cache[filename]) {
    // 동기적으로 즉시 호출
    callback(cache[filename]);
  } else {
    // 비동기적으로 호출
    fs.readFile(filename, 'utf8', (err, data) => {
      cache[filename] = data;
      callback(data);
    });
  }
}

// 해결책 1: process.nextTick() 사용
function consistentRead(filename, callback) {
  if (cache[filename]) {
    // 비동기적으로 만들기
    process.nextTick(() => callback(cache[filename]));
  } else {
    fs.readFile(filename, 'utf8', (err, data) => {
      cache[filename] = data;
      callback(data);
    });
  }
}

// 해결책 2: setImmediate() 사용
function consistentReadImmediate(filename, callback) {
  if (cache[filename]) {
    setImmediate(() => callback(cache[filename]));
  } else {
    fs.readFile(filename, 'utf8', (err, data) => {
      cache[filename] = data;
      callback(data);
    });
  }
}
```

**process.nextTick() vs setImmediate():**
- `process.nextTick()`: 현재 이벤트 루프 페이즈가 완료되기 전에 실행 (마이크로태스크)
- `setImmediate()`: 다음 이벤트 루프 사이클에서 실행 (매크로태스크)

```javascript
// 실행 순서 비교
console.log('start');

setImmediate(() => console.log('setImmediate'));
process.nextTick(() => console.log('nextTick'));

console.log('end');

// 출력 순서:
// start
// end
// nextTick
// setImmediate
```

## 2. Node.js 콜백 규칙과 패턴

### 2.1 콜백 규칙

```javascript
// 1. 콜백은 항상 마지막 인수
fs.readFile(filename, encoding, callback);
http.get(url, options, callback);

// 2. 에러 우선 콜백 패턴 (Error-First Callback)
function processData(data, callback) {
  try {
    const result = heavyProcessing(data);
    callback(null, result); // 성공: 첫 번째 인수는 null
  } catch (error) {
    callback(error); // 실패: 첫 번째 인수는 에러
  }
}

// 사용 예제
processData(inputData, (err, result) => {
  if (err) {
    console.error('Error:', err.message);
    return;
  }
  console.log('Result:', result);
});
```

### 2.2 에러 전파와 처리

```javascript
// 에러 전파 예제
function readAndProcess(filename, callback) {
  fs.readFile(filename, 'utf8', (err, data) => {
    if (err) {
      // 에러를 상위로 전파
      callback(err);
      return;
    }
    
    try {
      const processed = JSON.parse(data);
      callback(null, processed);
    } catch (parseError) {
      // 파싱 에러도 전파
      callback(parseError);
    }
  });
}

// Fail-fast 접근법
function validateAndProcess(data, callback) {
  // 빠른 검증
  if (!data) {
    callback(new Error('Data is required'));
    return;
  }
  
  if (typeof data !== 'string') {
    callback(new Error('Data must be a string'));
    return;
  }
  
  // 실제 처리
  processData(data, callback);
}
```

## 3. 실전 콜백 패턴 예제

### 3.1 순차 실행 패턴

```javascript
// 여러 비동기 작업을 순차적으로 실행
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
      if (err) {
        callback(err);
        return;
      }
      
      results.push(result);
      currentIndex++;
      executeNext();
    });
  }
  
  executeNext();
}

// 사용 예제
const tasks = [
  (cb) => setTimeout(() => cb(null, 'Task 1'), 1000),
  (cb) => setTimeout(() => cb(null, 'Task 2'), 500),
  (cb) => setTimeout(() => cb(null, 'Task 3'), 800)
];

sequentialExecution(tasks, (err, results) => {
  if (err) {
    console.error('Error:', err);
  } else {
    console.log('Results:', results);
  }
});
```

### 3.2 병렬 실행 패턴

```javascript
// 여러 비동기 작업을 병렬로 실행
function parallelExecution(tasks, callback) {
  let results = [];
  let completed = 0;
  let hasError = false;
  
  if (tasks.length === 0) {
    callback(null, []);
    return;
  }
  
  tasks.forEach((task, index) => {
    task((err, result) => {
      if (hasError) return;
      
      if (err) {
        hasError = true;
        callback(err);
        return;
      }
      
      results[index] = result;
      completed++;
      
      if (completed === tasks.length) {
        callback(null, results);
      }
    });
  });
}
```

### 3.3 제한된 병렬 실행 패턴

```javascript
// 동시 실행 개수를 제한하는 패턴
function limitedParallelExecution(tasks, limit, callback) {
  let results = [];
  let running = 0;
  let completed = 0;
  let index = 0;
  
  function executeNext() {
    while (running < limit && index < tasks.length) {
      const currentIndex = index++;
      const task = tasks[currentIndex];
      running++;
      
      task((err, result) => {
        running--;
        completed++;
        
        if (err) {
          callback(err);
          return;
        }
        
        results[currentIndex] = result;
        
        if (completed === tasks.length) {
          callback(null, results);
        } else {
          executeNext();
        }
      });
    }
  }
  
  executeNext();
}
```

## 4. 콜백 지옥과 해결 방안

### 4.1 콜백 지옥 예제

```javascript
// 콜백 지옥 - 피해야 할 패턴
fs.readFile('file1.txt', (err, data1) => {
  if (err) throw err;
  fs.readFile('file2.txt', (err, data2) => {
    if (err) throw err;
    fs.readFile('file3.txt', (err, data3) => {
      if (err) throw err;
      // 더 깊어지는 중첩...
      console.log(data1 + data2 + data3);
    });
  });
});
```

### 4.2 해결 방안

```javascript
// 1. 함수 분리
function readFile1(callback) {
  fs.readFile('file1.txt', callback);
}

function readFile2(data1, callback) {
  fs.readFile('file2.txt', (err, data2) => {
    if (err) return callback(err);
    callback(null, data1, data2);
  });
}

function readFile3(data1, data2, callback) {
  fs.readFile('file3.txt', (err, data3) => {
    if (err) return callback(err);
    callback(null, data1 + data2 + data3);
  });
}

// 2. 유틸리티 함수 사용
function waterfall(tasks, callback) {
  let index = 0;
  
  function next(...args) {
    if (index >= tasks.length) {
      callback(null, ...args.slice(1));
      return;
    }
    
    const task = tasks[index++];
    task(...args, (err, ...results) => {
      if (err) {
        callback(err);
        return;
      }
      next(null, ...results);
    });
  }
  
  next();
}
```

## 5. 실습 코드

### 5.1 파일 처리 시스템

```javascript
const fs = require('fs');
const path = require('path');

class FileProcessor {
  constructor() {
    this.cache = new Map();
  }
  
  readFile(filename, callback) {
    if (this.cache.has(filename)) {
      process.nextTick(() => {
        callback(null, this.cache.get(filename));
      });
      return;
    }
    
    fs.readFile(filename, 'utf8', (err, data) => {
      if (err) {
        callback(err);
        return;
      }
      
      this.cache.set(filename, data);
      callback(null, data);
    });
  }
  
  processFiles(filenames, processor, callback) {
    const results = [];
    let completed = 0;
    
    if (filenames.length === 0) {
      callback(null, []);
      return;
    }
    
    filenames.forEach((filename, index) => {
      this.readFile(filename, (err, data) => {
        if (err) {
          callback(err);
          return;
        }
        
        processor(data, (err, processed) => {
          if (err) {
            callback(err);
            return;
          }
          
          results[index] = processed;
          completed++;
          
          if (completed === filenames.length) {
            callback(null, results);
          }
        });
      });
    });
  }
}

// 사용 예제
const processor = new FileProcessor();

processor.processFiles(
  ['file1.txt', 'file2.txt'],
  (data, cb) => {
    // 데이터 처리 로직
    const processed = data.toUpperCase();
    setTimeout(() => cb(null, processed), 100);
  },
  (err, results) => {
    if (err) {
      console.error('Error:', err);
    } else {
      console.log('Processed files:', results);
    }
  }
);
```

## 6. 성능 고려사항

### 6.1 메모리 누수 방지

```javascript
// 잘못된 예제 - 메모리 누수 가능성
function createLeakyCallback() {
  const largeData = new Array(1000000).fill('data');
  
  return function callback(err, result) {
    // largeData가 클로저에 의해 참조됨
    if (err) {
      console.error('Error occurred');
    } else {
      console.log('Success');
    }
  };
}

// 개선된 예제
function createOptimizedCallback() {
  return function callback(err, result) {
    if (err) {
      console.error('Error occurred');
    } else {
      console.log('Success');
    }
  };
}
```

### 6.2 에러 처리 최적화

```javascript
// 에러 처리 유틸리티
function safeCallback(callback) {
  let called = false;
  
  return function(err, ...args) {
    if (called) {
      console.warn('Callback called multiple times');
      return;
    }
    called = true;
    callback(err, ...args);
  };
}

// 사용 예제
function riskyOperation(callback) {
  const safeCallback = safeCallback(callback);
  
  // 여러 조건에서 콜백이 호출될 수 있는 상황
  setTimeout(() => safeCallback(null, 'result1'), 100);
  setTimeout(() => safeCallback(null, 'result2'), 200); // 경고 출력
}
```

## 7. 참고 자료

- [MDN - Closures](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Closures)
- [Continuation-passing style - Wikipedia](https://en.wikipedia.org/wiki/Continuation-passing_style)
- [Designing APIs for Asynchrony](https://blog.izs.me/2013/08/designing-apis-for-asynchrony/)
- [Node.js Event Loop](https://nodejs.org/en/docs/guides/event-loop-timers-and-nexttick/)

## 8. 핵심 정리

1. **클로저**는 콜백 패턴의 핵심으로, 비동기 실행 시에도 컨텍스트를 유지
2. **CPS**는 결과를 직접 반환하지 않고 콜백으로 전달하는 패턴
3. **Zalgo 문제**를 피하기 위해 일관된 비동기 동작 보장
4. **에러 우선 콜백**으로 일관된 에러 처리
5. **콜백 지옥**을 피하기 위한 함수 분리와 유틸리티 활용
6. **메모리 누수**와 **중복 호출** 방지를 위한 안전장치 구현
