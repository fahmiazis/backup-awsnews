const joi = require('joi')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const responseStandard = require('../helpers/response')
const { User } = require('../models')

const { APP_KEY } = process.env

module.exports = {
  register: async (req, res) => {
    const schema = joi.object({
      name: joi.string().required(),
      email: joi.string().email().required(),
      password: joi.string().required()
    })
    const { value: results, error } = schema.validate(req.body)
    if (error) {
      return responseStandard(res, 'Error', { error: error.message }, 401, false)
    } else {
      const result = await User.findOne({ where: { email: results.email }, attributes: { exclude: ['password'] } })
      if (result) {
        return responseStandard(res, 'email already used', {}, 400, false)
      } else {
        results.password = await bcrypt.hash(results.password, await bcrypt.genSalt())
        const result = await User.create(results)
        if (result) {
          return responseStandard(res, 'register succesfully')
        } else {
          return responseStandard(res, 'register failed', {}, 400, false)
        }
      }
    }
  },
  login: async (req, res) => {
    const schema = joi.object({
      email: joi.string().required(),
      password: joi.string().required()
    })
    const { value: results, error } = schema.validate(req.body)
    if (error) {
      return responseStandard(res, 'Error', { error: error.message }, 401, false)
    } else {
      const result = await User.findOne({ where: { email: results.email } })
      if (result) {
        const { id, name, email } = result
        bcrypt.compare(results.password, result.password, function (_err, result) {
          if (result) {
            jwt.sign({ id: id }, `${APP_KEY}`, {
              expiresIn: '15m'
            }, (_err, token) => {
              return responseStandard(res, 'login success', { name: name, email: email, Token: `${token}` })
            })
          } else {
            return responseStandard(res, 'Wrong password', {}, 400, false)
          }
        })
      } else {
        return responseStandard(res, 'Wrong email', {}, 400, false)
      }
    }
  },
  update: async (req, res) => {
    const id = req.user.id
    const schema = joi.object({
      name: joi.string(),
      email: joi.string().email(),
      birthdate: joi.date()
    })
    const { value: results, error } = schema.validate(req.body)
    if (error) {
      return responseStandard(res, 'Error', { error: error.message }, 401, false)
    } else {
      if (results.email) {
        const result = await User.findOne({ where: { email: results.email } })
        if (result) {
          return responseStandard(res, 'email already used', {}, 400, false)
        } else {
          const result = await User.findByPk(id, { attributes: { exclude: ['password'] } })
          if (result) {
            result.update(results)
            return responseStandard(res, 'update succesfully', { data: result })
          } else {
            return responseStandard(res, 'update failed', {}, 400, false)
          }
        }
      } else {
        const result = await User.findByPk(id, { attributes: { exclude: ['password'] } })
        if (result) {
          result.update(results)
          return responseStandard(res, 'update succesfully', { data: result })
        } else {
          return responseStandard(res, 'update failed', {}, 400, false)
        }
      }
    }
  },
  upload: async (req, res) => {
    const id = req.user.id
    const picture = { picture: `/uploads/${req.file.filename}` }
    const result = await User.findByPk(id)
    if (result) {
      result.update(picture)
      return responseStandard(res, 'update image succesfully', { image: result.picture })
    } else {
      return responseStandard(res, 'update image failed', {}, 400, false)
    }
  }
}
