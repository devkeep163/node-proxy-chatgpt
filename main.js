const express = require('express');
const axios = require('axios');
const mysql = require('mysql2');
const db = require('./database');
const { appendToFile } = require('./fileWriter');

const app = express();
const PORT = 3000;
const UPSTREAM_URL = 'http://127.0.0.1:8300';

app.use(express.json());
app.use(express.text());

// 发送消息
app.post('/backend-api/conversation', async (req, res) => {
    try {

        // res.status(429).json({ detail: '测试' });
        // return;

        console.log(UPSTREAM_URL + req.url);

        const response = await axios({
            method: req.method,
            url: UPSTREAM_URL + req.url,
            headers: req.headers,
            data: req.body,
            responseType: 'stream'
        });

        let body = JSON.stringify(req.body);

        // 设置状态码和响应头
        res.status(response.status);
        res.set(response.headers);

        // 处理响应数据
        if (response.headers['content-type'].includes('application/json')) 
        {
            // 处理json响应
            let jsonData = '';
            response.data.on('data', (chunk) => { jsonData += chunk; });
            response.data.on('end', () => {
                res.send(jsonData);
            });
        } 
        else if (response.headers['content-type'].includes('text/event-stream')) 
        {
            // 文件
            const fileName = Date.now() + '.txt';
            const filePath = path.join(__dirname, 'msg', fileName);

            // 处理sse响应
            response.data.on('data', chunk => {
                console.log(`Received chunk: ${chunk}`);
                res.write(chunk);

                // 把数据写入文件
                appendToFile(chunk, filePath);
            });

            // 响应结束后关闭连接
            response.data.on('end', () => {

                // 写入数据库
                db.addRecord('chat_msg', {
                    body: body, 
                    result: filePath,
                    createtime: Math.floor(Date.now() / 1000)
                }, (err, result) => {
                    if (err) {
                        console.log(err);
                    }
                });

                res.end();
            });
        } 
        else 
        {
            // 处理其他响应
            response.data.pipe(res);
        }
    } 
    catch (error) 
    {
        res.status(429).json({ detail: error.message });
    }
});

// 获取历史记录
app.get('/backend-api/conversations', async (req, res) => {
    // const { offset, limit, order } = req.query;
    try {
        const response = await axios({
            method: req.method,
            url: UPSTREAM_URL + req.url,
            headers: req.headers,
            data: req.body,
            responseType: 'stream'
        });
        res.status(response.status);
        res.set(response.headers);
        response.data.pipe(res);
        
        // 处理业务逻辑
        if (response.headers['content-type'].includes('application/json')) {
            let jsonData = '';
            response.data.on('data', (chunk) => { jsonData += chunk; });
            response.data.on('end', () => {
                // res.send(jsonData);
            });
        } 

    } catch (error) {
        res.status(429).json({ detail: error.message });
    }
});

// 获取单条消息详情
app.get('/backend-api/conversation/:id', async (req, res) => {
    try {
        const response = await axios({
            method: req.method,
            url: UPSTREAM_URL + req.url,
            headers: req.headers,
            data: req.body,
            responseType: 'stream'
        });
        res.status(response.status);
        res.set(response.headers);
        response.data.pipe(res);
    } 
    catch (error) 
    {
        res.status(429).json({ detail: error.message });
    }
});

// 修改标题接口
app.post('/backend-api/conversation/gen_title/:id', async (req, res) => {
    try {
        const response = await axios({
            method: req.method,
            url: UPSTREAM_URL + req.url,
            headers: req.headers,
            data: req.body,
            responseType: 'stream'
        });
        res.status(response.status);
        res.set(response.headers);
        response.data.pipe(res);
    } 
    catch (error) 
    {
        res.status(429).json({ detail: error.message });
    }
});

// 启动服务器
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});


// res.type('txt');  // Content-Type: text/plain
// res.type('html'); // Content-Type: text/html
// res.type('json'); // Content-Type: application/json
// res.type('text/event-stream'); // Content-Type: text/event-stream