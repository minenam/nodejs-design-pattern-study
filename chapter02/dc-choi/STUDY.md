# ts를 동작시키는 node.js에서는 어떤 모듈 시스템을 사용할까?

## tsc로 컴파일 한 후 node.js 실행
module: commonjs => CJS
module: esnext or module: nodenext => ESM

## ts-node / tsx / bun 등으로 “직접 실행”할 때
package.json에 "type": "module" 이면 => ESM

없거나 "type": "commonjs"면 => CJS