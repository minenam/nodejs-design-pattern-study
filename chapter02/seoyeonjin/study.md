# TS에서 CJS와 ESM 사용하기

## 1️⃣ TS에서 CJS와 ESM 사용하기

TS는 JS의 상위 집합이므로, 컴파일 시 어떤 모듈 시스템으로 변환할지 `tsconfig.json`에서 지정할 수 있다.

### CommonJS 설정

```json
{
  "compilerOptions": {
    "module": "CommonJS",
    ...
  }
}
```

- 결과물은 `require` 문법으로 변환된다.
- Node.js 구버전과 호환성이 높고, 대부분의 기존 npm 패키지가 이 방식이다.

### ESM 설정

```json
{
  "compilerOptions": {
    "module": "ESNext",
    ...
  }
}
```

`package.json`에 `"type": "module"`을 추가해야 Node.js가 ESM으로 인식한다.

이때는 require, \_\_dirname을 사용할 수 없고, 대신 import.meta.url을 활용한다.

TS 코드에서 CommonJS와 ESM을 함께 사용할 때는 `esModuleInterop` 옵션을 켜면 CommonJS의 module.exports를 ESM의 default import 문법(import X from 'pkg')으로 불러올 수 있다.

```json
{
  "compilerOptions": {
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true
  }
}
```

## 2️⃣ 왜 둘 다 필요할까?

Node.js는 CommonJS로 쌓인 과거 생태계를 지키면서도, ESM을 통해 브라우저 표준과 최신 번들링 최적화에 대응하기 위해 두 모듈 시스템을 모두 지원한다.

1. 기존의 수십만 개의 패키지가 이미 CommonJS로 작성되어있다.
2. 브라우저 표준과 번들러 지원 → 브라우저는 ESM을 표준으로 채택하고 있다.

| 환경           | 주로 사용하는 모듈 시스템 | 이유                                                     |
| -------------- | ------------------------- | -------------------------------------------------------- |
| **프론트엔드** | **ESM**                   | - 브라우저는 `<script type="module">`로 ESM을 기본 지원. |

- Vite, Webpack, Rollup 등 모든 번들러가 ESM을 기반으로 동작.
- **트리 셰이킹 등 최적화 용이.** |
  | **백엔드 (Node.js)** | **과거: CommonJS 현재: ESM 전환 중** | - Node.js가 오랫동안 CommonJS 중심으로 동작했지만,버전 14 이상부터 ESM을 공식 지원하면서 점차 전환 중.
- TypeScript 기반 프로젝트나 최신 프레임워크(NestJS 등)는 ESM을 권장. |

→ SSR 환경(서버가 브라우저 코드와 서버 코드를 한번에 실행)에서는 브라우저(Esm 기반) 와 Node.js 런타임(CJS 또는 ESM) 이 서로 다른 모듈 시스템을 사용할 수 있기 때문에, 런타임이 두 시스템을 모두 이해할 수 있어야 한다.

## 3️⃣ 하나의 패키지가 CJS와 ESM을 동시에 제공하려면?

`package.json`의 `exports` 필드를 활용한다.

> `exports` 필드는 Node.js 12 이상에서 도입된 필드로,
> main보다 우선순위가 높으며 환경에 따라 require와 import 경로를 다르게 지정할 수 있다.

### 예시

```json
{
  "name": "my-lib",
  "type": "module",
  "main": "./dist/index.cjs",
  "exports": {
    "import": "./dist/index.mjs", // ESM import 시
    "require": "./dist/index.cjs" // CJS require 시
  }
}
```

→ `exports` 필드를 통해 하나의 패키지가 두 모듈 시스템을 동시에 지원하고 내부 구조를 캡슐화하며 호환성을확보할 수 있다.

## 참고

https://toss.tech/article/commonjs-esm-exports-field
