const { cadastrarProd } = require('./db')
const { mostraProdutosAll } = require('./db')
const { deletaProduto } = require('./db')
const { mostraProdutoId } = require('./db')
const { venderProduto } = require('./db')
const { atualizaProduto } = require('./db')
const cors = require('cors')

const express = require('express');

const app = express();

app.use(cors({
  origin: 'http://localhost:4200'
}));

app.use(express.json());




app.get('/produtos-cadastrados', async (req, res) => {
    try {
        const produtos = await mostraProdutosAll();

        return res.status(200).json({
            mensagem: 'Produtos cadastrados',
            produtos: produtos
        });

    } catch (erro) {
        
        if(erro.message === 'NADA_CADASTRADO'){
            return res.status(404).json({
                mensagem: 'Nenhum produto cadastrado no sistema'
            });
        }
    
        return res.status(500).json({ mensagem: 'Erro Interno' });
    }
});


app.get('/produto/:id', async (req, res) => {
    const id = Number(req.params.id);
    
    try {
        const produto= await mostraProdutoId(id);

        return res.status(200).json({
            mensagem: 'Produto Encontrado',
            produtos: produto
        });

    } catch (erro) {
        if(erro.message === 'PROD_NAO_ENCONTRADO'){
            return res.status(404).json({
                menssagem: 'Produto não encontrado'
            })
        }
        console.error(erro);
        return res.status(500).json({ mensagem: 'Erro ao buscar produto' });
    }
});


app.post('/cadastrar-produto', async (req, res) => {
    const {nome, preco, quantidade } = req.body;

    if (!nome || !preco || !quantidade) {
        return res.status(400).json({ mensagem: 'Dados inválidos' });
    }

    const prod = {
        nome,
        preco: Number(preco),
        quantidade: Number(quantidade)
    };

    try {
        const produtoCadastrado = await cadastrarProd(prod);

        return res.status(201).json({
            mensagem: 'Produto cadastrado com sucesso',
            produto: produtoCadastrado
        });

    } catch (erro) {
        if(erro.message === 'PROD_JA_CADASTRADO'){
            return res.status(400).json({ mensagem: 'Já existe um produto com esse nome' });
        }
        console.error(erro);
        return res.status(500).json({ mensagem: 'Erro ao cadastrar produto' });
    }
});

app.post('/produtos/:id/vender', async (req, res) => {
    
    const {id} = req.params;
    const {quantidade} = req.body;
    
    const prod = {
        id: Number(id),
        quantidade: Number(quantidade)
    }

    try {
        const produto = await venderProduto(prod)

        return res.status(200).json({
            mensagem: 'Quantidade atualizada',
            produtos: produto
        });

    } catch (erro) {
        if(erro.message === 'NAO_ENCONTRADO'){
            return res.status(404).json({
                mensagem: 'Produto não encontrado'
            })
        };

        if(erro.message === 'ESTOQUE_INSUFICIENTE'){
            return res.status(400).json({
                mensagem: 'Estoque insuficiente'
            })
        };
        return res.status(500).json({ mensagem: 'Erro ao buscar produto' });
    }
});


app.delete('/remover-produto/:id', async (req, res) => {
    const id = Number(req.params.id);
    
    try {
        const produto = await deletaProduto(id);

        return res.status(200).json({
            mensagem: 'Produto Excluido com Sucesso',
            produto: produto
        });

    } catch (erro) {
        console.error(erro);
        
        if(erro.message === 'PRODUTO_NAO_ENCONTRADO'){
            return res.status(404).json({
                mensagem: 'Produto não foi encontrado'
            })
        }
        return res.status(500).json({ mensagem: 'Erro ao buscar produto' });
    }
});

app.put('/atualizar-produto/:id', async (req, res) => {
    const id = Number(req.params.id);
    const {nome, preco, quantidade} = req.body;
    const prod ={
        id: id,
        nome: nome ?? null,
        preco: preco ?? null,
        quantidade: quantidade ?? null
    };
    if (preco != null && isNaN(preco) || preco <= 0) {
        return res.status(400).json({ mensagem: 'Preço inválido' });
    }
     try {
        const produto = await atualizaProduto(prod)

        return res.status(200).json({
            mensagem: 'Produto Atualizado',
            produto: produto
        });

    } catch (erro) {
        if(erro.message === 'NAO_ENCONTRADO'){
            return res.status(404).json({
                mensagem: 'Produto Não Encontrado'
            })
        }
        if(erro.message === 'PROD_JA_CADASTRADO'){
            return res.status(400).json({
                mensagem: 'Ja existe produto com esse nome'
            })
        }

        console.error(erro);
        return res.status(500).json({ 
            mensagem: 'Erro Interno' 
        });
    }

});
app.listen(3000, () => {
  console.log('Servidor rodando em http://localhost:3000');
});