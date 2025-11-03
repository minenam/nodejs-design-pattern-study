/**
 * 실험 4: 복합 시나리오 (종합)
 *
 * 목적: 전체 우선순위 체계 확인
 *
 * 우선순위:
 * 1. 동기 코드
 * 2. process.nextTick 큐
 * 3. Microtask(Promise) 큐
 * 4. libuv Phase 순서 (timers → poll → check)
 */

console.log("=".repeat(50));
console.log("실험 4: 복합 시나리오 - 전체 우선순위");
console.log("=".repeat(50));
console.log();

// 동기 코드
console.log("1: 동기 시작");

// setTimeout 등록
setTimeout(() => {
  console.log("2: setTimeout(0)");
  process.nextTick(() => console.log("3: nextTick in timer"));
  Promise.resolve().then(() => console.log("4: promise in timer"));
}, 0);

// setImmediate 등록
setImmediate(() => {
  console.log(" 5: setImmediate");
  process.nextTick(() => console.log("  6: nextTick in immediate"));
  Promise.resolve().then(() => console.log("7: promise in immediate"));
});

// nextTick 등록 (중첩 포함)
process.nextTick(() => {
  console.log("8: nextTick 1");
  process.nextTick(() => console.log("9: nested nextTick"));
});

// Promise 등록 (중첩 포함)
Promise.resolve().then(() => {
  console.log("10: promise 1");
  Promise.resolve().then(() => console.log("11: nested promise"));
});

// nextTick 한 번 더
process.nextTick(() => console.log("12: nextTick 2"));

// 동기 코드
console.log("🔵 13: 동기 끝");
console.log();

// 설명 출력 (충분히 나중에)
setTimeout(() => {
  console.log("=".repeat(50));
  console.log("실행 순서 분석");
  console.log("=".repeat(50));
  console.log();

  console.log("1. 동기 코드 (콜스택)");
  console.log("   1, 13");
  console.log();

  console.log("2. nextTick 큐 비우기");
  console.log("   8, 12, 9 (nested)");
  console.log("   ※ nextTick이 또 nextTick을 등록하면 같은 단계에서 실행");
  console.log();

  console.log("3. Microtask 큐 비우기");
  console.log("   10, 11 (nested)");
  console.log();

  console.log("4. Timers Phase");
  console.log("   2 (setTimeout)");
  console.log("   → 콜백 종료 시 nextTick/microtask 비움");
  console.log("   3, 4");
  console.log();

  console.log("5. Check Phase (또는 4️⃣ 전*)");
  console.log("   5 (setImmediate)");
  console.log("   → 콜백 종료 시 nextTick/microtask 비움");
  console.log("    6,  7");
  console.log();

  console.log("*: 메인 모듈에서는 setTimeout과 setImmediate의");
  console.log("   순서가 타이밍에 따라 바뀔 수 있습니다.");
  console.log();

  console.log("─".repeat(50));
  console.log("🔑 핵심 규칙:");
  console.log("─".repeat(50));
  console.log();
  console.log("▶ 콜백 경계마다:");
  console.log("  1. nextTick 큐 전체 비움 (FIFO)");
  console.log("  2. Microtask 큐 전체 비움 (FIFO)");
  console.log("  3. 다음 Phase/작업으로");
  console.log();
  console.log("▶ Phase 순서 (libuv):");
  console.log("  timers → pending → poll → check → close");
  console.log();
  console.log("▶ Node v11+ 변경:");
  console.log("  Phase 단위 → 콜백 단위로 큐 비우기");
  console.log();
  console.log("=".repeat(50));
}, 100);

// Phase 흐름 상세:
//
// [동기 코드 실행]
// - console.log('1: 동기 시작')
// - setTimeout, setImmediate, nextTick, Promise 등록
// - console.log('13: 동기 끝')
//
// [nextTick 큐 비우기]
// - nextTick(() => { ... '8' ... })
//   → 이 안에서 nextTick(() => '9') 등록
//   → 같은 단계에서 즉시 실행
// - nextTick(() => '12')
//
// [Microtask 큐 비우기]
// - Promise.then(() => { ... '10' ... })
//   → 이 안에서 Promise.then(() => '11') 등록
//   → 같은 단계에서 즉시 실행
//
// [libuv 사이클 시작 - Timers Phase]
// - setTimeout 콜백 실행 ('2')
//   → nextTick, Promise 등록
// - 콜백 종료 → nextTick 큐 비움 ('3')
// - 콜백 종료 → Microtask 큐 비움 ('4')
//
// [Poll Phase]
// - (이벤트 없음)
//
// [Check Phase]
// - setImmediate 콜백 실행 ('5')
//   → nextTick, Promise 등록
// - 콜백 종료 → nextTick 큐 비움 ('6')
// - 콜백 종료 → Microtask 큐 비움 ('7')
//
// 주의: 메인 모듈에서는 setTimeout(0)과 setImmediate()의
//       순서가 실행 환경에 따라 바뀔 수 있습니다!
