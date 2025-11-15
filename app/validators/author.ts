import vine from '@vinejs/vine'

export const createAuthorValidator = vine.compile(
  vine.object({
    name: vine.string().trim().minLength(2).maxLength(255),
    bio: vine.string().trim().optional(),
  })
)

export const updateAuthorValidator = vine.compile(
  vine.object({
    name: vine.string().trim().minLength(2).maxLength(255).optional(),
    bio: vine.string().trim().optional(),
  })
)