const route = require('express').Router()
const news = require('../controllers/category')

route.post('/', news.postCategory)
route.get('/', news.getCategory)

module.exports = route
