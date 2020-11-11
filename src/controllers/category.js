const { category, news } = require('../models')
const responseStandard = require('../helpers/response')
const joi = require('joi')
const { Op } = require('sequelize')
const qs = require('querystring')

module.exports = {
  postCategory: async (req, res) => {
    const schema = joi.object({
      name: joi.string().required()
    })
    const { value: results, error } = schema.validate(req.body)
    if (error) {
      return responseStandard(res, 'Error', { error: error.message }, 401, false)
    } else {
      const result = await category.create(results)
      if (result) {
        return responseStandard(res, 'Post news success', { data: result })
      } else {
        return responseStandard(res, 'failed post news', {}, 405, false)
      }
    }
  },
  getCategory: async (req, res) => {
    let { search, limit, page } = req.query
    let searchValue = ''
    let searchKey = ''
    let find = {}
    if (typeof search === 'object') {
      searchKey = Object.keys(search)[0]
      searchValue = Object.values(search)[0]
    } else {
      searchKey = 'name'
      searchValue = search || ''
    }
    if (!limit) {
      limit = 5
    } else {
      limit = parseInt(limit)
    }
    if (!page) {
      page = 1
    } else {
      page = parseInt(page)
    }
    if (searchKey === 'name') {
      find = { name: { [Op.like]: `%${searchValue}%` } }
    } else if (searchKey === 'category_id') {
      find = { id: { [Op.like]: `%${searchValue}%` } }
    } else {
      find = { name: { [Op.like]: `%${searchValue}%` } }
    }
    const result = await category.findAndCountAll({
      where: find,
      order: [['createdAt', 'ASC']],
      limit: limit,
      offset: (page - 1) * limit
    })
    const pageInfo = {
      count: result.count,
      pages: 0,
      currentPage: page,
      limitPerPage: limit,
      nextLink: null,
      prevLink: null
    }
    pageInfo.pages = Math.ceil(result.count / limit)

    const { pages, currentPage } = pageInfo
    if (currentPage < pages) {
      pageInfo.nextLink = `http://54.147.40.208:6060/category?${qs.stringify({ ...req.query, ...{ page: page + 1 } })}`
    }
    if (currentPage > 1) {
      pageInfo.prevLink = `http://54.147.40.208:6060/category?${qs.stringify({ ...req.query, ...{ page: page - 1 } })}`
    }
    if (result) {
      responseStandard(res, 'category news', { data: result, pageInfo })
    } else {
      responseStandard(res, 'category not found', {}, 400, false)
    }
  },
  getDetailCategory: async (req, res) => {
    let { limit, page } = req.query
    const id = req.params.id
    if (!limit) {
      limit = 5
    } else {
      limit = parseInt(limit)
    }
    if (!page) {
      page = 1
    } else {
      page = parseInt(page)
    }
    const result = await category.findAndCountAll({
      where: { id: id },
      include: [{ model: news, as: 'news', attributes: { exclude: ['content'] } }],
      order: [['createdAt', 'ASC']],
      limit: limit,
      offset: (page - 1) * limit
    })
    const pageInfo = {
      count: result.count,
      pages: 0,
      currentPage: page,
      limitPerPage: limit,
      nextLink: null,
      prevLink: null
    }
    pageInfo.pages = Math.ceil(result.count / limit)

    const { pages, currentPage } = pageInfo
    if (currentPage < pages) {
      pageInfo.nextLink = `http://54.147.40.208:6060/category?${qs.stringify({ ...req.query, ...{ page: page + 1 } })}`
    }
    if (currentPage > 1) {
      pageInfo.prevLink = `http://54.147.40.208:6060/category?${qs.stringify({ ...req.query, ...{ page: page - 1 } })}`
    }
    if (result) {
      responseStandard(res, 'category news', { data: result, pageInfo })
    } else {
      responseStandard(res, 'category not found', {}, 400, false)
    }
  }
}
