import { gql } from "@apollo/client";

export const SEND_MESSAGE = gql`
  mutation SendMessage($chatroomId: String!, $content: String!, $imageUrl: String) {
    sendMessage(input: { chatroomId: $chatroomId, content: $content, imageUrl: $imageUrl }) {
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
