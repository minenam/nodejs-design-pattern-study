# Chapter 1 코드 예제

이 디렉토리는 Chapter 1의 핵심 개념을 실습할 수 있는 코드 예제를 포함합니다.

## 📁 파일 구조

```
code/
├── blocking-io.js           # 블로킹 I/O 예제
├── non-blocking-io.js       # 논블로킹 I/O 예제
├── reactor-pattern.js       # Reactor 패턴 구현
└── event-loop-demo.js       # 이벤트 루프 동작 시연
```

## 🚀 실행 방법

### 1. 블로킹 I/O vs 논블로킹 I/O 비교

```bash
# 블로킹 방식 (순차 처리)
node blocking-io.js

# 논블로킹 방식 (병렬 처리)
node non-blocking-io.js
```

**학습 포인트**:

- 블로킹 방식의 성능 문제
- 논블로킹 방식의 효율성
- 단일 스레드로 동시성 구현

### 2. Reactor 패턴

```bash
node reactor-pattern.js
```

**학습 포인트**:

- 이벤트 디멀티플렉서 동작
- 이벤트 루프 메커니즘
- 핸들러 실행 순서

### 3. 이벤트 루프 상세 동작

```bash
node event-loop-demo.js
```

**학습 포인트**:

- setTimeout vs setImmediate vs process.nextTick
- 마이크로태스크 vs 매크로태스크
- 이벤트 루프의 6가지 단계
- 실무 적용 패턴


## 📚 추천 학습 순서

1. **blocking-io.js** → 문제 이해
2. **non-blocking-io.js** → 해결책 확인
3. **reactor-pattern.js** → 핵심 패턴 학습
4. **event-loop-demo.js** → 상세 동작 파악

## 💡 실습 팁

### 코드 수정해보기

각 예제의 코드를 수정하여 동작을 직접 확인해보세요:

```javascript
// event-loop-demo.js에서
setTimeout(() => console.log("A"), 0);
setImmediate(() => console.log("B"));
process.nextTick(() => console.log("C"));

// 순서는? C → A → B (또는 C → B → A)
```

### 성능 측정

블로킹 vs 논블로킹 성능 차이를 직접 측정해보세요:

```javascript
console.time("operation");
// ... 코드 실행
console.timeEnd("operation");
```

### 디버깅

Node.js 디버거로 단계별 실행을 확인하세요:

```bash
node --inspect-brk reactor-pattern.js
# Chrome DevTools에서 chrome://inspect 열기
```

## 🔧 문제 해결

### CommonJS vs ESM 충돌

- `.js` 파일은 기본적으로 CommonJS
- `.mjs` 파일은 ES Module
- `package.json`에 `"type": "module"` 추가 시 `.js`도 ESM으로 처리

### 이벤트 루프 이해

이벤트 루프가 어려우면 다음 순서로 학습:

1. 동기 코드 실행 이해
2. setTimeout 하나만 사용
3. Promise 추가
4. process.nextTick 추가
5. 모두 섞어서 사용

## 📖 참고 자료

- [Node.js 공식 문서](https://nodejs.org/en/docs/)
- [libuv 디자인 개요](http://docs.libuv.org/en/v1.x/design.html)
- [이벤트 루프 상세](https://nodejs.org/en/docs/guides/event-loop-timers-and-nexttick/)

---

**다음**: 상위 디렉토리의 `readme.md`에서 전체 챕터 요약을 확인하세요!
