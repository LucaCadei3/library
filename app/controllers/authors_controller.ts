import Author from '#models/author'
import type { HttpContext } from '@adonisjs/core/http'
import { createAuthorValidator, updateAuthorValidator  } from '#validators/author'

export default class AuthorsController {
  async index({ request }: HttpContext) {
    const page = request.input('page', 1)
    const perPage = request.input('per_page', 25)
    const search = request.input('search', '')

    const query = Author.query()

    if (search) {
      query.where('name', 'like', `%${search}%`)
        .orWhere('bio', 'like', `%${search}%`)
    }

    const authors = await query.paginate(page, perPage)
    return authors.toJSON()
  }

  async show({ params }: HttpContext) {
    const author = await Author.findOrFail(params.id)
    await author.load('books')
    return author
  }

  async store({ request }: HttpContext) {
    const data = await request.validateUsing(createAuthorValidator)
    const author = await Author.create(data)
    return author
  }

  async update({ params, request }: HttpContext) {
    const author = await Author.findOrFail(params.id)
    const data = await request.validateUsing(updateAuthorValidator)
    author.merge(data)
    await author.save()
    return author
  }

  async destroy({ params, response }: HttpContext) {
    const author = await Author.findOrFail(params.id)
    await author.delete()
    return response.noContent()
  }
}