import { gql } from "@apollo/client";

export const MESSAGE_ADDED = gql`
  subscription MessageAdded($chatroomId: String!) {
    messageAdded(chatroomId: $chatroomId) {
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
