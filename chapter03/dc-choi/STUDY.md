# 클로저와 콜백의 연관성

## 클로저
함수가 선언될 때의 스코프(환경)를 기억하고, 그 함수가 스코프 밖에서 호출되어도 그 환경에 접근할 수 있는 기능

```js
const makeCounter = () => {
  let count = 0;
  return () => {
    count += 1;
    console.log(count);
  };
}

const counter = makeCounter();
counter(); // 1
counter(); // 2
```

## 둘의 연관성
콜백 함수가 클로저를 이용해서 외부 상태를 기억하거나 접근할 수 있을 때, 이 둘이 연결됨.

```js
const createRequest = (url) => {
  let retries = 0;

  return (callback) => {
    fetch(url)
      .then((res) => res.json())
      .then((data) => callback(null, data))
      .catch((err) => {
        retries++;
        console.log(`Retry count: ${retries}`);
        callback(err);
      });
  };
}

const request = createRequest("https://api.example.com/data");

request((err, data) => {
  if (err) console.error("Error:", err);
  else console.log("Data:", data);
});
```

| 구분  | 역할                              | 둘의 관계                        |
|-----|---------------------------------|------------------------------|
| 클로저 | 함수가 외부 스코프의 변수를 기억하게 함          | 콜백이 외부 변수나 상태를 사용할 때 클로저가 작동 |
| 콜백  | 나중에 실행될 함수 (비동기/이벤트 기반에서 자주 사용) | 클로저 덕분에 실행 시점에 외부 데이터에 접근 가능 |

# process.nextTick()은 정말 최우선적으로 실행되나?
Promise와 같은 Microtask Queue에 들어가지 않나? 라는 의문에서 출발.

결론: 이론상으로는 process.nextTick()은 Promise보다 조금 더 우선순위가 높게 실행

Node.js의 이벤트 루프는 대략 timers, I/O callbacks, poll, check, close callbacks 순서로 돌아감.

각 Phase가 끝날 때마다 process.nextTick() 큐를 먼저 비우고, 그다음 Promise(Microtask) 큐를 비움

이벤트 루프의 각 단계가 끝날 때마다, 먼저 process.nextTick() 그다음 Promise.then() / await 같은 일반 microtask가 실행.

```js
setTimeout(() => console.log('timeout'), 0); // 3
Promise.resolve().then(() => console.log('promise')); // 2
process.nextTick(() => console.log('nextTick')); // 1
```

```shell
nextTick
promise
timeout
```

process.nextTick()은 원래 이벤트 루프 한 사이클이 완전히 끝나기 전에 꼭 실행돼야 할 콜백을 예약하려고 만든 API

그래서 진짜 다음 틱(next tick)이 오기 전에 강제로 실행되며 만약 nextTick을 재귀적으로 계속 등록하면 이벤트 루프가 완전히 멈춰버릴 수도 있음.

## 이론상으로는 그렇지만 실제로는 Promise가 더 먼저 실행되는 경우?
Promise가 resolve되는 타이밍이 V8의 Microtask Queue에 이미 등록된 상태일 때

그 시점엔 아직 process.nextTick()이 등록되지 않았기 때문에 Promise 콜백이 먼저 실행될 수 있음.

```js
Promise.resolve().then(() => console.log("promise"));
process.nextTick(() => console.log("nextTick"));
```

```shell
nextTick
promise
```

하지만 아래 구조대로 변경한다면?

```js
const run = async () => {
  await Promise.resolve();
  process.nextTick(() => console.log("nextTick"));
}
run().then(() => console.log("promise"));
```

```shell
promise
nextTick
```

여기선 process.nextTick이 await 이후(즉, 다음 tick 중간)에 등록돼서 이미 Promise 큐가 먼저 실행된 상태

## process.nextTick()과 setImmediate()의 차이점
process.nextTick(): 현재 이벤트 루프 턴이 끝나자마자, 다음 phase로 넘어가기 전에 실행. 그래서 setTimeout(fn, 0)/setImmediate()보다 항상 먼저고, Promise 보다도 우선 처리(별도 nextTick 큐 → 그 다음 microtask 큐).

setImmediate(): 다음 이벤트 루프 반복에서 실행. setTimeout(fn, 0)와 비슷한 수준(둘 다 macrotask)이라 어떤 게 먼저일지는 상황(phase, I/O 완료 타이밍 등)에 따라 달라질 수 있음.

### 실행 순서(한 phase가 끝날 때마다 정리되는 순서)
nextTick queue → 2) Promise microtask queue → 3) macrotask queue(setImmediate, setTimeout)

### 각각 언제 쓰는거지?
process.nextTick()
1. 에러 전파를 안전하게 미루고 싶을 때
2. 초기화가 끝난 직후 콜백을 호출하고 싶을 때
3. 비동기 API와 동기 API의 일관성 유지

setImmediate()
1. I/O 작업이 끝난 뒤 후속 처리를 예약하고 싶을 때
2. CPU 바운드 작업을 루프 턴 사이에 분리하고 싶을 때

# EventEmitter를 사용하는 라이브러리나 프레임워크는 뭐가 있지?
| 분류           | 예시                                   | EventEmitter 사용 이유 |
|--------------|--------------------------------------|--------------------|
| Node.js Core | `http`, `net`, `fs`, `child_process` | 비동기 이벤트 처리         |
| Framework    | Express, NestJS                      | 요청/응답, 도메인 이벤트     |
| Realtime     | Socket.IO                            | 양방향 통신             |
| DB           | Mongoose, Sequelize                  | 연결, 훅, 쿼리 이벤트      |

NestJS는 내부적으로 EventEmitter2를 사용함.

## 왜 EventEmitter2가 만들어졌는가?
기존 EventEmitter는 단순하고 빠르지만 대규모 시스템이나 복잡한 이벤트 흐름을 처리하기엔 어려움이 있었음.

| 한계                | 설명                                 |
|-------------------|------------------------------------|
| 와일드카드 이벤트 없음      | `"user.*"` 이런 식으로 그룹 단위 이벤트 리스닝 불가 |
| 리스너 우선순위 없음       | 등록 순서대로만 실행됨                       |
| 비동기 리스너 지원 부족     | `await` 기반 처리에 적합하지 않음             |
| 리스너 개수 제한         | `setMaxListeners()` 기본 10개 제한 있음   |
| 오브젝트 기반 네임스페이스 없음 | 이벤트 이름 문자열 기반이라 충돌 위험              |

| 기능             | Node EventEmitter | EventEmitter2               |
|----------------|-------------------|-----------------------------|
| 와일드카드 이벤트      | ❌                 | ✅                           |
| 비동기 이벤트        | ❌                 | ✅ (`emitAsync`)             |
| 리스너 우선순위       | ❌                 | ✅                           |
| 네임스페이스/패턴 이벤트  | ❌                 | ✅                           |
| 여러 이벤트 한 번에 등록 | ❌                 | ✅                           |
| NestJS 통합      | ❌                 | ✅ (`@nestjs/event-emitter`) |

## NestJS의 CQRS 모듈도 내부적으로는 EventEmitter2로 구현이 되어 있나?
CQRS의 CommandBus, QueryBus, EventBus는 RxJS 기반(Subject/Observable 스트림)으로 동작

### EventEmitter VS NestJS/CQRS
| 구분 | `@nestjs/event-emitter`     | `@nestjs/cqrs`                            |
|----|-----------------------------|-------------------------------------------|
| 목적 | 단순 이벤트 발행/구독 (Notification) | 도메인 중심 아키텍처 (Command-Event-Query 분리)      |
| 철학 | “A에서 일어났으니 B도 하자”           | “명령(Command)과 결과(Event), 질의(Query)를 분리하자” |
| 패턴 | Observer 패턴                 | CQRS + Mediator 패턴                        |

| 항목     | EventEmitter                        | CQRS                            |
|--------|-------------------------------------|---------------------------------|
| 기반 기술  | `EventEmitter2` (이벤트 핸들러 리스트에 emit) | `RxJS` (Subject 기반 비동기 스트림)     |
| 호출 방식  | `emit(eventName, payload)`          | `eventBus.publish(new Event())` |
| 리스너 구조 | 이벤트 이름(string) → 핸들러 목록             | 이벤트 클래스 타입 기반 → 핸들러 자동 바인딩      |
| 실행 순서  | 등록 순서대로 즉시 실행                       | RxJS Observable 스트림으로 비동기 처리 가능 |
| 동기/비동기 | 주로 동기(`emitAsync`만 별도)              | 본질적으로 비동기 (Observable 기반)       |

| 상황                                               | 추천 모듈                   | 이유                       |
|--------------------------------------------------|-------------------------|--------------------------|
| 단순 알림, 웹훅, 로깅, Slack 알림                          | `@nestjs/event-emitter` | 설정 간단, 이름 기반 이벤트         |
| 도메인 이벤트, 복잡한 비즈니스 흐름                             | `@nestjs/cqrs`          | Command→Event→Saga 구조 가능 |
| “A일 때 B도 하고 C도 해라”                               | `event-emitter`         | 단순 Notification 패턴       |
| “A 명령이 끝나면 Event를 발생시키고, Saga가 다음 Command를 실행하라” | `cqrs`                  | 흐름 제어 중심, 트랜잭션 경계 명확     |

### RxJS 기반(Subject/Observable 스트림) 스트림은 결국 EventEmitter 기반 아닌가?
RxJS의 스트림(Observable/Subject) 은 EventEmitter를 단순히 추상화한 게 아니라, 훨씬 더 높은 추상 계층의 “반응형 데이터 흐름” 시스템

| 구분        | EventEmitter           | RxJS (Observable/Subject)                        |
|-----------|------------------------|--------------------------------------------------|
| 핵심 개념     | 이벤트 → 리스너 호출           | **데이터 스트림(Observable)** → **구독자(Observer)**      |
| 이벤트 성격    | 1회성 알림 (fire & forget) | **연속적 데이터 흐름**, 변환·조합 가능                         |
| 구독자 호출 시점 | 이벤트 발생 즉시 콜백 호출        | 데이터 흐름을 구독 후, 오퍼레이터로 가공                          |
| 에러 처리     | try/catch 불편           | `error` 채널 내장 (`next`, `error`, `complete`)      |
| 동기/비동기    | 동기 중심 (emit → 즉시 실행)   | 비동기/동기 모두 자연스러움                                  |
| 연산자 지원    | 없음                     | `map`, `filter`, `mergeMap`, `debounceTime` 등 다수 |
| 구독 해제     | 수동으로 removeListener    | `subscription.unsubscribe()` 로 손쉽게 관리            |

| 비교 항목     | EventEmitter            | RxJS Subject/Observable      |
|-----------|-------------------------|------------------------------|
| 기반 개념     | 콜백 기반 이벤트 시스템           | 반응형 스트림(Observable Sequence) |
| 실행 시점     | 즉시 실행                   | 스트림 구독 후 반응                  |
| 데이터 흐름    | 1회성 이벤트                 | 지속적인 데이터 시퀀스                 |
| 조합/변환     | 불가                      | 연산자 기반 조합/변환 가능              |
| NestJS 예시 | `@nestjs/event-emitter` | `@nestjs/cqrs`               |
