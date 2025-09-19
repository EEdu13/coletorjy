const express = require('express');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('.'));

// Servir o PWA na raiz
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'coletor.html'));
});

// Servir arquivos estáticos
app.use(express.static(path.join(__dirname)));

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`🚀 PWA rodando na porta ${PORT}`);
    console.log(`📱 Acesse: http://localhost:${PORT}`);
    console.log(`🌐 Para ngrok: ngrok http ${PORT}`);
});