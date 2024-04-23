const express = require('express');
const axios = require('axios');

const app = express();
const PORT = 3000;
const UPSTREAM_URL = 'http://127.0.0.1:8300';

app.use(express.json());
app.use(express.text());

app.all('*', async (req, res) => {
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

        // 处理不同类型的响应
        if (response.headers['content-type'].includes('application/json')) {
            let jsonData = '';
            response.data.on('data', (chunk) => { jsonData += chunk; });
            response.data.on('end', () => {
                res.send(jsonData);
            });
        } else if (response.headers['content-type'].includes('text/event-stream')) {
            res.type('text/event-stream');
            response.data.pipe(res);
        } else {
            response.data.pipe(res);
        }
    } catch (error) {
        console.error('Error forwarding request:', error);
        res.status(500).send('Error forwarding request');
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
