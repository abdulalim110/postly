import { gql } from "@apollo/client";

export const ME_QUERY = gql`
  query CurrentUser {
    me {
      id
      name
      username
      email
      avatarKey
      bio
    }
  }
`;

export const LOGIN_MUTATION = gql`
  mutation Login($identifier: String!, $password: String!) {
    login(identifier: $identifier, password: $password) {
      token
      user {
        id
        name
        username
        email
        avatarKey
        bio
      }
    }
  }
`;

export const REGISTER_MUTATION = gql`
  mutation Register($input: RegisterInput!) {
    register(input: $input) {
      token
      user {
        id
        name
        username
        email
        avatarKey
        bio
      }
    }
  }
`;

export const FEED_QUERY = gql`
  query PublicFeed {
    feed {
      id
      caption
      imageKey
      createdAt
      author {
        id
        name
        username
        avatarKey
      }
      comments {
        id
        postId
        parentId
        content
        createdAt
        author {
          id
          name
          username
          avatarKey
        }
        replies {
          id
          postId
          parentId
          content
          createdAt
          author {
            id
            name
            username
            avatarKey
          }
        }
      }
    }
  }
`;

export const CREATE_POST_MUTATION = gql`
  mutation CreatePost($caption: String!, $imageKey: String!) {
    createPost(caption: $caption, imageKey: $imageKey) {
      id
    }
  }
`;

export const CREATE_COMMENT_MUTATION = gql`
  mutation CreateComment($postId: ID!, $parentId: ID, $content: String!) {
    createComment(postId: $postId, parentId: $parentId, content: $content) {
      id
    }
  }
`;

export const PROFILE_QUERY = gql`
  query PublicProfile($username: String!) {
    user(username: $username) {
      id
      name
      username
      avatarKey
      bio
      posts {
        id
        caption
        imageKey
        createdAt
      }
    }
  }
`;
