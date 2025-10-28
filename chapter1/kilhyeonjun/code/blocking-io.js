/**
 * 블로킹 I/O 예제
 *
 * 전통적인 블로킹 방식의 파일 읽기를 시연합니다.
 * 동시에 여러 파일을 읽을 때 성능 문제가 발생합니다.
 */

const fs = require("fs");
const path = require("path");

console.log("=== 블로킹 I/O 예제 ===\n");

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
 * 블로킹 방식으로 파일 읽기
 * - 각 파일을 순차적으로 읽음
 * - 하나의 파일 읽기가 완료될 때까지 다음 파일을 읽을 수 없음
 */
function readFilesBlocking() {
  console.log("⏳ 블로킹 방식으로 파일 읽기 시작...");
  const startTime = Date.now();

  for (let i = 1; i <= 3; i++) {
    const filePath = path.join(testDir, `file${i}.txt`);
    console.log(`  → file${i}.txt 읽기 시작 (${new Date().toISOString()})`);

    // fs.readFileSync는 파일을 다 읽을 때까지 블로킹됨
    const data = fs.readFileSync(filePath, "utf8");

    console.log(`  ✅ file${i}.txt 읽기 완료 (크기: ${data.length} bytes)`);
  }

  const endTime = Date.now();
  console.log(`\n총 소요 시간: ${endTime - startTime}ms\n`);
}

/**
 * 다중 스레드 시뮬레이션 (실제로는 순차 실행)
 * - 블로킹 환경에서 동시성을 달성하려면 각 연결마다 별도의 스레드가 필요
 * - Node.js는 기본적으로 단일 스레드이므로 여기서는 시뮬레이션만 함
 */
function simulateMultiThreadBlocking() {
  console.log('🔄 다중 "스레드" 시뮬레이션 (실제로는 순차 실행)\n');

  const connections = [
    { id: "Connection A", file: "file1.txt" },
    { id: "Connection B", file: "file2.txt" },
    { id: "Connection C", file: "file3.txt" },
  ];

  connections.forEach((conn) => {
    console.log(`[${conn.id}] 스레드 시작`);
    const filePath = path.join(testDir, conn.file);

    // 블로킹 읽기 - 이 작업이 끝날 때까지 다른 작업 불가
    const data = fs.readFileSync(filePath, "utf8");

    console.log(`[${conn.id}] 데이터 처리 완료 (${data.length} bytes)`);
    console.log(`[${conn.id}] 스레드 종료\n`);
  });
}

/**
 * 블로킹 I/O의 문제점 시연
 */
function demonstrateBlockingProblem() {
  console.log("⚠️  블로킹 I/O의 문제점 시연\n");
  console.log("시나리오: 웹 서버가 3개의 동시 요청을 받음");
  console.log("각 요청은 파일을 읽어야 함\n");

  const startTime = Date.now();

  console.log("[Server] 요청 A 도착 (시간: 0ms)");
  console.log("[Server] 요청 A 처리 시작...");
  const dataA = fs.readFileSync(path.join(testDir, "file1.txt"), "utf8");
  console.log(`[Server] 요청 A 완료 (${Date.now() - startTime}ms)\n`);

  console.log(
    "[Server] 요청 B 도착 (실제로는 A와 동시에 도착했지만 대기 중...)"
  );
  console.log("[Server] 요청 B 처리 시작...");
  const dataB = fs.readFileSync(path.join(testDir, "file2.txt"), "utf8");
  console.log(`[Server] 요청 B 완료 (${Date.now() - startTime}ms)\n`);

  console.log(
    "[Server] 요청 C 도착 (실제로는 A, B와 동시에 도착했지만 대기 중...)"
  );
  console.log("[Server] 요청 C 처리 시작...");
  const dataC = fs.readFileSync(path.join(testDir, "file3.txt"), "utf8");
  console.log(`[Server] 요청 C 완료 (${Date.now() - startTime}ms)\n`);

  console.log("📊 결과:");
  console.log(`  - 총 소요 시간: ${Date.now() - startTime}ms`);
  console.log("  - 각 요청은 이전 요청이 완료될 때까지 대기해야 함");
  console.log(
    "  - 스레드는 I/O 대기 중 아무 작업도 하지 못함 (유휴 시간 낭비)\n"
  );
}

// 실행
readFilesBlocking();
simulateMultiThreadBlocking();
demonstrateBlockingProblem();

// 정리: 테스트 파일 삭제
console.log("🧹 정리: 테스트 파일 삭제");
for (let i = 1; i <= 3; i++) {
  fs.unlinkSync(path.join(testDir, `file${i}.txt`));
}
fs.rmdirSync(testDir);

console.log("\n=== 요약 ===");
console.log("블로킹 I/O의 특징:");
console.log("✓ 간단하고 이해하기 쉬움");
console.log("✗ 하나의 I/O가 전체 스레드를 차단");
console.log(
  "✗ 동시성을 위해 여러 스레드 필요 → 메모리 및 컨텍스트 스위칭 비용"
);
console.log("✗ 대부분의 시간을 유휴 상태로 낭비");
console.log("\n다음: non-blocking-io.js에서 개선된 방식을 확인하세요!");
