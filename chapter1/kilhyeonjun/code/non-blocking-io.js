/**
 * 논블로킹 I/O 예제
 *
 * 논블로킹 방식의 파일 읽기를 시연합니다.
 * 단일 스레드로 여러 파일을 동시에 처리할 수 있습니다.
 */

const fs = require("fs");
const path = require("path");

console.log("=== 논블로킹 I/O 예제 ===\n");

// 테스트용 임시 파일 생성
const testDir = path.join(__dirname, "temp");
if (!fs.existsSync(testDir)) {
  fs.mkdirSync(testDir);
}

// 3개의 테스트 파일 생성
for (let i = 1; i <= 3; i++) {
  const filePath = path.join(testDir, `file${i}.txt`);
  fs.writeFileSync(filePath, `This is content of file ${i}\n`.repeat(1000));
}

console.log("📁 테스트 파일 생성 완료\n");

/**
 * 논블로킹 방식으로 파일 읽기
 * - 모든 파일 읽기를 동시에 시작
 * - 각 파일이 준비되면 콜백 실행
 * - I/O 대기 중에도 다른 작업 가능
 */
function readFilesNonBlocking() {
  console.log("⚡ 논블로킹 방식으로 파일 읽기 시작...");
  const startTime = Date.now();
  let completedCount = 0;

  for (let i = 1; i <= 3; i++) {
    const filePath = path.join(testDir, `file${i}.txt`);
    console.log(`  → file${i}.txt 읽기 요청 (${new Date().toISOString()})`);

    // fs.readFile은 논블로킹 - 즉시 반환되고 나중에 콜백 실행
    fs.readFile(filePath, "utf8", (err, data) => {
      if (err) {
        console.error(`  ❌ file${i}.txt 읽기 실패:`, err);
        return;
      }

      completedCount++;
      console.log(
        `  ✅ file${i}.txt 읽기 완료 (크기: ${data.length} bytes) - ${completedCount}/3`
      );

      // 모든 파일 읽기 완료 시
      if (completedCount === 3) {
        const endTime = Date.now();
        console.log(`\n총 소요 시간: ${endTime - startTime}ms`);
        console.log("💡 모든 요청이 거의 동시에 처리되었습니다!\n");

        // 다음 예제 실행
        demonstrateNonBlockingBenefit();
      }
    });
  }

  console.log("📌 모든 파일 읽기 요청 완료 (논블로킹이므로 즉시 반환됨)\n");
}

/**
 * 논블로킹 I/O의 장점 시연
 */
function demonstrateNonBlockingBenefit() {
  console.log("✨ 논블로킹 I/O의 장점 시연\n");
  console.log("시나리오: 웹 서버가 3개의 동시 요청을 받음");
  console.log("각 요청은 파일을 읽어야 함\n");

  const startTime = Date.now();
  const requestTimes = {
    A: null,
    B: null,
    C: null,
  };

  console.log("[Server] 요청 A, B, C가 거의 동시에 도착");

  // 요청 A
  console.log("[Server] 요청 A 처리 시작 (논블로킹)");
  fs.readFile(path.join(testDir, "file1.txt"), "utf8", (err, data) => {
    requestTimes.A = Date.now() - startTime;
    console.log(`[Server] 요청 A 완료 (${requestTimes.A}ms)`);
    checkAllCompleted();
  });

  // 요청 B (A가 완료되기를 기다리지 않고 즉시 시작)
  console.log("[Server] 요청 B 처리 시작 (논블로킹)");
  fs.readFile(path.join(testDir, "file2.txt"), "utf8", (err, data) => {
    requestTimes.B = Date.now() - startTime;
    console.log(`[Server] 요청 B 완료 (${requestTimes.B}ms)`);
    checkAllCompleted();
  });

  // 요청 C (A, B가 완료되기를 기다리지 않고 즉시 시작)
  console.log("[Server] 요청 C 처리 시작 (논블로킹)\n");
  fs.readFile(path.join(testDir, "file3.txt"), "utf8", (err, data) => {
    requestTimes.C = Date.now() - startTime;
    console.log(`[Server] 요청 C 완료 (${requestTimes.C}ms)`);
    checkAllCompleted();
  });

  console.log("📌 모든 요청이 즉시 시작되었습니다 (블로킹 없음)\n");

  let completedRequests = 0;
  function checkAllCompleted() {
    completedRequests++;
    if (completedRequests === 3) {
      console.log("\n📊 결과:");
      console.log(
        `  - 총 소요 시간: ${Math.max(
          requestTimes.A,
          requestTimes.B,
          requestTimes.C
        )}ms`
      );
      console.log("  - 모든 요청이 거의 동시에 처리됨 (병렬 처리)");
      console.log("  - 단일 스레드로 여러 I/O 작업을 효율적으로 처리\n");

      // 다음 예제 실행
      simulateEventLoop();
    }
  }
}

/**
 * 이벤트 루프 시뮬레이션
 * - 논블로킹 I/O가 이벤트 루프와 어떻게 작동하는지 시연
 */
function simulateEventLoop() {
  console.log("🔄 이벤트 루프 동작 시뮬레이션\n");

  console.log("[이벤트 루프] 시작");
  console.log("[애플리케이션] 파일 읽기 요청 1");

  const file1 = path.join(testDir, "file1.txt");
  fs.readFile(file1, "utf8", (err, data) => {
    console.log("  [콜백 1] 파일 1 읽기 완료 → 이벤트 루프가 이 콜백 실행");
  });

  console.log("[애플리케이션] 파일 읽기 요청 2");

  const file2 = path.join(testDir, "file2.txt");
  fs.readFile(file2, "utf8", (err, data) => {
    console.log("  [콜백 2] 파일 2 읽기 완료 → 이벤트 루프가 이 콜백 실행");
  });

  console.log(
    "[애플리케이션] 다른 작업 수행 가능 (I/O 대기 중에도 블로킹 안 됨)"
  );
  console.log("[이벤트 루프] I/O 완료 이벤트 대기 중...\n");

  // 정리 작업은 모든 I/O가 완료된 후에 실행
  setTimeout(() => {
    cleanup();
  }, 100);
}

/**
 * 정리 작업
 */
function cleanup() {
  console.log("\n🧹 정리: 테스트 파일 삭제");
  for (let i = 1; i <= 3; i++) {
    fs.unlinkSync(path.join(testDir, `file${i}.txt`));
  }
  fs.rmdirSync(testDir);

  console.log("\n=== 요약 ===");
  console.log("논블로킹 I/O의 특징:");
  console.log("✓ 단일 스레드로 여러 I/O 작업 동시 처리");
  console.log("✓ I/O 대기 중에도 다른 작업 가능");
  console.log("✓ 효율적인 리소스 사용 (유휴 시간 최소화)");
  console.log("✓ 확장성이 뛰어남 (스레드 생성 비용 없음)");
  console.log("\n⚠️  주의사항:");
  console.log("- CPU 집약적 작업에는 부적합 (이벤트 루프 블로킹)");
  console.log("- 콜백 지옥 가능성 (Promise, async/await으로 해결)");
  console.log(
    "\n다음: reactor-pattern.js에서 Reactor 패턴의 실제 구현을 확인하세요!"
  );
}

// 실행
readFilesNonBlocking();
