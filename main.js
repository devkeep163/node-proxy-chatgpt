const express = require('express');
const axios = require('axios');

const app = express();
const PORT = 3000;
const UPSTREAM_URL = 'http://127.0.0.1:8300';

app.use(express.json());
app.use(express.text());

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
            // 处理sse响应
            response.data.on('data', chunk => {
                console.log(`Received chunk: ${chunk}`);
                res.write(chunk);
            });

            // 响应结束后关闭连接
            response.data.on('end', () => {
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
    const { offset, limit, order } = req.query;

    try {
        const response = await axios({
            method: req.method,
            url: UPSTREAM_URL + req.url,
            headers: req.headers,
            data: req.body
        });
        res.status(response.status);
        res.set(response.headers);
        response.data.pipe(res);
        
        // if (response.headers['content-type'].includes('application/json')) {
        //     let jsonData = '';
        //     response.data.on('data', (chunk) => { jsonData += chunk; });
        //     response.data.on('end', () => {
        //         res.send(jsonData);
        //     });
        // } 
        // else 
        // {
        //     response.data.pipe(res);
        // } 

    } catch (error) {
        res.status(429).json({ detail: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});


// res.type('txt');  // Content-Type: text/plain
// res.type('html'); // Content-Type: text/html
// res.type('json'); // Content-Type: application/json
// res.type('text/event-stream'); // Content-Type: text/event-stream