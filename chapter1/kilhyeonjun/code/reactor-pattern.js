/**
 * Reactor 패턴 구현 예제
 *
 * Node.js의 핵심 패턴인 Reactor 패턴을 간단히 구현합니다.
 * 실제 Node.js는 libuv를 사용하지만, 여기서는 교육 목적으로 시뮬레이션합니다.
 */

const fs = require("fs");
const path = require("path");

console.log("=== Reactor 패턴 구현 예제 ===\n");

/**
 * 이벤트 디멀티플렉서 시뮬레이션
 * - 실제로는 OS의 epoll, kqueue, IOCP 등을 사용
 * - 여기서는 간단한 콜백 큐로 시뮬레이션
 */
class EventDemultiplexer {
  constructor() {
    this.watchedResources = new Map(); // { resource: { operation, handler } }
    this.eventQueue = [];
  }

  /**
   * 리소스 관찰 등록
   */
  watch(resource, operation, handler) {
    console.log(
      `[디멀티플렉서] 리소스 등록: ${resource.name}, 작업: ${operation}`
    );
    this.watchedResources.set(resource, { operation, handler });

    // 실제 I/O 작업 시작 (논블로킹)
    this.startAsyncOperation(resource, operation, handler);
  }

  /**
   * 리소스 관찰 해제
   */
  unwatch(resource) {
    console.log(`[디멀티플렉서] 리소스 해제: ${resource.name}`);
    this.watchedResources.delete(resource);
  }

  /**
   * 비동기 작업 시작 (실제로는 OS가 처리)
   */
  startAsyncOperation(resource, operation, handler) {
    // 파일 읽기 시뮬레이션
    if (operation === "READ") {
      fs.readFile(resource.path, "utf8", (err, data) => {
        // I/O 완료 시 이벤트 큐에 추가
        this.eventQueue.push({
          resource,
          handler,
          data: err ? null : data,
          error: err,
        });
      });
    }
  }

  /**
   * 이벤트 가져오기 (블로킹 - 이벤트가 있을 때까지 대기)
   * 실제로는 여기서 블로킹되지만, JavaScript는 이벤트 루프가 처리
   */
  getEvents() {
    if (this.eventQueue.length > 0) {
      return this.eventQueue.shift();
    }
    return null;
  }

  hasEvents() {
    return this.eventQueue.length > 0;
  }
}

/**
 * Reactor 패턴 구현
 * - 이벤트 루프의 핵심 로직
 */
class Reactor {
  constructor() {
    this.demultiplexer = new EventDemultiplexer();
    this.isRunning = false;
    this.pendingOperations = 0;
  }

  /**
   * I/O 작업 등록
   */
  registerIO(resource, operation, handler) {
    console.log(`[Reactor] I/O 작업 등록: ${resource.name}`);
    this.pendingOperations++;

    // 핸들러를 래핑하여 완료 시 카운터 감소
    const wrappedHandler = (data, error) => {
      handler(data, error);
      this.pendingOperations--;
    };

    // 디멀티플렉서에 등록
    this.demultiplexer.watch(resource, operation, wrappedHandler);
  }

  /**
   * 이벤트 루프 시작
   */
  run() {
    console.log("\n[Reactor] 이벤트 루프 시작\n");
    this.isRunning = true;
    this.eventLoop();
  }

  /**
   * 이벤트 루프 (핵심!)
   */
  eventLoop() {
    // 더 이상 처리할 작업이 없으면 종료
    if (this.pendingOperations === 0) {
      console.log("\n[Reactor] 모든 작업 완료 - 이벤트 루프 종료");
      this.isRunning = false;
      return;
    }

    // 이벤트 가져오기
    const event = this.demultiplexer.getEvents();

    if (event) {
      console.log(`[이벤트 루프] 이벤트 처리: ${event.resource.name}`);

      // 핸들러 실행
      event.handler(event.data, event.error);
    }

    // 다음 이벤트 루프 스케줄링
    if (this.isRunning) {
      setImmediate(() => this.eventLoop());
    }
  }
}

/**
 * 리소스 클래스 (파일을 추상화)
 */
class Resource {
  constructor(name, filePath) {
    this.name = name;
    this.path = filePath;
  }
}

/**
 * 실제 사용 예제
 */
function demonstrateReactorPattern() {
  console.log("📚 Reactor 패턴 동작 과정\n");

  // 1. Reactor 인스턴스 생성
  const reactor = new Reactor();

  // 2. 테스트 파일 준비
  const testDir = path.join(__dirname, "temp");
  if (!fs.existsSync(testDir)) {
    fs.mkdirSync(testDir);
  }

  const files = [];
  for (let i = 1; i <= 3; i++) {
    const filePath = path.join(testDir, `reactor-test${i}.txt`);
    fs.writeFileSync(filePath, `Content from file ${i}\n`.repeat(10));
    files.push(new Resource(`File${i}`, filePath));
  }

  console.log("📁 테스트 파일 생성 완료\n");

  // 3. I/O 작업 등록 (애플리케이션 코드)
  console.log("--- 단계 1: 애플리케이션이 I/O 작업 등록 ---\n");

  files.forEach((file, index) => {
    reactor.registerIO(file, "READ", (data, error) => {
      if (error) {
        console.log(`  ❌ [핸들러] ${file.name} 읽기 실패`);
        return;
      }
      console.log(
        `  ✅ [핸들러] ${file.name} 읽기 성공 (${data.length} bytes)`
      );

      // 핸들러 실행 중 새로운 비동기 작업 요청 가능
      if (index === 0) {
        console.log(`  → [핸들러] ${file.name} 처리 중 추가 작업 요청 가능`);
      }
    });
  });

  console.log("\n--- 단계 2: 이벤트 루프 시작 ---");

  // 4. Reactor 실행 (이벤트 루프 시작)
  reactor.run();

  // 5. 정리 (이벤트 루프가 종료된 후)
  setTimeout(() => {
    console.log("\n🧹 정리: 테스트 파일 삭제");
    files.forEach((file) => {
      fs.unlinkSync(file.path);
    });
    fs.rmdirSync(testDir);

    printSummary();
  }, 200);
}

/**
 * Reactor 패턴 흐름 다이어그램
 */
function printReactorFlow() {
  console.log("\n📊 Reactor 패턴 동작 흐름:\n");
  console.log("┌─────────────────┐");
  console.log("│  애플리케이션    │");
  console.log("└────────┬────────┘");
  console.log("         │ 1. I/O 요청 + 핸들러 제출");
  console.log("         ↓");
  console.log("┌─────────────────┐");
  console.log("│ 이벤트 디멀티플  │");
  console.log("│   렉서          │ ← 리소스, 작업, 핸들러 저장");
  console.log("└────────┬────────┘");
  console.log("         │ 2. I/O 완료 → 이벤트 큐에 추가");
  console.log("         ↓");
  console.log("┌─────────────────┐");
  console.log("│  이벤트 루프     │ ← 3. 이벤트 큐 순회");
  console.log("└────────┬────────┘");
  console.log("         │ 4. 각 이벤트의 핸들러 실행");
  console.log("         ↓");
  console.log("   ┌─────┴─────┐");
  console.log("   │           │");
  console.log("5a.│제어권 반환  │  5b.새 비동기 작업 요청");
  console.log("   │           │      (1로 돌아감)");
  console.log("   └───────────┘");
  console.log("         │ 6. 모든 이벤트 처리 완료");
  console.log("         ↓");
  console.log("  [디멀티플렉서 대기]");
  console.log("");
}

/**
 * 요약
 */
function printSummary() {
  console.log("\n=== Reactor 패턴 요약 ===\n");
  console.log("✓ 핵심 아이디어:");
  console.log("  - 각 I/O 작업에 핸들러(콜백) 연결");
  console.log("  - 이벤트 발생 시 해당 핸들러 실행");
  console.log("");
  console.log("✓ 주요 구성 요소:");
  console.log("  1. 이벤트 디멀티플렉서: 여러 리소스 관찰, 준비된 이벤트 반환");
  console.log("  2. 이벤트 큐: 완료된 I/O 작업의 이벤트 저장");
  console.log("  3. 이벤트 루프: 이벤트 큐를 순회하며 핸들러 실행");
  console.log("");
  console.log("✓ 장점:");
  console.log("  - 단일 스레드로 동시성 구현");
  console.log("  - 효율적인 리소스 사용");
  console.log("  - 확장성이 뛰어남");
  console.log("");
  console.log("✓ Node.js 구현:");
  console.log("  - libuv가 이벤트 디멀티플렉서 역할");
  console.log("  - V8이 JavaScript 실행");
  console.log("  - 콜백, Promise, async/await은 모두 이 패턴 기반");
  console.log("");
  console.log(
    "다음: event-loop-demo.js에서 이벤트 루프의 상세 동작을 확인하세요!"
  );
}

// 실행
printReactorFlow();
demonstrateReactorPattern();
