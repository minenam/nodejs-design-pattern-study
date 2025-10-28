// 여러 개발자가 같은 변수명 사용 시 충돌 발생
var name = "김철수"; // 개발자 A
var name = "박영희"; // 개발자 B - 김철수를 덮어씀!

// 각자의 모듈 내에서 격리
const moduleA = (function () {
  var name = "김철수"; // 외부에서 접근 불가
  return { getName: () => name };
})();

const moduleB = (function () {
  var name = "박영희"; // 외부에서 접근 불가
  return { getName: () => name };
})();

console.log(moduleA.getName()); // "김철수"
console.log(moduleB.getName()); // "박영희" - 충돌 없음!

// 즉시 실행 함수(IIFE)로 모듈화

(function () {
  // 이 안의 코드는 즉시 실행되고 외부에서 접근 불가
  var privateData = "비밀";
})(); // 함수 정의와 동시에 실행

// privateData에 접근 불가 - ReferenceError

// 모듈로 활용
const calculator = (function () {
  let result = 0; // private 변수

  return {
    add: (x) => (result += x),
    subtract: (x) => (result -= x),
    getResult: () => result,
  };
})();

calculator.add(5); // result = 5
calculator.subtract(2); // result = 3
console.log(calculator.getResult()); // 3
// calculator.result에 직접 접근 불가
