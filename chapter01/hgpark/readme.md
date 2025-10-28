# Node.js 플랫폼

## Node.js 철학

1. 경량 코어
    - 최소한의 기능 세트를 제공하며 사용자 전용 모듈 생태계를 둠

2. 경량 모듈
    - 재사용 가능한 라이브러리를 만들기 위한 구성요소
    - npm, yarn등 패키지 매니저를 통해 종속성을 관리

3. 작은 외부 인터페이스
    - 단일진입점을 재공하기위해 단 하나의 함수나 클래스를 노출
    - 모듈의 확장보다는 사용을 위해 모듈 내부 접근을 제한

4. 간결함과 실용주의

## Node.js의 동작원리

### 블로킹 I/O

작업 완료까지 스레드의 실행을 차단

### 논블로킹 I/O

호출 순간에 미리 정의된 상수를 반환, 실제 데이터가 반환될때까지 loop polling (busy waiting)

### 이벤트 디멀티플렉싱

여러 리소스를 관찰하고 이 리소스들 중에 읽기 또는 쓰기 연산의 실행이 완료되었을 때 새로운 이벤트를 반환.
디멀티플렉서가 처리하기 위한 새로운 이벤트가 있을때 까지 프로세스가 블로킹 된다. (CPU를 사용하지 않는다)
    - 이벤트는 커널이 대신 감시하고 프로세스는 유휴상태가 된다.
    - 네트워크가 패킷을 수신하면 하드웨어 인터럽트를 발생시킨다.
    - 커널이 대기 큐에서 프로세스를 찾아 CPU에 스케쥴러에 올린다.

### 리액터 패턴

비동기 작업이 완료됬을떄 각 비동기 작업 완료 후 실행할 핸들러를 갖는다 (콜백을 갖는다)

1. 어플리케이션은 이벤트 디멀티 플렉서에 요청을 전달하여 IO작업을 생성하고, 작업완료시 호출할 핸들러를 명시한다.
    - 이벤트 디멀티플렉서에 새 요청을 전달하는것은 넌블러킹 호출이다. (왜?)
2. 일련의 I/O 작업들이 완료되면 이벤트 디멀티플렉서는 대응하는 이벤트 작업들을 이벤트 큐에 집어넣음
3. 이벤트 루프가 이벤트 큐의 항목을 순회
4. 각 이벤트와 관련된 핸들러가 호출됨
5. 핸들러의 실행이 완료되면 제어권을 이벤트 루프에 반환. 핸들러 실행 중 다른 비동기 작업을 요청할 수 있음 (이벤트 디멀티플렉서에 새로운 항목 추가)
6. 이벤트 큐의 모든 항목이 처리되고 나면 이벤트 루프는 이벤트 디멀티플렉서에서 블로킹 처리되며, 처리가능한 새 이벤트가 있을 경우 다시 트리거됨

### Libuv

각 운영체제별로 논블로킹 동작의 호환을 위해 libuv라는 라이브러리 만듦

## Node.js와 JavaScript

### 모듈 시스템

Node.js는 로컬 파일 시스템에 있는 모듈만 다룰 수 있음

### 운영체제 기능에 대한 모든 접근

fs, net, dgram등의 모듈을 이용해 운영체제 기능에 접근할 수 있음
child_process를 이용하여 다른 프로세스를 실행시키거나, 전역변수 process를 사용하여 프로세스에 할당된 환경변수 목록과 arvg를 가져올 수 있음

### 네이티브 코드 실행

N-API 인터페이스의 도움으로 네이티브 모듈을 구현할 수 있다. (node-canvas)
Javascript VM들은 WASM을 지원한다.

# 비동기-블로킹 I/O 모델이란..?

동기 I/O
1. 동기 I/O 작업 시작
    - Application Thread
        - read(fileA, buffer, 1024) 호출
        - 시스템 콜로 커널 진입
        - Thread 1은 즉시 BLOCKED 상태
    - Kernel
        - Thread 1의 I/O 요청 받음
        - 디스크 컨트롤러에 읽기 명령
        - Thread 1을 I/O 대기 큐에 등록
    - CPU
        - Thread 1이 BLOCKED 되었으므로
        - 스케줄러가 다른 Thread/Process 실행

2. 동기 I/O 작업중
    - Kernal
    - Application Thread
        - BLOCKED
    - CPU
        - BLOCKED상태이므로 Application Thread 의 명령어를 수행할 수 없다. 

3. 동기 I/O 완료
    - Kernel
        - 디스크에서 데이터 읽기 완료
        - Thread 1을 RUNNABLE 상태로 변경
    - Application Thread
        - BLOCKED → RUNNABLE
        - 스케줄러 큐에서 대기
        - CPU 차례가 오면 RUNNING
    - CPU
        - Thread 3 실행 완료 → Thread 1 실행

비동기 I/O
1. 비동기 I/O 작업 요청
    - Application Thread
        - 커널에 파일 A 를 읽기 요청 등록
        - 요청만 하고 다른작업은 계속 진행
    - Kernal
        - 요청들을 관심목록에 등록(?)

2. 이벤트 루프 진입
    - Application Thread
        - epoll_wait()을 호출하여 멀티플렉서 작동
        - Thread는 BLOCKED 상태로 전환됨
    - CPU
        - Application Thread 이 Blocking 상태이므로 다른 프로세스 실행

3. 백그라운드 I/O wlsgod
    - Kernal, 하드웨어
        - 파일 읽는중
    - Application Thread
        - epoll_wait() 상태이므로 BLOCKED
    - CPU
        - 다른일 하는중

4. I/O 완료
    - Kernal
        - DB 응답 데이터를 버퍼에 저장
        - 이벤트를 epoll 준비 목록에 추가
        - epoll_wait()하는 Thread 깨우기
    - Application Thread
        - BLOCKED -> RUNNABLE 상태로 상태 변경

5. 멀티플렉서 동작
    - Application Thread
        - epoll_wait()에서 이벤트 정보 반환 { 파일 A, READ_READY }

6. 디멀티플렉서 동작
    - Application Thread
        - 이벤트 타입 확인하여 알맞은 콜백 실행

결국 동기 IO나 비동기 IO 모두 Thread에 블로킹이 발생하는건 똑같다.
다만 무엇이, 얼마나 블로킹 되느냐가 다르다

ex) 1000개의 IO
동기 IO: 스레드 1000개가 개별로 블로킹됨 -> CPU간 컨텍스트 스위칭이 발생한다.
비동기 IO: 이벤트 루프 1개만 블로킹하면 됨

따라서 I/O Multiplexing (select/poll) Blocking + Asynchronous 하다.
(정확히는 비동기 I/O에 Blocking 이 있다.)