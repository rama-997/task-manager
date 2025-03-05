import { CookieOptions } from 'express'

export const cookieOptions:CookieOptions = {
    httpOnly: true,
    maxAge: 2592000,
}