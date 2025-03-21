import { Response } from 'express'

export const responseMock: Partial<Response> = {
    cookie: jest.fn(),
    clearCookie: jest.fn(),
    json: jest.fn(),
    status: jest.fn(),
}
