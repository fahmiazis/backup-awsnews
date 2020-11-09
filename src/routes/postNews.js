const route = require('express').Router()
const news = require('../controllers/news')
const category = require('../controllers/category')

route.post('/category/post', category.postCategory)
route.post('/news/post', news.postNews)
route.patch('/news/edit/:id', news.editNews)

module.exports = route
