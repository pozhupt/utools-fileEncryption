const fs = require("fs");
const crypto = require("crypto");
const path = require('path')
window.pluginInfo = JSON.parse(fs.readFileSync(path.join(__dirname, 'plugin.json')));
window.isFile = (filePath) => {
  const stat = fs.statSync(filePath);
  return stat.isFile();
}
window.openFile = () => {
  const paths = utools.showOpenDialog({
    properties: ['openFile', 'multiSelections']
  })
  if (!paths) {
    return paths
  }
  debugger;
  return paths.map(filePath => {
    const file = {}
    file.name = path.basename(filePath);
    file.path = filePath
    return file
  })
}
// 加密
window.xencode = (by, filePath, key, iv, callback) => {
  return new Promise((resolve) => {
    let encryptStream, readStream, writeStream
    try {
      encryptStream = crypto.createCipheriv(by, key, iv);
      readStream = fs.createReadStream(filePath);
      writeStream = fs.createWriteStream(filePath + ".xu")
    } catch (e) {
      console.log(e)
      callback("失败");
      return
    }
    if (callback) {
      let totalSize = fs.statSync(filePath).size;
      let curSize = 0;
      let percent = '0%';
      readStream
        .on('data', (chunk) => {
          curSize += chunk.length
          // 将已经读取到的字节数 / 总字节数 * 100 = 百分比
          percent = (curSize / totalSize * 100).toFixed(2) + '%';
          callback(percent);
        })
        .pipe(encryptStream) // 加密
        .pipe(writeStream)
        .on('error', (error) => {
          console.log('1 xencode error', error.message);
          readStream.close()
          callback("失败");
        })
        .on("finish", function () {
          resolve("完成");
        });
    } else {
      readStream
        .pipe(encryptStream) // 加密
        .pipe(writeStream)
        .on('error', (error) => {
          console.log('2 xencode error', error.message);
          resolve("完成");
        })
        .on("finish", function () {
          resolve("完成");
        });
    }
  });
};
// 解密
window.xdecode = (by, filePath, key, iv, callback) => {
  return new Promise((resolve) => {
    const decryptStream = crypto.createDecipheriv(by, key, iv, {
      authTagLength: 16,
    });
    const readStream = fs.createReadStream(filePath);
    const writeStream = fs.createWriteStream(filePath.replace(".xu", ""));

    if (callback) {
      let totalSize = fs.statSync(filePath).size;
      let curSize = 0;
      let percent = '0%';
      readStream
        .on('data', (chunk) => {
          curSize += chunk.length
          // 将已经读取到的字节数 / 总字节数 * 100 = 百分比
          percent = (curSize / totalSize * 100).toFixed(2) + '%';
          callback(percent);
        })
        .pipe(decryptStream) // 加密
        .pipe(writeStream)
        .on("finish", function () {
          resolve("完成");
        });
    } else {
      readStream
        .pipe(decryptStream) // 加密
        .pipe(writeStream)
        .on("finish", function () {
          resolve("完成");
        });
    }

  });
};
window.openUrl = (url) => {
  utools.shellOpenExternal(url);
};