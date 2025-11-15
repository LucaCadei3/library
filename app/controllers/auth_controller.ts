import type { HttpContext } from '@adonisjs/core/http'
import User from '#models/user'
import hash from '@adonisjs/core/services/hash'
import vine from '@vinejs/vine'

const registerValidator = vine.compile(
  vine.object({
    email: vine.string().email(),
    password: vine.string().minLength(8),
    full_name: vine.string().trim().minLength(2),
  })
)

const loginValidator = vine.compile(
  vine.object({
    email: vine.string().email(),
    password: vine.string(),
  })
)

export default class AuthController {
  async register({ request, response }: HttpContext) {
    const data = await request.validateUsing(registerValidator)

    const existingUser = await User.findBy('email', data.email)
    if (existingUser) {
      return response.conflict({ error: 'Email already registered' })
    }

    const hashedPassword = await hash.make(data.password)

    const user = await User.create({
      email: data.email,
      password: hashedPassword,
      fullName: data.full_name,
      role: 'user',
    })

    const token = await User.accessTokens.create(user)

    return { user, token }
  }

  async login({ request, response }: HttpContext) {
    const { email, password } = await request.validateUsing(loginValidator)

    const user = await User.findBy('email', email)
    if (!user) {
      return response.unauthorized({ error: 'Invalid credentials' })
    }

    const isPasswordValid = await hash.verify(user.password, password)
    if (!isPasswordValid) {
      return response.unauthorized({ error: 'Invalid credentials' })
    }

    const token = await User.accessTokens.create(user)

    return { user, token }
  }
}