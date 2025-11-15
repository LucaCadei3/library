import User from '#models/user'
import type { HttpContext } from '@adonisjs/core/http'
import vine from '@vinejs/vine'

const updateUserValidator = vine.compile(
  vine.object({
    full_name: vine.string().trim().minLength(2).optional(),
    email: vine.string().email().optional(),
    password: vine.string().minLength(8).optional(),
    role: vine.enum(['user', 'admin']).optional(),
  })
)

export default class UsersController {
  async index({ response }: HttpContext) {
    const users = await User.all()
    return users
  }

  async show({ params }: HttpContext) {
    const user = await User.findOrFail(params.id)
    return user
  }

  async update({ params, request }: HttpContext) {
    const user = await User.findOrFail(params.id)
    const data = await request.validateUsing(updateUserValidator)
    
    user.merge(data)
    await user.save()
    return user
  }

  async destroy({ params, response }: HttpContext) {
    const user = await User.findOrFail(params.id)
    await user.delete()
    return response.noContent()
  }
}