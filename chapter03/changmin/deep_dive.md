# Node.js Event Loop 딥다이브

## 실제 소스코드와 공식 문서 기반 완전 분석

> **목표** "이벤트 루프가 어떻게 돈다"를 추상적 개념이 아닌, 실제 코드(Node ↔ libuv ↔ OS)와 공식 문서를 통해 정확히 이해한다.

## 1. 전체 아키텍처

### 1-1. 레이어별 역할

```
┌─────────────────────────────────────────┐
│         JavaScript (Your Code)          │
│  Promise, async/await, setTimeout, etc  │
└────────────────┬────────────────────────┘
                 │
┌────────────────▼────────────────────────┐
│              V8 Engine                  │
│  • JS 실행 엔진                          │
│  • Microtask Queue 관리                 │
│    (Promise, queueMicrotask)           │
└────────────────┬────────────────────────┘
                 │
┌────────────────▼────────────────────────┐
│          Node.js Runtime (C++)          │
│  • process.nextTick() 큐               │
│  • JS API → Native 바인딩              │
│  • Environment 관리                     │
│  • node::SpinEventLoop()               │
└────────────────┬────────────────────────┘
                 │ uv_run() 호출
┌────────────────▼────────────────────────┐
│              libuv (C)                  │
│  • 이벤트 루프 코어 (uv_run)            │
│  • Timers, I/O, Check, Close 핸들 관리  │
│  • 크로스 플랫폼 추상화                  │
│  • Thread Pool (파일 I/O 등)            │
└────────────────┬────────────────────────┘
                 │ epoll_wait / kevent / IOCP
┌────────────────▼────────────────────────┐
│         OS Kernel (Linux/Mac/Win)       │
│  • epoll (Linux)                        │
│  • kqueue (macOS/BSD)                   │
│  • IOCP (Windows)                       │
│  → I/O 이벤트 감시 및 알림              │
└─────────────────────────────────────────┘
```

### 1-2. 각 레이어의 책임

| 레이어           | 책임                            | 주요 함수/API                                             |
| ---------------- | ------------------------------- | --------------------------------------------------------- |
| **V8**           | JS 코드 실행, Microtask 관리    | `v8::Isolate`, `v8::MicrotaskQueue`                       |
| **Node Runtime** | JS ↔ C++ 연결, nextTick 큐 관리 | `node::SpinEventLoop()`, `node::Environment`              |
| **libuv**        | 이벤트 루프 코어, OS 추상화     | `uv_run()`, `uv__io_poll()`, `uv__run_timers()`           |
| **OS**           | 실제 I/O 이벤트 감시            | `epoll_wait()`, `kevent()`, `GetQueuedCompletionStatus()` |

### 1-3. 제어 흐름

```c
// Node.js 메인 루프 (의사코드)
// 참조: include/node/node.h - SpinEventLoop()

int node::Start(int argc, char** argv) {
    // ... 초기화 ...

    // 메인 이벤트 루프
    do {
        // 1. libuv 한 사이클 실행
        uv_run(env->event_loop(), UV_RUN_DEFAULT);

        // 2. 플랫폼 태스크 처리 (V8)
        platform->DrainTasks(isolate);

        // 3. 더 할 일이 있는지 확인
        more = uv_loop_alive(env->event_loop());

    } while (more == true);

    // ... 종료 ...
}
```

**핵심** Node는 `uv_run()`을 반복 호출하며 OS 이벤트를 폴링하고 콜백을 스케줄한다.

**참조** `include/node/node.h` - `SpinEventLoop(Environment*)` 주석

---

## 2. libuv의 이벤트 루프 구현

### 2-1. uv_run()의 실제 구조

```c
// libuv: src/unix/core.c (의사코드)
// 참조: uvbook PDF, libuv 공식 가이드

int uv_run(uv_loop_t* loop, uv_run_mode mode) {
    int r;

    while (r != 0 && loop->stop_flag == 0) {
        // ─────────────────────────────────────
        // 1. 시간 업데이트
        // ─────────────────────────────────────
        uv__update_time(loop);

        // ─────────────────────────────────────
        // 2. Timers Phase
        // ─────────────────────────────────────
        uv__run_timers(loop);
        // setTimeout, setInterval 콜백 실행

        // ─────────────────────────────────────
        // 3. Pending I/O Callbacks
        // ─────────────────────────────────────
        uv__run_pending(loop);
        // 이전 사이클에서 지연된 I/O 콜백

        // ─────────────────────────────────────
        // 4. Idle / Prepare Handles
        // ─────────────────────────────────────
        uv__run_idle(loop);
        uv__run_prepare(loop);
        // 내부 사용 (일반적으로 사용자 코드에는 없음)

        // ─────────────────────────────────────
        // 5. Backend Timeout 계산
        // ─────────────────────────────────────
        timeout = uv_backend_timeout(loop);
        // I/O 폴링에서 얼마나 대기할지 결정

        // ─────────────────────────────────────
        // 6. I/O Polling (핵심!)
        // ─────────────────────────────────────
        uv__io_poll(loop, timeout);
        // epoll_wait / kevent / IOCP
        // 새 I/O 이벤트 수집 + 대부분의 I/O 콜백 실행

        // ─────────────────────────────────────
        // 7. Check Phase
        // ─────────────────────────────────────
        uv__run_check(loop);
        // setImmediate() 콜백 실행 (Node.js)

        // ─────────────────────────────────────
        // 8. Close Callbacks
        // ─────────────────────────────────────
        uv__run_closing_handles(loop);
        // socket.on('close', ...) 등

        // ─────────────────────────────────────
        // 9. 루프 생존 검사
        // ─────────────────────────────────────
        r = uv__loop_alive(loop);
        // 더 할 일이 있으면 다시 1로
    }

    return r;
}
```

### 2-2. Backend Timeout 정책

```c
// libuv: uv_backend_timeout() 동작 방식 (의사코드)
// 참조: libuv 가이드
// 주의: 실제 구현은 더 복잡하며, 여러 조건을 추가로 확인합니다

int uv_backend_timeout(const uv_loop_t* loop) {
    if (loop->stop_flag != 0)
        return 0;  // 즉시 리턴

    if (!uv__has_active_handles(loop) && !uv__has_active_reqs(loop))
        return 0;  // 할 일 없음, 즉시 리턴

    if (loop->idle_handles || loop->pending_queue)
        return 0;  // idle/pending 있으면 논블로킹

    if (loop->closing_handles)
        return 0;  // close 대기 중이면 논블로킹

    // 가장 이른 타이머까지의 시간
    return get_timeout_for_next_timer(loop);
    // 타이머 없으면 -1 (무기한 대기)
}
```

**핵심**

- idle/closing 핸들이 있으면 → `timeout = 0` (논블로킹 폴링)
- 타이머가 있으면 → "가장 이른 타이머까지 남은 시간"
- 타이머 없으면 → `-1` (I/O 이벤트가 올 때까지 무기한 대기)

> **참고**: 위 코드는 개념 이해를 위한 단순화된 버전입니다.
> 실제 libuv 구현은 immediate 큐, active requests/handles 등 추가 조건을 확인합니다.

**참조** libuv 가이드 - "Backend Timeout"

### 2-3. I/O Polling 구현

```c
// Linux: src/unix/linux-core.c
// macOS: src/unix/darwin.c
// Windows: src/win/core.c

void uv__io_poll(uv_loop_t* loop, int timeout) {
#ifdef __linux__
    // Linux: epoll
    int nfds = epoll_wait(loop->backend_fd,
                          events,
                          ARRAY_SIZE(events),
                          timeout);

    for (int i = 0; i < nfds; i++) {
        // 준비된 fd의 콜백 실행
        handle_io_event(events[i]);
    }

#elif defined(__APPLE__)
    // macOS: kqueue
    int nfds = kevent(loop->backend_fd,
                      NULL, 0,
                      events, ARRAY_SIZE(events),
                      &ts);
    // ...

#elif defined(_WIN32)
    // Windows: IOCP
    GetQueuedCompletionStatus(loop->iocp,
                               &bytes,
                               &key,
                               &overlapped,
                               timeout);
    // ...
#endif
}
```

**핵심**

- `timeout` 시간만큼 OS가 I/O 이벤트를 대기
- 준비된 I/O만 반환하여 효율적으로 처리
- CPU는 대기 중 사용하지 않음 (sleep 상태)

**참조** GitHub 이슈의 스택트레이스에서 `uv__io_poll` → `epoll_wait` 확인 가능

---

## 3. Node.js Phase 모델

### 3-1. 6개 Phase 개요

Node.js는 libuv의 8단계를 개발자 관점에서 6개 Phase로 설명합니다.

```
   ┌───────────────────────────┐
┌─>│           timers          │
│  └─────────────┬─────────────┘
│  ┌─────────────▼─────────────┐
│  │     pending callbacks     │
│  └─────────────┬─────────────┘
│  ┌─────────────▼─────────────┐
│  │       idle, prepare       │
│  └─────────────┬─────────────┘      ┌───────────────┐
│  ┌─────────────▼─────────────┐      │   incoming:   │
│  │           poll            │<─────┤  connections, │
│  └─────────────┬─────────────┘      │   data, etc.  │
│  ┌─────────────▼─────────────┐      └───────────────┘
│  │           check           │
│  └─────────────┬─────────────┘
│  ┌─────────────▼─────────────┐
└──┤      close callbacks      │
   └───────────────────────────┘
```

### 3-2. Phase별 상세

| Phase                 | libuv 함수                            | Node.js API                     | 설명                                                             |
| --------------------- | ------------------------------------- | ------------------------------- | ---------------------------------------------------------------- |
| **timers**            | `uv__run_timers()`                    | `setTimeout()`, `setInterval()` | 만료된 타이머 콜백 실행                                          |
| **pending callbacks** | `uv__run_pending()`                   | (내부)                          | 이전 사이클에서 지연된 I/O 콜백 (TCP 에러 등)                    |
| **idle, prepare**     | `uv__run_idle()`, `uv__run_prepare()` | (내부)                          | 매 틱마다 실행되는 내부 핸들                                     |
| **poll**              | `uv__io_poll()`                       | (내부)                          | **새 I/O 이벤트 수집 및 I/O 콜백 실행**<br>필요 시 여기서 블로킹 |
| **check**             | `uv__run_check()`                     | `setImmediate()`                | I/O 직후 실행할 콜백                                             |
| **close callbacks**   | `uv__run_closing_handles()`           | `socket.on('close')`            | 리소스 정리 콜백                                                 |

### 3-3. setImmediate() ↔ check phase 매핑

```c
// Node.js 초기화 시 (의사코드)

void SetupProcessObject(Environment* env) {
    // ...

    // setImmediate 콜백을 libuv check 핸들에 바인딩
    uv_check_init(env->event_loop(), &env->immediate_check_handle);
    uv_check_start(&env->immediate_check_handle, CheckImmediate);

    // CheckImmediate 함수:
    // → immediate_info.queue()에서 JS 콜백 꺼내서 실행
}
```

**핵심**

- `setImmediate()` 호출 시 → 큐에 콜백 등록
- poll phase 이후 → check phase에서 큐의 콜백들을 순서대로 실행

**참조** Node.js 초기화 코드 - setImmediate는 libuv check 핸들로 등록

### 3-4. Node.js 버전별 주의사항

**Node v11 이후의 주요 변경** (검증됨)

- Microtask 처리 타이밍 변경 (Phase 단위 → 콜백 단위)
- 자세한 내용은 섹션 4-2 참조

**Node v20+ 관련**

- libuv 1.45+ 통합으로 내부 최적화가 있을 수 있음
- 기본 Phase 모델은 동일하게 유지
- 프로덕션 배포 전 충분한 테스트 권장

> **참고** Node.js의 이벤트 루프 동작은 지속적으로 최적화되고 있습니다.
> 버전 업그레이드 시 공식 릴리즈 노트와 마이그레이션 가이드를 확인하세요.

**참조**

- [Node.js Event Loop 공식 문서](https://nodejs.org/en/docs/guides/event-loop-timers-and-nexttick/)
- [Node.js 릴리즈 노트](https://github.com/nodejs/node/releases)

---

## 4. Microtask 처리

### 4-1. nextTick vs Promise 큐

**중요** `nextTick`과 `microtask`는 **Phase가 아닙니다**. "콜백이 끝날 때마다" 처리되는 큐입니다.

```
┌─────────────────────────────────────────────┐
│    JS 콜백 실행 (타이머/setImmediate/I/O)    │
└──────────────────┬──────────────────────────┘
                   │ 콜백 종료
┌──────────────────▼──────────────────────────┐
│         1. process.nextTick() 큐            │
│         모든 nextTick 콜백 실행 (FIFO)       │
└──────────────────┬──────────────────────────┘
                   │ 큐 비움
┌──────────────────▼──────────────────────────┐
│         2. Microtask 큐                     │
│         Promise, queueMicrotask 실행         │
└──────────────────┬──────────────────────────┘
                   │ 큐 비움
┌──────────────────▼──────────────────────────┐
│         다음 Phase로 진행                     │
└─────────────────────────────────────────────┘
```

### 4-2. Node v11 중요 변경 (Breaking!)

**v11 이전 (v10 이하)**

```javascript
// Phase 전체가 끝난 후 nextTick/microtask 비움
setTimeout(() => console.log("timer1"));
setTimeout(() => console.log("timer2"));
Promise.resolve().then(() => console.log("promise"));
process.nextTick(() => console.log("nextTick"));

// 실행 순서 (v10):
// nextTick → promise → timer1 → timer2
```

**v11 이후** (브라우저와 유사):

```javascript
// 각 콜백이 끝날 때마다 nextTick/microtask 비움
setTimeout(() => {
  console.log("timer1");
  process.nextTick(() => console.log("nextTick in timer1"));
});
setTimeout(() => console.log("timer2"));

// 실행 순서 (v11+):
// timer1 → nextTick in timer1 → timer2
```

**핵심 변경**

```
v10 이하: Phase 단위로 큐 비움
v11+:     콜백 단위로 큐 비움
```

**참조** Node v11.0.0 릴리즈 노트 - "nextTick queue will be run after each immediate and timer" (#22842)

### 4-3. 우선순위 정리

```javascript
// 실행 순서 보장:
// 1. process.nextTick() 큐 (전체)
// 2. Microtask 큐 (Promise, queueMicrotask) (전체)
// 3. 다음 작업

setImmediate(() => {
  console.log("immediate");

  process.nextTick(() => console.log("nextTick 1"));
  process.nextTick(() => console.log("nextTick 2"));

  Promise.resolve().then(() => console.log("promise 1"));
  Promise.resolve().then(() => console.log("promise 2"));
});

// 출력 순서:
// immediate
// nextTick 1
// nextTick 2
// promise 1
// promise 2
```

### 4-4. 기아(Starvation) 위험

```javascript
// ⚠️ 위험: 무한 nextTick은 I/O를 굶긴다
function infiniteNextTick() {
  process.nextTick(infiniteNextTick);
}
infiniteNextTick();

// I/O 콜백이 절대 실행되지 않음!
fs.readFile("file.txt", (err, data) => {
  console.log("이 코드는 실행되지 않음");
});
```

**참조** Node 공식 문서 - "Don't Starve Your Event Loop"

---

## 5. 타이밍과 우선순서

### 5-1. setImmediate() vs setTimeout(0)

#### Case 1: 메인 모듈에서 직접 호출

```javascript
// main.js (I/O 사이클 밖)
setTimeout(() => console.log("timeout"), 0);
setImmediate(() => console.log("immediate"));

// 결과: 순서가 일정하지 않음!
// 이유: 메인 모듈 실행은 timers phase 전에 완료되므로
//       타이머 등록 시점에 따라 순서가 바뀔 수 있음
```

#### Case 2: I/O 사이클 안에서 호출

```javascript
fs.readFile("file.txt", () => {
  setTimeout(() => console.log("timeout"), 0);
  setImmediate(() => console.log("immediate"));
});

// 결과: 항상 immediate → timeout
// 이유:
// 1. fs.readFile 콜백은 poll phase에서 실행
// 2. poll 직후 check phase (setImmediate)
// 3. 다음 사이클의 timers phase (setTimeout)
```

**규칙**

- I/O 콜백 내부 → `setImmediate()`가 항상 먼저
- 메인 모듈 → 순서 불확실

**참조** Node 공식 문서 - "setImmediate() vs setTimeout()"

### 5-2. 전체 우선순위 정리

```
┌─ 동일 "콜백 경계" 내 ─┐
│ 1. 동기 코드          │ (즉시 실행)
│ 2. nextTick 큐       │ (모두 비움)
│ 3. Microtask 큐      │ (모두 비움)
└──────────────────────┘
         ↓
┌─ libuv Phase 순서 ─┐
│ 1. timers           │
│ 2. pending          │
│ 3. idle, prepare    │
│ 4. poll             │
│ 5. check            │
│ 6. close            │
└──────────────────────┘
```

### 5-3. 복잡한 예제

```javascript
console.log("1: sync");

setTimeout(() => {
  console.log("2: timeout");
  process.nextTick(() => console.log("3: nextTick in timeout"));
  Promise.resolve().then(() => console.log("4: promise in timeout"));
}, 0);

setImmediate(() => {
  console.log("5: immediate");
  process.nextTick(() => console.log("6: nextTick in immediate"));
  Promise.resolve().then(() => console.log("7: promise in immediate"));
});

process.nextTick(() => console.log("8: nextTick"));
Promise.resolve().then(() => console.log("9: promise"));

console.log("10: sync");

// 출력 순서 (v11+):
// 1: sync
// 10: sync
// 8: nextTick
// 9: promise
// 2: timeout
// 3: nextTick in timeout
// 4: promise in timeout
// 5: immediate
// 6: nextTick in immediate
// 7: promise in immediate
```

---

## 6. 오해와 진실

### 6-1. "libuv가 JavaScript 콜스택을 확인한다?"

**틀림**

**진실**

- libuv는 C 레벨 라이브러리로 JS를 전혀 모름
- libuv는 콜백 **함수 포인터**를 실행하고 반환을 기다릴 뿐
- 콜백이 "끝났다" = 함수가 반환(return)됨
- 그 **반환 시점**에 Node.js/V8이 nextTick/microtask 큐를 처리

**관심사의 분리**

```
┌─────────────────────┐
│  V8 / Node Runtime  │ ← JS 콜스택 관리
│  • 콜백 실행        │ ← nextTick/microtask 처리
│  • 큐 비우기        │ ← 콜백 반환 시점에 수행
└──────────┬──────────┘
           │ C++ 콜백 포인터 전달
           │ 함수 반환으로 "완료" 통지
┌──────────▼──────────┐
│      libuv          │
│  • 핸들 큐 관리     │ ← JS를 모름
│  • 콜백 포인터 실행 │ ← 단순히 함수 호출
│  • OS 폴링          │
└─────────────────────┘
```

**더 정확한 이해**

```c
// libuv가 하는 일 (의사코드)
void run_callback(callback_fn) {
    callback_fn();  // 함수 호출
    // 함수가 반환되면 "끝"
}

// Node.js/V8이 하는 일
void wrapped_callback() {
    user_js_callback();     // 사용자 JS 코드 실행
    // 여기서 반환되기 전에:
    drain_nexttick_queue(); // nextTick 큐 비우기
    drain_microtask_queue(); // microtask 큐 비우기
    return;  // libuv로 반환
}
```

### 6-2. "macrotask queue가 있다?"

**부정확**

**진실**

- "macrotask"는 브라우저 용어
- Node는 **Phase**(timers, poll, check 등)로 설명
- 각 Phase마다 별도의 큐가 있음

**브라우저 vs Node**
| 브라우저 | Node.js |
|---------|---------|
| Microtask Queue | nextTick 큐 + Microtask 큐 |
| Macrotask Queue | timers 큐, check 큐, pending 큐, ... (Phase별) |

**참조** Node 공식 문서는 "macrotask" 용어를 사용하지 않고 Phase로 설명

### 6-3. "setTimeout(0)는 즉시 실행된다?"

즉시 실행? -> **틀림**

**진실**

```javascript
setTimeout(() => console.log("timer"), 0);
console.log("sync");

// 출력:
// sync
// timer

// 이유: setTimeout은 다음 timers phase까지 대기
//       동기 코드가 항상 먼저
```

**최소 지연**

- 브라우저: 4ms (중첩 5회 이상)
- Node.js: 1ms (내부 타이머 정밀도)

---

## 7. 실무 가이드 (NestJS 관점)

### 7-1. 성능 최적화

#### DO: CPU 집약 작업은 분리

```typescript
// 나쁜 예: poll phase 블로킹
@Get('/heavy')
async getHeavyData() {
    // 동기 계산이 10초 걸림
    const result = this.complexCalculation(); // 이벤트 루프 블로킹!
    return result;
}

// 좋은 예: Worker Threads 사용
import { Worker } from 'worker_threads';

@Get('/heavy')
async getHeavyData() {
    return new Promise((resolve, reject) => {
        const worker = new Worker('./calculation-worker.js');
        worker.on('message', resolve);
        worker.on('error', reject);
    });
}
```

#### DO: 대량 데이터 처리는 청크로

```typescript
// 나쁜 예
@Get('/users')
async getAllUsers() {
    const users = await this.db.find(); // 100만 건

    // 동기 루프가 이벤트 루프 블로킹
    users.forEach(user => {
        user.email = this.encrypt(user.email);
    });

    return users;
}

// 좋은 예: 청크 + setImmediate
@Get('/users')
async getAllUsers() {
    const users = await this.db.find();

    // 1000개씩 처리 후 이벤트 루프에 제어권 반환
    for (let i = 0; i < users.length; i += 1000) {
        const chunk = users.slice(i, i + 1000);
        chunk.forEach(user => {
            user.email = this.encrypt(user.email);
        });

        // 다른 요청이 처리될 기회 제공
        await new Promise(resolve => setImmediate(resolve));
    }

    return users;
}
```

### 7-2. 안티패턴 회피

#### DONT: nextTick 무한 루프

```typescript
// I/O 기아 발생
function recursiveNextTick() {
  process.nextTick(() => {
    // 무한 반복
    recursiveNextTick();
  });
}

// 해결: setImmediate 사용
function recursiveImmediate() {
  setImmediate(() => {
    // poll phase를 거치므로 I/O 처리 가능
    recursiveImmediate();
  });
}
```

#### DONT: 동기 API 사용 (프로덕션)

```typescript
// 절대 금지
@Get('/config')
getConfig() {
    // 파일 읽는 동안 모든 요청 블로킹!
    const config = fs.readFileSync('config.json');
    return JSON.parse(config);
}

// 초기화 시에만 동기, 런타임은 비동기
@Injectable()
export class ConfigService {
    private config: any;

    constructor() {
        // 앱 시작 시 한 번만 (블로킹 OK)
        this.config = JSON.parse(fs.readFileSync('config.json'));
    }

    getConfig() {
        return this.config; // 메모리에서 즉시 반환
    }
}
```
