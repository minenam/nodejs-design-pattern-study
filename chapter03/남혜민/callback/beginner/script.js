// 탭 전환 기능
document.querySelectorAll('.tab-btn').forEach(button => {
    button.addEventListener('click', () => {
        const tabId = button.dataset.tab;
        
        // 모든 탭 버튼과 콘텐츠 비활성화
        document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
        
        // 선택된 탭 활성화
        button.classList.add('active');
        document.getElementById(tabId).classList.add('active');
    });
});

// 이벤트 루프 데모
let demoRunning = false;
let demoTimeout;

const callStack = document.getElementById('callStack');
const taskQueue = document.getElementById('taskQueue');
const outputContent = document.getElementById('outputContent');
const startBtn = document.getElementById('startDemo');
const resetBtn = document.getElementById('resetDemo');

function createTaskElement(text, color = '#667eea') {
    const task = document.createElement('div');
    task.className = 'task-item';
    task.textContent = text;
    task.style.background = `linear-gradient(135deg, ${color} 0%, ${adjustColor(color, -20)} 100%)`;
    return task;
}

function adjustColor(color, amount) {
    return '#' + color.replace(/^#/, '').replace(/../g, color => 
        ('0' + Math.min(255, Math.max(0, parseInt(color, 16) + amount)).toString(16)).substr(-2)
    );
}

function addToStack(text, color) {
    const task = createTaskElement(text, color);
    callStack.appendChild(task);
    return task;
}

function removeFromStack(task) {
    return new Promise(resolve => {
        setTimeout(() => {
            if (task && task.parentNode) {
                task.style.opacity = '0';
                setTimeout(() => {
                    if (task.parentNode) {
                        task.remove();
                    }
                    resolve();
                }, 300);
            } else {
                resolve();
            }
        }, 800);
    });
}

function addToQueue(text, color) {
    const task = createTaskElement(text, color);
    taskQueue.appendChild(task);
    return task;
}

function moveFromQueueToStack(queueTask) {
    return new Promise(resolve => {
        if (!queueTask || !queueTask.parentNode) {
            resolve();
            return;
        }
        
        queueTask.style.opacity = '0';
        setTimeout(() => {
            if (queueTask.parentNode) {
                queueTask.remove();
            }
            const stackTask = addToStack(queueTask.textContent, '#28a745');
            setTimeout(() => resolve(stackTask), 500);
        }, 300);
    });
}

function addOutput(text) {
    const line = document.createElement('div');
    line.textContent = `> ${text}`;
    line.style.animation = 'fadeIn 0.5s';
    outputContent.appendChild(line);
}

async function runDemo() {
    if (demoRunning) return;
    demoRunning = true;
    startBtn.disabled = true;
    
    // 1. console.log('1번')
    let task = addToStack("console.log('1번')", '#667eea');
    await removeFromStack(task);
    addOutput('1번');
    
    await sleep(1000);
    
    // 2. setTimeout
    task = addToStack("setTimeout(...)", '#dc3545');
    await sleep(800);
    addOutput('setTimeout을 백그라운드로 보냄');
    await removeFromStack(task);
    
    await sleep(1000);
    
    // 3. console.log('3번')
    task = addToStack("console.log('3번')", '#667eea');
    await removeFromStack(task);
    addOutput('3번');
    
    await sleep(1500);
    
    // 4. setTimeout 콜백이 Queue에 추가
    addOutput('setTimeout 완료! 콜백을 Queue에 추가');
    const queueTask = addToQueue("() => console.log('2번')", '#ffc107');
    
    await sleep(2000);
    
    // 5. Stack이 비었으니 Queue에서 가져옴
    addOutput('Stack이 비었음! Queue에서 가져옴');
    await sleep(1000);
    
    const movedTask = await moveFromQueueToStack(queueTask);
    await removeFromStack(movedTask);
    addOutput('2번');
    
    await sleep(1000);
    addOutput('');
    addOutput('✅ 완료! 출력 순서: 1번 → 3번 → 2번');
    
    demoRunning = false;
    startBtn.disabled = false;
}

function resetDemo() {
    clearTimeout(demoTimeout);
    callStack.innerHTML = '';
    taskQueue.innerHTML = '';
    outputContent.innerHTML = '';
    demoRunning = false;
    startBtn.disabled = false;
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

startBtn.addEventListener('click', runDemo);
resetBtn.addEventListener('click', resetDemo);

// 초기 메시지
if (outputContent) {
    outputContent.innerHTML = '<div style="color: #6c757d;">▶ 데모 시작 버튼을 눌러보세요!</div>';
}
