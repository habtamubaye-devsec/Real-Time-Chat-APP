import { gql } from "@apollo/client";

export const UPDATE_PROFILE = gql`
  mutation UpdateProfile(
    $fullName: String!
    $file: Upload
    $chatroomId: Float
  ) {
    updateProfile(
      updateUserProfileInput: {
        fullName: $fullName
        file: $file
        chatroomId: $chatroomId
      }
    ) {
      id
      fullName
      avatarUrl
    }
  }
`;
