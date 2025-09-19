const { Client } = require('pg');
require('dotenv').config();

const client = new Client({
    host: process.env.PGHOST,
    port: process.env.PGPORT,
    user: process.env.PGUSER,
    password: process.env.PGPASSWORD,
    database: process.env.PGDATABASE,
    ssl: {
        rejectUnauthorized: false
    }
});

async function verificarColunas() {
    try {
        await client.connect();
        
        // Verificar quais colunas precisamos adicionar
        const colunasAtuais = await client.query(`
            SELECT column_name
            FROM information_schema.columns 
            WHERE table_name = 'avaliacoes'
            ORDER BY ordinal_position;
        `);
        
        console.log('Colunas atuais na tabela avaliacoes:');
        const nomesColunas = colunasAtuais.rows.map(row => row.column_name);
        nomesColunas.forEach(col => console.log(`- ${col}`));
        
        // Novas colunas baseadas na imagem
        const novasColunas = [
            'pisoteadas',
            'substrato_exposto', // já existe como substrato_deposito
            'quebradas_vivas',
            'tombadas_vivas', 
            'escaldadura_vivas',
            'falha_subsolagem_toco',
            'queimada_viva',
            'raspagem_grilo_2nivel'
        ];
        
        console.log('\nColunas que precisam ser adicionadas:');
        for (const coluna of novasColunas) {
            if (!nomesColunas.includes(coluna)) {
                console.log(`- ${coluna} (NOVA)`);
            } else {
                console.log(`- ${coluna} (JÁ EXISTE)`);
            }
        }
        
    } catch (error) {
        console.error('❌ Erro:', error.message);
    } finally {
        await client.end();
    }
}

verificarColunas();