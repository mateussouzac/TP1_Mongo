const mongoose = require('mongoose')

const connectDB = async () => {
  const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/tp1_mongo'

  await mongoose.connect(mongoUri)
  console.log(`MongoDB conectado em ${mongoose.connection.name}!`)
}

module.exports = connectDB
