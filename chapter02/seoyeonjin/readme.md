## [2장 - 모듈 시스템]

<aside>
✅

모듈은 코드를 독립된 단위로 분리하고 재사용하기 위한 설계 단위이다.

Node.js는 두 가지 모듈 시스템(CommonJS, ECMAScript module)을 지원한다.

</aside>

### 2.1 모듈의 필요성

- 독립적인 기능을 개발하고 테스트할 수 있게한다.
- 코드 재사용
- 캡슐화, 정보 은닉
- 종속성 관리. 필요한 종속성을 쉽게 import

### 2.2 Javascript와 Node.js의 모듈 시스템

브라우저에는 모듈 시스템이 없었기 때문에, Node.js는 서버 환경에서도 JS를 쓸 수 있도록 CommonJS라는 모듈 시스템 표준을 구현했다.

- CommonJS
- ECMAScript module

### 2.3 모듈 시스템과 패턴

- 모듈
  - 명시적으로 노출시키지 않은 함수들과 변수를 비공개로 유지하여 은닉성을 강화한다.
  - 노출식 모듈 패턴
    - 모든 스크립트는 전역 범위에서 실행되기 때문에, private 범위를 만들고 공개될 부분만 내보내기 위해 즉시 실행 함수를 활용한다.
    - 노출식 모듈 패턴의 private은 ‘클로저에 의한 접근 불가능 영역’을 만든 것. → 언어 차원에서 보호되는 완전한 private은 아니다.

### 2.4 CommonJS 모듈

- require는 로컬 파일 시스템으로부터 모듈을 임포트
  - require 함수는 동기적으로 실행된다.
  - require 함수는 처음 로드될 때만 로드되고 평가된다. 후로는 캐시된 버전을 반환한다.

### 2.5 모듈 정의 패턴

- exports와 module.exports는 모듈에서 공개될 기능을 내보내기 위해서 사용한다.
  - exports를 통해 public으로 공개할 모든 값을 할당한다.

### 2.6 ESM: ECMAScript 모듈

- static으로 동작한다. import는 모듈의 가장 상위 레벨과 제어 흐름 구문의 바깥쪽에 기술된다.
- 실행 시 동적으로 생성할 수 없다.
- tree shaking: 코드 최적화를 해줄 수 있는 종속성 트리의 정적 분석을 가능하게 해준다.
- 모듈 적재 단계
  1. 로딩 단계
     1. 생성: import 구문을 찾고 재귀적으로 각 파일로부터 모든 파일 내용을 적재한다.
     2. 인스턴스화: export된 개체들에 의해 명명된 참조를 메모리에 유지한다.
     3. 평가: 코드를 실행하며 인스턴스화된 모든 개체가 실제 값을 얻을 수 있도록 한다.

### 2.7 ESM과 CommonJS의 차이점과 상호 운용

- ES 모듈은 strict mode에서 실행된다.
- this 동작
  - ES 모듈의 전역범위에서 this → undefined
  - CommonJS 의 this → exports와 같은 참조
- import
  - ESM에서 CommonJS import 가능
  - CommonJS에서 ESM import 불가능
