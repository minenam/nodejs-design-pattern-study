// 3.4-ticker-error.js
// 연습 3.4: 에러 다루기
// tick이 발생할 때 타임스탬프가 5로 나누어지면 에러를 생성
// 콜백과 EventEmitter를 사용하여 에러를 전파

const { EventEmitter } = require('events');

function ticker(duration, callback) {
  const emitter = new EventEmitter();
  let tickCount = 0;
  const startTime = Date.now();

  function emitTick() {
    const timestamp = Date.now();

    // 타임스탬프가 5로 나누어지는지 확인
    if (timestamp % 5 === 0) {
      const error = new Error(`타임스탬프 ${timestamp}가 5로 나누어집니다!`);

      // EventEmitter로 에러 전파
      emitter.emit('error', error);

      // 콜백으로도 에러 전파
      callback(error, null);
      return false; // 에러 발생
    }

    // tick 이벤트 발생
    emitter.emit('tick');
    tickCount++;
    return true; // 정상 처리
  }

  function scheduleTick() {
    const elapsed = Date.now() - startTime;

    if (elapsed >= duration) {
      // 시간이 다 되었으면 콜백 호출 (에러 없이 정상 완료)
      callback(null, tickCount);
      return;
    }

    // tick 발생 (에러 체크 포함)
    const success = emitTick();

    if (!success) {
      // 에러가 발생하면 더 이상 tick을 예약하지 않음
      return;
    }

    // 다음 tick 예약 (재귀적으로 setTimeout 사용)
    setTimeout(scheduleTick, 50);
  }

  // 즉시 첫 tick 발생 (process.nextTick 사용하여 리스너 등록 후 발생하도록)
  process.nextTick(() => {
    const success = emitTick();

    if (success) {
      // 에러가 없으면 다음 tick부터 50ms 간격으로 예약
      setTimeout(scheduleTick, 50);
    }
  });

  return emitter;
}

// 사용 예시
console.log('[연습 3.4] Ticker 시작... (에러 처리 포함)');

const emitter = ticker(500, (err, tickCount) => {
  if (err) {
    console.error(`[연습 3.4] 콜백에서 에러 수신: ${err.message}`);
  } else {
    console.log(`[연습 3.4] 완료! 총 ${tickCount}번의 tick이 발생했습니다.`);
  }
});

emitter.on('tick', () => {
  console.log('[연습 3.4] tick!');
});

emitter.on('error', (err) => {
  console.error(`[연습 3.4] EventEmitter에서 에러 수신: ${err.message}`);
});
