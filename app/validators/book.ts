import vine from '@vinejs/vine'

export const createBookValidator = vine.compile(
  vine.object({
    title: vine.string().trim().minLength(1).maxLength(255),
    isbn: vine.string().trim().regex(/^[0-9-]+$/),
    author_id: vine.number().positive(),
    year: vine.number().optional(),
    available: vine.boolean().optional(),
  })
)

export const updateBookValidator = vine.compile(
  vine.object({
    title: vine.string().trim().minLength(1).maxLength(255).optional(),
    isbn: vine.string().trim().regex(/^[0-9-]+$/).optional(),
    author_id: vine.number().positive().optional(),
    year: vine.number().optional(),
    available: vine.boolean().optional(),
  })
)