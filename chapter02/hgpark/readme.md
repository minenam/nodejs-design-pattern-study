# 모듈

## 모듈시스템

### 모듈의 필요성

1. 코드베이스의 디커플링
2. 재사용성
3. 은닉성
4. 종속성 관리

파일시스템에만 의존 - CJS?

### 모듈시스템과 패턴

문제점
    - namespace가 없음 -> 스코프의 오염 발생
    - IIFE를 이용한 스코프 격리를 통해 분리하여 사용해왔음

## CommonJS 모듈시스템

require: 로컬 파일 시스템으로부터 모듈을 import
exports, module.exports: 현재 모듈에서 공개될 기능들을 내보내기 위한 예약어

CJS에서는 모듈을 동기적으로 로드하므로, 여러 모듈을 import 할때는 올바른 순서를 지켜야 한다.

모듈 로드 과정

1. 모듈 이름을 입력받아 전체 경로 resolve
2. 이미 로드된 모듈은 캐시 사용
3. 아직 로드되지 않은 경우 빈 객체 리터럴을 통해 초기화된 export속성을 가진 module객체를 만듬
4. 최초 로드 후 캐시
5. 모듈 소스코드는 해당 파일에서 읽어오며 생성된 module객체와 require()함수의 참조를 모듈에 전달
6. 모듈의 public API를 나타내는 module.exports가 호출자에게 반환

### module.exports vs exports

exports: module.exports의 초기값에 대한 참조 = 모듈이 로드되기 전에 만들어지는 객체 리터럴 -> exports는 일반 객체 리터럴이므로 재할당이 가능하다. (module.exports는 재할당 안됨)

### require 함수는 동기

### resolving 알고리즘

파일모듈: / 절대경로, ./ 상대경로
코어모듈 /, ./ 로 시작하지 않으면 Node.js 모듈을 검색
패키지 모듈: 일치하는 moduleName이 없는 경우 디렉터리구조를 탐색하며 node_modules디렉터리를 찾고, 그 안에서 일치하는 모듈을 찾음 ({}.js, {}/index.js, P{/pakage.json})

### 순환 종속성

loaded라는 변수를 통해 완전히 로드된 경우값을 true 로 바꾼다.
어떤 모듈이 먼저 로딩되는지에 따라 불완전하게 로드될 수 있다.

## 모듈 정의 패턴

### export 지정하기

export에 값을 할당하면 참조하는 객체 (혹은 module.exports) 의 속성에 공개할 모든 값을 할당

### 함수 내보내기

module.exports 변수 전체를 함수로 재할당
    - 모듈에 대한 명확한 진입점을 가짐
모든 모듈은 SRP를 지킬것을 강력히 권장하며, 모듈은 단일기능에 대한 책임을 갖고, 책임은 모듈에 의해 캡슐화 되어야 함

### 클래스 내보내기

..?
module.exports = Logger

### 

module.exports =  new Logger

## ECMAScript 모듈 (ESM)
## ESM VS CommonJS