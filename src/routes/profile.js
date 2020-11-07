const route = require('express').Router()
const user = require('../controllers/users')

route.patch('/update', user.update)

module.exports = route
