/**
 * 실험 3: nextTick vs Promise 우선순위
 *
 * 목적:
 * 1. nextTick → Promise 순서 확인
 * 2. Node v11 변경사항 확인 (각 콜백마다 큐 비움)
 *
 * 예상 결과 (v11+):
 * - 각 immediate 콜백이 끝날 때마다 nextTick → Promise 큐를 비움
 */

console.log("=".repeat(50));
console.log("실험 3: nextTick vs Promise 우선순위");
console.log("=".repeat(50));
console.log();
console.log(`Node.js 버전: ${process.version}`);
console.log();

setImmediate(() => {
  console.log("─── setImmediate 1 시작 ───");

  process.nextTick(() => console.log("1. nextTick in immediate1"));
  process.nextTick(() => console.log("2. nextTick in immediate1 (2)"));

  Promise.resolve().then(() => console.log("3. promise in immediate1"));
  Promise.resolve().then(() => console.log("4. promise in immediate1 (2)"));

  console.log("─── setImmediate 1 종료 ───");
  console.log();
});

setImmediate(() => {
  console.log("─── setImmediate 2 시작 ───");

  process.nextTick(() => console.log("5. nextTick in immediate2"));
  Promise.resolve().then(() => console.log("6. promise in immediate2"));

  console.log("─── setImmediate 2 종료 ───");
  console.log();

  // 설명 출력 (다음 틱에)
  setImmediate(() => {
    console.log("─".repeat(50));
    console.log("📊 실행 순서 분석:");
    console.log();
    console.log("✓ 각 setImmediate 콜백이 끝날 때마다:");
    console.log("  1. nextTick 큐 비움 (모두)");
    console.log("  2. microtask(Promise) 큐 비움 (모두)");
    console.log("  3. 다음 setImmediate 실행");
    console.log();
    console.log("🔑 핵심:");
    console.log("  - Node v11+ 변경사항:");
    console.log("    Phase 단위 → 콜백 단위로 큐 비우기");
    console.log("  - nextTick이 항상 Promise보다 먼저");
    console.log("─".repeat(50));
  });
});

// 실행 흐름 (Node v11+):
//
// [check phase - setImmediate 1 실행]
// 1. console.log('setImmediate 1 시작')
// 2. process.nextTick 2개 등록
// 3. Promise 2개 등록
// 4. console.log('setImmediate 1 종료')
//
// [콜백 종료 시점]
// 5. nextTick 큐 비움:
//    - 1️⃣ nextTick in immediate1
//    - 2️⃣ nextTick in immediate1 (2)
//
// 6. microtask 큐 비움:
//    - 3️⃣ promise in immediate1
//    - 4️⃣ promise in immediate1 (2)
//
// [check phase - setImmediate 2 실행]
// 7. console.log('setImmediate 2 시작')
// 8. process.nextTick 1개 등록
// 9. Promise 1개 등록
// 10. console.log('setImmediate 2 종료')
//
// [콜백 종료 시점]
// 11. nextTick 큐 비움:
//     - 5️⃣ nextTick in immediate2
//
// 12. microtask 큐 비움:
//     - 6️⃣ promise in immediate2

// v10 이하와의 차이:
// - v10: Phase 전체가 끝난 후 한 번에 큐 비움
//   → immediate1, immediate2 모두 실행 후
//   → nextTick 전부, Promise 전부 순서로 실행
//
// - v11+: 각 콜백이 끝날 때마다 큐 비움
//   → immediate1 끝 → nextTick/Promise
//   → immediate2 끝 → nextTick/Promise
