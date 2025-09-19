# Avaliação de Sobrevivência PWA

PWA para avaliação de sobrevivência de mudas - JY Agroflorestal

## 🚀 Deploy no Railway

### Arquivos de Configuração para Railway:

1. **package.json** ✅
   - Scripts: start, dev, test
   - Dependencies: express, pg, cors, dotenv
   - Engine: Node.js 18.x

2. **Procfile** ✅
   - Comando: `web: node server.js`

3. **.nvmrc** ✅ 
   - Versão: 18.20.4

4. **.env** ✅
   - PostgreSQL Railway credentials configuradas

### Funcionalidades Implementadas:

✅ **Backend (server.js)**
- Express.js servidor
- PostgreSQL connectivity (Railway)
- CORS habilitado
- Health check endpoint
- POST /api/avaliacoes (salvar)
- GET /api/avaliacoes (listar)
- PORT dinâmica (Railway compatible)

✅ **Frontend PWA (coletor.html)**
- Manifesto Web configurado
- Service Worker para offline
- Datas em formato brasileiro (dd/mm/aaaa)
- Lista suspensa: Dias da Avaliação (15, 30, 60, 90)
- Cálculo automático: Idade do Plantio
- Reset completo após envio
- Sync offline/online
- Interface responsiva mobile

✅ **Database Integration**
- Tabela: qualidadejy.sobrevivencia
- 21 campos de não conformidades
- Campos calculados automaticamente
- Mapeamento completo HTML ↔ PostgreSQL

### Como Deploy no Railway:

1. **Conectar repositório Git**
2. **Configurar variáveis de ambiente**:
   ```
   PGHOST=ballast.proxy.rlwy.net
   PGPORT=21526
   PGUSER=postgres
   PGPASSWORD=CqdPHkjnPksiOYxCKVZtFUUOIGDIlPNr
   PGDATABASE=railway
   ```
3. **Deploy automático** - Railway detectará automaticamente

### URLs:
- **Health Check**: `/api/health`
- **PWA**: `/` (coletor.html)
- **API**: `/api/avaliacoes` (GET/POST)

### Status: ✅ PRONTO PARA PRODUÇÃO