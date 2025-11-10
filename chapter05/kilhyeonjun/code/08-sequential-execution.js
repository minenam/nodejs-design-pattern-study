/**
 * 순차 실행 (Sequential Execution)
 * - for 루프로 순차 실행
 * - reduce로 순차 실행
 * - async/await로 순차 실행
 */

console.log('=== 순차 실행 패턴 ===\n')

function delay(ms, value) {
  return new Promise(resolve => {
    setTimeout(() => resolve(value), ms)
  })
}

// 테스트용 비동기 작업들
const tasks = [
  () => delay(100, 'Task 1'),
  () => delay(100, 'Task 2'),
  () => delay(100, 'Task 3'),
  () => delay(100, 'Task 4'),
  () => delay(100, 'Task 5')
]

console.log('--- 1. for 루프 + Promise 체인 (Chapter 5 초반) ---')

function sequentialForLoop(tasks) {
  let promise = Promise.resolve()
  const results = []

  for (const task of tasks) {
    promise = promise.then(() => task())
      .then(result => {
        results.push(result)
        console.log('  완료:', result)
      })
  }

  return promise.then(() => results)
}

const startTime1 = Date.now()
console.log('시작:', new Date().toLocaleTimeString())

sequentialForLoop(tasks).then(results => {
  const elapsed = Date.now() - startTime1
  console.log('모든 작업 완료:', results)
  console.log(`총 소요 시간: ${elapsed}ms (약 500ms)\n`)

  setTimeout(() => {
    console.log('--- 2. reduce로 순차 실행 (더 간결) ---')

    function sequentialReduce(tasks) {
      return tasks.reduce((prevPromise, task) => {
        return prevPromise.then((results) => {
          return task().then(result => {
            console.log('  완료:', result)
            return [...results, result]
          })
        })
      }, Promise.resolve([]))
    }

    const startTime2 = Date.now()
    console.log('시작:', new Date().toLocaleTimeString())

    sequentialReduce(tasks).then(results => {
      const elapsed = Date.now() - startTime2
      console.log('모든 작업 완료:', results)
      console.log(`총 소요 시간: ${elapsed}ms (약 500ms)\n`)

      setTimeout(() => {
        console.log('--- 3. async/await + for 루프 (가장 간결) ---')

        async function sequentialAsyncAwait(tasks) {
          const results = []
          for (const task of tasks) {
            const result = await task()
            console.log('  완료:', result)
            results.push(result)
          }
          return results
        }

        const startTime3 = Date.now()
        console.log('시작:', new Date().toLocaleTimeString())

        sequentialAsyncAwait(tasks).then(results => {
          const elapsed = Date.now() - startTime3
          console.log('모든 작업 완료:', results)
          console.log(`총 소요 시간: ${elapsed}ms (약 500ms)\n`)

          setTimeout(() => {
            console.log('--- 4. 실전 예제: 파일 순차 처리 ---')

            import('fs/promises').then(async fsPromises => {
              const files = [
                { name: '/tmp/file1.txt', content: 'File 1 content' },
                { name: '/tmp/file2.txt', content: 'File 2 content' },
                { name: '/tmp/file3.txt', content: 'File 3 content' }
              ]

              // 파일을 순차적으로 쓰기
              async function writeFilesSequentially(files) {
                console.log('파일 쓰기 시작...')
                for (const file of files) {
                  await fsPromises.writeFile(file.name, file.content)
                  console.log(`  ${file.name} 저장 완료`)
                }
                console.log('모든 파일 저장 완료\n')
              }

              await writeFilesSequentially(files)

              // 파일을 순차적으로 읽기
              async function readFilesSequentially(filenames) {
                console.log('파일 읽기 시작...')
                const contents = []
                for (const filename of filenames) {
                  const content = await fsPromises.readFile(filename, 'utf8')
                  console.log(`  ${filename}: ${content}`)
                  contents.push(content)
                }
                return contents
              }

              const filenames = files.map(f => f.name)
              await readFilesSequentially(filenames)

              console.log()
              console.log('--- 5. 순차 실행이 필요한 경우 ---')
              console.log('✓ 작업 간 의존성이 있을 때')
              console.log('✓ 이전 결과가 다음 입력으로 필요할 때')
              console.log('✓ 리소스 경합을 피해야 할 때')
              console.log('✓ 실행 순서가 중요할 때\n')

              console.log('--- 6. 체이닝 예제: 각 단계가 이전 결과 사용 ---')

              async function processData(data) {
                console.log('1. 데이터 검증...')
                await delay(50)
                const validated = data.trim()
                console.log('   검증 완료:', validated)

                console.log('2. 데이터 변환...')
                await delay(50)
                const transformed = validated.toUpperCase()
                console.log('   변환 완료:', transformed)

                console.log('3. 데이터 저장...')
                await delay(50)
                await fsPromises.writeFile('/tmp/processed.txt', transformed)
                console.log('   저장 완료')

                console.log('4. 결과 반환...')
                return transformed
              }

              const result = await processData('  hello world  ')
              console.log('최종 결과:', result)

              console.log()
              console.log('--- 7. 에러 처리와 순차 실행 ---')

              const tasksWithError = [
                () => delay(50, 'Task 1'),
                () => delay(50, 'Task 2'),
                () => Promise.reject(new Error('Task 3 failed!')),
                () => delay(50, 'Task 4'), // 실행되지 않음
                () => delay(50, 'Task 5')  // 실행되지 않음
              ]

              async function sequentialWithError(tasks) {
                const results = []
                try {
                  for (const task of tasks) {
                    const result = await task()
                    console.log('  완료:', result)
                    results.push(result)
                  }
                } catch (err) {
                  console.log('  에러 발생:', err.message)
                  console.log('  나머지 작업 중단')
                }
                return results
              }

              console.log('에러가 있는 순차 실행:')
              const partialResults = await sequentialWithError(tasksWithError)
              console.log('완료된 작업:', partialResults)

              console.log()
              console.log('--- 8. 순차 vs 병렬 비교 ---')

              const compareTasks = [
                () => delay(100, 'A'),
                () => delay(100, 'B'),
                () => delay(100, 'C')
              ]

              // 순차 실행
              console.log('순차 실행:')
              const seqStart = Date.now()
              await sequentialAsyncAwait(compareTasks)
              const seqTime = Date.now() - seqStart
              console.log(`소요 시간: ${seqTime}ms (약 300ms)\n`)

              // 병렬 실행 (비교용)
              console.log('병렬 실행:')
              const parStart = Date.now()
              const promises = compareTasks.map(task => task())
              const parResults = await Promise.all(promises)
              const parTime = Date.now() - parStart
              console.log('  완료:', parResults)
              console.log(`소요 시간: ${parTime}ms (약 100ms)`)

              console.log()
              console.log('=== 핵심 포인트 ===')
              console.log('✅ for 루프: 가장 직관적이고 읽기 쉬움')
              console.log('✅ reduce: 함수형 프로그래밍 스타일')
              console.log('✅ async/await: 동기 코드처럼 작성 (권장)')
              console.log('✅ 순차 실행 = 작업 수 × 각 작업 시간')
              console.log('✅ 의존성이 없으면 병렬 실행 고려')
              console.log('✅ 에러 발생 시 나머지 작업 중단됨')
            })
          }, 600)
        })
      }, 600)
    })
  }, 600)
})

/*
예상 출력:
=== 순차 실행 패턴 ===

--- 1. for 루프 + Promise 체인 (Chapter 5 초반) ---
시작: [시간]
  완료: Task 1
  완료: Task 2
  완료: Task 3
  완료: Task 4
  완료: Task 5
모든 작업 완료: ['Task 1', 'Task 2', 'Task 3', 'Task 4', 'Task 5']
총 소요 시간: 500ms (약 500ms)

--- 2. reduce로 순차 실행 (더 간결) ---
시작: [시간]
  완료: Task 1
  완료: Task 2
  완료: Task 3
  완료: Task 4
  완료: Task 5
모든 작업 완료: ['Task 1', 'Task 2', 'Task 3', 'Task 4', 'Task 5']
총 소요 시간: 500ms (약 500ms)

--- 3. async/await + for 루프 (가장 간결) ---
시작: [시간]
  완료: Task 1
  완료: Task 2
  완료: Task 3
  완료: Task 4
  완료: Task 5
모든 작업 완료: ['Task 1', 'Task 2', 'Task 3', 'Task 4', 'Task 5']
총 소요 시간: 500ms (약 500ms)

--- 4. 실전 예제: 파일 순차 처리 ---
파일 쓰기 시작...
  /tmp/file1.txt 저장 완료
  /tmp/file2.txt 저장 완료
  /tmp/file3.txt 저장 완료
모든 파일 저장 완료

파일 읽기 시작...
  /tmp/file1.txt: File 1 content
  /tmp/file2.txt: File 2 content
  /tmp/file3.txt: File 3 content

--- 5. 순차 실행이 필요한 경우 ---
✓ 작업 간 의존성이 있을 때
✓ 이전 결과가 다음 입력으로 필요할 때
✓ 리소스 경합을 피해야 할 때
✓ 실행 순서가 중요할 때

--- 6. 체이닝 예제: 각 단계가 이전 결과 사용 ---
1. 데이터 검증...
   검증 완료: hello world
2. 데이터 변환...
   변환 완료: HELLO WORLD
3. 데이터 저장...
   저장 완료
4. 결과 반환...
최종 결과: HELLO WORLD

--- 7. 에러 처리와 순차 실행 ---
에러가 있는 순차 실행:
  완료: Task 1
  완료: Task 2
  에러 발생: Task 3 failed!
  나머지 작업 중단
완료된 작업: ['Task 1', 'Task 2']

--- 8. 순차 vs 병렬 비교 ---
순차 실행:
  완료: A
  완료: B
  완료: C
소요 시간: 300ms (약 300ms)

병렬 실행:
  완료: ['A', 'B', 'C']
소요 시간: 100ms (약 100ms)

=== 핵심 포인트 ===
✅ for 루프: 가장 직관적이고 읽기 쉬움
✅ reduce: 함수형 프로그래밍 스타일
✅ async/await: 동기 코드처럼 작성 (권장)
✅ 순차 실행 = 작업 수 × 각 작업 시간
✅ 의존성이 없으면 병렬 실행 고려
✅ 에러 발생 시 나머지 작업 중단됨
*/
