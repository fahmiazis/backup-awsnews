const route = require('express').Router()
const news = require('../controllers/news')

route.get('/', news.getNews)
route.get('/detail/:id', news.getDetailNews)

module.exports = route
