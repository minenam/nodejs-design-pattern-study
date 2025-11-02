// callback-hell.js

const fs = require('fs');

// 콜백 지옥 예시: 3개의 파일을 순차적으로 읽고 내용을 합칩니다.
fs.readFile('./testdata/file1.txt', 'utf8', (err, data1) => {
  if (err) {
    return console.error('첫 번째 파일 읽기 오류:', err);
  }
  console.log('첫 번째 파일 읽기 완료.');

  fs.readFile('./testdata/file2.txt', 'utf8', (err, data2) => {
    if (err) {
      return console.error('두 번째 파일 읽기 오류:', err);
    }
    console.log('두 번째 파일 읽기 완료.');

    fs.readFile('./testdata/file3.txt', 'utf8', (err, data3) => {
      if (err) {
        return console.error('세 번째 파일 읽기 오류:', err);
      }
      console.log('세 번째 파일 읽기 완료.');

      const combinedData = data1 + data2 + data3;
      // console.log('\n--- 모든 파일 내용 ---\n', combinedData);
      console.log('\n모든 파일을 성공적으로 읽고 내용을 합쳤습니다.');
    });
  });
});

