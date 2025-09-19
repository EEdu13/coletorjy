const express = require('express');
const { Client } = require('pg');
const cors = require('cors');
const multer = require('multer');
const { BlobServiceClient } = require('@azure/storage-blob');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 8000;

// Configuração do multer para upload de arquivos
const upload = multer({ 
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB limite
    }
});

// Configuração Azure Blob Storage com SAS Token
const accountName = process.env.AZURE_STORAGE_ACCOUNT || 'checklistfilesferre';
const containerName = process.env.AZURE_STORAGE_CONTAINER || 'fotos-checklist';
const sasToken = process.env.AZURE_SAS_TOKEN || 'sp=racwdli&st=2025-08-10T13:50:29Z&se=2026-07-23T22:05:29Z&spr=https&sv=2024-11-04&sr=c&sig=35a3WC0k7IhDscrOqmxF3lHpXEMs7BxZWUstxLitCi8%3D';

const blobServiceClient = new BlobServiceClient(
    `https://${accountName}.blob.core.windows.net/?${sasToken}`
);

// Middlewares
app.use(cors());
app.use(express.json());
const path = require('path');
app.use(express.static(path.join(__dirname)));

// Configuração do PostgreSQL
const dbConfig = {
    host: process.env.PGHOST,
    port: process.env.PGPORT,
    user: process.env.PGUSER,
    password: process.env.PGPASSWORD,
    database: process.env.PGDATABASE,
    ssl: {
        rejectUnauthorized: false
    }
};

// Função para calcular dias e idade
function calcularDatas(dataPlantio, dataAvaliacao) {
    const plantio = new Date(dataPlantio);
    const avaliacao = new Date(dataAvaliacao);
    const diasAvaliacao = Math.floor((avaliacao - plantio) / (1000 * 60 * 60 * 24));
    const idadePlantio = diasAvaliacao; // Assumindo que idade_plantio = dias_avaliacao
    
    return { diasAvaliacao, idadePlantio };
}

// Endpoint para health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Endpoint para salvar avaliação
app.post('/api/avaliacoes', async (req, res) => {
    const client = new Client(dbConfig);
    
    try {
        await client.connect();
        
        const dados = req.body;
        const { diasAvaliacao, idadePlantio } = calcularDatas(dados.data_plantio, dados.data_avaliacao);
        
        // Calcular total de falhas
        const totalFalhas = [
            'quebradas', 'formigas', 'pisoteadas', 'sem_plantar', 'coleto_afogado',
            'substrato_exposto', 'queima_adubo', 'raiz_paralisada', 'canela_preta',
            'gafanhotos', 'escaldadura', 'outros', 'ausencia_de_cova', 'erosao', 'pragas',
            'quebradas_vivas', 'tombadas_vivas', 'escaldadura_vivas', 'falsa_subsolagem_toco',
            'queimada_viva', 'raspagem_grilo_2_nivel'
        ].reduce((total, campo) => total + (dados[campo] || 0), 0);
        
        const query = `
            INSERT INTO qualidadejy.sobrevivencia (
                fazenda, talhao, clone, data_plantio, data_avaliacao, 
                dias_avaliacao, idade_plantio, mudas_avaliadas, 
                area_talhao, area_avaliada, avaliador, viveiro, status_carga,
                quebradas, formigas, pisoteadas, sem_plantar, coleto_afogado,
                substrato_exposto, queima_adubo, raiz_paralisada, canela_preta,
                gafanhotos, escaldadura, outros, ausencia_de_cova, erosao, pragas,
                quebradas_vivas, tombadas_vivas, escaldadura_vivas, 
                falsa_subsolagem_toco, queimada_viva, raspagem_grilo_2_nivel,
                foto_area, foto_linha
            ) VALUES (
                $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13,
                $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, 
                $26, $27, $28, $29, $30, $31, $32, $33, $34, $35, $36
            ) RETURNING id;
        `;
        
        const values = [
            dados.fazenda, dados.talhao, dados.clone, dados.data_plantio, dados.data_avaliacao,
            diasAvaliacao, idadePlantio, dados.mudas_avaliadas,
            dados.area_talhao, dados.area_avaliada, dados.avaliador, dados.viveiro, dados.status_carga,
            dados.quebradas || 0, dados.formigas || 0, dados.pisoteadas || 0, 
            dados.sem_plantar || 0, dados.coleto_afogado || 0, dados.substrato_exposto || 0,
            dados.queima_adubo || 0, dados.raiz_paralisada || 0, dados.canela_preta || 0,
            dados.gafanhotos || 0, dados.escaldadura || 0, dados.outros || 0,
            dados.ausencia_de_cova || 0, dados.erosao || 0, dados.pragas || 0,
            dados.quebradas_vivas || 0, dados.tombadas_vivas || 0, dados.escaldadura_vivas || 0,
            dados.falsa_subsolagem_toco || 0, dados.queimada_viva || 0, dados.raspagem_grilo_2_nivel || 0,
            dados.foto_area || '', dados.foto_linha || ''
        ];
        
        const result = await client.query(query, values);
        
        res.json({
            success: true,
            message: 'Avaliação salva com sucesso!',
            id: result.rows[0].id,
            totalFalhas
        });
        
    } catch (error) {
        console.error('Erro ao salvar avaliação:', error);
        res.status(500).json({
            success: false,
            message: 'Erro ao salvar avaliação',
            error: error.message
        });
    } finally {
        await client.end();
    }
});

// Endpoint para listar avaliações
app.get('/api/avaliacoes', async (req, res) => {
    const client = new Client(dbConfig);
    
    try {
        await client.connect();
        
        const query = `
            SELECT * FROM qualidadejy.sobrevivencia 
            ORDER BY data_avaliacao DESC 
            LIMIT 50;
        `;
        
        const result = await client.query(query);
        
        res.json({
            success: true,
            data: result.rows
        });
        
    } catch (error) {
        console.error('Erro ao buscar avaliações:', error);
        res.status(500).json({
            success: false,
            message: 'Erro ao buscar avaliações',
            error: error.message
        });
    } finally {
        await client.end();
    }
});

// Endpoint para upload de fotos para Azure Blob
app.post('/api/upload-photo', upload.single('photo'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'Nenhuma foto enviada'
            });
        }

        const { filename, tipo } = req.body;
        const timestamp = new Date().getTime();
        const blobName = `${tipo}_${timestamp}_${filename || req.file.originalname}`;
        
        // Conectar ao container
        const containerClient = blobServiceClient.getContainerClient(containerName);
        
        // Upload da foto
        const blockBlobClient = containerClient.getBlockBlobClient(blobName);
        const uploadResponse = await blockBlobClient.upload(
            req.file.buffer, 
            req.file.size,
            {
                blobHTTPHeaders: {
                    blobContentType: req.file.mimetype
                }
            }
        );

        // URL pública da foto
        const photoUrl = `https://${accountName}.blob.core.windows.net/${containerName}/${blobName}`;

        console.log(`✅ Foto ${tipo} enviada para Azure Blob:`, photoUrl);

        res.json({
            success: true,
            url: photoUrl,
            blobName: blobName,
            message: `Foto ${tipo} enviada com sucesso!`
        });

    } catch (error) {
        console.error('❌ Erro no upload para Azure Blob:', error);
        res.status(500).json({
            success: false,
            message: 'Erro ao enviar foto para Azure Blob',
            error: error.message
        });
    }
});

// Rota raiz - serve o arquivo HTML principal
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'coletor.html'));
});

app.listen(port, () => {
    console.log(`🚀 Servidor rodando na porta ${port}`);
    console.log(`📊 Health check: http://localhost:${port}/api/health`);
});