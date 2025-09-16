// Importar as bibliotecas necessárias
import express from "express";
import dotenv from "dotenv";
import prisma from "./db.js"; // Importar nossa conexão com o banco

// Carregar variáveis de ambiente do arquivo .env
dotenv.config();

// Criar aplicação Express
const app = express();

// Middleware para processar JSON nas requisições
app.use(express.json());

//Healthcheck
app.get("/", (_req, res) => res.json({ ok: true, service: "API 3º Bimestre" }));


// POST /stores body: { name, userId }
app.post('/stores', async (req, res) => {
    try {
    const { name, userId } = req.body
    const store = await prisma.store.create({
    data: { name, userId: Number(userId) }
    })
    res.status(201).json(store)
    } catch (e) { res.status(400).json({ error: e.message }) }
    })
    // GET /stores/:id -> retorna loja + user (dono) + produtos
    app.get('/stores/:id', async (req, res) => {
    try {
    const store = await prisma.store.findUnique({
    where: { id: Number(req.params.id) },
    include: { user: true, products: true }
    })
    if (!store) return res.status(404).json({ error: 'Loja não encontrada' })
    res.json(store)
    } catch (e) { res.status(400).json({ error: e.message }) }
    })

    // POST /products body: { name, price, storeId }
    app.post('/products', async (req, res) => {
    try {
    const { name, price, storeId } = req.body
    const product = await prisma.product.create({
    data: { name, price: Number(price), storeId: Number(storeId) }
    
    })
    res.status(201).json(product)
    } catch (e) { res.status(400).json({ error: e.message }) }
    })
    // GET /products -> inclui a loja e o dono da loja
    app.get('/products', async (req, res) => {
    try {
    const products = await prisma.product.findMany({
    include: { store: { include: { user: true } } }
    })
    res.json(products)
    } catch (e) { res.status(400).json({ error: e.message }) }
    })