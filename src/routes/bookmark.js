const route = require('express').Router()
const bookmark = require('../controllers/bookmark')

route.post('/post', bookmark.postBookmark)
route.get('/', bookmark.getBookmark)
route.delete('/delete/:id', bookmark.deleteBookmark)
route.delete('/delete', bookmark.deleteAllBookmark)

module.exports = route
