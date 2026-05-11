const path = require('path')
require('dotenv').config({ path: path.join(__dirname, '../.env') })
const app = require('./app')
const connectDB = require('./config/db')

const PORT = process.env.PORT || 3000

connectDB()
  .then(() => {
    app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`))
  })
  .catch((err) => {
    console.error('Erro ao iniciar o servidor:', err.message)
    process.exit(1)
  })
