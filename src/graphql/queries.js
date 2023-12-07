/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const getNote = /* GraphQL */ `
  query GetNote($id: ID!) {
    getNote(id: $id) {
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
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const listNotes = /* GraphQL */ `
  query ListNotes(
    $filter: ModelNoteFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listNotes(filter: $filter, limit: $limit, nextToken: $nextToken) {
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
        createdAt
        updatedAt
        __typename
      }
      nextToken
      __typename
    }
  }
`;
