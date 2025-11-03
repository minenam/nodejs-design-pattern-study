// event-emitter-example.js

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
    this.emit('find_started', this.files);
    for (const file of this.files) {
      fs.readFile(file, 'utf8', (err, content) => {
        if (err) {
          return this.emit('error', err); // 에러 이벤트 발생
        }

        this.emit('fileread', file); // 파일 읽기 완료 이벤트 발생
        const match = content.match(this.regex);
        if (match) {
          match.forEach(elem => this.emit('found', file, elem)); // 'found' 이벤트 발생
        }
      });
    }
    return this; // 체이닝을 위해 this 반환
  }
}

// 사용 예시
const findRegexInstance = new FindRegex(/hello \w+/i)
  .addFile('./callback-hell.js') // 존재하지 않을 수 있는 단어
  .addFile('./inconsistent-api.js'); // 존재하지 않을 수 있는 단어

// 이벤트 리스너 등록
findRegexInstance
  .on('find_started', (files) => console.log(`검색 시작: ${files.join(', ')}`))
  .on('fileread', (file) => console.log(`${file} 파일 읽기 완료.`))
  .on('found', (file, match) => console.log(`** ${file} 파일에서 '${match}' 발견!`))
  .on('error', (err) => console.error(`오류 발생: ${err.message}`));

// 리스너 등록 후 find() 호출
findRegexInstance.find();
