const fs = require('fs').promises;
const path = require('path');

async function appendToFile(data, filePath) {
    try {
        // 获取目录路径
        const dirPath = path.dirname(filePath);

        // 检查目录是否存在，如果不存在则创建
        await fs.access(dirPath).catch(async () => {
            await fs.mkdir(dirPath, { recursive: true });
        });

        // 追加数据到文件，并在每次写入后加入换行符
        await fs.appendFile(filePath, data + '\n');
        console.log('Data appended successfully');
    } catch (err) {
        console.error('Error writing to file:', err);
    }
}

// 导出 appendToFile 函数
module.exports = { appendToFile };
