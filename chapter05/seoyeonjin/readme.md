## [5장 - Promise 그리고 Async/Await와 함께하는 비동기제어 흐름 패턴

콜백 지옥 → 프라미스 → async/await

⇒ 실행 흐름을 명확히 파악

### 5.1 프라미스(Promise)

- Promise란?
  - **비동기 적업의 최종적인 결과(또는 에러)를 담고 있는 객체**
  - 대기중, 이행됨, 거부됨, 결정된 상태
  - 값을 가지고 프라미스를 동기적으로 해결한다 해도, 한번은 onFulfilled(), onRejected() 콜백을 비동기적으로 호출

```jsx
promise.then(onFulfilled, onRejected);
```

- Promise/A+와 thenable
  - 호환성: then()함수가 있는 모든 객체를 thenable이라는 Promise와 유사한 객체로 간주한다. (덕 타이핑)
- 프라미스 API
  - 생성할 때 두 개의 제어 함수(resolve, reject) 를 넘겨받는다.
    - resolve: 프라미스를 이행하는 함수
    - reject: err 사유와 함께 프라미스를 거부
  - **프라미스 객체의 정적 메서드**
    - Promise.resolve(obj): 다른 프라미스, thenable, 값에서 새로운 프라미스를 생성한다.
    - Promise.reject(err): err를 이유로 거부하는 Promise를 생성
    - Promise.all: 입력된 반복 가능한 객체 내의 모든 프라미스가 이행되면 이행된 결과값들의 배열을 이행값으로 하여 이행하는 새로운 프라미스 생성
      - 하나라도 거부되면 거부됨
    - Promise.allSettled: 프라미스 중 하나가 거부될 때 즉시 거부되지 않고 모든 프라미스가 이행되거나 거부될 때까지 기다림
    - Promise.race: 반복 가능 객체에서 처음으로 결정된 프라미스를 반환
- 프라미스 생성하기

  ```jsx
  function delay(milliseconds) {
    return new Promise((resolve, reject) => {
       setTimeout(() => {
          resolve(new Date());
  	    }, milliseconds);
      });
  }

  delay(1000)
   .then(newDate => {
      console.log(`Done ${newDate.getSeconds())s`);
    })
  ```

- 프라미스화
  - 콜백 기반 함수 → 프라미스를 반환하는 함수로 변환
  - promisify 함수 사용
- 순차 실행과 반복
  - 각 `spider()`가 끝나야 다음이 실행
  ```jsx
  function spiderLinks (currentUrl, content, nesting) {
    let promise = Promise.resolve()
    if (nesting === 0) {
      return promise
    }
    const links = getPageLinks(currentUrl, content)
    for (const link of links) {
      **promise = promise.then(() => spider(link, nesting - 1))**
    }
    return promise
  }
  ```
- 병렬 실행

  - Promise.all() 사용
    - `map` 안의 모든 `spider()`가 **즉시 동시에 호출**

  ```jsx
  function spiderLinks(currentUrl, content, nesting) {
     if (nesting === 0) {
         return Promise.resolve();
     }
     const links = getPageLinks(currentUrl, content);
     **const promises = links.map(link => spider(link, nesting -1 ));**

     return Promise.all(promises);
   }
  ```

- 제한된 병렬 실행 (최대 실행 수 제한)

  - 프라미스를 사용한 TaskQueue 구현

    - 데드락 발생 가능성: 슬롯을 점유한 상태에서 새 작업 호출하는 경우, 슬롯이 꽉 차면 새 작업이 실행되지 못하고, 상위는 하위를 기다리면서 **교착 상태** 발생
    - 해결: spiderLinks()를 큐의 바깥으로 옮겨서 큐는 다운로드(I/O) 만 제한하고, 링크 탐색은 자유롭게 재귀 호출하게 함

    ```jsx
    async function spider(url, nesting) {
      const filename = urlToFilename(url);
      let content;

      // ① 다운로드만 큐로 제한
      await queue.runTask(() => download(url, filename));

      // ② 링크 처리(spiderLinks)는 큐 바깥에서 실행 -> 데드락 방지
      content = await fsPromises.readFile(filename, "utf8");
      return spiderLinks(url, content, nesting);
    }
    ```

### 5.2 Async/await

- async 함수와 await 표현
  - **각 await 표현에서 함수의 실행이 보류되고 상태가 저장되며 제어가 이벤트 루프로 반환.**
- async/await 에서의 에러 처리

  - 통일된 try…catch 사용
  - return vs return await

    - 에러를 로컬에서 잡고 싶으면, 반환될 프라미스 앞에 await 표현식을 사용해야 함.

    ```jsx
    async function errorCaught() {
      try {
        return await delayError(1000);
      } catch (err) {
        console.error("Error caught by the async function: " + err.message);
      }
    }

    errorCaught().catch((err) =>
      console.error("Error caught by the caller: " + err.message)
    );
    ```

- 순차 실행과 반복
  - 안티패턴: 순차 실행을 위한 Array.forEach와 async/await 의 사용
    - 모든 작업이 완료되기를 기다리지 않고 forEach() 호출 즉시 연속적으로 실행
- 병렬 실행
  - await 표현식 사용
  - 권장) Promise.all()
- 제한된 병렬 실행
  - 위의 promise예시 → async/await 으로 변경

### 5.3 무한 재귀 프라미스 해결(resolution) 체인의 문제

- 프라미스 상태가 다음 호출에 따라 달라짐 → 절대로 해결되지 않음
  ```jsx
  funciton leakLoop() {
     return delay(1)
        .then(() => {
           console.log(`Tick ${Date.now())`)
           return leakLoop()
       })
   }
  ```
- 해결방법 1: resolve 체인 끊기
  ```jsx
  function nonLeek() {
    delay(1)
      .then(() => {
         console.log(~)
         nonLeek()
       })
     }
  ```
- 해결방법 2: 재귀 함수 프라미스 생성자로 감싸기
  ```jsx
  function nonLeakingLoopWithErrors() {
    return new Promise((resolve, reject) => {
      (function internalLoop() {
        delay(1)
          .then(() => {
            console.log(`Tick ${Date.now()}`);
            internalLoop();
          })
          .catch((err) => {
            reject(err);
          });
      })();
    });
  }
  ```
- 해결방법 3: async/await
  - 매 반복마다 await을 통해 **이벤트 루프에 제어권을 돌려주기** 때문에 프로세스가 멈추지 않고 안정적으로 무한 실행된다.
  ```
  async function nonLeakingLoopAsync () {
    while (true) {
      await delay(1)
      console.log(`Tick ${Date.now()}`)
    }
  }
  ```
