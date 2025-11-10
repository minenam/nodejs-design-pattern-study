# Chapter 4: 콜백을 사용한 비동기 제어 흐름 패턴

> **발표자**: 길현준
> **주제**: 콜백 기반 비동기 프로그래밍의 패턴과 제어 흐름

---

## 📌 목차

1. [개요](#개요)
2. [비동기 프로그래밍의 어려움](#1-비동기-프로그래밍의-어려움)
3. [콜백 모범 사례와 제어 흐름 패턴](#2-콜백-모범-사례와-제어-흐름-패턴)
4. [비동기 라이브러리](#3-비동기-라이브러리)
5. [핵심 요약](#핵심-요약)
6. [실습 코드](#실습-코드)
7. [참고 자료](#참고-자료)

---

## 개요

### 왜 이 챕터가 중요한가?

콜백은 Node.js 비동기 프로그래밍의 **기초**입니다. Promise와 async/await를 이해하기 전에 콜백 패턴을 완전히 이해해야 합니다. 이 챕터에서는 콜백의 어려움을 극복하고, 복잡한 비동기 제어 흐름을 관리하는 **검증된 패턴**들을 배웁니다.

### 핵심 키워드

- **콜백 지옥 (Callback Hell)**: 중첩된 콜백으로 인한 가독성 저하와 유지보수의 어려움
- **순차 실행 (Sequential Execution)**: 작업을 순서대로 하나씩 실행하는 패턴
- **병렬 실행 (Parallel Execution)**: 여러 작업을 동시에 실행하는 패턴
- **제한된 병렬 실행 (Limited Parallel Execution)**: 동시 실행 수를 제한하여 리소스를 관리하는 패턴
- **TaskQueue**: 작업 큐를 통한 동시성 제어

---

## 1. 비동기 프로그래밍의 어려움

### 1-1. CPS와 비동기 API의 도전 과제

Node.js에서는 연속 전달 방식(Continuation-Passing Style, CPS)으로 비동기 코드를 작성합니다. 이는 강력하지만, 복잡한 제어 흐름을 만들 때 **가독성**과 **유지보수성** 문제를 야기합니다.

**주요 문제점**:

1. **순서 보장의 어려움**: 여러 비동기 작업을 순서대로 실행하기 어렵다
2. **중첩 구조**: 작업이 많아질수록 코드가 깊게 중첩된다
3. **에러 처리**: 각 단계마다 에러 처리 로직을 작성해야 한다

---

### 1-2. 콜백 지옥 (Callback Hell)

**핵심 문제**: 콜백을 중첩하여 사용하면 코드가 오른쪽으로 계속 들여쓰기되어 **죽음의 피라미드(Pyramid of Doom)**가 만들어집니다.

**❌ 나쁜 예: 콜백 지옥**

```javascript
// 웹 페이지의 모든 링크를 재귀적으로 다운로드하는 예제
function spider(url, nesting, callback) {
  if (spidering.has(url)) {
    return process.nextTick(callback)
  }
  spidering.add(url)

  const filename = urlToFilename(url)
  fs.readFile(filename, 'utf8', (err, fileContent) => {
    if (err) {
      if (err.code !== 'ENOENT') {
        return callback(err)
      }

      // 파일이 없으면 다운로드
      download(url, filename, (err, requestContent) => {
        if (err) {
          return callback(err)
        }

        // 링크 추출 및 재귀적 다운로드
        spiderLinks(url, requestContent, nesting, (err) => {
          if (err) {
            return callback(err)
          }
          callback()
        })
      })
    } else {
      // 파일이 있으면 링크만 처리
      spiderLinks(url, fileContent, nesting, callback)
    }
  })
}
```

**문제점**:

1. **가독성 저하**: 코드의 흐름을 따라가기 어렵다
2. **변수명 중복**: 모든 콜백에서 `err` 변수를 반복 사용
3. **유지보수 어려움**: 로직 수정 시 여러 단계를 거쳐야 한다
4. **클로저 남용**: 각 단계마다 새로운 클로저가 생성되어 메모리 사용 증가

> 📊 **실습**: `code/01-callback-hell.js` 참조

---

## 2. 콜백 모범 사례와 제어 흐름 패턴

### 2-1. 콜백 규칙 (Best Practices)

콜백 지옥을 피하기 위한 핵심 원칙들입니다.

#### 규칙 1: 빠른 종료 (Early Return)

**핵심 원칙**: 중첩을 줄이기 위해 조건을 만족하지 않으면 즉시 반환하라.

**✅ 좋은 예: 빠른 종료 적용**

```javascript
if (err) {
  return callback(err)
}
// 정상 로직 계속...
```

**❌ 나쁜 예: else 블록 사용**

```javascript
if (err) {
  callback(err)
} else {
  // 정상 로직...
  // 중첩 레벨 증가
}
```

**장점**:
- ✅ 중첩 레벨 감소
- ✅ 코드 흐름이 선형적
- ✅ 에러 처리가 명확

---

#### 규칙 2: 재사용 가능한 함수로 분리

**핵심 원칙**: 인라인 콜백 대신 명명된 함수를 사용하여 코드를 모듈화하라.

**✅ 좋은 예: 함수 분리**

```javascript
function saveFile(filename, contents, callback) {
  mkdirp(path.dirname(filename), (err) => {
    if (err) {
      return callback(err)
    }
    fs.writeFile(filename, contents, callback)
  })
}

function download(url, filename, callback) {
  console.log(`Downloading ${url}`)
  request(url, (err, response, body) => {
    if (err) {
      return callback(err)
    }
    saveFile(filename, body, (err) => {
      if (err) {
        return callback(err)
      }
      console.log(`Downloaded and saved: ${url}`)
      callback(null, body)
    })
  })
}
```

**장점**:
- ✅ 재사용 가능
- ✅ 테스트하기 쉬움
- ✅ 가독성 향상
- ✅ 디버깅이 용이 (스택 트레이스에 함수명 표시)

---

#### 규칙 3: 코드 모듈화

**핵심 원칙**: 복잡한 로직을 작은 함수들로 나누고, 각 함수는 한 가지 역할만 수행하도록 하라.

**실무 적용**:

```javascript
// spider-v2.js 리팩토링 버전
function spider(url, nesting, callback) {
  if (spidering.has(url)) {
    return process.nextTick(callback)
  }
  spidering.add(url)

  const filename = urlToFilename(url)
  fs.readFile(filename, 'utf8', (err, fileContent) => {
    if (err) {
      if (err.code !== 'ENOENT') {
        return callback(err)
      }
      // 모듈화된 download 함수 사용
      return download(url, filename, (err, requestContent) => {
        if (err) {
          return callback(err)
        }
        spiderLinks(url, requestContent, nesting, callback)
      })
    }
    spiderLinks(url, fileContent, nesting, callback)
  })
}
```

> 📊 **실습**: `code/02-callback-best-practices.js` 참조

---

### 2-2. 순차 실행 (Sequential Execution)

**핵심 개념**: 작업들을 하나씩 순서대로 실행하는 패턴입니다.

#### 알려진 일련의 작업 순차 실행

**패턴**:

```javascript
function task1(callback) {
  asyncOperation((err, result) => {
    if (err) {
      return callback(err)
    }
    task2(result, callback)
  })
}

function task2(arg, callback) {
  asyncOperation(arg, (err, result) => {
    if (err) {
      return callback(err)
    }
    task3(result, callback)
  })
}

function task3(arg, callback) {
  asyncOperation(arg, (err, result) => {
    if (err) {
      return callback(err)
    }
    callback(null, result) // 최종 결과
  })
}

// 실행
task1((err, result) => {
  if (err) {
    return console.error(err)
  }
  console.log('All tasks completed:', result)
})
```

**장점**:
- ✅ 순서가 보장됨
- ✅ 각 단계의 결과를 다음 단계에 전달 가능
- ✅ 단순한 로직

**단점**:
- ❌ 병렬로 실행 가능한 작업도 순차적으로 실행되어 느림

> 📊 **실습**: `code/03-sequential-execution.js` 참조

---

#### 순차 반복 (Sequential Iteration)

**핵심 개념**: 컬렉션의 각 요소를 순차적으로 비동기 처리하는 패턴입니다.

**패턴: Iterator 함수 사용**

```javascript
function iterate(index) {
  if (index === tasks.length) {
    return finish()
  }

  const task = tasks[index]
  task(() => {
    iterate(index + 1) // 다음 작업으로
  })
}

function finish() {
  // 모든 작업 완료 후 처리
}

iterate(0) // 시작
```

**실전 예제: 웹 스파이더의 링크 순차 처리**

```javascript
function spiderLinks(currentUrl, body, nesting, callback) {
  if (nesting === 0) {
    return process.nextTick(callback)
  }

  const links = getPageLinks(currentUrl, body)

  function iterate(index) {
    if (index === links.length) {
      return callback()
    }

    spider(links[index], nesting - 1, (err) => {
      if (err) {
        return callback(err)
      }
      iterate(index + 1)
    })
  }

  iterate(0)
}
```

**장점**:
- ✅ 동적으로 작업 목록 구성 가능
- ✅ 메모리 효율적 (한 번에 하나의 작업만 처리)
- ✅ 순서 보장

**단점**:
- ❌ 전체 실행 시간이 길어짐

> 📊 **실습**: `code/04-sequential-iteration.js` 참조

---

### 2-3. 병렬 실행 (Parallel Execution)

**핵심 개념**: 여러 비동기 작업을 동시에 실행하여 전체 실행 시간을 단축하는 패턴입니다.

#### Node.js의 동시성 이해

**중요**: Node.js는 **단일 스레드**이지만, 논블로킹 I/O와 이벤트 루프 덕분에 **동시성(Concurrency)**을 구현할 수 있습니다.

```
┌─────────────────────────┐
│   동기 (Synchronous)     │
├─────────────────────────┤
│  Task1 ████████         │
│  Task2         ████████ │
│  Task3                 ████████
│  총 시간: ████████████████████
└─────────────────────────┘

┌─────────────────────────┐
│   비동기 (Asynchronous)  │
├─────────────────────────┤
│  Task1 ████████         │
│  Task2 ████████         │
│  Task3 ████████         │
│  총 시간: ████████       │
└─────────────────────────┘
```

**패턴: 완료 카운터 사용**

```javascript
const tasks = [task1, task2, task3]
let completed = 0
const results = []

tasks.forEach((task, index) => {
  task((err, result) => {
    if (err) {
      return console.error(err)
    }
    results[index] = result
    completed++

    if (completed === tasks.length) {
      // 모든 작업 완료
      console.log('All tasks completed:', results)
    }
  })
})
```

**실전 예제: 웹 스파이더 병렬 다운로드**

```javascript
function spiderLinks(currentUrl, body, nesting, callback) {
  if (nesting === 0) {
    return process.nextTick(callback)
  }

  const links = getPageLinks(currentUrl, body)
  if (links.length === 0) {
    return process.nextTick(callback)
  }

  let completed = 0
  let hasErrors = false

  links.forEach((link) => {
    spider(link, nesting - 1, (err) => {
      if (err) {
        hasErrors = true
        return callback(err)
      }
      if (++completed === links.length && !hasErrors) {
        callback()
      }
    })
  })
}
```

**장점**:
- ✅ 실행 시간 대폭 단축
- ✅ CPU와 I/O 리소스 효율적 활용

**단점**:
- ❌ 순서가 보장되지 않음
- ❌ 경쟁 상태(Race Condition) 발생 가능
- ❌ 리소스 고갈 위험

> 📊 **실습**: `code/05-parallel-execution.js` 참조

---

#### 경쟁 상태 (Race Conditions) 문제

**핵심 문제**: 여러 비동기 작업이 동시에 같은 리소스에 접근할 때 예측 불가능한 결과가 발생합니다.

**문제 시나리오**: 동일한 URL을 여러 번 다운로드하는 경우

```
시간 ─────────────────────────────────────>

Task A: spider(url) 시작 ──> 파일 없음 확인 ──> 다운로드 시작 ──────> 저장
Task B: spider(url) 시작 ──> 파일 없음 확인 ──> 다운로드 시작 ──> 저장
                                          ↑
                                    중복 다운로드 발생!
```

**❌ 문제 코드**:

```javascript
function spider(url, nesting, callback) {
  const filename = urlToFilename(url)

  fs.readFile(filename, 'utf8', (err, fileContent) => {
    if (err) {
      if (err.code !== 'ENOENT') {
        return callback(err)
      }
      // 두 작업이 동시에 여기까지 도달할 수 있음!
      download(url, filename, (err, requestContent) => {
        // ...
      })
    }
  })
}
```

**✅ 해결책: Set을 사용한 상호 배제**

```javascript
const spidering = new Set()

function spider(url, nesting, callback) {
  if (spidering.has(url)) {
    // 이미 처리 중이면 즉시 반환
    return process.nextTick(callback)
  }
  spidering.add(url) // 처리 중으로 표시

  const filename = urlToFilename(url)
  fs.readFile(filename, 'utf8', (err, fileContent) => {
    if (err) {
      if (err.code !== 'ENOENT') {
        return callback(err)
      }
      download(url, filename, (err, requestContent) => {
        if (err) {
          return callback(err)
        }
        spiderLinks(url, requestContent, nesting, callback)
      })
    } else {
      spiderLinks(url, fileContent, nesting, callback)
    }
  })
}
```

**장점**:
- ✅ 중복 작업 방지
- ✅ 리소스 낭비 방지
- ✅ 파일 충돌 방지

> 📊 **실습**: `code/06-race-condition.js` 참조

---

### 2-4. 제한된 병렬 실행 (Limited Parallel Execution)

**핵심 개념**: 동시에 실행되는 작업의 수를 제한하여 리소스를 관리하고, 시스템 안정성을 보장하는 패턴입니다.

#### 왜 동시성을 제한해야 하는가?

**문제점**:

1. **리소스 고갈**: 수천 개의 파일을 동시에 열면 시스템의 파일 디스크립터 한계 초과
2. **메모리 부족**: 많은 HTTP 요청을 동시에 보내면 메모리 부족
3. **DoS 공격**: 무제한 요청은 서버에 과부하를 유발하여 DoS 공격으로 간주될 수 있음

**실전 예시**:

```bash
# 에러: Too many open files
Error: EMFILE: too many open files, open '/path/to/file'
```

---

#### 동시성 제한 패턴 구현

**패턴**:

```javascript
const tasks = [...]
const concurrency = 2 // 동시에 최대 2개만 실행
let running = 0
let completed = 0
let index = 0

function next() {
  while (running < concurrency && index < tasks.length) {
    const task = tasks[index++]
    task(() => {
      if (++completed === tasks.length) {
        return finish()
      }
      running--
      next()
    })
    running++
  }
}

next()
```

**실전 예제: 웹 스파이더에 동시성 제한 적용**

```javascript
function spiderLinks(currentUrl, body, nesting, callback) {
  if (nesting === 0) {
    return process.nextTick(callback)
  }

  const links = getPageLinks(currentUrl, body)
  if (links.length === 0) {
    return process.nextTick(callback)
  }

  const concurrency = 2
  let running = 0
  let completed = 0
  let index = 0

  function next() {
    while (running < concurrency && index < links.length) {
      const link = links[index++]

      spider(link, nesting - 1, (err) => {
        if (err) {
          return callback(err)
        }
        if (++completed === links.length) {
          return callback()
        }
        running--
        next()
      })
      running++
    }
  }

  next()
}
```

**장점**:
- ✅ 리소스 사용 제어
- ✅ 시스템 안정성 향상
- ✅ DoS 공격 방지
- ✅ 순차 실행보다 빠르고, 무제한 병렬보다 안전

> 📊 **실습**: `code/07-limited-parallel-execution.js` 참조

---

#### TaskQueue: 전역적인 동시성 제한

**핵심 개념**: 재사용 가능한 작업 큐 클래스를 만들어 동시성을 전역적으로 관리합니다.

**TaskQueue 클래스 구현**:

```javascript
import { EventEmitter } from 'events'

export class TaskQueue extends EventEmitter {
  constructor(concurrency) {
    super()
    this.concurrency = concurrency
    this.running = 0
    this.queue = []
  }

  pushTask(task) {
    this.queue.push(task)
    process.nextTick(this.next.bind(this))
    return this
  }

  next() {
    if (this.running === 0 && this.queue.length === 0) {
      return this.emit('empty')
    }

    while (this.running < this.concurrency && this.queue.length) {
      const task = this.queue.shift()
      task((err) => {
        if (err) {
          this.emit('error', err)
        }
        this.running--
        process.nextTick(this.next.bind(this))
      })
      this.running++
    }
  }
}
```

**사용 예제**:

```javascript
const downloadQueue = new TaskQueue(2)

downloadQueue.on('error', (err) => {
  console.error(err)
})

downloadQueue.on('empty', () => {
  console.log('All downloads completed')
})

function spiderLinks(currentUrl, body, nesting, callback) {
  if (nesting === 0) {
    return process.nextTick(callback)
  }

  const links = getPageLinks(currentUrl, body)
  if (links.length === 0) {
    return process.nextTick(callback)
  }

  let completed = 0
  let hasErrors = false

  links.forEach((link) => {
    downloadQueue.pushTask((done) => {
      spider(link, nesting - 1, (err) => {
        if (err) {
          hasErrors = true
          return callback(err)
        }
        if (++completed === links.length && !hasErrors) {
          callback()
        }
        done()
      })
    })
  })
}
```

**TaskQueue의 장점**:

1. ✅ **재사용성**: 여러 곳에서 동일한 큐 사용 가능
2. ✅ **전역 제한**: 애플리케이션 전체의 동시성 제어
3. ✅ **이벤트 기반**: EventEmitter를 상속하여 유연한 이벤트 처리
4. ✅ **간결한 코드**: 복잡한 제어 로직을 캡슐화

**TaskQueue 개선**:

```javascript
export class TaskQueue extends EventEmitter {
  constructor(concurrency) {
    super()
    this.concurrency = concurrency
    this.running = 0
    this.queue = []
  }

  pushTask(task) {
    this.queue.push(task)
    process.nextTick(this.next.bind(this))
    return this
  }

  next() {
    if (this.running === 0 && this.queue.length === 0) {
      return this.emit('empty')
    }

    while (this.running < this.concurrency && this.queue.length) {
      const task = this.queue.shift()
      task((err) => {
        if (err) {
          this.emit('error', err)
        }
        this.running--
        process.nextTick(this.next.bind(this))
      })
      this.running++
    }
  }
}
```

**이벤트**:

- `error`: 작업 실패 시 발생
- `empty`: 모든 작업 완료 시 발생

> 📊 **실습**: `code/08-task-queue.js`, `code/spider/spider-v4-limited.js` 참조

---

## 3. 비동기 라이브러리

### 3-1. async 라이브러리

**핵심 개념**: 콜백 기반 비동기 코드를 더 쉽게 작성할 수 있도록 돕는 **검증된 라이브러리**입니다.

**설치**:

```bash
npm install async
```

**주요 기능**:

#### 1. 컬렉션 처리

**순차적 처리 (eachSeries)**:

```javascript
import async from 'async'

async.eachSeries(
  items,
  (item, callback) => {
    // 각 item 처리
    asyncOperation(item, callback)
  },
  (err) => {
    // 모든 작업 완료
    if (err) {
      return console.error(err)
    }
    console.log('All items processed')
  }
)
```

**병렬 처리 (each)**:

```javascript
async.each(
  items,
  (item, callback) => {
    asyncOperation(item, callback)
  },
  (err) => {
    if (err) {
      return console.error(err)
    }
    console.log('All items processed in parallel')
  }
)
```

**제한된 병렬 처리 (eachLimit)**:

```javascript
async.eachLimit(
  items,
  2, // concurrency
  (item, callback) => {
    asyncOperation(item, callback)
  },
  (err) => {
    if (err) {
      return console.error(err)
    }
    console.log('All items processed with concurrency limit')
  }
)
```

---

#### 2. Waterfall 실행

**순차적으로 데이터를 전달하며 실행**:

```javascript
async.waterfall([
  (callback) => {
    asyncOperation1(callback)
  },
  (result1, callback) => {
    asyncOperation2(result1, callback)
  },
  (result2, callback) => {
    asyncOperation3(result2, callback)
  }
], (err, finalResult) => {
  if (err) {
    return console.error(err)
  }
  console.log('Final result:', finalResult)
})
```

---

#### 3. 큐 추상화 (queue)

```javascript
const q = async.queue((task, callback) => {
  console.log('Processing task:', task.name)
  task.run(callback)
}, 2) // concurrency = 2

q.push({ name: 'task1', run: (cb) => { /* ... */ } })
q.push({ name: 'task2', run: (cb) => { /* ... */ } })

q.drain(() => {
  console.log('All tasks completed')
})
```

---

#### 4. Race 패턴

**가장 먼저 완료되는 작업의 결과 사용**:

```javascript
async.race([
  (callback) => {
    setTimeout(() => callback(null, 'task1'), 200)
  },
  (callback) => {
    setTimeout(() => callback(null, 'task2'), 100)
  }
], (err, winner) => {
  console.log('Winner:', winner) // 'task2'
})
```

---

### 3-2. 실전 적용 권장사항

**언제 async 라이브러리를 사용할까?**

1. ✅ **복잡한 제어 흐름**: 여러 패턴이 혼합된 경우
2. ✅ **빠른 개발**: 검증된 패턴을 즉시 사용
3. ✅ **팀 협업**: 표준화된 코드 스타일

**주의사항**:

- ❌ 간단한 경우 오버엔지니어링 방지
- ❌ Promise/async-await가 더 적합한 경우 고려
- ✅ 라이브러리의 API와 동작 방식을 완전히 이해하고 사용

---

## 핵심 요약

### 🔑 주요 개념

1. **콜백 지옥의 극복**
   - 빠른 종료(Early Return) 원칙
   - 재사용 가능한 함수로 분리
   - 코드 모듈화

2. **제어 흐름 패턴**
   - **순차 실행**: 순서가 중요한 작업에 사용
   - **순차 반복**: 컬렉션을 하나씩 처리
   - **병렬 실행**: 독립적인 작업을 동시에 실행하여 성능 향상
   - **제한된 병렬 실행**: 리소스 관리를 위해 동시성 제한

3. **경쟁 상태 방지**
   - Set/Map을 사용한 중복 작업 방지
   - 상호 배제(Mutual Exclusion) 패턴 적용

4. **TaskQueue 구현**
   - EventEmitter 기반 작업 큐
   - 전역적인 동시성 제어
   - 재사용 가능한 추상화

### 💡 실무 적용 포인트

1. **동시성 제한 설정**
   - CPU 코어 수를 고려: `os.cpus().length`
   - I/O 작업: 5-10 정도가 적절
   - 외부 API 호출: 서버 정책에 따라 1-5

2. **에러 처리**
   - 모든 콜백에서 에러를 첫 번째로 확인
   - 에러 발생 시 즉시 상위 콜백으로 전파
   - 전역 에러 핸들러 설정

3. **메모리 관리**
   - 클로저 남용 방지
   - 이벤트 리스너 정리
   - 대용량 데이터는 스트림 사용 고려

4. **디버깅**
   - 명명된 함수 사용 (스택 트레이스 개선)
   - 적절한 로깅
   - async_hooks로 비동기 추적

### 🔗 다음 챕터 연결

**Chapter 5: Promise와 Async/Await**
- 콜백의 한계를 극복하는 현대적 패턴
- 더 나은 에러 처리와 가독성
- async/await로 동기 코드처럼 작성하기

콜백 패턴을 완전히 이해하면 Promise와 async/await로 자연스럽게 넘어갈 수 있습니다! 🚀

---

## 실습 코드

모든 코드 예제는 `code/` 디렉토리에 있습니다:

### 1. 콜백 지옥과 리팩토링

```bash
node code/01-callback-hell.js
node code/02-callback-best-practices.js
```

### 2. 제어 흐름 패턴

```bash
# 순차 실행
node code/03-sequential-execution.js

# 순차 반복
node code/04-sequential-iteration.js

# 병렬 실행
node code/05-parallel-execution.js

# 경쟁 상태
node code/06-race-condition.js

# 제한된 병렬 실행
node code/07-limited-parallel-execution.js

# TaskQueue
node code/08-task-queue.js
```

### 3. 웹 스파이더 진화

```bash
# 버전별로 실행하여 차이 확인
node code/spider/spider-v1.js https://example.com
node code/spider/spider-v2-refactored.js https://example.com
node code/spider/spider-v3-parallel.js https://example.com
node code/spider/spider-v4-limited.js https://example.com
```

### 4. 연습 문제

```bash
node code/exercises/4.3-recursive-find.js
```

자세한 실행 방법은 `code/README.md`를 참고하세요.

---

## 참고 자료

### 공식 문서

- **Node.js Documentation**: https://nodejs.org/docs/latest/api/
- **Node.js Event Loop**: https://nodejs.org/en/docs/guides/event-loop-timers-and-nexttick/
- **Node.js Asynchronous Context Tracking**: https://nodejs.org/api/async_context.html

### 비동기 라이브러리

- **async 라이브러리**: https://caolan.github.io/async/v3/
- **Callback Hell 해결법**: http://callbackhell.com/

### 추가 학습

- **JavaScript Event Loop 시각화**: http://latentflip.com/loupe/
- **Node.js Design Patterns (책)**: https://www.nodejsdesignpatterns.com/

---

**마무리**: 콜백 패턴은 Node.js 비동기 프로그래밍의 기초입니다. 이 패턴들을 완전히 이해하면 Promise와 async/await로 자연스럽게 넘어갈 수 있고, 더 복잡한 비동기 시나리오도 쉽게 다룰 수 있습니다. 다음 챕터에서는 콜백의 한계를 극복하는 현대적인 비동기 패턴을 배워봅시다! 🚀
