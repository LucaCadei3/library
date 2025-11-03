import Book from '#models/book'
import type { HttpContext } from '@adonisjs/core/http'

export default class BooksController {
  /**
   * Display a list of resource
   */
  async index({ request }: HttpContext) {
    const pageInput = Number(request.input('page', 1))
    const page = Number.isFinite(pageInput) && pageInput > 0 ? pageInput : 1
    const perPage = 25

    const paginator = await Book.query().preload('author').paginate(page, perPage)
    return paginator.toJSON()
  }

  /**
   * Display form to create a new record
   */
  async create({}: HttpContext) {}

  /**
   * Handle form submission for the create action
   */
  async store({}: HttpContext) {}

  /**
   * Show individual record
   */
  async show({}: HttpContext) {}

  /**
   * Edit individual record
   */
  async edit({}: HttpContext) {}

  /**
   * Handle form submission for the edit action
   */
  async update({}: HttpContext) {}

  /**
   * Delete record
   */
  async destroy({}: HttpContext) {}
}