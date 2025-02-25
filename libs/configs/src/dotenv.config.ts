import { DotenvConfigOptions } from 'dotenv'

export const dotenvConfig:DotenvConfigOptions={
    path:`.${process.env.NODE_ENV}.env`
}