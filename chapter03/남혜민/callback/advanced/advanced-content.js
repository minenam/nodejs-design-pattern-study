// Zalgo 섹션 콘텐츠
const zalgoContent = `
<h2>👹 Zalgo 문제: "He Who Waits Behind The Wall"</h2>

<div class="definition-box">
    <h3>Zalgo란?</h3>
    <p>Isaac Z. Schlueter가 명명한 개념으로, <strong>때로는 동기적으로, 때로는 비동기적으로 동작하는 API</strong>를 의미합니다.</p>
    <p>이는 코드의 실행 순서를 예측 불가능하게 만들어 심각한 버그를 유발합니다.</p>
</div>

<div class="concept-box">
    <h3>Zalgo의 위험성</h3>
    
    <div class="code-block bad">
        <h4>❌ Zalgo를 방출하는 코드</h4>
        <pre><code>const cache = {};

function getData(key, callback) {
  if (cache[key]) {
    // 캐시가 있으면 동기적으로 즉시 실행
    callback(cache[key]);
  } else {
    // 캐시가 없으면 비동기적으로 실행
    fetchFromDB(key, (data) => {
      cache[key] = data;
      callback(data);
    });
  }
}

// 문제 발생!
let isReady = false;

getData('user:1', (data) => {
  console.log('Data:', data);
  console.log('isReady:', isReady);
});

isReady = true;

// 첫 호출 (캐시 없음): Data: {...}, isReady: true
// 두 번째 호출 (캐시 있음): Data: {...}, isReady: false
// 실행 순서가 예측 불가능!</code></pre>
    </div>

    <div class="mermaid">
sequenceDiagram
    participant C as Caller
    participant G as getData
    participant CB as Callback
    
    Note over C,CB: 첫 호출 (캐시 없음 - 비동기)
    C->>G: getData('user:1', cb)
    G->>C: 즉시 반환
    C->>C: isReady = true
    Note over G: DB 조회 중...
    G->>CB: 나중에 콜백 실행
    Note over CB: isReady는 true
    
    Note over C,CB: 두 번째 호출 (캐시 있음 - 동기)
    C->>G: getData('user:1', cb)
    G->>CB: 즉시 콜백 실행
    Note over CB: isReady는 아직 false
    G->>C: 반환
    C->>C: isReady = true
    </div>
</div>

<div class="concept-box">
    <h3>Zalgo가 발생하는 실제 시나리오</h3>
    
    <div class="scenario-box">
        <h4>시나리오 1: 조건부 캐싱</h4>
        <div class="code-block">
            <pre><code>function readConfig(path, callback) {
  if (configCache[path]) {
    callback(null, configCache[path]); // 동기
  } else {
    fs.readFile(path, (err, data) => {  // 비동기
      if (!err) configCache[path] = data;
      callback(err, data);
    });
  }
}</code></pre>
        </div>
    </div>

    <div class="scenario-box">
        <h4>시나리오 2: 조건부 검증</h4>
        <div class="code-block">
            <pre><code>function processData(data, callback) {
  if (!isValid(data)) {
    callback(new Error('Invalid')); // 동기
    return;
  }
  
  saveToDatabase(data, callback); // 비동기
}</code></pre>
        </div>
    </div>
</div>

<div class="concept-box">
    <h3>Zalgo 방지 방법</h3>
    
    <div class="solution-box">
        <h4>해결책 1: 항상 비동기로 만들기</h4>
        <div class="code-block good">
            <pre><code>function getData(key, callback) {
  if (cache[key]) {
    // process.nextTick으로 비동기화
    process.nextTick(() => {
      callback(cache[key]);
    });
  } else {
    fetchFromDB(key, (data) => {
      cache[key] = data;
      callback(data);
    });
  }
}

// 또는 setImmediate 사용
function getDataImmediate(key, callback) {
  if (cache[key]) {
    setImmediate(() => {
      callback(cache[key]);
    });
  } else {
    fetchFromDB(key, (data) => {
      cache[key] = data;
      callback(data);
    });
  }
}</code></pre>
        </div>
    </div>

    <div class="solution-box">
        <h4>해결책 2: 항상 동기로 만들기</h4>
        <div class="code-block good">
            <pre><code>// 동기 API로 설계
function getDataSync(key) {
  if (cache[key]) {
    return cache[key];
  }
  throw new Error('Data not in cache');
}

// 별도의 비동기 API 제공
function loadData(key, callback) {
  fetchFromDB(key, (data) => {
    cache[key] = data;
    callback(data);
  });
}

// 사용
try {
  const data = getDataSync('user:1');
  console.log(data);
} catch (err) {
  loadData('user:1', (data) => {
    console.log(data);
  });
}</code></pre>
        </div>
    </div>

    <div class="solution-box">
        <h4>해결책 3: dezalgo 모듈 사용</h4>
        <div class="code-block good">
            <pre><code>const dezalgo = require('dezalgo');

function getData(key, callback) {
  // dezalgo가 자동으로 일관성 보장
  callback = dezalgo(callback);
  
  if (cache[key]) {
    callback(cache[key]);
  } else {
    fetchFromDB(key, (data) => {
      cache[key] = data;
      callback(data);
    });
  }
}</code></pre>
        </div>
    </div>
</div>

<div class="concept-box">
    <h3>Isaac Z. Schlueter의 핵심 원칙</h3>
    
    <div class="principle-box">
        <h4>원칙 1: 일관성 유지</h4>
        <p>함수는 <strong>항상 동기</strong> 또는 <strong>항상 비동기</strong>여야 합니다.</p>
        <div class="code-block">
            <pre><code>// 다음 중 하나만 참이어야 함
var after = false;
callbackTaker(function() {
  assert(after === true);  // 항상 비동기
});
after = true;

// 또는

var after = false;
callbackTaker(function() {
  assert(after === false); // 항상 동기
});
after = true;</code></pre>
        </div>
    </div>

    <div class="principle-box">
        <h4>원칙 2: 성능보다 예측 가능성</h4>
        <p>캐시된 데이터를 즉시 반환하는 것이 빠르지만, 예측 불가능한 동작은 더 큰 문제를 야기합니다.</p>
        <blockquote>
            "비동기 API는 더 빠르지 않습니다. 오히려 더 느립니다. 
            하지만 프로그램의 다른 부분이 기다리지 않아도 되므로 전체 성능이 향상됩니다."
            <cite>- Isaac Z. Schlueter</cite>
        </blockquote>
    </div>

    <div class="principle-box">
        <h4>원칙 3: 합성 지연(Synthetic Deferral) 최소화</h4>
        <p>process.nextTick이나 setImmediate는 코드 스멜입니다. API 설계를 재고해야 합니다.</p>
        
        <div class="strategy-grid">
            <div class="strategy-card">
                <h5>결과가 보통 즉시 사용 가능한 경우</h5>
                <ul>
                    <li>동기 API로 설계</li>
                    <li>사용 불가능 시 에러 반환</li>
                    <li>별도의 대기 메커니즘 제공</li>
                </ul>
                <div class="code-block">
                    <pre><code>// O_NONBLOCK 패턴
const result = tryGetData(key);
if (result instanceof Error) {
  waitForData(key, callback);
} else {
  processData(result);
}</code></pre>
                </div>
            </div>
            
            <div class="strategy-card">
                <h5>결과가 보통 나중에 사용 가능한 경우</h5>
                <ul>
                    <li>비동기 API로 설계</li>
                    <li>즉시 사용 가능해도 지연</li>
                </ul>
                <div class="code-block">
                    <pre><code>function getData(key, callback) {
  if (cache[key]) {
    process.nextTick(() => 
      callback(cache[key])
    );
  } else {
    fetchData(key, callback);
  }
}</code></pre>
                </div>
            </div>
        </div>
    </div>
</div>

<div class="warning-box">
    <h4>⚠️ Zalgo 체크리스트</h4>
    <ul>
        <li>✅ 모든 코드 경로가 동일한 동기/비동기 패턴을 따르는가?</li>
        <li>✅ 조건부 로직이 실행 타이밍을 변경하지 않는가?</li>
        <li>✅ 캐싱 로직이 일관된 비동기 동작을 유지하는가?</li>
        <li>✅ 에러 처리가 정상 흐름과 동일한 타이밍인가?</li>
    </ul>
</div>
`;

// 콜백 규칙 섹션 콘텐츠
const rulesContent = `
<h2>📋 Node.js 콜백 규칙</h2>

<div class="definition-box">
    <h3>왜 규칙이 필요한가?</h3>
    <p>일관된 패턴은 <strong>학습 비용을 줄이고, 도구 지원을 가능하게 하며, 에러를 방지</strong>합니다.</p>
    <p>Node.js 생태계는 다음 규칙들을 표준으로 채택했습니다.</p>
</div>

<div class="concept-box">
    <h3>규칙 1: 콜백은 마지막 인자</h3>
    
    <div class="code-block good">
        <h4>✅ 올바른 예</h4>
        <pre><code>fs.readFile(path, encoding, callback);
db.query(sql, params, callback);
request.get(url, options, callback);</code></pre>
    </div>
    
    <div class="code-block bad">
        <h4>❌ 잘못된 예</h4>
        <pre><code>fs.readFile(callback, path, encoding);
db.query(callback, sql, params);</code></pre>
    </div>
    
    <div class="rationale-box">
        <h4>이유</h4>
        <ul>
            <li><strong>가독성:</strong> 함수 본문이 자연스럽게 이어짐</li>
            <li><strong>일관성:</strong> 모든 API가 동일한 패턴</li>
            <li><strong>부분 적용:</strong> 커링이 용이함</li>
        </ul>
        <div class="code-block">
            <pre><code>// 가독성 비교
doSomething(arg1, arg2, arg3, function(err, result) {
  // 함수 본문이 자연스럽게 이어짐
  if (err) return handleError(err);
  processResult(result);
});

// vs

doSomething(function(err, result) {
  if (err) return handleError(err);
  processResult(result);
}, arg1, arg2, arg3); // 인자가 멀리 떨어짐</code></pre>
        </div>
    </div>
</div>

<div class="concept-box">
    <h3>규칙 2: 에러 우선 콜백 (Error-First Callback)</h3>
    
    <div class="code-block good">
        <h4>✅ 표준 시그니처</h4>
        <pre><code>function callback(err, result1, result2, ...) {
  if (err) {
    // 에러 처리
    return;
  }
  // 정상 처리
}</code></pre>
    </div>
    
    <div class="pattern-box">
        <h4>패턴 상세</h4>
        <ul>
            <li><strong>첫 번째 인자:</strong> Error 객체 또는 null/undefined</li>
            <li><strong>나머지 인자:</strong> 성공 시 결과 값들</li>
            <li><strong>에러 발생 시:</strong> 첫 번째 인자만 설정, 나머지는 undefined</li>
            <li><strong>성공 시:</strong> 첫 번째 인자는 null, 나머지에 결과</li>
        </ul>
    </div>
    
    <div class="code-block">
        <h4>실제 사용 예</h4>
        <pre><code>// 파일 읽기
fs.readFile('file.txt', 'utf8', (err, data) => {
  if (err) {
    console.error('파일 읽기 실패:', err.message);
    return;
  }
  console.log('파일 내용:', data);
});

// HTTP 요청
request.get('https://api.example.com', (err, response, body) => {
  if (err) {
    console.error('요청 실패:', err);
    return;
  }
  console.log('응답:', body);
});

// 데이터베이스 쿼리
db.query('SELECT * FROM users', (err, rows) => {
  if (err) {
    console.error('쿼리 실패:', err);
    return;
  }
  console.log('결과:', rows);
});</code></pre>
    </div>
</div>

<div class="concept-box">
    <h3>규칙 3: 에러 전파 (Error Propagation)</h3>
    
    <div class="code-block">
        <h4>에러 전파 패턴</h4>
        <pre><code>function readJSON(filename, callback) {
  fs.readFile(filename, 'utf8', (err, data) => {
    if (err) {
      // 에러를 그대로 전파
      return callback(err);
    }
    
    let parsed;
    try {
      parsed = JSON.parse(data);
    } catch (parseErr) {
      // 파싱 에러도 콜백으로 전파
      return callback(parseErr);
    }
    
    // 성공
    callback(null, parsed);
  });
}

// 사용
readJSON('config.json', (err, config) => {
  if (err) {
    // 모든 에러를 한 곳에서 처리
    console.error('설정 로드 실패:', err);
    return;
  }
  console.log('설정:', config);
});</code></pre>
    </div>
    
    <div class="warning-box">
        <h4>⚠️ 주의: try-catch는 동기 에러만 잡음</h4>
        <div class="code-block bad">
            <pre><code>// ❌ 비동기 에러를 잡을 수 없음
try {
  fs.readFile('file.txt', (err, data) => {
    if (err) throw err; // try-catch 밖에서 발생!
  });
} catch (err) {
  // 여기서 잡히지 않음
  console.error(err);
}</code></pre>
        </div>
        
        <div class="code-block good">
            <pre><code>// ✅ 콜백 내에서 에러 처리
fs.readFile('file.txt', (err, data) => {
  if (err) {
    handleError(err);
    return;
  }
  
  try {
    // 동기 코드의 에러만 try-catch
    const parsed = JSON.parse(data);
    processData(parsed);
  } catch (parseErr) {
    handleError(parseErr);
  }
});</code></pre>
        </div>
    </div>
</div>

<div class="concept-box">
    <h3>규칙 4: 콜백은 정확히 한 번만 호출</h3>
    
    <div class="code-block bad">
        <h4>❌ 잘못된 예: 여러 번 호출</h4>
        <pre><code>function badFunction(callback) {
  doAsync((err, data) => {
    if (err) {
      callback(err);
      // return을 빼먹음!
    }
    callback(null, data); // 에러 후에도 호출됨!
  });
}</code></pre>
    </div>
    
    <div class="code-block good">
        <h4>✅ 올바른 예: 한 번만 호출</h4>
        <pre><code>function goodFunction(callback) {
  doAsync((err, data) => {
    if (err) {
      return callback(err); // return으로 종료
    }
    callback(null, data);
  });
}

// 또는 once 패턴 사용
function safeFunction(callback) {
  let called = false;
  
  const safeCallback = (...args) => {
    if (called) {
      console.warn('콜백이 이미 호출됨!');
      return;
    }
    called = true;
    callback(...args);
  };
  
  doAsync(safeCallback);
}</code></pre>
    </div>
</div>

<div class="concept-box">
    <h3>규칙 5: 동기 에러는 throw, 비동기 에러는 콜백</h3>
    
    <div class="code-block">
        <h4>패턴 구분</h4>
        <pre><code>function processFile(filename, callback) {
  // 입력 검증: 동기 에러는 throw
  if (typeof filename !== 'string') {
    throw new TypeError('filename must be a string');
  }
  
  if (!filename) {
    throw new Error('filename is required');
  }
  
  // 비동기 작업: 에러는 콜백으로
  fs.readFile(filename, (err, data) => {
    if (err) {
      return callback(err);
    }
    
    try {
      // 동기 작업 중 에러: try-catch
      const processed = transform(data);
      callback(null, processed);
    } catch (transformErr) {
      // 동기 에러를 비동기 콜백으로 변환
      callback(transformErr);
    }
  });
}

// 사용
try {
  // 동기 에러는 try-catch로
  processFile(null, (err, result) => {
    // 비동기 에러는 콜백으로
    if (err) {
      console.error('처리 실패:', err);
      return;
    }
    console.log('결과:', result);
  });
} catch (err) {
  console.error('입력 검증 실패:', err);
}</code></pre>
    </div>
</div>

<div class="concept-box">
    <h3>고급: 콜백 헬 해결 패턴</h3>
    
    <div class="code-block">
        <h4>문제: 콜백 중첩</h4>
        <pre><code>getData((err, data) => {
  if (err) return handleError(err);
  
  processData(data, (err, processed) => {
    if (err) return handleError(err);
    
    saveData(processed, (err, saved) => {
      if (err) return handleError(err);
      
      notifyUser(saved, (err) => {
        if (err) return handleError(err);
        console.log('완료!');
      });
    });
  });
});</code></pre>
    </div>
    
    <div class="code-block good">
        <h4>해결 1: 함수 분리</h4>
        <pre><code>function handleData(err, data) {
  if (err) return handleError(err);
  processData(data, handleProcessed);
}

function handleProcessed(err, processed) {
  if (err) return handleError(err);
  saveData(processed, handleSaved);
}

function handleSaved(err, saved) {
  if (err) return handleError(err);
  notifyUser(saved, handleNotified);
}

function handleNotified(err) {
  if (err) return handleError(err);
  console.log('완료!');
}

getData(handleData);</code></pre>
    </div>
    
    <div class="code-block good">
        <h4>해결 2: async 라이브러리</h4>
        <pre><code>const async = require('async');

async.waterfall([
  getData,
  processData,
  saveData,
  notifyUser
], (err, result) => {
  if (err) return handleError(err);
  console.log('완료!', result);
});</code></pre>
    </div>
    
    <div class="code-block good">
        <h4>해결 3: Promise 변환</h4>
        <pre><code>const { promisify } = require('util');

const getDataAsync = promisify(getData);
const processDataAsync = promisify(processData);
const saveDataAsync = promisify(saveData);
const notifyUserAsync = promisify(notifyUser);

getDataAsync()
  .then(processDataAsync)
  .then(saveDataAsync)
  .then(notifyUserAsync)
  .then(() => console.log('완료!'))
  .catch(handleError);

// 또는 async/await
async function workflow() {
  try {
    const data = await getDataAsync();
    const processed = await processDataAsync(data);
    const saved = await saveDataAsync(processed);
    await notifyUserAsync(saved);
    console.log('완료!');
  } catch (err) {
    handleError(err);
  }
}</code></pre>
    </div>
</div>
`;

// 콘텐츠를 DOM에 삽입하는 함수
function loadAdvancedContent() {
    const zalgoSection = document.getElementById('zalgo');
    const rulesSection = document.getElementById('rules');
    
    if (zalgoSection) {
        zalgoSection.innerHTML = zalgoContent;
    }
    
    if (rulesSection) {
        rulesSection.innerHTML = rulesContent;
    }
    
    // Mermaid 다이어그램 렌더링
    if (typeof mermaid !== 'undefined') {
        mermaid.initialize({ startOnLoad: true, theme: 'default' });
        mermaid.contentLoaded();
    }
}

// DOM 로드 후 실행
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadAdvancedContent);
} else {
    loadAdvancedContent();
}
