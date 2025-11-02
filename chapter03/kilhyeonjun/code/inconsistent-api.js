// inconsistent-api.js

const fs = require('fs');
const cache = new Map();

// Zalgo를 유발하는 일관성 없는 함수
function inconsistentRead(filename, cb) {
  if (cache.has(filename)) {
    // 캐시에 있으면 동기적으로 콜백 실행
    cb(cache.get(filename));
  } else {
    // 캐시에 없으면 비동기적으로 파일 읽고 콜백 실행
    fs.readFile(filename, 'utf8', (err, data) => {
      if (err) return cb(err);
      cache.set(filename, data);
      cb(data);
    });
  }
}

function createFileReader(filename) {
  const listeners = [];
  inconsistentRead(filename, value => {
    listeners.forEach(listener => listener(value));
  });

  return {
    onDataReady: listener => listeners.push(listener)
  };
}

// 1. 첫 번째 호출 (비동기)
const reader1 = createFileReader('./testdata/package.json');
reader1.onDataReady(data => {
  console.log('첫 번째 리스너 호출:', data);

  // 2. 두 번째 호출 (동기)
  const reader2 = createFileReader('./testdata/package.json');
  reader2.onDataReady(data => {
    // 이 리스너는 절대 호출되지 않습니다.
    console.log('두 번째 리스너 호출:', data);
  });
});

console.log('onDataReady 리스너를 등록했습니다. 하지만 두 번째 리스너는 호출되지 않을 것입니다.');
