## CallBack
비동기 작업의 결과를 가지고 런타임에 의해 호출되는 함수.

모든 비동기 매커니즘을 기초로 하는 것들의 가장 기본적인 구성요소

동기적으로 사용되는 return의 사용을 대신 할 수 있음.

그 이유는 함수가 일급 클래스 객체이기 때문.

콜백을 구현하는 또 다른 이상적 구조는 클로저(closure).

```ts
const func = (callback: (result: string) => void) => {
  setTimeout(() => {
    callback("작업 완료");
  }, 1000);
};

func((result) => {
  console.log(result); // "작업 완료"
});
```

### 연속 전달 방식
JS에서 콜백은 다른 함수에 인자로 전달되는 함수이며, 작업이 완료되면 작업 결과를 가지고 호출

함수형 프로그래밍에서 이런식으로 결과를 전달하는 방식을 연속 전달 방식(CPS: continuation-passing style)이라고 부름.

#### 동기식 연속 전달 방식
```js
const add = (a, b) => {
    return a + b;
};
```

이 경우 결과가 return을 통해 호출자에게 전달됨. 이것을 직접 스타일이라고 하고 동기식 프로그래밍에서 일반적으로 결과를 반환하는 방식임.

앞의 함수와 동일한 처리를 CPS로 바꾼 코드는 다음과 같음.

```js
const addCps = (a, b, callback) => {
    callback(a + b);
};
```

addCps() 함수는 동기 CPS 함수로 콜백 또한 작업이 완료되었을 때 작업을 완료함.

### 비동기 연속 전달 방식
```js
const additionAsync = (a, b, callback) => {
    setTimeout(() => callback(a + b), 100)
}
```

setTimeout() 은 이벤트 큐에 주어진 밀리초 후에 실행되는 작업을 추가함. 이는 명백한 비동기 작업임.

비동기 작업을 실행시키기 때문에 콜백의 실행이 끝날 때까지 기다리지 않는 대신,

즉시 반환되어 additionAsync()로 제어를 돌려주어 제어가 호출자에게 반환.

Node.js의 이 속성은 매우 중요한데 그 이유는 비동기 요청이 전달된 후

즉시 제어를 이벤트 루프에 돌려주고 큐(대기열)에 있는 새로운 이벤트가 처리될 수 있도록 하기 때문.