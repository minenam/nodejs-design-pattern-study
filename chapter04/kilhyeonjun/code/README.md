# Chapter 4 코드 예제

콜백을 사용한 비동기 제어 흐름 패턴 실습 코드

## 📁 파일 구조

```
code/
├── 01-callback-hell.js                  # 콜백 지옥 문제
├── 02-callback-best-practices.js        # 리팩토링 및 모범 사례
├── 03-sequential-execution.js           # 순차 실행 패턴
├── 04-sequential-iteration.js           # 순차 반복 패턴
├── 05-parallel-execution.js             # 병렬 실행 패턴
├── 06-race-condition.js                 # 경쟁 상태와 해결
├── 07-limited-parallel-execution.js     # 제한된 병렬 실행
├── 08-task-queue.js                     # TaskQueue 클래스
├── spider/
│   ├── spider-v1.js                     # 웹 스파이더 v1 (콜백 지옥)
│   ├── spider-v2-refactored.js          # v2 (리팩토링)
│   ├── spider-v3-parallel.js            # v3 (병렬 실행)
│   └── spider-v4-limited.js             # v4 (제한된 병렬 + TaskQueue)
├── exercises/
│   ├── 4.1-concat-files.js              # 연습 문제: 파일 연결
│   ├── 4.2-list-nested-files.js         # 연습 문제: 재귀적 파일 리스트
│   └── 4.3-recursive-find.js            # 연습 문제: 재귀적 파일 검색
└── testdata/                            # 테스트 데이터 (자동 생성)
```

---

## 🚀 실행 방법

### 준비사항

Node.js 버전 확인:
```bash
node --version  # v14 이상 권장
```

의존성 설치 (spider 예제용):
```bash
npm install superagent mkdirp
```

### 기본 예제

```bash
# 콜백 지옥 문제
node 01-callback-hell.js

# 리팩토링된 코드
node 02-callback-best-practices.js

# 순차 실행
node 03-sequential-execution.js

# 순차 반복
node 04-sequential-iteration.js

# 병렬 실행
node 05-parallel-execution.js

# 경쟁 상태
node 06-race-condition.js

# 제한된 병렬 실행
node 07-limited-parallel-execution.js

# TaskQueue
node 08-task-queue.js
```

### 웹 스파이더 예제

```bash
cd spider

# v1: 콜백 지옥 버전
node spider-v1.js https://example.com

# v2: 리팩토링 버전
node spider-v2-refactored.js https://example.com

# v3: 병렬 실행 버전
node spider-v3-parallel.js https://example.com 1

# v4: 제한된 병렬 실행 (동시성 2)
node spider-v4-limited.js https://example.com 1 2
```

**참고**: 실제 웹사이트 크롤링 시 주의사항
- robots.txt 확인
- 요청 간격 조절
- 사이트 정책 준수

### 연습 문제

```bash
cd exercises

# 현재 디렉터리에서 "TODO" 키워드 검색
node 4.3-recursive-find.js . "TODO"

# 특정 디렉터리에서 검색 (동시성 10)
node 4.3-recursive-find.js /path/to/dir "keyword" 10
```

---

## 📚 학습 포인트

### 1. `01-callback-hell.js`

**개념**: 콜백 지옥 (Callback Hell)

**학습 목표**:
- 중첩된 콜백의 문제점 이해
- 죽음의 피라미드(Pyramid of Doom) 확인
- 가독성 저하 체감

**예상 출력**:
```
=== 콜백 지옥 (Callback Hell) 예제 ===
✅ 테스트 데이터 생성 완료
📖 파일 1 읽기 완료: First file content
📖 파일 2 읽기 완료: Second file content
📖 파일 3 읽기 완료: Third file content
✅ 모든 작업 완료!
```

**핵심**: 5단계 이상 중첩되면 유지보수가 거의 불가능!

---

### 2. `02-callback-best-practices.js`

**개념**: 콜백 모범 사례

**학습 목표**:
- Early Return 패턴 적용
- 함수 모듈화
- 재사용 가능한 코드 작성

**핵심 개선**:
```javascript
// ✅ 재사용 가능한 함수
function readFileContent(filePath, callback) {
  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      return callback(err) // Early Return
    }
    callback(null, data)
  })
}
```

**장점**:
- 중첩 레벨 감소
- 테스트 용이성
- 디버깅 편의성

---

### 3. `03-sequential-execution.js`

**개념**: 순차 실행 (Sequential Execution)

**학습 목표**:
- 작업을 순서대로 실행하는 방법
- 이전 결과를 다음 작업에 전달

**패턴**:
1. 명시적 순차 실행
2. 일반화된 순차 실행 함수
3. Waterfall 패턴 (결과 누적)

**예상 출력**:
```
📌 Task 1 시작...
✅ Task 1 완료
📌 Task 2 시작...
✅ Task 2 완료
...
```

**사용 시기**: 작업 간 의존성이 있을 때

---

### 4. `04-sequential-iteration.js`

**개념**: 순차 반복 (Sequential Iteration)

**학습 목표**:
- 컬렉션을 순차적으로 처리
- Iterator 패턴 구현

**패턴**:
1. 기본 순차 반복
2. forEach 스타일
3. map 스타일 (결과 수집)
4. filter 스타일 (필터링)

**예상 출력**:
```
📌 항목 1 처리 시작: "Apple"
✅ 항목 1 완료: "Apple (처리됨)"
📌 항목 2 처리 시작: "Banana"
...
```

---

### 5. `05-parallel-execution.js`

**개념**: 병렬 실행 (Parallel Execution)

**학습 목표**:
- 동시 실행으로 성능 향상
- 완료 카운터 패턴

**성능 비교**:
```
순차 실행:   600ms
병렬 실행:   150ms (75% 개선!)
```

**주의사항**:
- 순서 보장 안 됨
- 경쟁 상태 위험
- 리소스 관리 필요

---

### 6. `06-race-condition.js`

**개념**: 경쟁 상태 (Race Conditions)

**학습 목표**:
- 경쟁 상태 발생 원인 이해
- Set/Map을 사용한 해결
- EventEmitter를 사용한 완벽한 해결

**문제 상황**:
```
Task A: 파일 없음 확인 → 다운로드 시작
Task B: 파일 없음 확인 → 다운로드 시작 (중복!)
```

**해결책**:
```javascript
const downloading = new Set()

if (downloading.has(url)) {
  return callback() // 이미 다운로드 중
}
downloading.add(url)
```

---

### 7. `07-limited-parallel-execution.js`

**개념**: 제한된 병렬 실행 (Limited Parallel Execution)

**학습 목표**:
- 동시성 제한의 필요성
- 리소스 관리
- 순차/병렬/제한된 병렬 비교

**성능 비교**:
```
순차 실행:       600ms (가장 느림)
제한된 병렬:     300ms (균형)
무제한 병렬:     150ms (가장 빠르지만 위험)
```

**동시성 설정 가이드**:
- CPU 집약: `os.cpus().length`
- I/O 작업: 5-10
- 외부 API: 1-5

---

### 8. `08-task-queue.js`

**개념**: TaskQueue 클래스

**학습 목표**:
- EventEmitter 기반 작업 큐
- 재사용 가능한 추상화
- 전역적인 동시성 제어

**클래스 구조**:
```javascript
class TaskQueue extends EventEmitter {
  constructor(concurrency)
  pushTask(task)        // 작업 추가
  next()                // 다음 작업 실행
  getStats()            // 통계 정보
}
```

**이벤트**:
- `empty`: 모든 작업 완료
- `error`: 작업 실패

**장점**:
- 재사용 가능
- 체이닝 지원
- 동적 작업 추가

---

### 9. 웹 스파이더 시리즈

#### `spider-v1.js` - 콜백 지옥

**문제점**:
- 5단계 이상 중첩
- 가독성 매우 낮음

#### `spider-v2-refactored.js` - 리팩토링

**개선**:
- `saveFile()`, `download()` 함수 분리
- Early Return 적용
- 중첩 레벨 3단계로 감소

#### `spider-v3-parallel.js` - 병렬 실행

**개선**:
- 링크를 병렬로 다운로드
- 실행 시간 단축
- Set으로 경쟁 상태 방지

**문제**:
- 무제한 병렬 실행
- 리소스 고갈 위험

#### `spider-v4-limited.js` - 최종 버전

**개선**:
- TaskQueue 사용
- 동시성 제한 (기본 2)
- 안전하고 빠른 크롤링

**실행 예시**:
```bash
# 동시성 2로 제한
node spider-v4-limited.js https://example.com 1 2

# 동시성 5로 설정
node spider-v4-limited.js https://example.com 1 5
```

---

### 10. `4.1-concat-files.js` - 연습 문제

**문제**: 여러 텍스트 파일을 순서대로 하나의 파일로 연결

**학습 목표**:
- Rest 파라미터 활용
- 순차 실행 패턴 적용
- 파일 순서 유지

**함수 시그니처**:
```javascript
concatFiles(src1, src2, ..., dest, callback)
```

**실행 예시**:
```bash
# 3개 파일을 하나로 연결
node 4.1-concat-files.js
```

**예상 출력**:
```
=== 연습 문제 4.1: 파일 연결 (concatFiles) ===

📌 3개 파일 연결 시작...

📖 읽는 중: file1.txt
📖 읽는 중: file2.txt
📖 읽는 중: file3.txt

✅ Concatenated 3 files into concatenated.txt

📄 결합된 내용:
────────────────────────────────────────
First file contentSecond file contentThird file content
────────────────────────────────────────

💡 파일 순서가 유지되었는지 확인하세요!
```

**핵심 구현**:
```javascript
function concatFiles(...args) {
  const callback = args[args.length - 1]
  const dest = args[args.length - 2]
  const srcFiles = args.slice(0, args.length - 2)

  // 순차적으로 파일 읽기
  function readNext() {
    if (index === srcFiles.length) {
      // 모두 읽었으면 목적 파일에 쓰기
      fs.writeFile(dest, contents.join(''), callback)
      return
    }
    // 다음 파일 읽고 readNext() 재귀 호출
  }
}
```

---

### 11. `4.2-list-nested-files.js` - 연습 문제

**문제**: 디렉터리의 모든 서브 디렉터리를 재귀적으로 탐색하여 파일 목록 반환

**학습 목표**:
- 재귀적 디렉터리 탐색
- 완료 카운터 패턴
- 콜백 지옥 회피

**함수 시그니처**:
```javascript
listNestedFiles(dir, callback)
```

**실행 예시**:
```bash
# 현재 디렉터리의 모든 파일 나열
node 4.2-list-nested-files.js .

# 특정 디렉터리 탐색
node 4.2-list-nested-files.js ../testdata
```

**예상 출력**:
```
=== 연습 문제 4.2: 재귀적 파일 리스트 (listNestedFiles) ===

📂 탐색 디렉터리: /path/to/testdata

✅ 탐색 완료! (15ms)
📊 발견된 파일: 5개

파일 목록:
  1. /path/to/testdata/file1.txt
  2. /path/to/testdata/file2.txt
  3. /path/to/testdata/file3.txt
  4. /path/to/testdata/concatenated.txt
  5. /path/to/testdata/subdirectory/nested.txt
```

**핵심 구현**:
```javascript
function listNestedFiles(dir, cb) {
  const allFiles = []

  fs.readdir(dir, { withFileTypes: true }, (err, entries) => {
    let completed = 0
    const totalEntries = entries.length

    entries.forEach((entry) => {
      if (entry.isDirectory()) {
        // 재귀 호출
        listNestedFiles(fullPath, (err, nestedFiles) => {
          allFiles.push(...nestedFiles)
          if (++completed === totalEntries) cb(null, allFiles)
        })
      } else {
        allFiles.push(fullPath)
        if (++completed === totalEntries) cb(null, allFiles)
      }
    })
  })
}
```

---

### 12. `4.3-recursive-find.js` - 연습 문제

**문제**: 디렉터리에서 키워드를 포함한 파일 재귀적 검색

**학습 목표**:
- 재귀적 디렉터리 탐색
- 제한된 병렬 실행 적용
- 실전 패턴 구현

**실행 예시**:
```bash
# 현재 디렉터리에서 "TODO" 검색
node 4.3-recursive-find.js . "TODO"

# 특정 디렉터리, 동시성 10
node 4.3-recursive-find.js ~/projects "console.log" 10
```

**예상 출력**:
```
✅ Match found: /path/to/file1.js
✅ Match found: /path/to/file2.js
🎉 Search complete in 250ms
📊 Found 2 file(s) containing "TODO"
```

---

## 🎯 추천 학습 순서

1. **콜백 기초** → `01`, `02`
   - 콜백 지옥 문제 확인
   - 리팩토링 방법 학습

2. **순차 패턴** → `03`, `04`
   - 순차 실행 이해
   - 순차 반복 구현

3. **병렬 패턴** → `05`, `06`
   - 병렬 실행의 장점
   - 경쟁 상태 문제와 해결

4. **동시성 제어** → `07`, `08`
   - 제한된 병렬 실행
   - TaskQueue 클래스

5. **실전 적용** → `spider/*`
   - 웹 크롤러 단계별 개선
   - v1 → v2 → v3 → v4 순서로

6. **종합 연습** → `exercises/*`
   - 4.1: 순차 실행 패턴 (파일 연결)
   - 4.2: 재귀와 완료 카운터 (파일 리스트)
   - 4.3: 제한된 병렬 실행 (재귀적 검색)

---

## 💡 실습 팁

### 코드 수정해보기

1. **동시성 변경**
   ```javascript
   // 07-limited-parallel-execution.js에서
   const concurrency = 2 // → 5로 변경해보기
   ```

2. **작업 수 변경**
   ```javascript
   // 05-parallel-execution.js에서
   for (let i = 1; i <= 5; i++) // → 10으로 증가
   ```

3. **지연 시간 조정**
   ```javascript
   // 03-sequential-execution.js에서
   const delay = 100 // → 500으로 변경
   ```

### 디버깅 팁

**통계 출력 추가**:
```javascript
console.log('현재 실행 중:', running)
console.log('대기 중인 작업:', queue.length)
```

**시간 측정**:
```javascript
const startTime = Date.now()
// ... 작업 수행
console.log(`실행 시간: ${Date.now() - startTime}ms`)
```

**에러 추적**:
```javascript
process.on('unhandledRejection', (err) => {
  console.error('Unhandled rejection:', err)
})
```

---

## 🔧 문제 해결

### 에러: ENOENT

**에러**:
```
Error: ENOENT: no such file or directory
```

**원인**: 파일이나 디렉터리가 존재하지 않음

**해결**:
1. 테스트 데이터 디렉터리 확인
2. 파일 경로가 올바른지 확인
3. 코드 실행 위치 확인

---

### 에러: Too many open files

**에러**:
```
Error: EMFILE: too many open files
```

**원인**: 동시성 제한 없이 너무 많은 파일을 열려고 함

**해결**:
1. concurrency 값을 낮춤 (예: 2-5)
2. 제한된 병렬 실행 패턴 적용
3. OS의 파일 디스크립터 한계 확인

---

### 에러: Cannot find module 'superagent'

**에러**:
```
Error: Cannot find module 'superagent'
```

**원인**: 의존성 미설치

**해결**:
```bash
npm install superagent mkdirp
```

---

### 프로그램이 종료되지 않음

**원인**: 콜백이 호출되지 않거나 이벤트 루프에 작업이 남아 있음

**해결**:
1. 모든 비동기 작업이 콜백을 호출하는지 확인
2. 이벤트 리스너가 제거되는지 확인
3. `process.exit(0)` 명시적 호출

---

## 📖 참고 자료

### Node.js 공식 문서

- **File System**: https://nodejs.org/api/fs.html
- **Events**: https://nodejs.org/api/events.html
- **Process**: https://nodejs.org/api/process.html

### 비동기 라이브러리

- **async**: https://caolan.github.io/async/v3/
- **p-limit**: https://github.com/sindresorhus/p-limit

### 추가 학습

- **Callback Hell 해결법**: http://callbackhell.com/
- **JavaScript Event Loop**: http://latentflip.com/loupe/

---

## 🌟 다음 단계

Chapter 4의 패턴들을 마스터했다면:

1. **Promise 학습** (Chapter 5)
   - 콜백의 한계 극복
   - 더 나은 에러 처리
   - 체이닝과 조합

2. **async/await 학습** (Chapter 6)
   - 동기 코드처럼 작성
   - 최고의 가독성
   - 현대적인 패턴

3. **실전 프로젝트**
   - 웹 크롤러 완성
   - API 서버 구축
   - 파일 처리 파이프라인

콜백 패턴을 완전히 이해하면 Promise와 async/await로 자연스럽게 넘어갈 수 있습니다! 🚀
