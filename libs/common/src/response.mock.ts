import { Response } from 'express'

export const responseMock: Partial<Response> = {
    cookie: jest.fn(),
}
