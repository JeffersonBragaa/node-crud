const { Pool } = require('pg');

// conexão com o banco
const pool = new Pool({
  host: '127.0.0.1',
  port: 5432,
  user: 'postgres',
  password: 'postgres',
  database: 'produtos_db'
});

// função para cadastrar produto
async function cadastrarProd(prod) {
  const sql = `
    INSERT INTO produtos (nome, preco, quantidade)
    VALUES ($1, $2, $3)
    RETURNING *
  `;
  const values = [prod.nome, prod.preco, prod.quantidade ];
  try{
    const result = await pool.query(sql, values);
    return result.rows[0];

  } catch (erro){
    if(erro.code === '23505'){
      throw new Error('PROD_JA_CADASTRADO');
    }
  }

}

async function mostraProdutosAll() {
  const sql = `
    SELECT * FROM produtos
  `;

  const result = await pool.query(sql);
  console.log(result.rowCount);
  if(result.rowCount === 0){

    throw new Error('NADA_CADASTRADO');
  }
  return result.rows;
}

async function mostraProdutoId(id) {
  const sql = `
    SELECT * FROM produtos
    WHERE id = $1
  `;
  const value = [id];
  const result = await pool.query(sql, value);
  if(result.rowCount === 0){
    throw new Error('PROD_NAO_ENCONTRADO');
  }
  return result.rows[0];
}

async function deletaProduto(id) {
  const sql = `
    DELETE FROM produtos
    WHERE id = $1
    RETURNING *
  `;

  const value = [id];
  const produto = await pool.query(sql, value);
  if(produto.rowCount === 0){
    throw new Error('PRODUTO_NAO_ENCONTRADO')
  }
  return produto.rows[0];
}

async function venderProduto(prod) {

  const sql_verifica = `
    SELECT * FROM produtos
    WHERE id = $1 
  `;
  const values_verifica = [prod.id];

  const produto = await pool.query(sql_verifica, values_verifica);

  if (produto.rowCount === 0) {
    throw new Error('NAO_ENCONTRADO');
  }
  
  if (produto.rows[0].quantidade < prod.quantidade) {
    throw new Error('ESTOQUE_INSUFICIENTE');
  }

  const sql_update = `
    UPDATE produtos
    SET quantidade = quantidade - $2
    WHERE id = $1
    RETURNING *
  `;
  const values = [prod.id, prod.quantidade];

  const result = await pool.query(sql_update, values);

  return result.rows[0];
}
async function atualizaProduto(prod) {
  const sql = `
    UPDATE produtos
    SET 
      nome = COALESCE($2, nome),
      preco = COALESCE($3, preco),
      quantidade = COALESCE($4, quantidade)
    WHERE id = $1
    RETURNING *
  `;
  const values = [prod.id, prod.nome, prod.preco, prod.quantidade];
  try {
    const result = await pool.query(sql, values);
    if(result.rowCount === 0){
      throw new Error('NAO_ENCONTRADO');
    }
    return result.rows[0];

  } catch (erro) {
    if(erro.code === '23505'){
      throw new Error('PROD_JA_CADASTRADO');
    }
    throw erro;
  }
}
// exportando função
module.exports = {
  cadastrarProd,
  mostraProdutosAll,
  mostraProdutoId,
  deletaProduto,
  venderProduto, 
  atualizaProduto
};