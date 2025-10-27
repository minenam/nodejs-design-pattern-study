/**
 * ESM Live Bindings 데모용 모듈
 *
 * export된 변수는 값의 복사가 아닌 참조(binding)
 */

// export된 변수
export let count = 0

// count를 변경하는 함수
export function increment() {
  count++
  console.log(`[counter.mjs] count incremented to ${count}`)
}

export function decrement() {
  count--
  console.log(`[counter.mjs] count decremented to ${count}`)
}

export function reset() {
  count = 0
  console.log(`[counter.mjs] count reset to ${count}`)
}

// 내부적으로 count 사용하는 함수
export function getCount() {
  return count
}

// 여러 번 증가
export function incrementMultiple(times) {
  for (let i = 0; i < times; i++) {
    count++
  }
  console.log(`[counter.mjs] count incremented ${times} times to ${count}`)
}
