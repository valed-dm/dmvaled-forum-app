import { gql } from "apollo-server-express";

const typeDefs = gql`
  scalar Date

  type EntityResult {
    messages: [String!]
  }

  type User {
    id: ID!
    email: String!
    userName: String!
    password: String!
    confirmed: Boolean!
    isDisabled: Boolean!
    threads: [Thread!]
    threadItems: [ThreadItem!]
    createdBy: String!
    createdOn: Date!
    lastModifiedBy: String!
    lastModifiedOn: Date!
  }

  union UserResult = User | EntityResult

  type Thread {
    id: ID!
    views: Int!
    points: Int!
    isDisabled: Boolean!
    title: String!
    body: String!
    user: User!
    threadItems: [ThreadItem!]
    category: ThreadCategory
    createdBy: String!
    createdOn: Date!
    lastModifiedBy: String!
    lastModifiedOn: Date!
  }

  union ThreadResult = Thread | EntityResult
  type ThreadArray {
    threads: [Thread!]
  }
  type ThreadItemArray {
    threadItems: [ThreadItem!]
  }
  union ThreadArrayResult = ThreadArray | EntityResult
  union ThreadItemArrayResult = ThreadItemArray | EntityResult

  type ThreadItem {
    id: ID!
    views: Int!
    points: Int!
    isDisabled: Boolean!
    body: String!
    user: User!
    thread: Thread!
    createdBy: String!
    createdOn: Date!
    lastModifiedBy: String!
    lastModifiedOn: Date!
  }

  type ThreadCategory {
    id: ID!
    name: String!
    description: String!
    threads: [Thread!]
    createdBy: String!
    createdOn: Date!
    lastModifiedBy: String!
    lastModifiedOn: Date!
  }

  type ThreadByCategory {
    threadId: ID!
    categoryId: ID!
    categoryName: String!
    title: String!
    titleCreatedOn: Date!
  }

  type Query {
    me: UserResult!
    getAllCategories: [ThreadCategory!]
    getTopCategoryThread: [ThreadByCategory!]
    getThreadById(threadId: ID!): ThreadResult
    getThreadsLatest: ThreadArrayResult!
    getThreadsByCategoryId(categoryId: ID!): ThreadArrayResult!
    getThreadItemsByThreadId(threadId: ID!): ThreadItemArrayResult!
  }

  type Mutation {
    register(email: String!, userName: String!, password: String!): String!
    login(userName: String!, password: String!): String!
    logout: String!
    createThread(
      userId: ID!
      categoryId: ID!
      title: String!
      body: String!
    ): EntityResult
    createThreadItem(userId: ID!, threadId: ID!, body: String!): EntityResult
    updateThreadPoint(threadId: ID!, increment: Boolean!): String!
    updateThreadItemPoint(threadItemId: ID!, increment: Boolean!): String!
    changePassword(newPassword: String!): String!
  }
`;

export default typeDefs;
