import * as React from 'react'
import {
    Body,
    Button,
    Head,
    Heading,
    Html,
    Text,
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
                <Button
                    // href={`${domain}/api/auth/email-confirm?token=${token}`}
                    href={`http://localhost:5000/api/auth/email-confirm?token=${token}`}
                >
                    Подтвердить почту
                </Button>
            </Body>
        </Html>
    )
}
