import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'
import type User from '#models/user'

export default class AdminMiddleware {
  async handle(ctx: HttpContext, next: NextFn) {
    const user = ctx.auth.user as unknown as User | undefined

    if (!user || user.role !== 'admin') {
      return ctx.response.forbidden({ error: 'Admin access required' })
    }

    return next()
  }
}