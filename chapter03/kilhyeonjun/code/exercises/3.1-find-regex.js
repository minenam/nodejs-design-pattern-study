// 3.1-find-regex.js
// 연습 3.1: 단순 이벤트
// 입력 파일 리스트를 인자로 넘기고 find 프로세스를 시작할 때 이벤트를 방출하는 비동기적 FindRegex 클래스

const { EventEmitter } = require('events');
const fs = require('fs');

class FindRegex extends EventEmitter {
  constructor(regex) {
    super();
    this.regex = regex;
    this.files = [];
  }

  addFile(file) {
    this.files.push(file);
    return this; // 체이닝을 위해 this 반환
  }

  find() {
    // find 프로세스 시작 시 이벤트 발생
    this.emit('find_started', this.files);

    for (const file of this.files) {
      fs.readFile(file, 'utf8', (err, content) => {
        if (err) {
          return this.emit('error', err);
        }

        this.emit('fileread', file);
        const match = content.match(this.regex);
        if (match) {
          match.forEach(elem => this.emit('found', file, elem));
        }
      });
    }
    return this;
  }
}

// 사용 예시
const findRegexInstance = new FindRegex(/hello \w+/i)
  .addFile('../callback-hell.js')
  .addFile('../inconsistent-api.js');

// 이벤트 리스너 등록
findRegexInstance
  .on('find_started', (files) => {
    console.log(`[연습 3.1] 검색 시작: ${files.join(', ')}`);
  })
  .on('fileread', (file) => {
    console.log(`[연습 3.1] ${file} 파일 읽기 완료.`);
  })
  .on('found', (file, match) => {
    console.log(`[연습 3.1] ** ${file} 파일에서 '${match}' 발견!`);
  })
  .on('error', (err) => {
    console.error(`[연습 3.1] 오류 발생: ${err.message}`);
  });

// 리스너 등록 후 find() 호출
findRegexInstance.find();
