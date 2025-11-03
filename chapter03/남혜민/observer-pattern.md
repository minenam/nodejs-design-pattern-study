# Chapter 03. 콜백과 이벤트

## 관찰자 패턴

- 관찰자 패턴(Observer Pattern): 객체 상태 변화에 따라 다른 객체(관찰자 또는 listener)에 알림을 보내는 디자인 패턴
- 콜백패턴과 관찰자 패턴의 차이점
  - 콜백 패턴: 단일 콜백 함수가 특정 작업 완료 후 호출
  - 관찰자 패턴: 여러 관찰자가 이벤트 발생 시 알림을 받음

### EventEmitter 클래스

- 비동기 이벤트를 다루는데 사용되는 Node.js의 핵심 모듈

- on(event, listener): 이벤트 리스너 등록
- emit(event, ...args): 이벤트 발생 및 리스너 호출
- once(event, listener): 한 번만 실행되는 리스너 등록
- removeListener(event, listener) / off(event, listener): 특정 리스너 제거

- 오류전파: error 이벤트 리스너가 없으면 예외를 발생하고 프로세스 종료. error 이벤트 리스너 등록 필요. error 특수한 이벤트를 발생시켜 error 객체를 인자로 처리

```javascript
const EventEmitter = require("events");
const emitter = new EventEmitter();
// 이벤트 리스너 등록
emitter.on("data", (message) => {
  console.log(`Data received: ${message}`);
});
// 이벤트 발생
emitter.emit("data", "Hello, Observer Pattern!");

// 한 번만 실행되는 리스너 등록
emitter.once("onceEvent", () => {
  console.log("Once event triggered");
});
emitter.emit("onceEvent"); // 출력됨
emitter.emit("onceEvent"); // 출력되지 않음
```

- 예. EventEmitter를 상속받은 http.Server 클래스 : request, connection, close 이벤트 제공

#### 메모리 누수

- 구독 해지로 메모리 누수를 예방하고 불필요한 메모리 사용 방지
- 기본 10개 리스너 제한, 초과 시 경고 발생
- ref. JavaScript 가비지 컬렉션 https://javascript.info/garbage-collection
