import Book from '#models/book'
import type { HttpContext } from '@adonisjs/core/http'

export default class BooksController {
  async index({ request }: HttpContext) {
    const page = request.input('page', 1)
    const perPage = request.input('per_page', 25)
    const search = request.input('search', '')
    const authorId = request.input('author_id')

    const query = Book.query().preload('author')

    if (search) {
      query.where('title', 'like', `%${search}%`)
        .orWhere('isbn', 'like', `%${search}%`)
    }

    if (authorId) {
      query.where('author_id', authorId)
    }

    const books = await query.paginate(page, perPage)
    return books.toJSON()
  }

  async show({ params }: HttpContext) {
    const book = await Book.query()
      .where('id', params.id)
      .preload('author')
      .preload('loans')
      .firstOrFail()
    return book
  }

  async store({ request }: HttpContext) {
    // Implementare validazione (vedi punto 5)
    const data = request.only(['title', 'isbn', 'author_id', 'year', 'available'])
    const book = await Book.create(data)
    await book.load('author')
    return book
  }

  async update({ params, request }: HttpContext) {
    const book = await Book.findOrFail(params.id)
    const data = request.only(['title', 'isbn', 'author_id', 'year', 'available'])
    book.merge(data)
    await book.save()
    await book.load('author')
    return book
  }

  async destroy({ params, response }: HttpContext) {
    const book = await Book.findOrFail(params.id)
    await book.delete()
    return response.noContent()
  }
}