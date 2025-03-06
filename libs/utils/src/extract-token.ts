import * as request from 'supertest'

export const extractToken = (
    res: request.Response,
    token: string,
): string | null => {
    const cookies = res.headers['set-cookie'] as any

    return cookies
        .find(cookie => cookie.startsWith(`${token}=`))
        .split(';')[0]
        .split('=')[1]
}
