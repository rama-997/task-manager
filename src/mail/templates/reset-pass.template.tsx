import * as React from 'react'
import {
    Body,
    Button,
    Head,
    Heading,
    Html,
    Text,
} from '@react-email/components'

interface ResetPassTemplateProps {
    domain: string
    token: string
}

export const ResetPassTemplate = ({
    domain,
    token,
}: ResetPassTemplateProps) => {
    return (
        <Html lang='en'>
            <Head>
                <title>Сброс пароля</title>
            </Head>
            <Body>
                <Heading>Сброс пароля</Heading>
                <Text>Перейдите по ссылку чтобы сбросить пароль</Text>
                <Button href={`${domain}/auth/reset-pass?token=${token}`}>
                    Сбросить пароль
                </Button>
            </Body>
        </Html>
    )
}
