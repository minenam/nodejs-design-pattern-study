## 비동기 프로그래밍의 어려움

### 콜백 지옥
콜백의 정의가 코드의 가독성을 떨어뜨리고 관리할 수 없는 상황.

Node.js와 JavaScript에서 일반적으로 가장 잘 알려져 있는 안티 패턴 중 하나

콜백 지옥의 다른 문제는 각 스코프에서 사용하는 변수의 중복이 발생한다는 점이다.

### 병렬 실행
Node.js의 Non-Blocking 성질 덕분에 단 하나의 스레드만 가지고도 동시성을 달성할 수 있다.

실제로 이 경우 병렬이라는 용어는 부적절하다.

작업들을 동시에 실행하는 것이 아니라 Non-Blocking API 위에서 실행되고 이벤트루프에 의해 인터리브(interleaved)된다는 것을 의미함.

Node.js에서는 Non-Blocking API에 의해 내부적으로 동시 처리되기 때문에 병렬 비동기 작업으로 실행된다는 것임.

## 동시 작업과 경쟁 상태 수정
멀티 스레드와 함께 Blocking I/O를 사용하는 경우 병렬로 작업들을 실행할 때 문제가 발생할 수 있음.

Node.js가 가진 동시성 모델의 중요한 특징은 작업 동기화 및 경쟁 상태를 다루는 방식임.

멀티 스레드 프로그램에서 이것은 일반적으로 Lock, Mutex, Semaphore 및 Monitor와 같은 구조를 사용하여 수행됨.

이는 병렬 처리의 성능에 상당한 영향을 미칠 뿐만 아니라 가장 복잡할 수 있음.

Node.js에서는 모든 것이 단일 스레드에서 실행되기 때문에 일반적으로 멋진 동기화 메커니즘을 필요로 하지 않음.

그러나 이것이 경쟁 조건을 가지지 않는 다는 것을 의미하지는 않음.

오히려 문제의 원인은 비동기 작업의 호출과 그 결과에 대한 통지 사이에 생기는 지연임.

## Promise
더 나은 비동기 코드를 만들기 위한 해법으로 Promise가 등장함.

비동기 작업의 최종 결과에 대한 상태를 전달하는 객체.

pending: 작업이 아직 완료되지 않음

settled: 작업이 완료되어 더 이상 진행 중이지 않음(fulfilled 또는 rejected 상태)

fulfilled: 작업이 성공적으로 완료됨

rejected: 작업이 실패함

fulfilled나 rejected와 관련된 에러를 받기 위해 Promise의 then()을 사용할 수 있음. 형식은 다음과 같음.

```js
promise.then(onFulfilled, onRejected)

thenOperation(arg)
    .then(result => {
        // 결과 처리
    }, err => {
        // 에러 처리
    })
```

또한 여러가지 환경에서 비동기 작업들을 손쉽게 통합하고 배치할 수 있는 체인을 구성할 수 있음.

```js
thenOperation(arg)
    .then(result1 => {
        // 결과 처리
    })
    .then(result2 => {
        // 체이닝된 결과 처리
    })
    .catch(err => {
        // 에러 처리
    })
    .finally(final => {
        // 항상 실행되는 코드
    })
```

위 코드에서 then()은 동기적으로 호출되지만 내부적으로 비동기 작업이 완료될 때까지 기다림.

### Promise API
Promise 생성자는 새로운 Promise 인스턴스를 생성함.

```js
new Promise((resolve, reject) => {})
```

생성자에서 주어지는 CallBack은 두 개의 인자를 받음.

1. resolve: Promise를 이행하는 함수
2. reject: Promise를 거부하는 함수, error와 함께 반환되며 Error 인스턴스임.

### Promise 정적 메서드
Promise.all(): 여러 Promise를 병렬로 실행하고 모든 Promise가 이행될 때까지 기다림. 하나라도 거부되면 즉시 거부됨.

Promise.allSettled(): 모든 Promise가 이행되거나 거부될 때까지 기다림.

Promise.race(): 가장 먼저 이행되거나 거부된 Promise의 결과를 반환함.

## Async/await
Async/await는 Promise 기반 비동기 코드를 작성하기 위한 새로운 문법적 설탕임.

비동기적 순차 실행을 읽고 쓰기 쉽게 만들 수 있음.

### async 함수와 await 표현
async 함수안에서 await를 사용하면 동기적으로 실행되는 것처럼 보이지만 실제로는 비동기적으로 실행됨.

각 await 표현에서 함수의 실행이 보류되고 상태가 저장되며 이벤트루프로 반환됨.

async 함수는 항상 Promise를 반환함. 함수의 반환값이 Promise.resolve()에 의해 감싸져 반환됨.

### Async/await에서의 에러 처리
try/catch/finally 블록을 사용하여 async 함수 내에서 발생하는 에러를 처리할 수 있음.

```js
const delayError = (milliseconds) => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            reject(new Error(`Error after ${milliseconds}ms`))
        }, milliseconds)
    })
};

const playingWithErrors = async (throwSyncError) =>{
    try {
        if (throwSyncError) {
            throw new Error('This is a synchronous error')
        }
        await delayError(1000)
    } catch (err) {
        console.error(`We have an error: ${err.message}`)
    } finally {
        console.log('Done')
    }
}
```

### 안티패턴 - 순차 실행을 위한 Array.prototype.forEach()와 async/await 사용
```js
arr.forEach(async (item) => {
    await fn(item)
})
```

위 코드는 의도한 대로 작동하지 않음. forEach()는 비동기 함수를 인식하지 못하고, await는 forEach() 콜백 내부에서만 작동함.

대신 for...of 루프를 사용하여 순차 실행을 구현할 수 있음.

```js
for (const item of arr) {
    await fn(item)
}
```

### 병렬 실행
병렬 실행이 필요한 경우 Promise.all()을 사용하는 것을 권고한다.

```js
const results = await Promise.all(promises)
```
