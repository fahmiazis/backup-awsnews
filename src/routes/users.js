const route = require('express').Router()
const user = require('../controllers/users')

route.post('/register', user.register)
route.post('/login', user.login)

module.exports = route
