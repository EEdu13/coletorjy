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

async function analisarTabelaSobrevivencia() {
    try {
        await client.connect();
        console.log('✅ Conectado ao PostgreSQL!');
        
        // Verificar se o schema existe
        const schemas = await client.query(`
            SELECT schema_name 
            FROM information_schema.schemata 
            WHERE schema_name = 'qualidadejy';
        `);
        
        if (schemas.rows.length === 0) {
            console.log('❌ Schema "qualidadejy" não encontrado');
            return;
        }
        
        // Verificar se a tabela sobrevivencia existe no schema qualidadejy
        const tabela = await client.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'qualidadejy' AND table_name = 'sobrevivencia';
        `);
        
        if (tabela.rows.length === 0) {
            console.log('❌ Tabela "sobrevivencia" não encontrada no schema "qualidadejy"');
            
            // Listar todas as tabelas do schema qualidadejy
            const todasTabelas = await client.query(`
                SELECT table_name 
                FROM information_schema.tables 
                WHERE table_schema = 'qualidadejy'
                ORDER BY table_name;
            `);
            
            console.log('\n📋 Tabelas disponíveis no schema "qualidadejy":');
            todasTabelas.rows.forEach(row => {
                console.log(`- ${row.table_name}`);
            });
            return;
        }
        
        console.log('✅ Tabela "sobrevivencia" encontrada!');
        
        // Mostrar estrutura da tabela sobrevivencia
        console.log('\n🔍 Estrutura da tabela "qualidadejy.sobrevivencia":');
        
        const colunas = await client.query(`
            SELECT 
                column_name,
                data_type,
                is_nullable,
                column_default,
                character_maximum_length
            FROM information_schema.columns 
            WHERE table_schema = 'qualidadejy' AND table_name = 'sobrevivencia'
            ORDER BY ordinal_position;
        `);
        
        colunas.rows.forEach(col => {
            const tamanho = col.character_maximum_length ? `(${col.character_maximum_length})` : '';
            const nullable = col.is_nullable === 'NO' ? ' - NOT NULL' : '';
            const defaultVal = col.column_default ? ` - DEFAULT: ${col.column_default}` : '';
            console.log(`  - ${col.column_name}: ${col.data_type}${tamanho}${nullable}${defaultVal}`);
        });
        
    } catch (error) {
        console.error('❌ Erro:', error.message);
    } finally {
        await client.end();
    }
}

analisarTabelaSobrevivencia();