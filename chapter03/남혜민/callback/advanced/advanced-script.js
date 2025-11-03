// 탭 전환
document.querySelectorAll('.tab-btn').forEach(button => {
    button.addEventListener('click', () => {
        const tabId = button.dataset.tab;
        
        document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
        
        button.classList.add('active');
        document.getElementById(tabId).classList.add('active');
    });
});

// 유틸리티
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function addFlowItem(container, text, className = '') {
    const item = document.createElement('div');
    item.className = `flow-item ${className}`;
    item.textContent = text;
    container.appendChild(item);
    return item;
}

function removeItem(item) {
    if (item && item.parentNode) {
        item.style.opacity = '0';
        item.style.transform = 'translateX(20px)';
        setTimeout(() => {
            if (item.parentNode) item.remove();
        }, 300);
    }
}

function addOutput(container, text, type = '') {
    const line = document.createElement('div');
    line.className = `output-line ${type}`;
    line.textContent = text;
    container.appendChild(line);
}

// CPS 데모
let cpsRunning = false;

async function runCPSDemo() {
    if (cpsRunning) return;
    cpsRunning = true;
    
    const stack = document.getElementById('cpsStack');
    const timer = document.getElementById('cpsTimer');
    const queue = document.getElementById('cpsQueue');
    const output = document.getElementById('cpsOutputContent');
    
    stack.innerHTML = '';
    timer.innerHTML = '';
    queue.innerHTML = '';
    output.innerHTML = '';
    
    // console.log("Start")
    let item = addFlowItem(stack, 'console.log("Start")', 'sync');
    await sleep(800);
    addOutput(output, 'Start', 'info');
    removeItem(item);
    await sleep(500);
    
    // addAsync 호출
    item = addFlowItem(stack, 'addAsync(2, 3, cb)', 'async');
    await sleep(800);
    
    // setTimeout - Timer로 이동
    const timerItem = addFlowItem(timer, 'setTimeout(..., 1000)', 'async');
    addOutput(output, '⏱️ Timer 시작 (1초)', 'warning');
    removeItem(item);
    await sleep(500);
    
    // console.log("End")
    item = addFlowItem(stack, 'console.log("End")', 'sync');
    await sleep(800);
    addOutput(output, 'End', 'info');
    removeItem(item);
    await sleep(1000);
    
    // Timer 완료 - Queue로
    addOutput(output, '⏱️ Timer 완료!', 'success');
    removeItem(timerItem);
    await sleep(300);
    
    const queueItem = addFlowItem(queue, 'callback(5)', 'callback');
    await sleep(1000);
    
    // Queue에서 Stack으로
    addOutput(output, '📥 콜백을 Stack으로 이동', 'info');
    removeItem(queueItem);
    await sleep(300);
    
    const cbItem = addFlowItem(stack, 'callback(5)', 'callback');
    await sleep(800);
    addOutput(output, 'Result: 5', 'success');
    removeItem(cbItem);
    
    cpsRunning = false;
}

function resetCPSDemo() {
    document.getElementById('cpsStack').innerHTML = '';
    document.getElementById('cpsTimer').innerHTML = '';
    document.getElementById('cpsQueue').innerHTML = '';
    document.getElementById('cpsOutputContent').innerHTML = '';
    cpsRunning = false;
}

// Zalgo 데모
let zalgoRunning = false;

async function runZalgoSync() {
    if (zalgoRunning) return;
    zalgoRunning = true;
    
    const stack = document.getElementById('zalgoStack');
    const webapi = document.getElementById('zalgoWebAPI');
    const queue = document.getElementById('zalgoQueue');
    const output = document.getElementById('zalgoOutputContent');
    
    stack.innerHTML = '';
    webapi.innerHTML = '';
    queue.innerHTML = '';
    output.innerHTML = '';
    
    addOutput(output, '=== 캐시 있음 (동기 실행) ===', 'warning');
    await sleep(500);
    
    let item = addFlowItem(stack, 'let isReady = false', 'sync');
    await sleep(800);
    addOutput(output, '> isReady = false', 'info');
    removeItem(item);
    await sleep(500);
    
    item = addFlowItem(stack, 'getData("user:1", cb)', 'sync');
    await sleep(800);
    addOutput(output, '> 캐시 확인: 있음!', 'info');
    await sleep(500);
    
    const cbItem = addFlowItem(stack, 'callback(data)', 'sync');
    await sleep(800);
    addOutput(output, '> console.log("isReady:", false)', 'error');
    await sleep(500);
    removeItem(cbItem);
    removeItem(item);
    await sleep(500);
    
    item = addFlowItem(stack, 'isReady = true', 'sync');
    await sleep(800);
    addOutput(output, '> isReady = true', 'info');
    removeItem(item);
    await sleep(500);
    
    addOutput(output, '', '');
    addOutput(output, '❌ 문제: isReady가 false일 때 콜백 실행!', 'error');
    
    zalgoRunning = false;
}

async function runZalgoAsync() {
    if (zalgoRunning) return;
    zalgoRunning = true;
    
    const stack = document.getElementById('zalgoStack');
    const webapi = document.getElementById('zalgoWebAPI');
    const queue = document.getElementById('zalgoQueue');
    const output = document.getElementById('zalgoOutputContent');
    
    stack.innerHTML = '';
    webapi.innerHTML = '';
    queue.innerHTML = '';
    output.innerHTML = '';
    
    addOutput(output, '=== 캐시 없음 (비동기 실행) ===', 'info');
    await sleep(500);
    
    let item = addFlowItem(stack, 'let isReady = false', 'sync');
    await sleep(800);
    addOutput(output, '> isReady = false', 'info');
    removeItem(item);
    await sleep(500);
    
    item = addFlowItem(stack, 'getData("user:1", cb)', 'async');
    await sleep(800);
    addOutput(output, '> 캐시 확인: 없음!', 'info');
    await sleep(500);
    
    const apiItem = addFlowItem(webapi, 'fetchFromDB(...)', 'async');
    addOutput(output, '> DB 조회 시작 (비동기)', 'warning');
    removeItem(item);
    await sleep(500);
    
    item = addFlowItem(stack, 'isReady = true', 'sync');
    await sleep(800);
    addOutput(output, '> isReady = true', 'info');
    removeItem(item);
    await sleep(1000);
    
    addOutput(output, '> DB 조회 완료!', 'success');
    removeItem(apiItem);
    await sleep(300);
    
    const queueItem = addFlowItem(queue, 'callback(data)', 'callback');
    await sleep(1000);
    
    addOutput(output, '> 콜백을 Stack으로 이동', 'info');
    removeItem(queueItem);
    await sleep(300);
    
    const cbItem = addFlowItem(stack, 'callback(data)', 'callback');
    await sleep(800);
    addOutput(output, '> console.log("isReady:", true)', 'success');
    removeItem(cbItem);
    await sleep(500);
    
    addOutput(output, '', '');
    addOutput(output, '✅ 정상: isReady가 true일 때 콜백 실행!', 'success');
    
    zalgoRunning = false;
}

async function runNextTickDemo() {
    if (zalgoRunning) return;
    zalgoRunning = true;
    
    const stack = document.getElementById('zalgoStack');
    const queue = document.getElementById('zalgoQueue');
    const output = document.getElementById('zalgoOutputContent');
    
    stack.innerHTML = '';
    document.getElementById('zalgoWebAPI').innerHTML = '';
    queue.innerHTML = '';
    output.innerHTML = '';
    
    addOutput(output, '=== process.nextTick 해결책 ===', 'success');
    await sleep(500);
    
    let item = addFlowItem(stack, 'let isReady = false', 'sync');
    await sleep(800);
    addOutput(output, '> isReady = false', 'info');
    removeItem(item);
    await sleep(500);
    
    item = addFlowItem(stack, 'getData("user:1", cb)', 'async');
    await sleep(800);
    addOutput(output, '> 캐시 확인: 있음!', 'info');
    await sleep(500);
    
    addOutput(output, '> process.nextTick() 호출', 'warning');
    const queueItem = addFlowItem(queue, 'callback(data)', 'callback');
    removeItem(item);
    await sleep(500);
    
    item = addFlowItem(stack, 'isReady = true', 'sync');
    await sleep(800);
    addOutput(output, '> isReady = true', 'info');
    removeItem(item);
    await sleep(1000);
    
    addOutput(output, '> 콜백을 Stack으로 이동', 'info');
    removeItem(queueItem);
    await sleep(300);
    
    const cbItem = addFlowItem(stack, 'callback(data)', 'callback');
    await sleep(800);
    addOutput(output, '> console.log("isReady:", true)', 'success');
    removeItem(cbItem);
    await sleep(500);
    
    addOutput(output, '', '');
    addOutput(output, '✅ 해결: 항상 비동기로 동작!', 'success');
    
    zalgoRunning = false;
}

function resetZalgo() {
    document.getElementById('zalgoStack').innerHTML = '';
    document.getElementById('zalgoWebAPI').innerHTML = '';
    document.getElementById('zalgoQueue').innerHTML = '';
    document.getElementById('zalgoOutputContent').innerHTML = '';
    zalgoRunning = false;
}

// 에러 처리 데모
async function runErrorDemo(isSuccess) {
    const flowArea = document.getElementById('errorFlowArea');
    const output = document.getElementById('errorOutputContent');
    
    flowArea.innerHTML = '';
    output.innerHTML = '';
    
    addOutput(output, '=== 파일 읽기 시작 ===', 'info');
    await sleep(500);
    
    let item = addFlowItem(flowArea, 'fs.readFile("data.txt", cb)', 'async');
    addOutput(output, '> fs.readFile 호출', 'info');
    await sleep(1000);
    removeItem(item);
    
    if (isSuccess) {
        item = addFlowItem(flowArea, 'callback(null, data)', 'callback');
        addOutput(output, '> 파일 읽기 성공!', 'success');
        await sleep(800);
        addOutput(output, '> callback(null, "파일 내용...")', 'success');
        await sleep(500);
        removeItem(item);
        addOutput(output, '> 데이터 처리 중...', 'info');
    } else {
        item = addFlowItem(flowArea, 'callback(Error, null)', 'error');
        addOutput(output, '> 파일 읽기 실패!', 'error');
        await sleep(800);
        addOutput(output, '> callback(Error("ENOENT"))', 'error');
        await sleep(500);
        removeItem(item);
        addOutput(output, '> 에러 처리: 로그 기록', 'warning');
    }
}

// Fail-Fast 데모
async function runFailFastDemo(isValid) {
    const output = document.getElementById('failFastOutputContent');
    output.innerHTML = '';
    
    addOutput(output, '=== processData 호출 ===', 'info');
    await sleep(500);
    
    if (isValid) {
        addOutput(output, '> 입력 검증: 통과 ✓', 'success');
        await sleep(500);
        addOutput(output, '> saveToDatabase 호출', 'info');
        await sleep(1000);
        addOutput(output, '> 데이터 저장 성공!', 'success');
        await sleep(500);
        addOutput(output, '> callback(null, result)', 'success');
    } else {
        addOutput(output, '> 입력 검증: 실패 ✗', 'error');
        await sleep(500);
        addOutput(output, '> callback(Error("Data is required"))', 'error');
        await sleep(500);
        addOutput(output, '> 즉시 종료 (Fail-Fast)', 'warning');
        await sleep(500);
        addOutput(output, '> saveToDatabase 호출 안 함 (리소스 절약)', 'info');
    }
}

// Solution 탭 전환
document.querySelectorAll('.solution-tab').forEach(button => {
    button.addEventListener('click', () => {
        const solutionId = button.dataset.solution;
        
        document.querySelectorAll('.solution-tab').forEach(btn => btn.classList.remove('active'));
        document.querySelectorAll('.solution-content').forEach(content => content.classList.remove('active'));
        
        button.classList.add('active');
        document.getElementById(solutionId).classList.add('active');
    });
});

// 이벤트 리스너
document.addEventListener('DOMContentLoaded', () => {
    // CPS
    const runCPSBtn = document.getElementById('runCPSDemo');
    const resetCPSBtn = document.getElementById('resetCPSDemo');
    if (runCPSBtn) runCPSBtn.addEventListener('click', runCPSDemo);
    if (resetCPSBtn) resetCPSBtn.addEventListener('click', resetCPSDemo);
    
    // Zalgo
    const runZalgoSyncBtn = document.getElementById('runZalgoSync');
    const runZalgoAsyncBtn = document.getElementById('runZalgoAsync');
    const resetZalgoBtn = document.getElementById('resetZalgo');
    const runNextTickBtn = document.getElementById('runNextTickDemo');
    
    if (runZalgoSyncBtn) runZalgoSyncBtn.addEventListener('click', runZalgoSync);
    if (runZalgoAsyncBtn) runZalgoAsyncBtn.addEventListener('click', runZalgoAsync);
    if (resetZalgoBtn) resetZalgoBtn.addEventListener('click', resetZalgo);
    if (runNextTickBtn) runNextTickBtn.addEventListener('click', runNextTickDemo);
    
    // 에러 처리
    const runErrorSuccessBtn = document.getElementById('runErrorSuccess');
    const runErrorFailBtn = document.getElementById('runErrorFail');
    
    if (runErrorSuccessBtn) runErrorSuccessBtn.addEventListener('click', () => runErrorDemo(true));
    if (runErrorFailBtn) runErrorFailBtn.addEventListener('click', () => runErrorDemo(false));
    
    // Fail-Fast
    const runFailFastValidBtn = document.getElementById('runFailFastValid');
    const runFailFastInvalidBtn = document.getElementById('runFailFastInvalid');
    
    if (runFailFastValidBtn) runFailFastValidBtn.addEventListener('click', () => runFailFastDemo(true));
    if (runFailFastInvalidBtn) runFailFastInvalidBtn.addEventListener('click', () => runFailFastDemo(false));
});
