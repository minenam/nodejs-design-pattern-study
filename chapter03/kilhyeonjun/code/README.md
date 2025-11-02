# Chapter 3 코드 예제: 콜백과 이벤트

Chapter 3의 핵심 개념인 콜백(Callback)과 이벤트(Event) 패턴을 실습할 수 있는 코드 예제 모음입니다.

## 📁 파일 구조

```
code/
├── testdata/                      # 테스트 데이터 파일
│   ├── file1.txt                 # 콜백 지옥 예제용 테스트 파일
│   ├── file2.txt
│   ├── file3.txt
│   └── package.json              # Zalgo 예제용 테스트 파일
├── exercises/                     # p118 연습 문제 구현
│   ├── 3.1-find-regex.js         # 연습 3.1: 단순 이벤트
│   ├── 3.2-ticker.js             # 연습 3.2: Ticker
│   ├── 3.3-ticker-immediate.js   # 연습 3.3: 간단한 수정
│   └── 3.4-ticker-error.js       # 연습 3.4: 에러 다루기
├── callback-hell.js              # 콜백 지옥(Pyramid of Doom) 예제
├── inconsistent-api.js           # 일관성 없는 API (Zalgo) 문제 예제
├── consistent-api.js             # process.nextTick으로 해결한 일관성 있는 API 예제
├── event-emitter-example.js      # EventEmitter 클래스 상속 및 사용 예제
└── event-emitter-vs-callback.js  # EventEmitter와 콜백 패턴 비교 예제
```

---

## 🚀 실행 방법

### 기본 예제

각 예제 파일은 `node` 명령어로 직접 실행할 수 있습니다.

```bash
# 1. 콜백 지옥 예제 실행
node callback-hell.js

# 2. 일관성 없는 API (Zalgo) 예제 실행
node inconsistent-api.js

# 3. 일관성 있는 API 예제 실행
node consistent-api.js

# 4. EventEmitter 예제 실행
node event-emitter-example.js

# 5. EventEmitter와 콜백 비교 예제 실행
node event-emitter-vs-callback.js
```

### 연습 문제 (p118)

```bash
cd exercises

# 연습 3.1: 단순 이벤트
node 3.1-find-regex.js

# 연습 3.2: Ticker (50ms 간격)
node 3.2-ticker.js

# 연습 3.3: Ticker (즉시 발생)
node 3.3-ticker-immediate.js

# 연습 3.4: Ticker (에러 처리)
node 3.4-ticker-error.js
```

--- 

## 📚 학습 포인트

### 1. `callback-hell.js`

- **개념**: 비동기 콜백이 연속적으로 중첩되어 코드의 들여쓰기가 깊어지고 가독성이 급격히 떨어지는 "파멸의 피라미드" 현상을 보여줍니다.
- **학습 목표**: 왜 콜백 패턴이 복잡한 비동기 흐름 제어에 한계를 가지는지 직접 확인하고, 이후에 배울 Promise나 async/await의 필요성을 이해합니다.
- **예상 출력**:
  ```
  첫 번째 파일 읽기 완료.
  두 번째 파일 읽기 완료.
  세 번째 파일 읽기 완료.

  모든 파일을 성공적으로 읽고 내용을 합쳤습니다.
  ```

### 2. `inconsistent-api.js`

- **개념**: 특정 조건(캐시 존재)에서는 동기적으로, 다른 조건에서는 비동기적으로 동작하는 API, 일명 "Zalgo"가 어떤 문제를 일으키는지 보여줍니다.
- **학습 목표**: API의 동기/비동기 동작이 일관되지 않을 때, 리스너 등록 시점 문제로 콜백이 호출되지 않는 버그가 발생하는 과정을 이해합니다.
- **예상 출력**:
  ```
  onDataReady 리스너를 등록했습니다. 하지만 두 번째 리스너는 호출되지 않을 것입니다.
  첫 번째 리스너 호출: ... (package.json 내용)
  ```

### 3. `consistent-api.js`

- **개념**: `process.nextTick()`을 사용하여 동기적인 상황에서도 콜백을 강제로 비동기 실행(지연 실행)하여 API의 동작을 일관되게 만드는 해결책을 보여줍니다.
- **학습 목표**: Zalgo 문제를 해결하고 항상 예측 가능하게 동작하는 비동기 API를 작성하는 방법을 배웁니다.
- **예상 출력**:
  ```
  첫 번째 onDataReady 리스너를 등록했습니다.
  첫 번째 리스너 호출 완료.
  두 번째 onDataReady 리스너를 등록했습니다.
  두 번째 리스너 호출 완료.
  ```

### 4. `event-emitter-example.js`

- **개념**: `EventEmitter`를 상속받아 이벤트를 기반으로 동작하는 관찰 가능한(Observable) 클래스를 만드는 방법을 보여줍니다.
- **학습 목표**: `on`, `emit`을 활용하여 여러 종류의 이벤트를 발생시키고 구독하는 방법을 익힙니다. 특히 `error` 이벤트 처리의 중요성을 이해합니다.
- **예상 출력**:
  ```
  검색 시작: ./callback-hell.js, ./inconsistent-api.js
  ./callback-hell.js 파일 읽기 완료.
  ./inconsistent-api.js 파일 읽기 완료.
  ```

### 5. `event-emitter-vs-callback.js`

- **개념**: 동일한 비동기 작업을 콜백 패턴과 EventEmitter 패턴으로 각각 구현하여 두 방식의 차이점을 비교합니다.
- **학습 목표**: 작업의 **결과**를 한 번만 반환할 때는 콜백이, 동일한 **사건**이 여러 번 발생하거나 여러 곳에 알려야 할 때는 EventEmitter가 더 적합함을 이해합니다.
- **예상 출력**:
  ```
  어떤 결과가 먼저 출력될까요?
  EventEmitter 결과: Hello World from EventEmitter
  콜백 결과: Hello World from Callback
  ```

---

## 🎯 연습 문제 (p118)

책의 118페이지에 나오는 연습 문제들을 구현한 코드입니다.

### 연습 3.1: 단순 이벤트

**문제**: 입력 파일 리스트를 인자로 넘기고 find 프로세스를 시작할 때 이벤트를 방출하게끔 비동기적 FindRegex 클래스를 수정하세요.

**구현**: `exercises/3.1-find-regex.js`

**예상 출력**:
```
[연습 3.1] 검색 시작: ../callback-hell.js, ../inconsistent-api.js
[연습 3.1] ../callback-hell.js 파일 읽기 완료.
[연습 3.1] ../inconsistent-api.js 파일 읽기 완료.
```

### 연습 3.2: Ticker

**문제**: number와 콜백을 인자로 받는 함수를 작성하세요. 이 함수는 호출되고 나서 number 만큼의 밀리초가 지나기 전까지 매 50밀리초마다 tick이라는 이벤트를 내보내는 EventEmitter를 반환합니다. 또한 이 함수는 number 만큼의 밀리초가 지났을 때 tick 이벤트가 일어난 횟수를 받는 callback을 호출합니다.

**힌트**: setTimeout()을 예약하기 위해 setTimeout()을 재귀적으로 사용하세요.

**구현**: `exercises/3.2-ticker.js`

**예상 출력** (500ms 실행 시):
```
[연습 3.2] Ticker 시작...
[연습 3.2] tick! (약 9~10회)
[연습 3.2] 완료! 총 9번의 tick이 발생했습니다.
```

### 연습 3.3: 간단한 수정

**문제**: 함수 호출 즉시 tick 이벤트를 생성하도록 연습 3.2에서 만든 함수를 수정하세요.

**구현**: `exercises/3.3-ticker-immediate.js`

**예상 출력** (500ms 실행 시):
```
[연습 3.3] Ticker 시작... (즉시 첫 tick 발생)
[연습 3.3] tick! (약 10~11회, 3.2보다 1번 더 많음)
[연습 3.3] 완료! 총 10번의 tick이 발생했습니다.
```

### 연습 3.4: 에러 다루기

**문제**: (3.3에서 추가한 초기 발생을 포함하여) tick이 발생할 때 타임스탬프가 5로 나누어지면 에러를 생성하도록 3.3에서 만든 함수를 수정하세요. 콜백과 EventEmitter를 사용하여 에러를 전파시키세요.

**힌트**: Date.now()를 사용하여 타임스탬프를 얻고 나머지 연산자(%)를 사용하여 5로 나누어지는지 아닌지 확인하세요.

**구현**: `exercises/3.4-ticker-error.js`

**예상 출력**:
```
[연습 3.4] Ticker 시작... (에러 처리 포함)
[연습 3.4] tick!
[연습 3.4] EventEmitter에서 에러 수신: 타임스탬프 xxx가 5로 나누어집니다!
[연습 3.4] 콜백에서 에러 수신: 타임스탬프 xxx가 5로 나누어집니다!
```

---

## 📖 참고 자료

- **Node.js Events**: https://nodejs.org/api/events.html
- **Node.js Process**: https://nodejs.org/api/process.html#processnexttickcallback-args
