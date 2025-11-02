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
