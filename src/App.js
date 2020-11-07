const express = require('express')
const bodyParser = require('body-parser')
const morgan = require('morgan')
const cors = require('cors')

const app = express()
const { APP_PORT } = process.env

app.use(bodyParser.urlencoded({ extended: false }))
app.use(morgan('dev'))
app.use(cors())

const userRoute = require('./routes/users')
const profilRoute = require('./routes/profile')

const authMiddleware = require('./middlewares/auth')

app.use('/auth', userRoute)
app.use('/profile', authMiddleware, profilRoute)

app.get('/', (req, res) => {
  res.send({
    success: true,
    message: 'Backend is running'
  })
})

app.listen(APP_PORT, () => {
  console.log(`App listen on port ${APP_PORT}`)
})
