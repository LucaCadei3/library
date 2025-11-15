import { BaseCommand } from '@adonisjs/core/ace'
import { CommandOptions } from '@adonisjs/core/types/ace'
import User from '#models/user'
import hash from '@adonisjs/core/services/hash'

export default class CreateAdmin extends BaseCommand {
  static commandName = 'create:admin'
  static description = 'Create a new admin user'

  static options: CommandOptions = {
    startApp: true,
  }

  async run() {
    const email = await this.prompt.ask('Enter admin email')
    const password = await this.prompt.secure('Enter admin password')
    const fullName = await this.prompt.ask('Enter admin full name')

    const existingUser = await User.findBy('email', email)
    if (existingUser) {
      this.logger.error('User with this email already exists')
      return
    }

    const hashedPassword = await hash.make(password)

    const admin = await User.create({
      email,
      password: hashedPassword,
      fullName,
      role: 'admin',
    })

    this.logger.success(`Admin user created successfully: ${admin.email}`)
  }
}