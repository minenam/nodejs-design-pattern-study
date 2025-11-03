// 이벤트 루프와 콜백 실행 순서 데모

console.log('=== 이벤트 루프와 콜백 실행 순서 ===\n');

// 1. 기본 실행 순서
console.log('1. 동기 코드 시작');

setTimeout(() => {
  console.log('4. setTimeout (매크로태스크)');
}, 0);

process.nextTick(() => {
  console.log('2. process.nextTick (마이크로태스크)');
});

setImmediate(() => {
  console.log('5. setImmediate (매크로태스크)');
});

Promise.resolve().then(() => {
  console.log('3. Promise.then (마이크로태스크)');
});

console.log('1. 동기 코드 끝');

// 2. 복잡한 실행 순서
setTimeout(() => {
  console.log('\n=== 복잡한 실행 순서 ===');
  
  console.log('A. setTimeout 시작');
  
  process.nextTick(() => {
    console.log('B. setTimeout 내부의 nextTick');
  });
  
  setImmediate(() => {
    console.log('D. setTimeout 내부의 setImmediate');
  });
  
  Promise.resolve().then(() => {
    console.log('C. setTimeout 내부의 Promise');
  });
  
  console.log('A. setTimeout 끝');
}, 10);

// 3. I/O 기아 현상 시연
setTimeout(() => {
  console.log('\n=== I/O 기아 현상 시연 ===');
  
  let count = 0;
  
  function recursiveNextTick() {
    if (count < 5) {
      count++;
      console.log(`nextTick 재귀 호출 ${count}`);
      process.nextTick(recursiveNextTick);
    } else {
      console.log('nextTick 재귀 완료');
    }
  }
  
  // 이 setTimeout은 nextTick 재귀가 끝날 때까지 실행되지 않음
  setTimeout(() => {
    console.log('setTimeout이 드디어 실행됨 (I/O 기아 해결)');
  }, 0);
  
  recursiveNextTick();
}, 50);

// 4. 실제 파일 I/O와 콜백 순서
const fs = require('fs');

setTimeout(() => {
  console.log('\n=== 파일 I/O와 콜백 순서 ===');
  
  // 작은 파일 생성
  fs.writeFile('temp.txt', 'Hello World', (err) => {
    if (err) {
      console.error('파일 쓰기 실패:', err);
      return;
    }
    
    console.log('1. 파일 쓰기 완료');
    
    // 파일 읽기
    fs.readFile('temp.txt', 'utf8', (err, data) => {
      if (err) {
        console.error('파일 읽기 실패:', err);
        return;
      }
      
      console.log('2. 파일 읽기 완료:', data);
      
      // 파일 삭제
      fs.unlink('temp.txt', (err) => {
        if (err) {
          console.error('파일 삭제 실패:', err);
          return;
        }
        
        console.log('3. 파일 삭제 완료');
        
        // 마지막 데모 실행
        setTimeout(runTimerDemo, 100);
      });
    });
  });
}, 100);

// 5. 타이머 정확도 데모
function runTimerDemo() {
  console.log('\n=== 타이머 정확도 데모 ===');
  
  const start = Date.now();
  
  setTimeout(() => {
    const elapsed = Date.now() - start;
    console.log(`setTimeout(0) 실제 지연시간: ${elapsed}ms`);
  }, 0);
  
  setTimeout(() => {
    const elapsed = Date.now() - start;
    console.log(`setTimeout(1) 실제 지연시간: ${elapsed}ms`);
  }, 1);
  
  setImmediate(() => {
    const elapsed = Date.now() - start;
    console.log(`setImmediate 실제 지연시간: ${elapsed}ms`);
  });
  
  process.nextTick(() => {
    const elapsed = Date.now() - start;
    console.log(`process.nextTick 실제 지연시간: ${elapsed}ms`);
  });
  
  // 6. 콜백 지옥 vs 개선된 패턴
  setTimeout(() => {
    console.log('\n=== 콜백 지옥 vs 개선된 패턴 ===');
    
    // 콜백 지옥 예제
    console.log('콜백 지옥 시작');
    setTimeout(() => {
      console.log('  Level 1');
      setTimeout(() => {
        console.log('    Level 2');
        setTimeout(() => {
          console.log('      Level 3');
          setTimeout(() => {
            console.log('        Level 4 - 너무 깊어짐!');
            
            // 개선된 패턴
            demonstrateImprovedPattern();
          }, 50);
        }, 50);
      }, 50);
    }, 50);
  }, 200);
}

// 개선된 콜백 패턴
function demonstrateImprovedPattern() {
  console.log('\n개선된 패턴 시작');
  
  function level1(callback) {
    setTimeout(() => {
      console.log('  Level 1 (개선됨)');
      callback();
    }, 50);
  }
  
  function level2(callback) {
    setTimeout(() => {
      console.log('  Level 2 (개선됨)');
      callback();
    }, 50);
  }
  
  function level3(callback) {
    setTimeout(() => {
      console.log('  Level 3 (개선됨)');
      callback();
    }, 50);
  }
  
  function level4(callback) {
    setTimeout(() => {
      console.log('  Level 4 (개선됨) - 훨씬 읽기 쉬움!');
      callback();
    }, 50);
  }
  
  // 순차 실행
  level1(() => {
    level2(() => {
      level3(() => {
        level4(() => {
          console.log('\n✨ 모든 데모 완료!');
          
          // 최종 정리
          setTimeout(() => {
            console.log('\n=== 핵심 정리 ===');
            console.log('1. 마이크로태스크(nextTick, Promise)가 매크로태스크(setTimeout, setImmediate)보다 우선');
            console.log('2. process.nextTick은 Promise.then보다 우선');
            console.log('3. setImmediate는 setTimeout(0)보다 늦게 실행될 수 있음');
            console.log('4. 재귀적 nextTick은 I/O 기아를 일으킬 수 있음');
            console.log('5. 콜백 지옥을 피하기 위해 함수를 분리하고 명명하기');
          }, 100);
        });
      });
    });
  });
}
