import type { HttpContext } from '@adonisjs/core/http'
import Loan from '#models/loan'
import Book from '#models/book'
import { createLoanValidator, updateLoanValidator } from '#validators/loan'
import { DateTime } from 'luxon'
import type User from '#models/user'

export default class LoansController {
  async index({ auth, request }: HttpContext) {
    const user = auth.user as User
    const page = request.input('page', 1)
    const perPage = request.input('per_page', 25)

    const query = Loan.query().preload('book').preload('user')

    // Se non è admin, mostra solo i suoi prestiti
    if (user.role !== 'admin') {
      query.where('user_id', user.id)
    }

    const loans = await query.paginate(page, perPage)
    return loans.toJSON()
  }

  async show({ params, auth, response }: HttpContext) {
    const user = auth.user as User
    const loan = await Loan.query()
      .where('id', params.id)
      .preload('book')
      .preload('user')
      .firstOrFail()

    // Se non è admin, può vedere solo i suoi prestiti
    if (user.role !== 'admin' && loan.userId !== user.id) {
      return response.forbidden({ error: 'Access denied' })
    }

    return loan
  }

  async store({ request, auth, response }: HttpContext) {
    const user = auth.user as User
    const data = await request.validateUsing(createLoanValidator)

    // Verifica che il libro sia disponibile
    const book = await Book.findOrFail(data.book_id)
    if (!book.available) {
      return response.badRequest({ error: 'Book is not available' })
    }

    const loan = await Loan.create({
      userId: user.id,
      bookId: data.book_id,
      loan_date: data.loan_date, // ← Corretto: usa loan_date (snake_case)
      returned: false,
    })

    // Marca il libro come non disponibile
    book.available = false
    await book.save()

    await loan.load('book')
    return loan
  }

  async update({ params, request, auth, response }: HttpContext) {
    const user = auth.user as User
    const loan = await Loan.findOrFail(params.id)

    // Solo l'utente proprietario o un admin può modificare
    if (user.role !== 'admin' && loan.userId !== user.id) {
      return response.forbidden({ error: 'Access denied' })
    }

    const data = await request.validateUsing(updateLoanValidator)
    
    // Se viene marcato come restituito, riabilita il libro
    if (data.returned && !loan.returned) {
      const book = await Book.findOrFail(loan.bookId)
      book.available = true
      await book.save()
      
      // Se non c'è data di ritorno, usa ora
      if (!data.return_date) {
        loan.return_date = DateTime.now()
      }
    }

    // Merge solo i campi che esistono in data
    if (data.return_date !== undefined) {
      loan.return_date = data.return_date
    }
    if (data.returned !== undefined) {
      loan.returned = data.returned
    }

    await loan.save()
    await loan.load('book')
    
    return loan
  }

  async destroy({ params, auth, response }: HttpContext) {
    const user = auth.user as User
    const loan = await Loan.findOrFail(params.id)

    // Solo admin può eliminare
    if (user.role !== 'admin') {
      return response.forbidden({ error: 'Only admins can delete loans' })
    }

    await loan.delete()
    return response.noContent()
  }
}