const route = require('express').Router()
const news = require('../controllers/news')

route.post('/post', news.postNews)
route.get('/', news.getNews)
route.patch('/edit/:id', news.editNews)
route.get('/detail/:id', news.getDetailNews)
route.get('/user', news.userNews)

module.exports = route
