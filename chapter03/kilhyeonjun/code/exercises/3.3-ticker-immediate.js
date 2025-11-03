// 3.3-ticker-immediate.js
// 연습 3.3: 간단한 수정
// 함수 호출 즉시 tick 이벤트를 생성하도록 연습 3.2에서 만든 함수를 수정

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

  // 즉시 첫 tick 발생 (process.nextTick 사용하여 리스너 등록 후 발생하도록)
  process.nextTick(() => {
    emitter.emit('tick');
    tickCount++;
    // 그 다음 tick부터 50ms 간격으로 예약
    setTimeout(scheduleTick, 50);
  });

  return emitter;
}

// 사용 예시
console.log('[연습 3.3] Ticker 시작... (즉시 첫 tick 발생)');

const emitter = ticker(500, (tickCount) => {
  console.log(`[연습 3.3] 완료! 총 ${tickCount}번의 tick이 발생했습니다.`);
});

emitter.on('tick', () => {
  console.log('[연습 3.3] tick!');
});
