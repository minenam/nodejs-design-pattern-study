## Observer Pattern
Reactor, Callback과 함께 비동기적인 Node.js 세계를 숙달하는데 필수적임.

### 정의
상태 변화가 일어날 때 listener에게 통지할 수 있는 객체를 정의하는 것

Callback과 가장 큰 차이점은 전통적인 CPS 콜백이 일반적으로 오직 하나의 리스너에게 결과를 전달.

Observer는 주체가 실질적으로 여러 listener에게 통지를 할 수 있다는 점.

## EventEmitter 클래스
일반적인 프로그래밍에서는 Observer Pattern에 인터페이스, 구체적인 클래스 그리고 계층구조를 요구함.

하지만 Node.js에서는 훨씬 더 간단하게 코어에 내장된 EventEmitter를 사용할 수 있음.

EventEmitter는 events 코어 모듈로부터 가져올 수 있음.

```js
import { EventEmitter } from 'events'
const emitter = new EventEmitter()
```

필수 메서드는 다음과 같음.
- on(event, listener): 주어진 이벤트 유형에 대해 새 listener 등록
- once(event, listener): 첫 이벤트가 전달된 후 제거되는 새 listener 등록
- emit(event, [arg1], [...]): 새 이벤트를 생성하고 listener에게 전달할 추가적인 인자 제공
- removeListener(event, listener): 지정된 이벤트 유형에 대한 listener 제거

모든 메서드는 체이닝을 가능하게 하기 위해 EventEmitter 인스턴스를 반환함.

## EventEmitter 생성 및 사용
```js
import { EventEmitter } from 'events'
import { readFile } from 'fs'

const findRegex = (files, regex) => {
    const emitter = new EventEmitter()
    
    for (const file of files) {
        readFile(file, 'utf8', (err, content) => {
            if (err) {
                return emitter.emit('error', err)
            }
            emitter.emit('fileread', file)
            const match = content.match(regex)
            if (match) {
                match.forEach(elem => emitter.emit('found', file, elem))
            }
        })
    }
    
    return emitter
}
```

```js
findRegex(
    ['fileA.txt', 'fileB.json'],
    /hello \w+/g
)
    .on('fileread', file => console.log(`${file} was read`))
    .on('found', (file, match) => console.log(`Matched "${match}" in ${file}`))
    .on('error', err => console.error(`Error emitted ${err.message}`))
```

## 오류 전파
콜백에서처럼 에러가 발생했을 때 예외를 단지 throw할 수 없음.

대신 error라는 특수한 이벤트를 발생시키고 Error 객체를 인자로 전달하는 규약을 따름.

## 관찰 가능한 객체 만들기
EventEmitter 자체로 사용되는 경우는 매우 드뭄.

대신, 다른 클래스의 확장이 일반적임.

```js
import { EventEmitter } from 'events'
import { readFile } from 'fs'

class FindRegex extends EventEmitter {
    constructor(regex) {
        super()
        this.regex = regex
        this.files = []
    }
    
    addFile(file) {
        this.files.push(file)
        return this
    }
    
    find() {
        for (const file of this.files) {
            readFile(file, 'utf8', (err, content) => {
                if (err) return this.emit('error', err)
                
                this.emit('fileread', file)
                
                const match = content.match(this.regex)
                if (match) match.forEach(elem => this.emit('found', file, elem))
            })
        }
        return this
    }
}
```

EventEmitter를 확장하여 완전한 관찰가능 객체가 됨. 아래는 해당 클래스의 사용 예제.

```js
const findRegexInstance = new FindRegex(/hello \w+/)

findRegexInstance
    .addFile('fileA.txt')
    .addFile('fileB.json')
    .find()
    .on('found', (file, match) => console.log(`Matched "${match}" in file ${file}`))
    .on('error', err => console.error(`Error emitted ${err.message}`))
```

이것은 Node.js 생태계에서 꽤나 일반적인 패턴임.

예를 들어, 핵심 HTTP 모듈의 Server 객체의 EventEmitter 함수 상속은 request(새로운 요청을 받았을 때), connection(새로운 연결이 성립되었을 때), closed(서버 소켓이 닫혔을 때)와 같은 이벤트를 생성.

## EventEmitter와 메모리 누수
오랜 시간 동안 구독을 하고 있는 listener가 있는 경우 해당 listener가 필요하지 않다면 구독 해지하는 것이 매우 중요.

구독 해지는 메모리 누수를 예방하고 listener의 스코프에 있는 객체에 의해 더 이상 사용되지 않는 메모리 점유를 풀게 해줌.

Node.js에서도 EventEmitter listener의 등록을 해지하지 않는 것이 메모리 누수의 주된 원인이 됨.

EventEmitter는 개발자에게 메모리 누수에 대한 가능성을 경고하기 위해서 간단한 내장 매커니즘을 가짐.

리스너의 수가 특정 개수(기본 10개)를 초과할 때 EventEmitter는 경고를 발생시킴.

가끔은 10개 이상의 등록이 전혀 무리 없을 때도 있어서 setMaxListeners() 메소드를 사용하여 이것에 대한 제한을 조정할 수 있음.

## 동기 및 비동기 이벤트
CallBack과 마찬가지로 이벤트를 생성하는 작업이 호출되는 순간에 따라 동기적 또는 비동기적으로 발생될 수 있음.

동일한 EventEmitter에서 두 가지 접근 방식을 섞으면 안됨.

더 중요한건 동기와 비동기를 혼합하여 동일한 유형의 이벤트를 발생시키면 안됨.

동기와 비동기 이벤트를 발생시키는 주된 차이점은 리스너를 등록할 수 있는 방법에 있음.

이벤트가 비동기적으로 발생할 때 현재의 스택이 이벤트 루프에 넘어갈 때까지는 이벤트 발생을 만들어내는 작업 이후에도 새로운 리스너를 등록할 수 있음.

그 이유는 이벤트가 이벤트루프의 다음 사이클이 될 때까지 실행되지 않는 것이 보장되기 때문.

반면에 작업이 실행된 이후에 이벤트를 동기적으로 발생시킨다면 모든 리스너를 작업 실행 전에 등록해야 함.

그렇지 않으면 모든 이벤트를 잃게 됨.

드물게는 동기적 방법에서의 이벤트 발생이 적합할 때가 있음.

하지만 EventEmitter의 본성은 비동기적 이벤트를 다루는 데에 근거.

이벤트를 동기적으로 발생시키는 것은 EventEmitter가 필요하지 않거나 어딘가에서 똑같은 관찰 가능한 것이 또 다른 이벤트를 비동기적으로 발생시킨다는 신호.

## EventEmitter vs CallBack
비동기식 API를 정의할 때 공통적인 딜레마는 두가지 중 어떤걸 써야하는지 결정하는 것.

결과가 비동기적으로 반환되어야 하는 경우에는 콜백을 사용, 이벤트는 발생한 사건과 연결될 때 사용

쉽게 결정할 수 없지만 결정을 내리는데 도움되는 힌트는 다음과 같음.
1. CallBack은 여러 유형의 결과를 전달하는데 있어서 약간의 제한이 있습니다. 실제로 CallBack의 인자로 타입을
   전달하거나 각 이벤트에 적합한 여러 개의 CallBack을 취하여 차이를 둘 수 있습니다. 하지만 이것은 깔끔
   한 API라고 할 수 없습니다. 이 상황에서는 EventEmitter가 더 나은 인터페이스와 군더더기 없는 코드
   를 만들게 해줍니다.
2. EventEmitter는 같은 이벤트가 여러 번 발생하거나 아예 발생하지 않을 수도 있는 경우에 사용되어야
   합니다. 사실 CallBack은 작업이 성공적이든 아니든 정확히 한번 호출됩니다. 반복가능성이 있는 상황을
   갖는 것은 결과가 반환되어야 하는 것보다는 알려주는 기능인 이벤트와 더 유사합니다.
3. CallBack을 사용하는 API는 오직 특정한 CallBack 하나만을 호출할 수 있습니다. 반면에 EventEmitter는 같은
   이벤트에 대해 다수의 리스너를 등록할 수 있게 해줍니다.

### 정리
| 상황              | 적합한 방식           | 이유                   |
|-----------------|------------------|----------------------|
| 한 번만 결과 반환      | **Callback**     | 호출은 단 한 번만 일어남       |
| 여러 번 이벤트 발생 가능  | **EventEmitter** | 다수의 이벤트 발생 또는 미발생 가능 |
| 여러 리스너 필요       | **EventEmitter** | 구독자 여러 명             |
| 단일 콜백으로 끝낼 수 있음 | **Callback**     | 불필요한 이벤트 구조 방지       |

## CallBack과 EventEmitter의 결합
EventEmitter를 CallBack과 함께 사용할 수 있는 특정한 상황도 존재.

이 패턴의 예시는 glob 스타일로 파일 검색을 수행하는 라이브러리인 glob 패키지에 의해 제공됨.

이 모듈의 주요 진입점은 아래와 같은 특징을 가지는 함수임.

```js
const eventEmitter = glob(pattern, [options], callback)
```

패턴을 첫 번째 인자로 취하고 다음에는 일련의 옵션을 그리고 주어진 패턴과 일치하는 모든 파일 리스트를 가지고 호출될 콜백 함수를 취함.

동시에 이 함수는 프로세스 상태에 대해서 보다 세분화된 알림을 제공하는 EventEmitter를 반환함.

다음은 사용 예시임.

```js
import glob from 'glob'

glob('data/*.txt', (err, files) => {
    if (err) return console.error(err)
    console.log(`All files found: ${JSON.stringify(files)}`)
}).on('match', match => console.log(`Match found: ${match}`))
```