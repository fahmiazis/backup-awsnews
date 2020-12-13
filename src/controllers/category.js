const { category, news, User } = require('../models')
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
    let { search, limit, page, sort } = req.query
    let searchValue = ''
    let sortValue = ''
    if (typeof search === 'object') {
      searchValue = Object.values(search)[0]
    } else {
      searchValue = search || ''
    }
    if (typeof sort === 'object') {
      sortValue = Object.values(sort)[0]
    } else {
      sortValue = sort || 'createdAt'
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
    const result = await category.findAndCountAll({
      where: {
        [Op.or]: [
          { name: { [Op.like]: `%${searchValue}%` } }
        ]
      },
      order: [[`${sortValue}`, 'ASC']],
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
      include: [
        {
          model: news,
          as: 'news',
          attributes: { exclude: ['content'] },
          include: [
            { model: User, as: 'user', attributes: { exclude: ['password', 'email', 'createdAt', 'updatedAt'] } },
            { model: category, as: 'category', attributes: { exclude: ['createdAt', 'updatedAt'] } }
          ]
        }
      ],
      order: [['createdAt', 'ASC']],
      limit: limit,
      offset: (page - 1) * limit
    })
    const resdata = result.rows.map(item => {
      return item.news
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
      responseStandard(res,
        'category news',
        {
          data: {
            count: result.count,
            rows: resdata[0]
          },
          pageInfo
        })
    } else {
      responseStandard(res, 'category not found', {}, 400, false)
    }
  }
}
