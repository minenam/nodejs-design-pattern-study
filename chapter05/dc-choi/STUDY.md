# forEach VS for...of VS Promise.all()
이 부분은 동시성에 관련된 부분에 비교 분석을 해보려고 함.

## forEach
```js
arr.forEach(async (item) => {
    await fn(item)
})
```

콜백이 await되지 않고 루프 바깥에서는 아무것도 기다리지 않음.

평행 실행처럼 보이지만 완료를 보장하지 않아 버그 소지가 큼.

## for...of
```js
for (const item of arr) {
    await fn(item)
}
```

각 항목을 순차 실행함으로서 안전하지만 가장 느릴 수 있음.

## Promise.all()
```js
const results = await Promise.all(promises)
```

가장 빠를 수 있지만 외부 리소스가 폭주하거나, rate limit, 메모리 부족의 문제가 발생할 수 있음.

## 현실적 베스트
[예전에 동시성 문제 테스트 진행한 코드](https://github.com/dc-choi/nestjs-prisma-demo/blob/main/test/e2e/race.condition.e2e.test.ts)
[pQueue 구현](https://github.com/dc-choi/nestjs-prisma-demo/blob/main/src/global/common/utils/PQueue.ts)

혹시 다른 처리 방법이나 예외가 있을지 같이 의논하면 좋을거같아요.
