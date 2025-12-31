import { gql } from '@apollo/client';

export const REGISTER_USER = gql`
    mutation RegisterUser(
        $fullName: String!,
        $email: String!,
        $password: String!,
        $confirmPassword: String!
    ) {
        register(
            registerInput: {
                fullName: $fullName,
                email: $email,
                password: $password,
                confirmPassword: $confirmPassword
            }
        ) {
            user {
                email
                id
                fullName
            }
    )
}   
}
`;