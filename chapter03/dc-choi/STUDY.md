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
