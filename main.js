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

        console.log('Content-Type:', response.headers['content-type']);

        // 处理不同类型的响应
        if (response.headers['content-type'].includes('application/json')) 
        {
            let jsonData = '';
            response.data.on('data', (chunk) => { jsonData += chunk; });
            response.data.on('end', () => {
                res.send(jsonData);
            });
        } 
        else if (response.headers['content-type'].includes('text/event-stream')) 
        {
            response.data.on('data', chunk => {
                console.log(`Received chunk: ${chunk}`);
                res.write(chunk);
            });
        } 
        else 
        {
            response.data.pipe(res);
        }

        // 刷新缓冲区
        res.flush();
    } 
    catch (error) 
    {
        // 返回json格式的错误信息
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