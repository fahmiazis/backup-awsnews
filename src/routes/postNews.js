const route = require('express').Router()
const news = require('../controllers/news')
const category = require('../controllers/category')
const upload = require('../helpers/upload')

route.post('/category/post', category.postCategory)
route.post('/news/post', news.postNews)
route.patch('/news/post/images/:id', upload, news.uploadImageNews)
route.patch('/news/edit/:id', news.editNews)
route.delete('/news/delete/:id', news.deleteNews)
route.get('/news/user', news.userNews)

module.exports = route
