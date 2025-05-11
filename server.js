import express from 'express';
import { PrismaClient } from './generated/prisma/index.js'; 
const prisma = new PrismaClient();

const app = express();
app.use(express.json()); 


app.use((err, req, res, next) => {
    console.error('Erro capturado:', err.stack);
    if (err instanceof Error) { 
        return res.status(500).json({ message: 'Ocorreu um erro interno no servidor.' });
    }
    next(err); 
});



// Routes

app.post('/users', async (req, res) => {
    try {
        const { name, email, age } = req.body;

        if (!name || !email || age === undefined) {
            return res.status(400).json({ message: 'Nome, email e idade são campos obrigatórios.' });
        }

        const newUser = await prisma.user.create({
            data: {
                name,  
                email, 
                age, 
            },
        });
        
        return res.status(201).json(newUser); 

    } catch (error) {
     
        if (error.code === 'P2002') { 
            return res.status(409).json({ message: 'Este email já está cadastrado.' });
        }
        return res.status(500).json({ message: 'Erro ao criar usuário.' });
    }
});

app.put('/users/:id', async (req, res) => {
    try {
        const id = req.params.id; 
        const { name, email, age } = req.body;

        const updatedUser = await prisma.user.update({
            where: { id },
            data: { name, email, age },
        });

        return res.status(200).json(updatedUser);

    } catch (error) {
        if (error.code === 'P2025') { 
            return res.status(404).json({ message: `Usuário com ID ${req.params.id} não encontrado.` });
        }
        if (error.code === 'P2002') {
            return res.status(409).json({ message: 'Este email já está cadastrado para outro usuário.' });
        }
        return res.status(500).json({ message: 'Erro ao atualizar usuário.' });
    }
});

app.delete('/users/:id', async (req, res) => {
    try {
        const id = req.params.id;
        
        await prisma.user.delete({
            where: { id },
        });

        return res.status(204).send(); 

    } catch (error) {
        if (error.code === 'P2025') {
            return res.status(404).json({ message: `Usuário com ID ${req.params.id} não encontrado.` });
        }
        return res.status(500).json({ message: 'Erro ao deletar usuário.' });
    }
});

app.get('/users', async (req, res) => {
    try {
        const { name, age, email } = req.query;
        const whereClause = {};

        if (name) {
            whereClause.name = { contains: name, mode: 'insensitive' };
        }
        if (email) {
            whereClause.email = { contains: email, mode: 'insensitive' };
        }
        if (age) {
            const ageNum = parseInt(age);
            if (!isNaN(ageNum)) {
                whereClause.age = ageNum;
            }
        }

        const users = await prisma.user.findMany({
            where: whereClause, 
        });
        
        return res.status(200).json(users);

    } catch (error) {
        return res.status(500).json({ message: 'Erro ao buscar usuários.' });
    }
});


app.listen(3000, () => {
    console.log('Servidor rodando na porta 3000!');
    console.log('Acesse: http://localhost:3000');
});