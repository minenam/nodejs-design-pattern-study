# Chapter 02. 모듈 시스템

## 2-1. 모듈의 필요성

- 관리 및 테스트 용이
- 코드 재사용성
- 은닉성 제공
- 종속성 관리

## 2-2. JavaScript와 Node.js 에서의 모듈 시스템

cf. AMD(Asynchronous Module Definition), UMD (Universal Module Definition) 등 브라우저 환경에서 사용되는 모듈 시스템

- 로컬의 파일 시스템에 접근 가능하고, 단일 스레드 환경에서 동작하는 Node.js는 브라우저와 다른 모듈 시스템이 필요
- 브라우저 아닌 환경에서 JS 모듈 시스템을 사용할 수 있는 CommonJS가 등장 (CJS)
- ECMAScript 6 (ES2015) 에서 표준 모듈 시스템 ESM (ECMAScript Module) 도입

## 2-3. 모듈 시스템과 패턴

### 노출식 모듈 패턴

- 전역 네임스페이스 오염 방지
- 즉시 실행 함수(IIFE)로 모듈화: 자기 호출 함수로 private 스코프 생성
- 노출식 모듈 패턴(Revealing Module Pattern): 모듈 내부의 변수와 메서드를 은닉하고, 공개할 부분만 명시적으로 노출
- [예시 코드](./code/revealing-module-pattern.js) 참고

## 2-4. CommonJS 모듈

- Node.js 첫 번째 내장 모듈
- require() 함수: 모듈 불러오기, 동기적으로 작동
- module.exports 또는 exports 객체로 모듈 내보내기
- 모듈 시스템 내부 동작 방식
  - 각 파일은 독립된 모듈로 취급
  - 모듈 캐싱: 동일 모듈을 여러 번 require 해도 최초 한 번만 로드
  - 모듈 래핑: 각 모듈은 함수로 래핑되어 독립된 스코프 제공
- 해결 (resolving) 알고리즘
  - 파일 모듈: /로 시작하면 절대경로, ./ 또는 ../로 시작하면 상대경로
  - 코어 모듈: Node.js 내장 모듈
  - 패키지 모듈: node_modules 폴더 내의 모듈
- 순환 종속성

## 2-5. 모듈 정의 패턴

- exports 지정하기 (Named exports): exports 변수만으로 public API 정의 가능
- module.exports 재할당 (Single export): module.exports에 객체, 함수 등 할당, 최소한의 노출 (small surface area). 서브스택(substack) 패턴
- 단일 진입점을 제공하여 단일 책임만 지는 SRP (Single Responsibility Principle) 준수

## 2-6. ESM: ECMAScript 모듈

- ES 모듈은 static 구조
- .mjs 확장자 또는 package.json 에 "type": "module" 설정
- import / export 키워드 사용
- 확장자를 명시적으로 작성해야 함
- default export 지원: 이름 없는 개체 내보내기
- 비동기 임포트 지원: import() 함수로 동적 로딩 가능 (실행 중에 수행, 모듈객체를 promise로 반환)
- 모듈 적재:
  - 로딩 단계: 모든 모듈 그래프(종속성 그래프)를 분석하고, 필요한 모듈을 비동기적으로 로드

## 2-7. ESM vs CommonJS

#### CommonJS vs ESM 비교

**CommonJS (동적 구조)**:

```javascript
// 실행 시점에 결정됨
const moduleName = getUserInput(); // 사용자 입력에 따라 달라짐
const myModule = require(moduleName); // 런타임에 어떤 모듈인지 결정

// 조건부 로딩 가능
if (process.env.NODE_ENV === "development") {
  const debugModule = require("./debug"); // 조건에 따라 로딩
}
```

**ESM (정적 구조)**:

```javascript
// 코드 작성 시점에 이미 결정됨
import { add, subtract } from "./calculator.js"; // 파일명과 함수명 고정
import express from "express"; // 항상 같은 모듈

// ❌ 이런 것들은 불가능
// import moduleName from getUserInput(); // 에러!
// if (condition) {
//   import something from './module.js'; // 에러!
// }
```

**1. 번들링 최적화 (Tree Shaking)**

```javascript
// utils.js
export function add(a, b) {
  return a + b;
}
export function subtract(a, b) {
  return a - b;
}
export function multiply(a, b) {
  return a * b;
} // 사용되지 않음

// main.js
import { add } from "./utils.js"; // add만 import

console.log(add(1, 2));

// 결과: multiply 함수는 최종 번들에서 제거됨 (Tree Shaking)
```

**2. 컴파일 타임 에러 검출**

```javascript
// math.js
export function calculate(x, y) {
  return x + y;
}

// main.js
import { calcuate } from "./math.js"; // 오타!
// ↑ 실행 전에 에러를 발견할 수 있음
```

**3. 빠른 의존성 분석**

```javascript
// 파일 시스템을 읽지 않아도 import/export 관계를 미리 파악 가능
import React from "react";
import { Router } from "express";
import { connect } from "./database.js";

// 번들러나 개발 도구가 의존성 그래프를 빠르게 생성
```

## 요약

- 모듈이 필수적인 이유, Node.js에서 다른 모듈 시스템이 가능한 이유
- CommonJS 내부와 모듈 패턴
- ES 모듈 (ESM)
- CommonJS vs ESM 비교
