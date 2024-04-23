const express = require('express');
const axios = require('axios');

const app = express();
const PORT = 3000;
const UPSTREAM_URL = 'http://127.0.0.1:8300/backend-api/conversation';

app.use(express.json());
app.use(express.text());

app.post('/backend-api/conversation', async (req, res) => {
    try {
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
            // res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
            // res.setHeader('Cache-Control', 'no-cache');
            // res.setHeader('Connection', 'keep-alive');
            
            // 直接将上游服务器的响应数据流返回给客户端
            response.data.pipe(res);
        } 
        else 
        {
            // 其他类型的响应，直接返回
            response.data.pipe(res);
        }
    } 
    catch (error) 
    {
        console.error('Error forwarding request:', error);
        res.status(500).send('Error forwarding request');
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});


// res.type('txt');  // Content-Type: text/plain
// res.type('html'); // Content-Type: text/html
// res.type('json'); // Content-Type: application/json
// res.type('text/event-stream'); // Content-Type: text/event-stream