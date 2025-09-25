import express from "express";
import dotenv from "dotenv";
import prisma from "./db.js"; // Importar nossa conexão com o banco
import { serializeJsonQuery } from "@prisma/client/runtime/client";

// Carregar variáveis de ambiente do arquivo .env
dotenv.config();

// Criar aplicação Express
const app = express();

// Middleware para processar JSON nas requisições
app.use(express.json());

//Healthcheck
app.get("/", (_req, res) => res.json({ ok: true, service: "API 3º Bimestre" }));

// POST /users body: { email, name }
app.post('/users', async (req, res) => {
    try {
        const { email, name } = req.body;
        const user = await prisma.user.create({
            data: { email, name }
        });
        res.status(201).json(user);
    } catch (e) {
        res.status(400).json({ error: e.message });
    }
});

// GET /users - Lista todos os usuários
app.get('/users', async (_req, res) => {
    try {
        const users = await prisma.user.findMany();
        res.json(users);
    } catch (e) {
        res.status(400).json({ error: e.message });
    }
});

// POST /stores body: { name, userId }
app.post('/stores', async (req, res) => {
    try {
        const { name, userId } = req.body;
        const store = await prisma.store.create({
            data: { name, userId: Number(userId),}
        });
        res.status(201).json(store);
    } catch (e) {
        res.status(400).json({ error: e.message });
    }
});

// GET /stores/:id -> retorna loja + user (dono) + produtos
app.get('/stores/:id', async (req, res) => {
    try {
        const store = await prisma.store.findUnique({
            where: { id: Number(req.params.id) },
            include: { user: true, products: true }
        });
        if (!store) return res.status(404).json({ error: 'Loja não encontrada' });
        res.json(store);
    } catch (e) {
        res.status(400).json({ error: e.message });
    }
});

// POST /products body: { name, price, storeId }
app.post('/products', async (req, res) => {
    try {
        const { name, price, storeId } = req.body;
        const product = await prisma.product.create({
            data: { name, price: Number(price), storeId: Number(storeId) }
        });
        res.status(201).json(product);
    } catch (e) {
        res.status(400).json({ error: e.message });
    }
});

// GET /products -> inclui a loja e o dono da loja
app.get('/products', async (req, res) => {
    try {
        const products = await prisma.product.findMany({
            include: { store: { include: { user: true } } }
        });
        res.json(products);
    } catch (e) {
        res.status(400).json({ error: e.message });
    }
});

// PUT /stores/:id - Atualizar loja
app.put('/stores/:id', async (req, res) => {
    try {
        const { name, userId } = req.body;
        const store = await prisma.store.update({
            where: { id: Number(req.params.id) },
            data: { name, userId: userId ? Number(userId) : undefined }
        });
        res.json(store);
    } catch (e) {
        res.status(400).json({ error: e.message });
    }
});

// DELETE /stores/:id - Remover loja
app.delete('/stores/:id', async (req, res) => {
    try {
        await prisma.store.delete({
            where: { id: Number(req.params.id) }
        });
        res.json({ message: 'Loja removida com sucesso' });
    } catch (e) {
        res.status(400).json({ error: e.message });
    }
});

// PUT /products/:id - Atualizar produto
app.put('/products/:id', async (req, res) => {
    try {
        const { name, price, storeId } = req.body;
        const product = await prisma.product.update({
            where: { id: Number(req.params.id) },
            data: {
                name,
                price: price !== undefined ? Number(price) : undefined,
                storeId: storeId !== undefined ? Number(storeId) : undefined
            }
        });
        res.json(product);
    } catch (e) {
        res.status(400).json({ error: e.message });
    }
});

// DELETE /products/:id - Remover produto
app.delete('/products/:id', async (req, res) => {
    try {
        await prisma.product.delete({
            where: { id: Number(req.params.id) }
        });
        res.json({ message: 'Produto removido com sucesso' });
    } catch (e) {
        res.status(400).json({ error: e.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});