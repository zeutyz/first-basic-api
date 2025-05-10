import express from 'express';

const app = express();
app.use(express.json());

const users = [];

app.post('/usuarios', (req, res) => {
    console.log(req.body);
    users.push(req.body);
    res.status(201).json(req.body);

});

app.get('/usuarios', (req, res) => {
    res.json(users).status(200);
    res.send('ok, tudo certo');
});

app.listen(3000);