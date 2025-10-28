# 요약

# 모듈의 필요성
좋은 모듈 시스템은 많은 도움을 줌.

코드베이스를 나누어 여러 파일로 분할하는 방법을 제시, 코드를 좀 더 구조적으로 관리할 수 있게 하고, 각각의 독립적인 기능의 조각들을 개발 및 테스트하는데에 도움을 줌.

코드를 재사용할 수 있게 해줌. 모듈은 다른 프로젝트에도 유용하고 일반적인 특성을 구현할 수 있음.

은닉성을 제공하여 복잡한 구현을 숨긴채 명료한 책임을 가진 간단한 인터페이스만 제공할 수 있음.

종속성을 관리하며 third-party를 포함하여 개발자로 하여금 기존에 있는 모듈에 의존하여 쉽게 빌드할 수 있게 해줌. 또한, 사용자가 주어진 모듈의 실행에 있어 필요한 일련의 종속성들을 쉽게 가져올 수 있게 해줌.

모듈과 모듈 시스템을 구분해야함. 모듈은 코드의 독립적인 단위이고, 모듈 시스템은 프로젝트에서 모듈을 정의하고 사용하게 해주는 도구.

# JS와 Node.js에서의 모듈 시스템
JS 진영에서는 오랫동안 이 요소가 결핍되다가 어플리케이션의 복잡성이 증가하고 프레임워크가 생태계를 점유해가면서 모듈 시스템을 정의하기 위한 여러 시도가 있었음.

Node.js가 처음 만들어졌을 때, 브라우저가 아닌 환경에서 JS 모듈 시스템을 제공할 수 있도록 CommonJS라는 모듈 시스템을 구현하게 됨.

CommonJS는 Node.js에서 주된 모듈 시스템이 되었고 WebPack과 같은 모듈 번들러 덕분에 브라우저 환경에서도 유명세를 가지게 됨.

2015년에 ES6가 나오게 되면서 ESM이라는 공식 제안이 나오게 됨.

ES6에서는 ESM을 위한 공식적인 명세만을 정의하고 구체적인 구현은 제공하지 않음.

Node.js는 버전 13.2.0부터 ESM에 대한 안정적인 지원을 함.

# 모듈 시스템과 패턴

## 노출식 모듈 패턴
JS의 주요 문제점 중 하나는 네임스페이스가 없다는 것임. 모든 스크립트는 전역 범위에서 실행됨.

따라서 내부 어플리케이션 코드나 종속성 라이브러리가 그들의 기능을 노출시키는 동시에 스코프를 오염시킬 수 있음.

전역 범위에 의존하는 것은 매우 위험한 작엄이고 어플리케이션이 확장됨에 따라 더욱 개별적인 기능 구현에 의존해야 하는 상황이 발생함.

이러한 문제를 해결하기 위한 보편적인 기법을 노출식 모듈 패턴이라고 함.

```js
const myModule = (() => {
    const privateFoo = () => {};
    const privateBar = [];

    const exported = {
        publicFoo: () => {},
        publicBar: () => {}
    };

    return exported
})() // 여기서 괄호가 파싱되면, 함수는 호출됩니다.

console.log(myModule) // { publicFoo: [Function: publicFoo], publicBar: [Function: publicBar] }
console.log(myModule.privateFoo, myModule.privateBar) // undefined undefined
```

이 패턴은 자기 호출 함수를 사용함. 이러한 종류의 함수를 즉시 실행 함수 표현(IIFE)이라고 부름.

private 범위를 만들고 공개될 부분만 내보내게 됨.

JS에서는 함수 내부에 선언한 변수는 외부 범위에서 접근할 수 없음.

함수는 선택적으로 외부 범위에 정보를 전파시키기 위해서 return 구문을 사용할 수 있음.

이 패턴은 배공개 정보의 은닉을 유지하고 공개할 API를 내보내기 위해서 이러한 특성을 잘 활용함.

# CommonJS 모듈
CommonJS는 Node.js의 첫 번째 내장 모듈 시스템이고 명세를 고려하여 추가적인 자체 확장 기능과 함께 구현됨.

명세의 두 가지 주요 개념은 다음과 같음.
- require는 로컬 파일 시스템으로부터 모듈을 가져오게 해줌.
- exports와 module.exports는 현재 모듈에서 공개된 기능들을 내보내기 위해서 사용.

## 직접 만드는 모듈 로더
Node.js의 require()의 원래 기능 중 일부를 모방한 함수를 만들어 보겠습니다.

```js
function loadModule(filename, module, require) {
    const wrappedSrc =
    `(function (module, exports, require) {
        ${fs.readFileSync(filename, 'utf8')}
    })(module, module.exports, require)`
    eval(wrappedSrc)
}
```

모듈의 소스코드는 노출식 모듈 패턴과 마찬가지로 기본적으로 함수로 감싸짐.

여기서 차이점은 일련의 매개변수를 함수에 전달한다는 것임. module, exports, require가 그것임.

눈여겨봐야 할 점은 래핑 함수의 exports 인자가 module.exports의 내용으로 초기화되었다는 것.

또, 모듈의 내용을 읽어들이기 위해서 readFileSync를 사용하고 있다는 점도 주목해야 함.

파일시스템의 동기식 버전을 사용하는 것은 일반적으로 권장되지 않지만 여기서는 적절함.

CommonJS에서 모듈을 로드하는 것이 의도적인 동기 방식이기 때문임.

이러한 방식에서는 여러 모듈을 임포트할 때 올바른 순서를 지키는 것이 중요함.

```js
function require(moduleName) {
    console.log(`Require invoked for module: ${moduleName}`)
    const id = require.resolve(moduleName) // (1)
    
    if (require.cache[id]) { // (2)
        return require.cache[id].exports
    }
    
    // 모듈 메타데이터
    const module = { // (3)
        exports: {},
        id
    }
    
    // 캐시 업데이트
    require.cache[id] = module // (4)
    
    // 모듈 로드
    loadModule(id, module, require) // (5)
    
    // 익스포트되는 변수 반환
    return module.exports // (6)
}
require.cache = {}
require.resolve = (moduleName) => {
    /* 모듈이름으로 id로 불리게 되는 모듈의 전체경로를 찾아냄(resolve) */
}
```

위 함수는 Node.js에서 모듈을 로드하기 위해 사용되는 Node.js require()의 동작을 모방함.

우리가 작성한 모듈 시스템은 다음과 같이 설명됨.
1. 모듈 이름을 입력으로 받아 수행하는 첫 번째 일은 우리가 id라고 부르는 모듈의 전체경로를 알아내는 것, 이것은 require.resolve()를 통해 수행됨.
2. 모듈이 이미 로드된 경우 캐시된 모듈을 사용함. 즉시 반환.
3. 모듈이 아직 로드되지 않은 경우 최초 로드를 위해서 환경을 설정함. 특히 빈 객체 리터럴을 통해 초기화된 exports 속성을 가지는 module 객체를 만듬. 이 객체는 불러올 모듈의 코드에서의 public API를 export 하는데 사용함.
4. 최초 호드 후에 module 객체가 캐시됨.
5. 모듈은 해당 파일에서 읽어오며, 코드는 앞에서 살펴본 방식으로 평가됨. 방금 생성한 module 객체와 require 함수의 참조를 모듈에 전달함. 모듈을 module.exports 객체를 조작하거나 대체하여 public API를 export 함.
6. 마지막으로 public API를 나타내는 module.exports 객체가 반환됨.

## module.exports VS exports
Node.js에 익숙하지 않은 많은 개발자들이 공통적으로 혼란스러워 하는 것은 public API를 공개하기 위해 사용하는 module.exports와 exports의 차이점이다.

앞서 작성한 require()를 통해 이 차이점을 명확하게 이해할 수 있음.

변수 exports는 module.exports의 초기 값에 대한 참조일 뿐.

우리는 이 값이 본질적으로 모듈이 로드되기 전에 만들어지는 간단한 객체 리터럴이라는 것을 확인함.

즉, 다음과 같이 exports가 참조하는 객체에만 새로운 속성을 추가할 수 있음.

```js
exports.hello = () => {
    console.log('Hello, World!')
}
```

exports 변수의 재할당은 module.exports의 내용을 변경하지 않기 때문에 아무런 효과가 없음.

그것은 exports 변수 자체만을 재할당함. 따라서 이런 코드는 잘못됨.

```js
exports = () => {
    console.log('Hello, World!')
}
```

함수, 인스턴스 또는 문자열과 같은 객체 리터럴 이외의 것을 배보내려면 다음과 같이 module.exports를 다시 할당해야 함.

```js
module.exports = () => {
    console.log('Hello, World!')
}
```

## require()는 동기적이다.
module.exports 에 대한 할당도 역시 동기적이어야 한다. 예를 들어 다음 코드는 올바르지 않음.

```js
setTimeout(() => {
    module.exports = function () {
        console.log('Hello, World!')
    }
}, 100)
```

그래서 모듈을 정의할 때 동기적으로 코드를 사용하도록 제한함으로서 우리가 모듈을 정의하는 방식에 영향을 미침.

이것이 Node.js에서 핵심 라이브러리가 비동기 방식에 대한 대안으로 동기식 API를 제공하는 이유 중 하나임.

## resolving 알고리즘
종속성 지옥이라는 용어는 프로그램의 종속성이 서로 공통된 라이브러리에 의존하지만 호환되지 않는 서로 다른 버전을 필요로 하는 상황을 나타냄.

Node.js는 불러와지는 위치에 따라 다른 버전의 모듈을 불러올 수 있도록 하여 이 문제를 해결함.

이 특성의 장점은 Node.js 패키지 매니저가 어플리케이션의 종속성을 구성하는 방식과 require()에서 사용하는 resolving 알고리즘에도 적용됨.

앞서 보았듯이 resolve() 함수는 모듈 이름을 입력으로 사용하여 모듈 전체의 경로를 반환함.

이 경우는 코드를 로드하고 모듈을 고유하게 식별하는데 사용됨. 크게 세가지로 나뉨.

1. 파일 모듈: 모듈 이름이 `/`로 시작하면 모듈에 대한 절대 경로로 간주되어 그대로 반환, `./`로 시작하면 모듈 이름은 상대 경로로 간주되며, 이는 요청한 모듈로부터 시작하여 계산
2. 코어 모듈: 모듈 이름이 `/` 또는 `./`로 시작하지 않으면 알고리즘은 먼저 코어 Node.js 모듈내에서 검색을 시도
3. 패키지 모듈: 모듈 이름과 일치하는 코어 모듈이 없는 경우, 요청 모듈의 경로에서 시작하여 디렉터리 구조를 탐색하여 올라가면서 node_modules 디렉터리를 찾고 그 안에서 일치하는 모듈을 계속 찾음. 알고리즘은 파일 시스템의 루트에 도달할 때까지 디렉터리 트리를 올라가면서 다음 node_modules 디렉터리를 탐색함.

파일 및 패키지 모듈의 경우 개별 파일과 디렉터리가 모두 모듈 이름과 일치할 수 있음. 알고리즘은 다음과 일치하는지 확인함.
- ~.js
- ~/index.js
- ~/package.json의 main 필드 확인

node_modules는 실제 패키지 매니저가 각 패키지의 종속성을 설치하는 곳임.

즉, 방금 설명한 알고리즘을 기반으로 각 패키지는 자체적으로 개별적인 종속성을 가질 수 있음.

예시로 다음과 같은 디렉터리 구조를 생각할 수 있음.

```shell
myApp
├── foo.js
└── node_modules
    ├── depA
    │   └── index.js
    ├── depB
    │   ├── bar.js
    │   └── node_modules
    │       └── depA
    │           └── index.js
    └── depC
        ├── foobar.js
        └── node_modules
            └── depA
                └── index.js
```

모두 debA에 종속성을 가질 수 있음. 그러나 이들은 모두 자신의 개별적인 버전에 대한 종속성을 가짐.

해석 알고리즘의 규칙에 따라 require('depA')를 사용하면 모듈을 필요로 하는 모듈에 따라 다른 파일이 불러와짐.

resolving 알고리즘은 Node.js 종속성 관리의 견고성을 뒷받침하는 핵심적인 부분이며, 충돌 혹은 버전 호환성 문제 없이 어플리케이션에서 수백 또는 수천 개의 패키지를 가질 수 있게 됨.

## 모듈 캐시
require()의 후속 호출은 단순히 캐시된 버전을 반환하기 때문에 각 모듈은 처음 로드될 때만 로드되고 평가됨.

캐싱은 성능을 위해 매우 중요하지만 다음과 같은 기능적인 영향도 있다.

- 모듈 종속성 내에서 순환을 가질 수 있음.
- 일정한 패키지 내에서 동일한 모듈이 필요할 때 얼마간 동일한 인스턴스가 항상 반환된다는 것을 보장.

모듈 캐시는 require.cache 변수를 통해 외부에 노출되므로 필요한 경우 모듈 캐시에 직접 접근할 수도 있음.

일반적인 사용 사례는 require.cache 변수에서 관련 키를 삭제하여 캐시된 모듈을 무효화 하는 것임. 이건 일반적인 상황에 적용하는건 매우 위험함.

## 순환 종속성
서로가 서로를 의존하는 구조

처음 require 시점에 아직 완전히 초기화되지 않은 모듈이 전달될 수 있음

즉, 서로 의존하는 모듈 중 누가 먼저 로드되느냐에 따라 불완전한 상태의 exports를 참조하게 됨

require 순서만 바꿔도 반대로 문제가 전파될 수 있음

# 모듈 정의 패턴
종속성을 로드하는 메커니즘이 되는 것말고도 API를 정의하기 위한 도구이기도 함.

## exports 지정하기.
public API를 정의하는 가장 기본적인 방법은 exports에 할당하는 것.

다음 코드는 이 패턴을 구현하는 모듈임.

```js
exports.info = (message) => {
    console.log(`info: ${message}`)
}

exports.verbose = (message) => {
    console.log(`verbose: ${message}`)
}
```

Node.js 코어 모듈 대부분은 이 패턴을 사용함.

CommonJS의 명세에는 public을 공개하는데 exports 변수 만을 사용하도록 하고 있음.

exports로 지정하는 것이 CommonJS의 명세와 호환되는 유일한 방법.

module.exports는 Node.js가 제공하는 모듈 정의 패턴의 광범위한 범위를 지원하기 위한 것

## 함수 내보내기
module.exports 변수 전체를 함수로 재할당하는 것이 가장 일반적인 모듈 정의 패턴중 하나임.

주요 장점은 모듈에 대한 명확한 진입점을 제공하는 단일 기능을 제공하여 그것에 대한 이해와 사용을 단순화 하는 것.

또한 최소한의 노출이라는 원리에 잘 맞아 떨어집니다.

이 방법은 서브스택 패턴이라는 이름으로도 알려져 있음.

```js
module.exports = (message) => {
    console.log(`info: ${message}`)
}
```

이 패턴의 응용은 내보내려는 함수를 다른 public API의 네임스페이스로 사용하는 것임.

이렇게 하면 모듈에 단일 진입점의 명확성을 제공하므로 매우 강력한 조합이 됨.

또한 이 접근 방식을 응용하여 그 이상의 유스케이스를 만들 수 있는 다른 부가적인 기능들을 노출할 수 있음.

그 부분의 예시는 다음과 같음.

```js
module.exports.verbose = (message) => {
    console.log(`verbose: ${message}`)
}
```

사용은 아래처럼 사용할 수 있음.

```js
const logger = require('./logger')
logger('This is an info message')
logger.verbose('This is a verbose message')
```

단순히 함수를 내보내는 것이 제약처럼 보이지만 단일 기능에 중점을 두도록하는 완벽한 방법.

내부 구조의 가시서을 줄이면서 이외 보조적인 사항을 함수의 속성으로 노출하여 단일 진입점을 제공.

Node.js의 모듈성은 SRP를 지키는 것을 강력히 권장함.

## 클래스 내보내기
클래스를 내보내는 모듈은 함수를 내보내는 모듈이 특화된 것.

차이점은 생성자를 사용하여 새 인스턴스를 만들 수 있게 하면서, 프로토타입을 확장하고 새 클래스를 만들 수 있는 기능을 제공함.

다음은 패턴의 예시임.

```js
class Logger {
    constructor(name) {
        this.name = name
    }
    
    log(message) {
        console.log(`[${this.name}] ${message}`)
    }
    
    info(message) {
        this.log(`info: ${message}`)
    }
    
    verbose(message) {
        this.log(`verbose: ${message}`)
    }
}

module.exports = Logger
```

사용은 다음과 같음.

```js
const Logger = require('./logger')

const dbLogger = new Logger('DB')
dbLogger.info('This is an informational message')

const accessLogger = new Logger('ACCESS')
accessLogger.verbose('This is a verbose message')
```

클래스를 내보내는 것은 여전히 모듈에 대한 단일 진입점을 제공하지만 서브스택 패턴과 비교하면 훨씬 더 많은 모듈의 내부를 노출함.

한편으로는 기능 확장에 있어 훨씬 강력할 수 있음.

## 인스턴스 내보내기
require()의 캐싱 메커니즘의 도움을 통해 생성자나 팩토리로부터 서로 다른 모듈간에 공유할 수 있는 상태 저장 인스턴스를 쉽게 정의할 수 있음.

이 패턴의 예시는 다음과 같음.

```js
class Logger {
    constructor(name) {
        this.count = 0
        this.name = name
    }
    
    log(message) {
        this.count++
        console.log('[' + this.name + '] ' + message)
    }
}

module.exports = new Logger('DEFAULT')
```

사용은 다음과 같음.

```js
const logger = require('./logger')
logger.log('This is an informational message')
```

모듈이 캐시되기 때문에 logger 모듈을 필요로 하는 모든 모듈은 실제로 항상 동일한 객체의 인스턴스를 받아 상태를 공유함.

이 패턴은 싱글톤을 만드는 것과 매우 비슷함.

그러나 전통적인 싱글톤 패턴에서처럼 전체 어플리케이션에서 인스턴스의 고유성을 보장하지는 않음.

resolving 알고리즘을 봤을 때 모듈이 어플리케이션의 종속성 트리 내에서 여러 번 설치될 수 있다는 것을 봄.

결과적으로 동일한 논리적 모듈의 여러 인스턴스가 모두 동일한 Node.js 어플리케이션의 컨텍스트에서 실행될 수 있음.

한가지 흥미로운 점은 우리가 명시적으로 클래스를 내보내지 않았지만 새로운 인스턴스를 만들지 못하게 막지 않는다는 것.

사실 우리는 내보낸 인스턴스의 생성자에 기반해서 같은 타입의 새로운 인스턴스를 만들 수 있음.

```js
const customLogger = new logger.constructor('CUSTOM')
customLogger.log('This is an informational message')
```

생성자를 이용해서 새로운 인스턴스를 초기화 할 수 있지만 이 기법은 신중하게 사용하거나 아예 사용하지 않는 것이 좋음.

## 다른 모듈 또는 전역 범위 수정
모듈이 아무것도 내보내지 않을 수도 있음.

모듈이 캐시에 있는 다른 모듈을 포함하여 전역 범위와 그 안에 있는 모든 개체를 수정할 수 있다는 것을 잊으면 안됨.

이는 일반적으로 권장되지 않지만 이 패턴은 일부 상황에서 유용하게 사용할 수 있음.

몽키패치: 모듈이 전역 범위의 다른 모듈이나 객체를 수정할 수 있는 것.

일반적으로 런타임에 기존 객체를 수정하거나 동작을 변경하는 임시 수정 적용 관행을 뜻함.

```js
// patcher.js 파일
require('./logger').customMessage = function () {
    console.log('This is a new functionality')
}
```

이 모듈을 사용하는 방법은 다음과 같음.

```js
// main.js 파일
require('./patcher')
const logger = require('./logger')
logger.customMessage()
```

여기서 설명된 기술은 모두 적용하기에 위험한 기술임.

핵심은 전역 네임스페이스나 다른 모듈을 수정하는 모듈을 갖는 데는 부작용이 있다는 것임.

즉, 범위를 벗어난 요소의 상태에 영향을 미치므로, 특히 여러 모듈이 동일한 속성에 대한 작업을 하는 경우에 예측할 수 없는 결과를 초래할 수 있음.

# ESM: ECMAScript 모듈
ESM은 ECMAScript 2015 명세의 일부분으로 JS에 서로 다른 실행 환경에서도 적합한 공식 모듈 시스템을 부여하기 위해 도입.

문법은 매우 간단하면서 짜임새를 갖추고 있음. 순환 종속성에 대한 지원과 비동기적으로 모듈을 로드할 수 있는 방법을 제공.

ESM과 CJS의 가장 큰 차이점은 ESM은 static이라는 것.

즉, 가져올 모듈의 이름을 코드를 이용하여 실행 시에 동적으로 생성할 수 없고, 상수 문자열만이 허용됨.

예시는 다음과 같음.

```js
// 안됨.
if (condition) {
    import module1 from 'module1'
} else {
    import module2 from 'module2'
}

// 가능
let module = null
if (condition) {
    module = require('module1')
} else {
    module = require('module2')
}
```

이를 통해 트리 세이킹과 같이 코드 최적화를 해줄 수 있는 종속성 트리의 정적 분석을 가능하게 해줌.

## Node.js에서 ESM 사용
Node.js에서 ESM을 사용하려면 몇가지 방법이 있음.

- package.json 파일에 "type": "module" 필드를 추가
- .mjs 확장자를 사용.

## exports와 imports 지정하기
ES 모듈에서는 기본적으로 모든 것이 private이며 export된 개체들만 다른 모듈에서 접근 가능함.

export 키워드는 우리가 모듈 사용자에게 접근을 허용하는 개체 앞에 사용합니다.

예시는 다음과 같음.

```js
// logger.js

// `log`로서 함수를 익스포트
export function log(message) {
    console.log(message)
}

// `DEFAULT_LEVEL`로서 상수를 익스포트
export const DEFAULT_LEVEL = 'info'

// `LEVELS`로서 객체를 익스포트
export const LEVELS = {
    error: 0,
    debug: 1,
    warn: 2,
    data: 3,
    info: 4,
    verbose: 5
}

// `Logger`로서 클래스 익스포트
export class Logger {
    constructor(name) {
        this.name = name
    }
    log(message) {
        console.log(`[${this.name}] ${message}`)
    }
}
```

우리가 모듈로부터 원하는 개체를 가져오고 싶다면 import 키워드를 사용함.

문법은 꽤나 유연하고 하나 이상의 개체를 가져올 수 있고 다른 이름으로 지정할 수도 있음.

예시는 다음과 같음.

```js
import * as loggerModule from './logger.js'
console.log(loggerModule)
```

이번 예시는 모듈의 모든 멤버를 가져오고 loggerModule이라는 변수에 할당하기 위해서 * 문법을 사용함.

네임스페이스 문법이라도고 부름. 출력은 다음과 같음.

```shell
[Module] {
    DEFAULT_LEVEL: 'info',
    LEVELS: { error: 0, debug: 1, warn: 2, data: 3, info: 4,
    verbose: 5 },
    Logger: [class: Logger],
    log: [Function: log]
}
```

가져온 모든 개체들을 loggerModule 네임스페이스로 접근할 수 있음.

만약 우리가 규모가 큰 모듈을 사용하고자 할 때, 모듈의 모든 기능들을 원하지 않고 하나 혹은 몇 개의 개체만을 사용하고 싶을 때 다음과 같이 사용함.

```js
import { log, Logger } from './logger.js'

log('Hello World')

const logger = new Logger('DEFAULT')
logger.log('Hello world')
```

이와 같은 import 구문은 가져오는 개체가 현재의 스코프로 가져오기 때문에 이름이 충돌할 가능성이 있음.

다음 코드는 동작하지 않음.

```js
import { log } from './logger.js'
const log = console // SyntaxError: Identifier 'log' has already been declared
```

이런 상황에서는 가져오는 개체의 이름을 as 키워드를 사용하여 바꾸는 것으로 해결할 수 있음.

```js
import { log as log2 } from './logger.js'
const log = console.log

log('message from log')
log2('message from log2')
```

이는 충돌이 발생하였을 때 유용하게 사용됨.

이것이 모듈 사용자가 모듈의 원래 이름을 바꾸는 방법을 별도로 고려하지 않아도 되게 해줌.

## export와 import 기본값 설정하기
ESM에서도 SRP 원칙을 권장하고 깔끔하게 하나의 인터페이스만 노출할 수 있는 방법이 있음.

그것은 바로 default export라고 부름.

다음 예제를 확인.

```js
// logger.js
export default class Logger {
    constructor(name) {
        this.name = name
    }
    log(message) {
        console.log(`[${this.name}] ${message}`)
    }
}
```

이 경우에 Logger라는 이름은 무시되며, 내보내는 개체는 default라는 이름 아래 등록됨.

내보내는 이름은 특별한 방법으로 다루게 됨. 다음 예제를 확인.

```js
// main.js
import MyLogger from './logger.js'

const logger = new MyLogger('info')
logger.log('Hello World')
```

default export는 이름이 없는 것으로 간주되기 때문에 이름을 명시한 ESM의 import와는 다름.

가져옴과 동시에 우리가 지정한 이름으로 할당됨.

주의할 점은 가져올 모듈의 이름을 중괄호로 감싸지 않아야 하며 이름을 지정할 때도 마찬가지임.

내부적으로 default export는 default라는 이름으로 내보내는 것과 동일함.

다음 예시를 실행하면 쉽게 확인할 수 있음.

```js
// showDefault.js
import * as loggerModule from './logger.js'
console.log(loggerModule) // [Module] { default: [class: Logger] }
```

한가지 불가능한게 있다면 default 개체를 명시적으로 가져올 수 없음. 다음 예시는 동작하지 않음.

```js
import { default } from './logger.js' // SyntaxError: Unexpected reseved word error
```

default라는 이름의 변수가 사용될 수 없음.

객체의 속성으로는 유효해서 ~.default를 사용해도 문제가 없지만 스코프 내에서 default라는 이름의 변수를 직접 사용할 수 없음.

## 혼합된 exports
ESM은 두가지를 모두 혼합해서 사용할 수 있음.

```js
// logger.js
export default function log(message) {
    console.log(message)
}

export function info(message) {
    log(`info: ${message}`)
}
```

우리가 이 모듈을 사용하는 방법은 다음과 같음.

```js
import mylog, { info } from './logger.js'
mylog('This is a log message')
info('This is an info message')
```

default export와 명시적인 export의 차이점에 대한 몇 가지 사항을 알아본다.

- 명시적인 export는 에디터의 기능을 잘 사용할 수 있지만 default export는 그렇지 않음.
- default export는 가장 핵심 기능을 연결하는 편리한 방법임. 정확한 이름을 몰라도 쉽게 가져올 수 있음.
- default export는 특정 상황에서 트리세이킹을 어렵게 만듬. 예를 들어 모듈의 객체의 속성을 이용해서 모든 기능을 노출시키는 default export만 제공할 수도 있음. 우리가 이 객체를 가져올 때 모듈 번들러는 객체의 전체가 사용되는 것으로 간주하여 노출된 기능 중에 사용되지 않는 코드를 제거할 수 없게 됨.

이러한 이유로 명확하게 하나의 기능을 가져올 경우 default export, 그게 아니라면 명시적인 export 사용이 좋다.

## 모듈 식별자
import 구문에서 우리가 적재하고 싶은 모듈의 경로를 명시할 때 쓰는 것.

어떤 방법이 있는지 나열.

- 상대적 식별자: `./logger.js`, `../utils/helper.js`와 같이 가져오는 파일의 경로에 상대적 경로 사용.
- 절대 식별자: `file:///usr/local/lib/mymodule.js`와 같이 직접적이고 명확하게 완전한 경로가 사용됨. 유일하게 ESM에 해당, `/`나 `//`가 선행하는 경우 동작하지 않음.
- 노출 식별자: `http`와 같이 node_modules에서 사용 가능하고 패키지 매니저를 통해 설치된 모듈 또는 Node.js 코어 모듈.
- 심층 식별자: `http/status`와 같이 패키지 내부의 특정 파일이나 서브모듈을 가리키는 데 사용됨.

## 비동기 import
import 구문은 정적이기에 두 가지 주요 제약이 존재함.

- 모듈 식별자는 실행 중에 생성될 수 없음.
- 모듈의 import는 모든 파일의 최상위에 선언되며 제어 구문내에 포함될 수 없음.

ES 모듈은 이런 제약을 극복하기 위해 비동기 import를 제공함.

비동기 import는 특별한 import() 연산자를 사용하여 실행 중에 수행됨.

import() 연산자는 문법적으로 모듈 식별자를 인자로 취하고 모듈 객체를 프라미스로 반환하는 함수와 동일.

모듈 식별자는 어떤 것이든지 사용 가능함. 간단하게 동적 import를 사용하는 방법을 살펴봄.

```js
// strings-el.js
export const HELLO = 'Γεια σου κόσμε'
// strings-en.js
export const HELLO = 'Hello World'
// strings-es.js
export const HELLO = 'Hola mundo'
// strings-it.js
export const HELLO = 'Ciao mondo'
// strings-pl.js
export const HELLO = 'Witaj świecie'

// main.js
const SUPPORTED_LANGUAGES = ['el', 'en', 'es', 'it', 'pl'] // (1)
const selectedLanguage = process.argv[2] // (2)
if (!SUPPORTED_LANGUAGES.includes(selectedLanguage)) { // (3)
    console.error('The specified language is not supported')
    process.exit(1)
}
const translationModule = `./strings-${selectedLanguage}.js` // (4)
import(translationModule) // (5)
    .then((strings) => { // (6)
        console.log(strings.HELLO)
    })
```

1. 지원되는 언어의 리스트를 정의
2. 선택한 언어를 커맨드라인의 첫 번째 인자를 받기
3. 지원되지 않는 언어가 선택된 경우를 처리
4. 우선 선택된 언어를 사용하여 임포트하고자 하는 모듈의 이름을 동적으로 만듬. 모듈의 이름에
   상대경로를 사용하기 위해서 ./ 를 파일이름 앞에 붙여줌.
5. 모듈의 동적 임포트를 하기 위해서 import() 연산자를 사용
6. 동적 임포트는 비동기적으로 됨. 그러므로, 모듈이 사용될 준비가 되었을 때를 알기 위해서 .then()을 반환된 프라미스에 사용. 모듈이 완전히 적재되었을 때, then()으로 전달된 함수가 실행. 그리고 strings는 동적 임포트된 모듈의 네임스페이스가 됨. 마지막으로 strings.HELLO에 접근할 수 있으며 콘솔에 값이 출력

다음처럼 스크립트를 실행하면 됨.

```shell
node main.js it
```

## 모듈 적재 이해
ES 모듈을 사용할 때 JS코드가 어떻게 파싱되고 평가되는지 좀 더 알아보아야 함.

### 로딩
인터프리터의 목표는 필요한 종속성 그래프를 만들어 내는 것.

인터프리터는 모듈이 실행되어야 할 코드의 순서와 함께 모듈 간에 어떠한 종속성을 갖는지 이해하기 위해서 기본적으로 종속성 그래프를 필요로 함.

인터프리터가 실행되면 일반적으로 JS 파일 형식으로 실행될 코드가 전달됨.

파일은 종속성 확인을 위한 진입점임.

인터프리터는 진입점에서부터 필요한 모든 코드가 탐색되고 평가될 때까지 import 구문을 재귀적인 DFS로 찾음.

좀 더 구체적으로, 3단계에 걸쳐 작업이 진행.
1. 생성: 모든 import 구문을 찾고 재귀적으로 각 파일로부터 모든 모듈의 내용을 적재
2. 인스턴스화: 가져온 모든 개체들에 대해 명명된 참조를 메모리에 유지. 또한 모든 import 및 export문에 대한 참조가 생상되어 이들 간의 종속 관계를 추적함.
3. 평가: Node.js는 마지막으로 코드를 싱행하여 이전에 인스턴스화된 모든 개체가 실제 값을 얻을 수 있도록 함. 진입점에서 코드 실행 가능.

이런 접근 방식은 CJS와 많이 달라 보이지는 않지만, 근본적인 차이가 존재함.

CJS는 동적 성질로 인해 종속성 그래프가 탐색되기 전에 모든 파일들을 실행시킴.

ESM에서는 3단계가 분리되어 있고 종속성 그래프가 완전해지기 전까지 어떠한 코드도 실행하지 않음.

### 읽기 전용 라이브 바인딩
간단한 예제와 함께 알아보도록 합니다.

```js
// counter.js
export let count = 0

export function increment() {
    count++
}

// main.js
import { count, increment } from './counter.js'
console.log(count) // 0을 출력
increment()
console.log(count) // 1을 출력
count++ // TypeError: Assignment to constant variable!
```

count 값을 언제든지 읽을 수 있으며 increment()를 이용하여 이를 변경할 수 있다는 것을 알 수 있습니다.

하지만 count 변수를 직접적으로 변경시키려 했을때 마치 우리가 const로 바인딩된 값을 변경하려 했을 때 발생하는 에러가 나타남.

이것을 통해 스코프 내에 개체가 가져와지면 사용자 코드의 직접적인 제어밖에 있는 바인딩 값은 그것으 원래 존재하는 모듈에서 바뀌지 않는 한,

원래 값에 대한 바인딩이 변경 불가하다는 것입니다.

# ESM과 CJS의 상호 운용성

## strict 모드에서의 ESM
ES 모듈들은 암시적으로 strict mode에서 실행됨.

## ESM에서의 참조 유실
ES 모듈이 strict mode에서 실행됨.

그래서 `require`, `export`, `module.exports`, `__filename`, `__dirname`등등 CommonJS 의 몇 가지 중요한 참조가 정의되지 않음.

ESM에서는 특별한 객체인 `import.meta` 를 사용하여 현재 파일에 대한 참조를 얻음.

이 값으로 절대 경로 형식에 대한 __filename과 __dirname를 재구성하는데 사용

```js
import { fileURLToPath } from 'url'
import { dirname } from 'path'
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
```

ES 모듈의 전역 범위에서 this는 undefined인 반면, CommonJS에서는 this가 exports와 같은 참조

```js
// this.js - ESM
console.log(this) // undefined

// this.cjs – CommonJS
console.log(this === exports) // true
```

## 상호 운용
ESM에서 default exports에 한하여 표준 import 문법을 사용하여 CommonJS 모듈을 임포트하는 것 또한 가능

CommonJS 모듈에서 ES 모듈을 임포트하는 것은 불가능.

CommonJS에서 꽤 자주 사용되는 기능인 JSON 파일을 직접적으로 가져오기는 ESM에서 불가능

```js
import data from './data.json' // TypeError(Unknown file extension: .json)
```