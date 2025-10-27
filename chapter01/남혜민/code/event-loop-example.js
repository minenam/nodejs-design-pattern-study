const fs = require("fs");

console.log("start");

fs.readFile("file.txt", (err, data) => {
  console.log("file read callback"); // (4) 보통 스레드풀 완료 후 큐에 들어와 실행
});

setTimeout(() => console.log("timeout"), 0); // (5) 타이머 페이즈에서 실행
setImmediate(() => console.log("immediate")); // (6) 체크 페이즈에서 실행

Promise.resolve().then(() => console.log("promise")); // (2) 마이크로태스크 — 가장 우선 실행

console.log("end");

/**
 * 예상 실행 순서:
 *
 * start
 * end
 * promise
 * file read callback (스레드풀 -> libuv 큐)
 * timeout / immediate 순서는 상황에 따라 달라질 수 있음
 */
