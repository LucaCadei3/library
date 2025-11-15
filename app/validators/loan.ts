import vine from '@vinejs/vine'
import { DateTime } from 'luxon'

export const createLoanValidator = vine.compile(
  vine.object({
    book_id: vine.number().positive(),
    loan_date: vine.date().transform((value) => DateTime.fromJSDate(value)),
  })
)

export const updateLoanValidator = vine.compile(
  vine.object({
    return_date: vine.date().optional().transform((value) => 
      value ? DateTime.fromJSDate(value) : undefined
    ),
    returned: vine.boolean().optional(),
  })
)