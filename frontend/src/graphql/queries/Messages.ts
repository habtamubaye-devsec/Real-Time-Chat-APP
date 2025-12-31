import { gql } from "@apollo/client";

export const GET_MESSAGES = gql`
  query Messages($chatroomId: String!) {
    messages(chatroomId: $chatroomId) {
      id
      content
      imageUrl
      chatroomId
      userId
      createdAt
      user {
        id
        fullName
        email
        avatarUrl
      }
    }
  }
`;
