/**
 * 실험 1: 상위 레벨에서 setImmediate vs setTimeout(0)
 *
 * 목적: 메인 모듈에서 순서가 불확실함을 확인
 *
 * 예상 결과: 순서가 매번 바뀔 수 있음
 * 이유: 메인 모듈 실행은 timers phase 전에 완료되므로
 *       타이머 등록 시점에 따라 순서가 바뀔 수 있음
 */

console.log("=".repeat(50));
console.log("실험 1: 메인 모듈에서 호출");
console.log("=".repeat(50));
console.log();

setTimeout(() => {
  console.log("✓ setTimeout(0)");
}, 0);

setImmediate(() => {
  console.log("✓ setImmediate()");
});

console.log("동기 코드 완료");
console.log();

// 실행 흐름:
// 1. 동기 코드 실행 (콜스택)
//    - setTimeout 등록 (timers 큐에 추가)
//    - setImmediate 등록 (check 큐에 추가)
//    - console.log 실행
//
// 2. nextTick/microtask 큐 비움 (없음)
//
// 3. libuv 사이클 시작:
//    - timers: setTimeout 만료 여부? (타이밍에 따라 다름)
//      * 만료됐으면: "setTimeout(0)" 출력
//      * 안 됐으면: 다음으로
//    - poll: (이벤트 없음)
//    - check: setImmediate 실행 → "setImmediate()" 출력
//    - (만약 위에서 setTimeout 안 했으면 다음 사이클 timers에서 실행)
//
// 결과: 실행할 때마다 순서가 바뀔 수 있음!
