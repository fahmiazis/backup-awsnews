const { news, User, category } = require('../models')
const joi = require('joi')
const responseStandard = require('../helpers/response')
const { Op } = require('sequelize')
const qs = require('querystring')

module.exports = {
  postNews: async (req, res) => {
    const id = req.user.id
    const schema = joi.object({
      title: joi.string().required(),
      headline: joi.string().required(),
      content: joi.string().required(),
      category_id: joi.number().required()
    })
    const { value: results, error } = schema.validate(req.body)
    if (error) {
      return responseStandard(res, 'Error', { error: error.message }, 401, false)
    } else {
      const user = {
        title: results.title,
        headline: results.headline,
        content: results.content,
        category_id: results.category_id,
        user_id: id
      }
      const result = await news.create(user)
      if (result) {
        return responseStandard(res, 'Post news success', { data: result })
      } else {
        return responseStandard(res, 'failed post news', {}, 405, false)
      }
    }
  },
  getDetailNews: async (req, res) => {
    const id = req.params.id
    const result = await news.findOne({
      where: { id: id },
      include: [
        { model: category, as: 'category', attributes: { exclude: ['createdAt', 'updatedAt'] } }
      ]
    })
    if (result) {
      const view = { view: result.view + 1 }
      result.update(view)
      responseStandard(res, 'detail news', { data: result })
    } else {
      responseStandard(res, 'Data not found', {}, 400, false)
    }
  },
  getNews: async (req, res) => {
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
    const result = await news.findAndCountAll({
      attributes: { exclude: ['content'] },
      include: [
        { model: User, as: 'user', attributes: { exclude: ['password', 'email', 'createdAt', 'updatedAt'] } },
        { model: category, as: 'category', attributes: { exclude: ['createdAt', 'updatedAt'] } }
      ],
      where: {
        [Op.or]: [
          { title: { [Op.like]: `%${searchValue}%` } },
          { headline: { [Op.like]: `%${searchValue}%` } }
        ]
      },
      order: [[`${sortValue}`, 'DESC']],
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
      pageInfo.nextLink = `http://54.147.40.208:6060/news?${qs.stringify({ ...req.query, ...{ page: page + 1 } })}`
    }
    if (currentPage > 1) {
      pageInfo.prevLink = `http://54.147.40.208:6060/news?${qs.stringify({ ...req.query, ...{ page: page - 1 } })}`
    }
    if (result.count !== 0) {
      responseStandard(res, 'list news', { data: result, pageInfo })
    } else if (result.count === 0) {
      const data = await category.findAndCountAll({
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
        where: {
          [Op.or]: [
            { name: { [Op.like]: `%${searchValue}%` } }
          ]
        },
        order: [['name', 'ASC']],
        limit: limit,
        offset: (page - 1) * limit
      })
      const resData = data.rows.map(item => {
        return item.news
      })
      const finalData = []
      for (let i = 0; i < resData.length; i++) {
        for (let j = 0; j < resData[i].length; j++) {
          const element = resData[i][j]
          finalData.push(element)
        }
      }
      const pageInfo = {
        count: data.count,
        pages: 0,
        currentPage: page,
        limitPerPage: limit,
        nextLink: null,
        prevLink: null
      }
      pageInfo.pages = Math.ceil(data.count / limit)

      const { pages, currentPage } = pageInfo
      if (currentPage < pages) {
        pageInfo.nextLink = `http://54.147.40.208:6060/news?${qs.stringify({ ...req.query, ...{ page: page + 1 } })}`
      }
      if (currentPage > 1) {
        pageInfo.prevLink = `http://54.147.40.208:6060/news?${qs.stringify({ ...req.query, ...{ page: page - 1 } })}`
      }
      if (data) {
        responseStandard(
          res,
          'list news',
          {
            data: {
              count: data.count,
              rows: finalData
            },
            pageInfo
          })
      } else {
        responseStandard(res, 'news not found', {}, 400, false)
      }
    } else {
      responseStandard(res, 'news not found', {}, 400, false)
    }
  },
  editNews: async (req, res) => {
    const idUser = req.user.id
    const id = req.params.id
    const schema = joi.object({
      title: joi.string(),
      headline: joi.string(),
      category_id: joi.string(),
      content: joi.string()
    })
    const { value: results, error } = schema.validate(req.body)
    if (error) {
      return responseStandard(res, 'Error', { error: error.message }, 401, false)
    } else {
      const result = await news.findOne({ where: { user_id: idUser } })
      if (result) {
        const result = await news.findByPk(id)
        if (result) {
          result.update(results)
          return responseStandard(res, 'update succesfully', { data: result })
        } else {
          return responseStandard(res, 'update failed', {}, 400, false)
        }
      } else {
        return responseStandard(res, 'you have not news', {}, 400, false)
      }
    }
  },
  userNews: async (req, res) => {
    let { limit, page } = req.query
    const idUser = req.user.id
    if (!limit) {
      limit = 10
    } else {
      limit = parseInt(limit)
    }
    if (!page) {
      page = 1
    } else {
      page = parseInt(page)
    }
    const result = await news.findAndCountAll({
      attributes: { exclude: ['content'] },
      include: [
        { model: category, as: 'category', attributes: { exclude: ['createdAt', 'updatedAt'] } }
      ],
      where: { user_id: idUser },
      order: [['createdAt', 'DESC']],
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
      pageInfo.nextLink = `http://54.147.40.208:6060/private/news/user?${qs.stringify({ ...req.query, ...{ page: page + 1 } })}`
    }
    if (currentPage > 1) {
      pageInfo.prevLink = `http://54.147.40.208:6060/private/news/user?${qs.stringify({ ...req.query, ...{ page: page - 1 } })}`
    }
    if (result) {
      responseStandard(res, 'list news', { data: result, pageInfo })
    } else {
      return responseStandard(res, 'you have not news', {}, 400, false)
    }
  },
  uploadImageNews: async (req, res) => {
    const id = req.params.id
    const picture = { picture: `/uploads/${req.file.filename}` }
    const result = await news.findByPk(id)
    if (result) {
      result.update(picture)
      return responseStandard(res, 'update image succesfully', { image: result.picture })
    } else {
      return responseStandard(res, 'update image failed', {}, 400, false)
    }
  },
  deleteNews: async (req, res) => {
    const id = req.user.id
    const newsId = req.params.id
    const result = await news.findByPk(newsId)
    if (result) {
      if (result.user_id === id) {
        await result.destroy()
        return responseStandard(res, 'delete news success')
      } else {
        return responseStandard(res, 'data not found', {}, 404, false)
      }
    } else {
      return responseStandard(res, 'data not found', {}, 404, false)
    }
  }
}
