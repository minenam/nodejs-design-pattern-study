/**
 * 실험 2: I/O 사이클 내부 순서
 *
 * 목적: I/O 콜백 안에서는 setImmediate가 항상 먼저임을 확인
 *
 * 예상 결과: 항상 immediate → timeout
 */

const fs = require("fs");

console.log("=".repeat(50));
console.log("실험 2: I/O 사이클 내부");
console.log("=".repeat(50));
console.log();

console.log("fs.readFile 요청...");
console.log();

fs.readFile(__filename, () => {
  console.log("─── fs.readFile 콜백 시작 (poll phase) ───");

  setTimeout(() => {
    console.log("  ✓ setTimeout(0)");
  }, 0);

  setImmediate(() => {
    console.log("  ✓ setImmediate()");
  });

  console.log("─── fs.readFile 콜백 종료 ───");
  console.log();

  // 설명 출력 (2초 후)
  setTimeout(() => {
    console.log("─".repeat(50));
    console.log("결과 분석:");
    console.log("   I/O 콜백 내부에서는");
    console.log("   setImmediate()가 항상 먼저 실행됩니다!");
    console.log();
    console.log("이유:");
    console.log("   1. fs.readFile 콜백은 poll phase에서 실행");
    console.log("   2. 콜백 내부:");
    console.log("      - setTimeout: 다음 사이클 timers phase에 등록");
    console.log("      - setImmediate: 현재 사이클 check phase에 등록");
    console.log("   3. 콜백 종료 → nextTick/microtask 비움 (없음)");
    console.log("   4. check phase: setImmediate 실행 ✓");
    console.log("   5. 다음 사이클 timers: setTimeout 실행 ✓");
    console.log("─".repeat(50));
  }, 2000);
});

// 실행 흐름:
//
// [메인 모듈]
// 1. fs.readFile 요청 → libuv Thread Pool에 위임
// 2. 메인 스레드는 계속 진행 (이벤트 루프)
//
// [워커 스레드]
// 3. 파일 읽기 수행 (blocking read)
// 4. 완료 후 이벤트 루프에 콜백 등록
//
// [이벤트 루프 - poll phase]
// 5. fs.readFile 콜백 실행
//    - setTimeout 등록 (다음 사이클 timers에)
//    - setImmediate 등록 (현재 사이클 check에)
// 6. 콜백 종료 → nextTick/microtask 비움 (없음)
//
// [이벤트 루프 - check phase]
// 7. setImmediate 콜백 실행 ← 먼저!
//
// [다음 사이클 - timers phase]
// 8. setTimeout 콜백 실행 ← 나중에!
