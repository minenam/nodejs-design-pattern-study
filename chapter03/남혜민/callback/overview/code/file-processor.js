// 실전 파일 처리 시스템 - 콜백 패턴 활용

const fs = require('fs');
const path = require('path');

class FileProcessor {
  constructor() {
    this.cache = new Map();
    this.stats = {
      cacheHits: 0,
      cacheMisses: 0,
      totalReads: 0
    };
  }
  
  // 캐시를 활용한 파일 읽기 (Zalgo 문제 해결)
  readFile(filename, callback) {
    this.stats.totalReads++;
    
    if (this.cache.has(filename)) {
      this.stats.cacheHits++;
      // 일관된 비동기 동작 보장
      process.nextTick(() => {
        callback(null, this.cache.get(filename));
      });
      return;
    }
    
    this.stats.cacheMisses++;
    fs.readFile(filename, 'utf8', (err, data) => {
      if (err) {
        callback(err);
        return;
      }
      
      this.cache.set(filename, data);
      callback(null, data);
    });
  }
  
  // 여러 파일을 병렬로 처리
  processFiles(filenames, processor, callback) {
    const results = [];
    let completed = 0;
    let hasError = false;
    
    if (filenames.length === 0) {
      callback(null, []);
      return;
    }
    
    filenames.forEach((filename, index) => {
      this.readFile(filename, (err, data) => {
        if (hasError) return;
        
        if (err) {
          hasError = true;
          callback(err);
          return;
        }
        
        // 데이터 처리
        processor(data, filename, (err, processed) => {
          if (hasError) return;
          
          if (err) {
            hasError = true;
            callback(err);
            return;
          }
          
          results[index] = {
            filename,
            original: data,
            processed
          };
          completed++;
          
          if (completed === filenames.length) {
            callback(null, results);
          }
        });
      });
    });
  }
  
  // 파일을 순차적으로 처리 (의존성이 있는 경우)
  processFilesSequentially(filenames, processor, callback) {
    const results = [];
    let currentIndex = 0;
    
    const processNext = () => {
      if (currentIndex >= filenames.length) {
        callback(null, results);
        return;
      }
      
      const filename = filenames[currentIndex];
      this.readFile(filename, (err, data) => {
        if (err) {
          callback(err);
          return;
        }
        
        processor(data, filename, results, (err, processed) => {
          if (err) {
            callback(err);
            return;
          }
          
          results.push({
            filename,
            processed
          });
          
          currentIndex++;
          processNext();
        });
      });
    };
    
    processNext();
  }
  
  // 파일 쓰기 (에러 처리 포함)
  writeFile(filename, data, callback) {
    const dir = path.dirname(filename);
    
    // 디렉토리 존재 확인
    fs.access(dir, fs.constants.F_OK, (err) => {
      if (err) {
        // 디렉토리 생성
        fs.mkdir(dir, { recursive: true }, (err) => {
          if (err) {
            callback(err);
            return;
          }
          this._writeFileContent(filename, data, callback);
        });
      } else {
        this._writeFileContent(filename, data, callback);
      }
    });
  }
  
  _writeFileContent(filename, data, callback) {
    fs.writeFile(filename, data, 'utf8', (err) => {
      if (err) {
        callback(err);
        return;
      }
      
      // 캐시 업데이트
      this.cache.set(filename, data);
      callback(null, filename);
    });
  }
  
  // 통계 정보 반환
  getStats() {
    return { ...this.stats };
  }
  
  // 캐시 클리어
  clearCache() {
    this.cache.clear();
    this.stats = {
      cacheHits: 0,
      cacheMisses: 0,
      totalReads: 0
    };
  }
}

// 사용 예제
if (require.main === module) {
  const processor = new FileProcessor();
  
  // 테스트 파일 생성
  const testFiles = ['test1.txt', 'test2.txt', 'test3.txt'];
  const testData = [
    'Hello World',
    'Node.js Design Patterns',
    'Callback Pattern Example'
  ];
  
  console.log('=== 파일 처리 시스템 테스트 ===\n');
  
  // 1. 테스트 파일 생성
  let filesCreated = 0;
  testFiles.forEach((filename, index) => {
    processor.writeFile(filename, testData[index], (err) => {
      if (err) {
        console.error(`파일 생성 실패 ${filename}:`, err.message);
        return;
      }
      
      console.log(`✅ 파일 생성: ${filename}`);
      filesCreated++;
      
      if (filesCreated === testFiles.length) {
        runProcessingTests();
      }
    });
  });
  
  function runProcessingTests() {
    console.log('\n=== 병렬 처리 테스트 ===');
    
    // 2. 병렬 처리 테스트
    processor.processFiles(
      testFiles,
      (data, filename, callback) => {
        // 데이터를 대문자로 변환
        const processed = data.toUpperCase();
        setTimeout(() => callback(null, processed), 100);
      },
      (err, results) => {
        if (err) {
          console.error('병렬 처리 실패:', err.message);
          return;
        }
        
        console.log('병렬 처리 결과:');
        results.forEach(result => {
          console.log(`  ${result.filename}: ${result.processed}`);
        });
        
        console.log('\n통계:', processor.getStats());
        
        runSequentialTest();
      }
    );
  }
  
  function runSequentialTest() {
    console.log('\n=== 순차 처리 테스트 ===');
    
    // 3. 순차 처리 테스트 (이전 결과를 활용)
    processor.processFilesSequentially(
      testFiles,
      (data, filename, previousResults, callback) => {
        // 이전 결과들의 길이를 합산
        const totalLength = previousResults.reduce((sum, result) => {
          return sum + result.processed.length;
        }, 0);
        
        const processed = `${data} (누적 길이: ${totalLength + data.length})`;
        setTimeout(() => callback(null, processed), 50);
      },
      (err, results) => {
        if (err) {
          console.error('순차 처리 실패:', err.message);
          return;
        }
        
        console.log('순차 처리 결과:');
        results.forEach(result => {
          console.log(`  ${result.filename}: ${result.processed}`);
        });
        
        console.log('\n최종 통계:', processor.getStats());
        
        // 테스트 파일 정리
        cleanupTestFiles();
      }
    );
  }
  
  function cleanupTestFiles() {
    console.log('\n=== 테스트 파일 정리 ===');
    
    let filesDeleted = 0;
    testFiles.forEach(filename => {
      fs.unlink(filename, (err) => {
        if (err && err.code !== 'ENOENT') {
          console.error(`파일 삭제 실패 ${filename}:`, err.message);
        } else {
          console.log(`🗑️  파일 삭제: ${filename}`);
        }
        
        filesDeleted++;
        if (filesDeleted === testFiles.length) {
          console.log('\n✨ 테스트 완료!');
        }
      });
    });
  }
}

module.exports = FileProcessor;
