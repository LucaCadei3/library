import factory from '@adonisjs/lucid/factories'
import Author from '#models/author'

export const AuthorFactory = factory
  .define(Author, async ({ faker }) => {
    return {
      name: faker.person.fullName(),
      bio: faker.lorem.paragraphs(2),
    }
  })
  .build()