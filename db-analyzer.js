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

async function analisarBanco() {
    try {
        await client.connect();
        console.log('✅ Conectado ao PostgreSQL!');
        
        // Listar todas as tabelas
        const tabelas = await client.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
            ORDER BY table_name;
        `);
        
        console.log('\n📋 Tabelas encontradas:');
        tabelas.rows.forEach(row => {
            console.log(`- ${row.table_name}`);
        });
        
        // Para cada tabela, mostrar as colunas
        for (const tabela of tabelas.rows) {
            console.log(`\n🔍 Estrutura da tabela "${tabela.table_name}":`);
            
            const colunas = await client.query(`
                SELECT 
                    column_name,
                    data_type,
                    is_nullable,
                    column_default
                FROM information_schema.columns 
                WHERE table_name = $1 
                ORDER BY ordinal_position;
            `, [tabela.table_name]);
            
            colunas.rows.forEach(col => {
                console.log(`  - ${col.column_name} (${col.data_type}) ${col.is_nullable === 'NO' ? '- NOT NULL' : ''}`);
            });
        }
        
    } catch (error) {
        console.error('❌ Erro:', error.message);
    } finally {
        await client.end();
    }
}

analisarBanco();