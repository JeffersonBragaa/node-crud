const express = require('express');

const app = express();
app.use(express.json());

let produtos = [];


app.get('/produtos-cadastrados', (req, res) => {
  res.json(produtos);
});


app.get('/produto/:id', (req, res) => {
    const id = Number(req.params.id);
    const produto = produtos.find(p => p.id === id);

    if (produto) {
        return res.json(produto);
    } 

    return res.status(404).json({ mensagem: 'Produto não encontrado' });
});


app.post('/cadastrar-produto', (req, res) => {
    const { id, nome, preco, quantidade } = req.body;

    if (!id || !nome || !preco || !quantidade) {
        return res.status(400).json({ mensagem: 'Dados inválidos' });
    }

    const prod = {
        id: Number(id),
        nome,
        preco: Number(preco),
        quantidade: Number(quantidade)
    };

    const existente = produtos.find(p => p.id === prod.id);

    if (existente) {
        existente.quantidade += prod.quantidade;
        return res.json({ mensagem: 'Produto atualizado com sucesso', produto: existente });
    }

    produtos.push(prod);
    return res.status(201).json({ mensagem: 'Produto cadastrado com sucesso', produto: prod });
});

app.post('/vender-produto', (req, res) => {
    const { id, quantidade } = req.body;

    const produto = produtos.find(p => p.id === Number(id));

    if (!produto) {
        return res.status(404).json({ mensagem: 'Produto não encontrado' });
    }

    if (produto.quantidade < quantidade) {
        return res.status(400).json({ mensagem: 'Quantidade insuficiente em estoque' });
    }

    produto.quantidade -= quantidade;

    return res.json({ mensagem: 'Produto vendido com sucesso', produto });
});


app.delete('/remover-produto/:id', (req, res) => {
    const id = Number(req.params.id);
    const index = produtos.findIndex(p => p.id === id);

    if (index === -1) {
        return res.status(404).json({ mensagem: 'Produto não encontrado' });
    }

    produtos.splice(index, 1);

    return res.json({ mensagem: 'Produto removido com sucesso' });
});

app.put('/atualizar-produto/:id', (req, res) => {
    const id = Number(req.params.id);
    const {nome, preco, quantidade} = req.body;
    const produto = produtos.find(p => p.id === id);

    if (!produto) {
        return res.status(404).json({ mensagem: 'Produto não encontrado' });
    }

    produto.nome = nome || produto.nome; 
    produto.preco = preco || produto.preco;
    produto.quantidade = quantidade || produto.quantidade;    
    return res.json({ mensagem: 'Produto atualizado com sucesso', produto });
});
app.listen(3000, () => {
  console.log('Servidor rodando em http://localhost:3000');
});