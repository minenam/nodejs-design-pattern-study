// Chapter 3 - 콜백 패턴 실습 코드

const fs = require('fs');
const path = require('path');

// 1. 클로저와 콜백
console.log('=== 1. 클로저와 콜백 ===');

function createMultiplier(factor) {
  return function(value, callback) {
    setTimeout(() => {
      const result = value * factor;
      callback(null, result);
    }, 100);
  };
}

const double = createMultiplier(2);
const triple = createMultiplier(3);

double(5, (err, result) => {
  console.log(`Double: ${result}`); // 10
});

triple(4, (err, result) => {
  console.log(`Triple: ${result}`); // 12
});

// 2. CPS vs Non-CPS 비교
console.log('\n=== 2. CPS vs Non-CPS ===');

// Non-CPS (동기)
function addSync(a, b) {
  return a + b;
}

// CPS (비동기)
function addAsync(a, b, callback) {
  setTimeout(() => {
    callback(null, a + b);
  }, 50);
}

console.log('Sync result:', addSync(2, 3));

addAsync(2, 3, (err, result) => {
  console.log('Async result:', result);
});

// 3. Zalgo 문제 시연
console.log('\n=== 3. Zalgo 문제 ===');

const cache = {};

// 문제가 있는 함수 (Zalgo)
function inconsistentRead(filename, callback) {
  if (cache[filename]) {
    callback(cache[filename]); // 동기적 호출
  } else {
    fs.readFile(filename, 'utf8', (err, data) => {
      if (err) {
        callback(err);
        return;
      }
      cache[filename] = data;
      callback(data); // 비동기적 호출
    });
  }
}

// 해결된 함수
function consistentRead(filename, callback) {
  if (cache[filename]) {
    process.nextTick(() => callback(cache[filename]));
  } else {
    fs.readFile(filename, 'utf8', (err, data) => {
      if (err) {
        callback(err);
        return;
      }
      cache[filename] = data;
      callback(data);
    });
  }
}

// 4. 에러 우선 콜백 패턴
console.log('\n=== 4. 에러 우선 콜백 ===');

function divideAsync(a, b, callback) {
  setTimeout(() => {
    if (b === 0) {
      callback(new Error('Division by zero'));
    } else {
      callback(null, a / b);
    }
  }, 100);
}

divideAsync(10, 2, (err, result) => {
  if (err) {
    console.error('Error:', err.message);
  } else {
    console.log('Division result:', result);
  }
});

divideAsync(10, 0, (err, result) => {
  if (err) {
    console.error('Error:', err.message);
  } else {
    console.log('Division result:', result);
  }
});

// 5. 순차 실행 패턴
console.log('\n=== 5. 순차 실행 ===');

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

const tasks = [
  (cb) => setTimeout(() => cb(null, 'Task 1 완료'), 300),
  (cb) => setTimeout(() => cb(null, 'Task 2 완료'), 100),
  (cb) => setTimeout(() => cb(null, 'Task 3 완료'), 200)
];

sequentialExecution(tasks, (err, results) => {
  if (err) {
    console.error('Sequential error:', err);
  } else {
    console.log('Sequential results:', results);
  }
});

// 6. 병렬 실행 패턴
console.log('\n=== 6. 병렬 실행 ===');

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

const parallelTasks = [
  (cb) => setTimeout(() => cb(null, 'Parallel Task 1'), 300),
  (cb) => setTimeout(() => cb(null, 'Parallel Task 2'), 100),
  (cb) => setTimeout(() => cb(null, 'Parallel Task 3'), 200)
];

parallelExecution(parallelTasks, (err, results) => {
  if (err) {
    console.error('Parallel error:', err);
  } else {
    console.log('Parallel results:', results);
  }
});

// 7. 제한된 병렬 실행
console.log('\n=== 7. 제한된 병렬 실행 ===');

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

const limitedTasks = [
  (cb) => setTimeout(() => cb(null, 'Limited 1'), 100),
  (cb) => setTimeout(() => cb(null, 'Limited 2'), 150),
  (cb) => setTimeout(() => cb(null, 'Limited 3'), 200),
  (cb) => setTimeout(() => cb(null, 'Limited 4'), 50),
  (cb) => setTimeout(() => cb(null, 'Limited 5'), 300)
];

limitedParallelExecution(limitedTasks, 2, (err, results) => {
  if (err) {
    console.error('Limited parallel error:', err);
  } else {
    console.log('Limited parallel results:', results);
  }
});

// 8. 안전한 콜백 래퍼
console.log('\n=== 8. 안전한 콜백 ===');

function safeCallback(callback) {
  let called = false;
  
  return function(err, ...args) {
    if (called) {
      console.warn('⚠️  콜백이 여러 번 호출됨');
      return;
    }
    called = true;
    callback(err, ...args);
  };
}

function riskyOperation(callback) {
  const safeCb = safeCallback(callback);
  
  // 실수로 여러 번 호출될 수 있는 상황
  setTimeout(() => safeCb(null, 'result1'), 100);
  setTimeout(() => safeCb(null, 'result2'), 200); // 경고 출력
}

riskyOperation((err, result) => {
  console.log('Safe callback result:', result);
});
