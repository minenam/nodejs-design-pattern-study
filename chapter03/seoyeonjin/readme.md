## [3장 - 콜백과 이벤트]

동기식 프로그래밍 → 모든 작업은 블로킹

비동기식 프로그래밍 → 파일 읽기 또는 네트워크 요청 수행과 같은 일부 작업을 백그라운드 작업으로 실행

### 3.1 콜백 패턴

`콜백`: 작업의 결과를 전달하기 위해 호출되는 함수.

- JS는 콜백에 이상적인 언어다.

  - 함수는 일급 클래스 객체
  - 클로저를 사용해서 생성된 함수의 환경을 참조할 수 있다.

- **연속 전달 방식(CPS):** 콜백은 다른 함수에 인자로 전달되는 함수, 작업이 완료되면 작업 결과를 가지고 호출된다.
  - 동기식 연속 전달 방식: 순서대로 호출
    ```jsx
    function addCps(a, b, callback) {
      callback(a + b);
    }
    ```
  - 비동기식 연속 전달 방식
    ```jsx
    function addtionAsync(a, b, callback) {
      setTimeout(() => callback(a + b), 100);
    }
    ```
- **비 연속 전달(Non-CPS) 콜백**: 콜백 인자가 있다고 함수가 비동기식이거나 연속 전달 스타일을 사용하는 것은 아니다. 콜백이 있지만 결과 전달의 연속성을 담당하지 않는다.

  ```jsx
  const result = [1, 5, 7].map((element) => element - 1);
  ```

- **동기? 비동기? :** 위험성 분석

  - 조건에 따라 비동기, 동기가 결정되는 예측할 수 없는 함수를 사용하는 경우

    ```jsx
    import { readFile } from "fs";

    const cache = new Map();

    function inconsistentRead(filename, cb) {
      if (cache.has(filename)) {
        // 동기적으로 호출
        cb(cache.get(filename));
      } else {
        // 비동기 함수
        readFile(filename, "utf8", (err, data) => {
          cache.set(filename, data);
          cb(data);
        });
      }
    }
    ```

    - 해결1. 모두 동기식으로 동작하게 한다.
      - 순수한 동기식 함수에 대해서는 직접 스타일을 사용한다. (CPS를 사용할 필요는 없다)
      - 주의사항
        - 모든 기능에 대해 동기식 API를 사용할 수 있는 것은 아니다.
        - 애플리케이션 전체 속도를 떨어뜨릴 수 있다.
        - 동기 I/O를 사용하는 것은 권장하지 않는다.
    - 해결2. 모두 비동기식으로 동작하게 한다.
      - 동기 콜백 호출이 동일한 이벤트 루프 사이클에서 즉시 실행되는 대신, 가까운 미래에 실행되도록 예약한다.
        - process.nextTick(): 현재 이벤트 루프 사이클이 끝나기 전에 실행
        - setImmediate(): 다음 이벤트 루프 사이클의 check phase에서 실행
        - setTimeout(callback, 0)

- **Node.js 콜백 규칙:** CPS API, 콜백은 다음 규칙을 따른다.
  - 콜백은 맨 마지막 인자로 전달되어야 한다.
  - 오류는 맨 처음에 전달되어야 한다. 오류는 항상 Error 타입이어야 한다.
  - 에러 전파는 오류를 콜백으로 전달하여 수행된다. 에러를 다시 밖으로 발생시키거나 리턴하지 않는다.
  - **예외가 이벤트루프에 도달하는 순간 애플리케이션은 중단된다.**
    - **Node 15 이후 버전에서는 `unhandledRejection`이나 `uncaughtException` 이벤트 리스너를 등록해두면 프로세스를 살릴 수 있다**
  - 캐치되지 않은 예외가 발생한 경우, 프로세스는 즉시 종료되어야 한다. (fail-fast 접근법)

### 3.2 관찰자 패턴 (The observer pattern)

> 관찰자 패턴은 상태 변화가 일어날 때 관찰자에게 통지할 수 있는 객체를 정의하는 것이다.

- **EvenEmitter 클래스**

  - 코어에 내장된 EventEmitter 클래스를 통해 이벤트가 발생하면 호출되는 함수를 리스너로 등록할 수 있다.

  ```jsx
  import { EventEmitter } from "events";
  import { readFile } from "fs";

  function findRegex(files, regex) {
    const emitter = new EventEmitter();
    for (const file of files) {
      readFile(file, "utf8", (err, content) => {
        if (err) {
          // 에러 발생할 때
          return emitter.emit("error", err);
        }

        // 파일 읽을 때
        emitter.emit("fileread", file);
        const match = content.match(regex);
        if (match) {
          // 일치하는 항목이 발견되었을 때
          match.forEach((elem) => emitter.emit("found", file, elem));
        }
      });
    }
    return emitter;
  }

  // 3개의 리스터 등록
  fileRegex(["fileA.txt", "fileB.json"], /hello \w+/g)
    .on("fileread", (file) => console.log(`${file} was read`))
    .on("found", (file, match) => console.log(`Matched "${match}" in ${file}`))
    .on("error", (err) => console.error(`Error emiited ${err.message}`));
  ```

- **오류 전파**

  - 에러가 발생했을 때 throw할 수 없다.
  - error 이벤트를 발생시키고, Error 객체를 인자로 전달한다.
  - error 이벤트 리스너를 등록하도록 권장한다.

- **관찰 가능한 객체 만들기**

  - 직접 EventEmitter를 사용하기 보단 클래스 확장을 통해 사용한다.
  - 어떤 클래스라도 EventEmitter의 기능을 상속받아 관찰 가능한 객체가 되는 것이 가능하다.

  ```jsx
  import { EventEmitter } form 'events'
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
               if (err) {
                 return this.emit('error', err)
               }

               this.emit('fileread', file)

               const match = content.match(this.regex)
               if (match) {
                 match.forEach(elem => this.emit('found', file, elem))
               }
           })
         }
         return this
     }
  }
  ```

- **EventEmitter의 메모리 누수**

  - EventEmitte를 사용하고 난 뒤에 사용하지 않는 리스너를 해지해야 한다. 해지하지 않으면 메모리 누수의 원인이 된다.
  - off(event, listner)

  ```jsx
  emitter.off("an_event", listner); // or removeListener
  ```

- **동기 및 비동기 이벤트**

  - 동일한 EventEmitter에서 두 가지 접근 방식을 섞으면 안 된다.
  - 동기와 비동기를 혼합하여 동일한 유형의 이벤트를 발생시키면 안 된다.
  - 작업이 실행된 이후에 이벤트를 동기적으로 발생시킨다면 모든 리스너를 작업 실행 전에 등록해야 한다.

- **EventEmitter vs 콜백**

  - 콜백
    - 결과가 비동기적으로 반환되어야 하는 경우
  - 이벤트
    - 여러 유형의 결과를 전달하는 경우
    - 같은 이벤트가 여러 번 발생하거나 아예 발생하지 않을 수도 있는 경우
    - 같은 이벤트에 대해 다수의 리스너를 등록하는 경우

- **콜백과 EventEmitter의 결합**
  - 콜백을 사용하여 결과를 비동기적으로 전달하고, EventEmitter를 반환하여 비동기 처리 상태에 상세한 판단을 제공할 수 있다.
