import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'
import type User from '#models/user'

export default class UserOrAdminMiddleware {
  async handle(ctx: HttpContext, next: NextFn) {
    const user = ctx.auth.user as unknown as User | undefined
    const userId = ctx.params.id

    if (!user) {
      return ctx.response.unauthorized({ error: 'Not authenticated' })
    }

    if (user.role !== 'admin' && user.id !== Number(userId)) {
      return ctx.response.forbidden({ 
        error: 'You can only modify your own account' 
      })
    }

    return next()
  }
}