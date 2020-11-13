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
const newsRoute = require('./routes/news')
const catRoute = require('./routes/category')
const postNewsRoute = require('./routes/postNews')
const bookmarkRoute = require('./routes/bookmark')

const authMiddleware = require('./middlewares/auth')

app.use('/auth', userRoute)
app.use('/profile', authMiddleware, profilRoute)
app.use('/news', newsRoute)
app.use('/private', authMiddleware, postNewsRoute)
app.use('/category', authMiddleware, catRoute)
app.use('/bookmark', authMiddleware, bookmarkRoute)
app.use('/uploads', express.static('assets/uploads/'))

app.get('/', (req, res) => {
  res.send({
    success: true,
    message: 'Backend is running'
  })
})

app.listen(APP_PORT, () => {
  console.log(`App listen on port ${APP_PORT}`)
})
