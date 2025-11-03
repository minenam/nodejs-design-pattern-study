// event-emitter-vs-callback.js

const { EventEmitter } = require('events');

// 1. EventEmitter를 사용하는 함수
// 이벤트가 여러 번 발생하거나, 여러 리스너가 필요한 경우에 적합합니다.
function helloWithEvents() {
  const emitter = new EventEmitter();
  // 비동기 작업 시뮬레이션
  setTimeout(() => {
    // 'complete' 이벤트를 발생시켜 결과를 전달합니다.
    emitter.emit('complete', 'Hello World from EventEmitter');
  }, 100);
  return emitter;
}

// 2. 콜백을 사용하는 함수
// 작업의 최종 결과를 한 번만 전달하는 경우에 적합합니다.
function helloWithCallback(cb) {
  // 비동기 작업 시뮬레이션
  setTimeout(() => {
    // 콜백 함수를 호출하여 결과를 전달합니다. (첫 인자는 에러)
    cb(null, 'Hello World from Callback');
  }, 100);
}

// EventEmitter 사용
const events = helloWithEvents();
events.on('complete', (message) => {
  console.log('EventEmitter 결과:', message);
});

// 콜백 사용
helloWithCallback((err, message) => {
  if (err) {
    return console.error(err);
  }
  console.log('콜백 결과:', message);
});

console.log('어떤 결과가 먼저 출력될까요?');
