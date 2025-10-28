/**
 * 이벤트 루프 동작 예제
 *
 * Node.js 이벤트 루프의 각 단계와 우선순위를 시연합니다.
 * - setTimeout vs setImmediate vs process.nextTick
 * - 마이크로태스크 vs 매크로태스크
 */

console.log("=== 이벤트 루프 동작 예제 ===\n");

/**
 * 이벤트 루프의 6가지 단계 (Phases)
 *
 * ┌───────────────────────────┐
 * │        timers             │ ← setTimeout, setInterval
 * └─────────────┬─────────────┘
 * ┌─────────────┴─────────────┐
 * │     pending callbacks     │ ← I/O 콜백 (일부)
 * └─────────────┬─────────────┘
 * ┌─────────────┴─────────────┐
 * │       idle, prepare       │ ← 내부용
 * └─────────────┬─────────────┘
 * ┌─────────────┴─────────────┐
 * │          poll             │ ← 새로운 I/O 이벤트, I/O 콜백
 * └─────────────┬─────────────┘
 * ┌─────────────┴─────────────┐
 * │          check            │ ← setImmediate
 * └─────────────┬─────────────┘
 * ┌─────────────┴─────────────┐
 * │      close callbacks      │ ← socket.on('close', ...)
 * └───────────────────────────┘
 *
 * 각 단계 사이에 process.nextTick과 Promise 마이크로태스크가 실행됨
 */

console.log("📊 이벤트 루프 단계별 실행 순서:\n");

/**
 * 예제 1: 기본 실행 순서
 */
function basicEventLoopOrder() {
  console.log("--- 예제 1: 기본 실행 순서 ---\n");

  console.log("1. 동기 코드 시작");

  // setTimeout: timers 단계에서 실행
  setTimeout(() => {
    console.log("4. setTimeout (timers 단계)");
  }, 0);

  // setImmediate: check 단계에서 실행
  setImmediate(() => {
    console.log("5. setImmediate (check 단계)");
  });

  // process.nextTick: 현재 작업이 끝난 직후 (각 단계 사이)
  process.nextTick(() => {
    console.log("2. process.nextTick (현재 작업 직후)");
  });

  // Promise: 마이크로태스크 (nextTick 다음)
  Promise.resolve().then(() => {
    console.log("3. Promise.then (마이크로태스크)");
  });

  console.log("1. 동기 코드 끝\n");

  setTimeout(() => {
    console.log(""); // 빈 줄
    nestedEventLoop();
  }, 50);
}

/**
 * 예제 2: 중첩된 이벤트 루프
 */
function nestedEventLoop() {
  console.log("--- 예제 2: 중첩된 비동기 작업 ---\n");

  setTimeout(() => {
    console.log("1. setTimeout 1 (0ms)");

    process.nextTick(() => {
      console.log("  → nextTick in setTimeout 1");
    });

    Promise.resolve().then(() => {
      console.log("  → Promise in setTimeout 1");
    });
  }, 0);

  setTimeout(() => {
    console.log("2. setTimeout 2 (0ms)");
  }, 0);

  setImmediate(() => {
    console.log("3. setImmediate 1");

    process.nextTick(() => {
      console.log("  → nextTick in setImmediate");
    });
  });

  setImmediate(() => {
    console.log("4. setImmediate 2\n");

    setTimeout(() => {
      priorityDemo();
    }, 50);
  });
}

/**
 * 예제 3: 우선순위 비교
 */
function priorityDemo() {
  console.log("--- 예제 3: 우선순위 비교 ---\n");
  console.log("실행 순서: nextTick > Promise > setTimeout > setImmediate\n");

  setTimeout(() => console.log("4. setTimeout"), 0);
  setImmediate(() => console.log("5. setImmediate"));
  process.nextTick(() => console.log("1. nextTick 1"));
  process.nextTick(() => console.log("2. nextTick 2"));
  Promise.resolve().then(() => console.log("3. Promise"));

  setTimeout(() => {
    console.log("");
    microtaskVsMacrotask();
  }, 50);
}

/**
 * 예제 4: 마이크로태스크 vs 매크로태스크
 */
function microtaskVsMacrotask() {
  console.log("--- 예제 4: 마이크로태스크 vs 매크로태스크 ---\n");

  console.log("매크로태스크 (Macrotask):");
  console.log("  - setTimeout, setInterval, setImmediate");
  console.log("  - I/O 작업");
  console.log("");
  console.log("마이크로태스크 (Microtask):");
  console.log("  - process.nextTick (가장 높은 우선순위)");
  console.log("  - Promise.then, async/await");
  console.log("");

  // 매크로태스크
  setTimeout(() => {
    console.log("매크로: setTimeout");
  }, 0);

  // 마이크로태스크
  Promise.resolve().then(() => {
    console.log("마이크로: Promise 1");

    // 마이크로태스크 내에서 또 다른 마이크로태스크
    Promise.resolve().then(() => {
      console.log("  → 마이크로: 중첩 Promise");
    });
  });

  Promise.resolve().then(() => {
    console.log("마이크로: Promise 2");
  });

  process.nextTick(() => {
    console.log("마이크로: nextTick (최우선)");
  });

  setTimeout(() => {
    console.log("");
    ioOperationDemo();
  }, 50);
}

/**
 * 예제 5: I/O 작업과 이벤트 루프
 */
function ioOperationDemo() {
  console.log("--- 예제 5: I/O 작업과 이벤트 루프 ---\n");

  const fs = require("fs");
  const path = require("path");

  // 테스트 파일 생성
  const testFile = path.join(__dirname, "temp-event-loop.txt");
  fs.writeFileSync(testFile, "Test content for event loop");

  console.log("동기 코드 시작");

  // I/O 작업 (poll 단계에서 처리)
  fs.readFile(testFile, "utf8", (err, data) => {
    console.log("3. I/O 콜백 (poll 단계)");

    // I/O 콜백 내에서의 setImmediate는 다음 check 단계에서 즉시 실행
    setImmediate(() => {
      console.log("  → setImmediate in I/O (다음 check 단계)");
    });

    // I/O 콜백 내에서의 setTimeout은 다음 루프의 timers 단계
    setTimeout(() => {
      console.log("  → setTimeout in I/O (다음 루프 timers 단계)");
    }, 0);

    // 파일 삭제
    fs.unlinkSync(testFile);
  });

  // 이것들은 I/O보다 먼저 실행됨
  process.nextTick(() => {
    console.log("1. nextTick (I/O 전)");
  });

  Promise.resolve().then(() => {
    console.log("2. Promise (I/O 전)");
  });

  console.log("동기 코드 끝\n");

  setTimeout(() => {
    realWorldExample();
  }, 100);
}

/**
 * 예제 6: 실무 패턴
 */
function realWorldExample() {
  console.log("\n--- 예제 6: 실무 적용 패턴 ---\n");

  console.log("패턴 1: 무거운 계산 작업 분할\n");

  let count = 0;
  const heavyTask = () => {
    if (count < 3) {
      console.log(`  작업 ${count + 1} 실행 중...`);
      count++;

      // setImmediate로 다음 이벤트 루프로 넘겨서 I/O 블로킹 방지
      setImmediate(heavyTask);
    } else {
      console.log("  모든 작업 완료!\n");
      errorHandlingPattern();
    }
  };

  heavyTask();
}

/**
 * 예제 7: 에러 처리 패턴
 */
function errorHandlingPattern() {
  console.log("패턴 2: process.nextTick을 이용한 에러 처리\n");

  function asyncOperation(shouldFail, callback) {
    // 동기적 검증
    if (shouldFail === undefined) {
      // process.nextTick으로 비동기 스타일 유지
      return process.nextTick(() => {
        callback(new Error("shouldFail is required"));
      });
    }

    // 비동기 작업
    setTimeout(() => {
      if (shouldFail) {
        callback(new Error("Operation failed"));
      } else {
        callback(null, "Success!");
      }
    }, 10);
  }

  asyncOperation(undefined, (err, result) => {
    if (err) {
      console.log(`  ✓ 에러 처리: ${err.message}`);
    }
  });

  asyncOperation(false, (err, result) => {
    if (!err) {
      console.log(`  ✓ 성공 처리: ${result}\n`);
    }

    setTimeout(() => {
      printSummary();
    }, 50);
  });
}

/**
 * 요약
 */
function printSummary() {
  console.log("=== 이벤트 루프 요약 ===\n");

  console.log("📌 실행 우선순위:");
  console.log("  1. 동기 코드");
  console.log("  2. process.nextTick");
  console.log("  3. Promise (마이크로태스크)");
  console.log("  4. setTimeout/setInterval (timers 단계)");
  console.log("  5. I/O 콜백 (poll 단계)");
  console.log("  6. setImmediate (check 단계)");
  console.log("");

  console.log("💡 Best Practices:");
  console.log("  ✓ CPU 집약적 작업은 setImmediate로 분할");
  console.log(
    "  ✓ process.nextTick은 신중하게 사용 (재귀 시 이벤트 루프 블로킹)"
  );
  console.log("  ✓ I/O 콜백 내에서 즉시 실행이 필요하면 setImmediate 사용");
  console.log("  ✓ 일반적인 비동기는 Promise/async-await 권장");
  console.log("");

  console.log("⚠️  주의사항:");
  console.log("  - process.nextTick 재귀는 이벤트 루프 블로킹 가능");
  console.log(
    "  - setTimeout(fn, 0)과 setImmediate는 실행 순서가 불확실할 수 있음"
  );
  console.log("  - I/O 작업 내에서는 setImmediate가 setTimeout보다 빠름");
  console.log("");

  console.log("🔗 연관 개념:");
  console.log("  - Reactor 패턴: 이벤트 루프의 이론적 기반");
  console.log("  - libuv: 이벤트 루프의 실제 구현");
  console.log("  - V8: JavaScript 실행 엔진");
}

// 실행
basicEventLoopOrder();
