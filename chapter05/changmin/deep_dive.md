# Node.js async/await 딥다이브

async/await은 왜 나오게 되었을까?

-> Promise 위에 구축된 syntactic sugar, 비동기 코드를 동기 코드처럼 작성 가능

그럼 왜 비동기 코드를 동기 코드처럼 작성하고 싶어할까?

-> 비동기 코드를 동기 코드처럼 작성하면 코드의 가독성이 좋아지고, 디버깅이 쉬워진다.

## 콜백 지옥 느껴보기

지옥을 아주 간단하고 비효율적인 음식 배달 주문 시스템을 만들어보자. 전화번호를 입력하면 사용자 ID를 조회하고, 사용자 ID를 조회하면 주소를 조회하고, 주소를 조회하면 배달 가능 지역인지 확인하고, 배달 가능 지역인지 확인하면 주문을 할 수 있다.

```javascript
function getUserId(phoneNumber) {
  /* ... */
}
function getAddress(userId) {
  /* ... */
}
function checkDeliveryZone(address) {
  /* ... */
}
function placeOrder(deliveryInfo, message) {
  /* ... */
}

function orderFood(phoneNumber) {
  const userId = getUserId(phoneNumber);
  const address = getAddress(userId);
  const deliveryInfo = checkDeliveryZone(address);
  const result = placeOrder(deliveryInfo, "주문 처리 완료");
  return result;
}
```

이 코드처럼 간단하게 표현할 수 있다면 좋겠지만, 실제로는 각 메서드에서 DB 조회, 네트워크 I/O 작업 등 비동기 작업을 수행하기 때문에 이렇게 간단하게 표현할 수 없다.
따라서 콜백 함수를 사용하여 비동기 작업을 수행하는 코드를 작성해야 한다.

```javascript
function getUserId(phoneNumber, callback) {
  /* ... */
}
function getAddress(userId, callback) {
  /* ... */
}
function checkDeliveryZone(address, callback) {
  /* ... */
}
function placeOrder(deliveryInfo, message, callback) {
  /* ... */
}

function orderFood(phoneNumber, callback) {
  getUserId(phoneNumber, function (userId) {
    getAddress(userId, function (address) {
      checkDeliveryZone(address, function (deliveryInfo) {
        placeOrder(deliveryInfo, "주문 처리 완료", function (result) {
          callback(result);
        });
      });
    });
  });
}
```

이렇게 간단하게 콜백 지옥을 만들 수 있다. 콜백의 문제점은 단순히 가독성의 문제만이 있는 것이 아니다.

**더 중요한 문제점은 콜백함수를 다른 함수로 전달하는 순간 그 콜백함수에 대한 제어권을 잃는 점이다.** 즉, 내가 제공한 콜백이 언제 실행되는지, 몇 번 실행되는지 등에 대해 신뢰할 수가 없게 된다.

더 예측하기 어렵게 되고 에러가 발생하기 쉽게 되며, 디버깅 또한 만만치 않게 된다.

## 프라미스 등장

Promise의 등장으로 인해 이러한 문제는 상당 부분 완화시킬 수 있다.

```javascript
function getUserId(phoneNumber) {
  /* Promise를 반환 */
}
function getAddress(userId) {
  /* Promise를 반환 */
}
function checkDeliveryZone(address) {
  /* Promise를 반환 */
}
function placeOrder(deliveryInfo, message) {
  /* Promise를 반환 */
}

function orderFood(phoneNumber) {
  return getUserId(phoneNumber)
    .then(function (userId) {
      return getAddress(userId);
    })
    .then(function (address) {
      return checkDeliveryZone(address);
    })
    .then(function (deliveryInfo) {
      return placeOrder(deliveryInfo, "주문 처리 완료");
    });
}
```

```javascript
// Arrow 함수 사용하면 더 세련된 코드 작성 가능
function orderFood(phoneNumber) {
  return getUserId(phoneNumber)
    .then((userId) => getAddress(userId))
    .then((address) => checkDeliveryZone(address))
    .then((deliveryInfo) => placeOrder(deliveryInfo, "주문 처리 완료"));
}
```

일단 콜백 기반의 처리보다 가독성이 한결 나아 보인다.

뿐만 아니라, 이제 해당 함수가 처리를 성공적으로 완료했을 경우 항상 `then()`에 넘겨진 함수가 단 한번 실행될 거라는 신뢰감을 가질 수 있다.

## 개발자의 욕심은 끝이 없다.

아까 작성한 첫번째 코드와 promise 기반의 코드를 비교해보자.

```javascript
function orderFood(phoneNumber) {
  const userId = getUserId(phoneNumber);
  const address = getAddress(userId);
  const deliveryInfo = checkDeliveryZone(address);
  const result = placeOrder(deliveryInfo, "주문 처리 완료");
  return result;
}
```

아무리 promise 기반으로 콜백 지옥을 피하고, arrow 함수로 코드도 더 세련되게 작성했지만 우리가 원하는 코드는 아니다.

우리는 더 나은 코드를 원한다. 그래서, async/await이 등장했다.

## async/await의 등장

```javascript
async function orderFood(phoneNumber) {
  const userId = await getUserId(phoneNumber);
  const address = await getAddress(userId);
  const deliveryInfo = await checkDeliveryZone(address);
  const result = await placeOrder(deliveryInfo, "주문 처리 완료");
  return result;
}
```

마치 동기 코드를 작성하는 것처럼 깔끔하다.

- 콜백 지옥도 없고
- Promise 체이닝의 복잡함도 없고
- 변수 스코프 문제도 자연스럽게 해결되고
- 에러 처리도 try-catch로 직관적으로 할 수 있다

```javascript
async function orderFood(phoneNumber) {
  try {
    const userId = await getUserId(phoneNumber);
    const address = await getAddress(userId);
    const deliveryInfo = await checkDeliveryZone(address);
    const result = await placeOrder(deliveryInfo, "주문 처리 완료");
    return result;
  } catch (error) {
    console.error("주문 처리 중 오류 발생:", error);
    throw error;
  }
}
```

## async/await는 내부적으로 어떻게 동작하는가?

async/await는 ECMAScript 2017에서 표준으로 정의되었다. **Node.js v7.6.0부터 네이티브로 지원**하기 시작했다.

### 핵심: Generator + Promise의 조합

async/await의 동작 원리는 간단하다. **내부적으로 Generator와 Promise를 조합하여 구현**된다.

```javascript
// 우리가 작성하는 코드
async function orderFood(phoneNumber) {
  const userId = await getUserId(phoneNumber);
  const address = await getAddress(userId);
  return address;
}

// 실제 내부 동작 (개념적 변환)
function orderFood(phoneNumber) {
  return _runGenerator(function* () {
    const userId = yield getUserId(phoneNumber);
    const address = yield getAddress(userId);
    return address;
  });
}
```

**변환 규칙**

- `async function` → Generator 함수 (`function*`)
- `await` → `yield`
- Generator를 자동으로 실행하는 런타임

### 동작 원리

#### 1. Generator가 실행 흐름을 제어한다

```javascript
function* myGenerator() {
  const a = yield promise1(); // 여기서 멈춤
  const b = yield promise2(); // 여기서 멈춤
  return a + b;
}
```

Generator는 `yield`를 만날 때마다 실행을 **일시 중지**하고, 컨텍스트(변수, 스택)를 **저장**한다.

#### 2. Promise가 재개 시점을 알려준다

```javascript
// 간단히 구현한 async/await 런타임
function runAsyncFunction(generatorFunc) {
  const gen = generatorFunc();

  function handle(result) {
    if (result.done) return Promise.resolve(result.value);

    // result.value는 Promise
    return result.value.then(
      (value) => handle(gen.next(value)), // Promise 완료 시 재개
      (error) => handle(gen.throw(error)) // 에러 시 Generator에 throw
    );
  }

  return handle(gen.next());
}
```

**핵심 포인트**

1. Generator를 한 번 실행 → `yield`에서 멈춤
2. `yield`된 Promise가 완료되면 → `gen.next(value)` 호출하여 재개
3. 다음 `yield`에서 다시 멈춤 → 반복
4. Generator가 끝나면 (`done: true`) 최종 값 반환

### 왜 await에 Promise를 사용해야 하나?

```javascript
async function example() {
  const result = await 42; // 이것도 작동한다!
  return result;
}
```

`await`는 어떤 값이든 받을 수 있지만, 내부적으로 `Promise.resolve(value)`로 감싸진다. 즉:

- `await promise` → 그대로 사용
- `await 42` → `Promise.resolve(42)`로 자동 변환

Promise가 없으면 비동기 작업의 완료 시점을 알 수 없기 때문이다.

### Node.js에서의 발전 과정

```
v0.x      → 콜백 지옥 (Callback Hell)
v0.11.2   → Generator 실험 지원 (--harmony 플래그)
v4.0.0    → Generator 안정화
v6.0.0    → Promise 네이티브 지원
v7.6.0    → async/await 네이티브 지원
v8.0.0+   → async/await가 표준이 됨
```

### 본질적인 흐름

```
Iterator Protocol (순회 가능한 객체)
    ↓
Generator (일시 중지/재개 가능한 함수)
    ↓
Generator + Promise (비동기 작업의 자동 제어)
    ↓
async/await (문법적 설탕)
```

### 이해하고 있어야 하는 것

1. **async 함수는 항상 Promise를 반환한다**

```javascript
async function foo() {
  return 42;
}
// 실제로는 Promise.resolve(42)를 반환
```

2. **await는 Promise가 완료될 때까지 기다린다**

```javascript
const result = await longRunningTask();
// longRunningTask가 완료될 때까지 함수 실행이 일시 중지
// 하지만 Node.js 이벤트 루프는 계속 돌아감!
```

3. **에러는 try-catch로 잡을 수 있다**

```javascript
async function example() {
  try {
    await riskyOperation();
  } catch (error) {
    // Promise reject가 여기로 온다
  }
}
```

4. **병렬 처리는 Promise.all 사용**

```javascript
// ❌ 느린 코드 (순차 실행)
const user = await getUser();
const posts = await getPosts(); // user와 무관한데 기다림

// ✅ 빠른 코드 (병렬 실행)
const [user, posts] = await Promise.all([getUser(), getPosts()]);
```

## 핵심 요약

**async/await의 본질**

- Generator로 실행 흐름 제어 (일시 중지/재개)
- Promise로 비동기 완료 시점 감지
- 두 개를 조합하여 동기 코드처럼 작성 가능

이것이 async/await의 내부 동작 원리다. 복잡해 보이지만, 결국 **"비동기 작업을 동기 코드처럼 쓸 수 있게 해주는 문법적 설탕"**이다.
