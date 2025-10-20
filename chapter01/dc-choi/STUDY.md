### Synchronous Event Demultiplexer
OS 커널이 여러 I/O 소켓(파일 디스크립터)을 동시에 감시하면서, 어떤 I/O가 준비됐는지 알려주는 역할을 하는 시스템 콜 계층

epoll, kqueue, poll같은 POSIX 시스템 콜

### Event Notification Interface
OS에 이벤트를 등록/통지하는 API 계층

uv_poll, uv_io 같은 libuv API

### Event Loop
이벤트 큐를 감시하고, 준비된 I/O 이벤트에 대한 콜백을 실행하는 루프

JS의 비동기 실행 모델

# 동작 원리 총 정리

```mermaid
graph TD

%% ========== JS & V8 ==========
subgraph JS["🟦 JavaScript (User Space)"]
  J0["🧑‍💻 Async Code (your JS: Promise/async, setTimeout, fs.readFile, etc.)"]
  J1["V8 Engine (콜스택/힙, 바이트코드·최적화 JIT, GC)"]
  J0 --> J1
end

%% ========== Node Core ==========
subgraph NODE["🟩 Node.js Core (C++ Bindings)"]
  N1["Node Core APIs (fs/net/timers) & Bindings"]
  N2["libuv Integration (bridge)"]
  J1 --> N1 --> N2
end

%% ========== libuv ==========
subgraph UV["🟩 libuv (C Layer)"]
  U1["Event Loop Core (uv_run) — Timers → Pending → Idle/Prepare → Poll → Check → Close"]
  U2["Event Notification Interface (uv_poll/uv_io)"]
  U3["Thread Pool (async fs/DNS/crypto; 기본 4, 최대 1024)"]
  U4["Timer Queue"]
  N2 --> U1
  U1 --> U2
  U1 --> U3
  U1 --> U4
end

%% ========== OS ==========
subgraph OS["🟧 OS Kernel"]
  O1["Synchronous Event Demultiplexer"]
  O2["(epoll / kqueue / IOCP / poll / select)"]
  O1 --> O2
end

%% ========== Flow ==========
UV --> OS
O2 -->|I/O readiness events| U2
U2 -->|I/O callbacks| U1
U3 -->|completed async tasks| U1
U1 -->|schedule callbacks| J1
J1 -->|run callbacks/microtasks| J0
```

# node.js 예제별 실행 흐름

1. 