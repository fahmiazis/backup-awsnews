const route = require('express').Router()
const news = require('../controllers/category')

route.post('/', news.postCategory)
route.get('/', news.getCategory)
route.get('/detail/:id', news.getDetailCategory)

module.exports = route
