import * as React from 'react'
import {
    Body,
    Html,
    Head,
    Heading,
    Text,
    Button,
} from '@react-email/components'

interface EmailTemplateProps {
    domain: string
    token: string
}

export const EmailTemplate = ({ domain, token }: EmailTemplateProps) => {
    return (
        <Html lang='en'>
            <Head>
                <title>Подтверждение почты</title>
            </Head>
            <Body>
                <Heading>Подтверждение почты</Heading>
                <Text>
                    Перейдите по ссылку чтобы подтвердить свой электронную почту
                </Text>
                <Button href={`${domain}/auth/email-confirm?token=${token}`}>
                    Подтвердить почту
                </Button>
            </Body>
        </Html>
    )
}
