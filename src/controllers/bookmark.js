const { bookmark, news } = require('../models')
const responseStandard = require('../helpers/response')
const joi = require('joi')
const qs = require('querystring')

module.exports = {
  postBookmark: async (req, res) => {
    const userId = req.user.id
    const schema = joi.object({
      newsId: joi.string().required()
    })
    const { value: results, error } = schema.validate(req.body)
    if (error) {
      return responseStandard(res, 'Error', { error: error.message }, 401, false)
    } else {
      const data = {
        userId: userId,
        newsId: results.newsId
      }
      const result = await bookmark.create(data)
      if (result) {
        return responseStandard(res, 'added bookmark successfully')
      } else {
        return responseStandard(res, 'failed to add bookmark', {}, 400, false)
      }
    }
  },
  getBookmark: async (req, res) => {
    const id = req.user.id
    let { limit, page } = req.query
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
    const result = await bookmark.findAndCountAll({
      where: { userId: id },
      attributes: { exclude: ['id'] },
      include: [
        { model: news, as: 'news', attributes: { exclude: ['content'] } }
      ],
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
      pageInfo.nextLink = `http://54.147.40.208:6060/bookmark?${qs.stringify({ ...req.query, ...{ page: page + 1 } })}`
    }
    if (currentPage > 1) {
      pageInfo.prevLink = `http://54.147.40.208:6060/bookmark?${qs.stringify({ ...req.query, ...{ page: page - 1 } })}`
    }
    if (result) {
      responseStandard(res, 'list news', { data: result, pageInfo })
    } else {
      responseStandard(res, 'news not found', {}, 400, false)
    }
  },
  deleteAllBookmark: async (req, res) => {
    const id = req.user.id
    const result = await bookmark.findAll({ where: { userId: id } })
    if (result) {
      await result.destroy()
      return responseStandard(res, 'all bookmark has delete')
    } else {
      return responseStandard(res, 'data not found', {}, 400, false)
    }
  },
  deleteBookmark: async (req, res) => {
    const id = req.user.id
    const newsId = req.params.id
    const result = await bookmark.findOne({ where: { newsId: newsId } })
    if (result.userId === id) {
      await result.destroy()
      return responseStandard(res, 'delete success')
    } else {
      return responseStandard(res, 'data not found', {}, 404, false)
    }
  }
}
