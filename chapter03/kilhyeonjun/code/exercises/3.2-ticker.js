// 3.2-ticker.js
// 연습 3.2: Ticker
// number와 콜백을 인자로 받는 함수
// - 호출되고 나서 number ms가 지나기 전까지 매 50ms마다 tick 이벤트 발생
// - number ms가 지났을 때 tick 횟수를 콜백으로 전달
// - setTimeout을 재귀적으로 사용

const { EventEmitter } = require('events');

function ticker(duration, callback) {
  const emitter = new EventEmitter();
  let tickCount = 0;
  const startTime = Date.now();

  function scheduleTick() {
    const elapsed = Date.now() - startTime;

    if (elapsed >= duration) {
      // 시간이 다 되었으면 콜백 호출
      callback(tickCount);
      return;
    }

    // tick 이벤트 발생
    emitter.emit('tick');
    tickCount++;

    // 다음 tick 예약 (재귀적으로 setTimeout 사용)
    setTimeout(scheduleTick, 50);
  }

  // 첫 tick 예약
  setTimeout(scheduleTick, 50);

  return emitter;
}

// 사용 예시
console.log('[연습 3.2] Ticker 시작...');

const emitter = ticker(500, (tickCount) => {
  console.log(`[연습 3.2] 완료! 총 ${tickCount}번의 tick이 발생했습니다.`);
});

emitter.on('tick', () => {
  console.log('[연습 3.2] tick!');
});
