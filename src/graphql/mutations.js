/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const createNote = /* GraphQL */ `
  mutation CreateNote(
    $input: CreateNoteInput!
    $condition: ModelNoteConditionInput
  ) {
    createNote(input: $input, condition: $condition) {
      id
      name
      description
      nickname
      date
      createdAt
      updatedAt
      send_cnt
      magx
      magy
      magz
      degree
      distance
      pres
      temp
      humi
      general_data00
      general_data01
      postType
      __typename
    }
  }
`;
export const updateNote = /* GraphQL */ `
  mutation UpdateNote(
    $input: UpdateNoteInput!
    $condition: ModelNoteConditionInput
  ) {
    updateNote(input: $input, condition: $condition) {
      id
      name
      description
      nickname
      date
      createdAt
      updatedAt
      send_cnt
      magx
      magy
      magz
      degree
      distance
      pres
      temp
      humi
      general_data00
      general_data01
      postType
      __typename
    }
  }
`;
export const deleteNote = /* GraphQL */ `
  mutation DeleteNote(
    $input: DeleteNoteInput!
    $condition: ModelNoteConditionInput
  ) {
    deleteNote(input: $input, condition: $condition) {
      id
      name
      description
      nickname
      date
      createdAt
      updatedAt
      send_cnt
      magx
      magy
      magz
      degree
      distance
      pres
      temp
      humi
      general_data00
      general_data01
      postType
      __typename
    }
  }
`;
