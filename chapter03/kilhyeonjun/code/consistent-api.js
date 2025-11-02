// consistent-api.js

const fs = require('fs');
const cache = new Map();

// process.nextTick을 사용하여 항상 비동기적으로 콜백을 호출하는 함수
function consistentRead(filename, cb) {
  if (cache.has(filename)) {
    // 캐시에 있더라도, process.nextTick을 사용해 비동기적으로 콜백 실행
    process.nextTick(() => cb(cache.get(filename)));
  } else {
    fs.readFile(filename, 'utf8', (err, data) => {
      if (err) return cb(err);
      cache.set(filename, data);
      cb(data);
    });
  }
}

function createFileReader(filename) {
  const listeners = [];
  consistentRead(filename, value => {
    listeners.forEach(listener => listener(value));
  });

  return {
    onDataReady: listener => listeners.push(listener)
  };
}

// 1. 첫 번째 호출 (비동기)
const reader1 = createFileReader('./testdata/package.json');
reader1.onDataReady(data => {
  console.log('첫 번째 리스너 호출 완료.');

  // 2. 두 번째 호출 (이제 비동기로 일관성 있게 동작)
  const reader2 = createFileReader('./testdata/package.json');
  reader2.onDataReady(data => {
    // 이제 이 리스너도 정상적으로 호출됩니다.
    console.log('두 번째 리스너 호출 완료.');
  });
  console.log('두 번째 onDataReady 리스너를 등록했습니다.');
});

console.log('첫 번째 onDataReady 리스너를 등록했습니다.');
