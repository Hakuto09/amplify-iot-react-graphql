/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const getNote = /* GraphQL */ `
  query GetNote($id: ID!, $date: String!) {
    getNote(id: $id, date: $date) {
      id
      name
      description
      nickname
      date
      send_cnt
      magx
      magy
      magz
      degree
      distance
      pres
      temp
      humi
      postType
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const listNotes = /* GraphQL */ `
  query ListNotes(
    $id: ID
    $date: ModelStringKeyConditionInput
    $filter: ModelNoteFilterInput
    $limit: Int
    $nextToken: String
    $sortDirection: ModelSortDirection
  ) {
    listNotes(
      id: $id
      date: $date
      filter: $filter
      limit: $limit
      nextToken: $nextToken
      sortDirection: $sortDirection
    ) {
      items {
        id
        name
        description
        nickname
        date
        send_cnt
        magx
        magy
        magz
        degree
        distance
        pres
        temp
        humi
        postType
        createdAt
        updatedAt
        __typename
      }
      nextToken
      __typename
    }
  }
`;
