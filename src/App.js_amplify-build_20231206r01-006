import React, { useState, useEffect } from "react";

// Hakuto
import { Line } from "react-chartjs-2";

import "./App.css";
import "@aws-amplify/ui-react/styles.css";
//import { API } from "aws-amplify";
import { generateClient } from "aws-amplify/api";
import {
  Button,
  Flex,
  Heading,
  Text,
  TextField,
  View,
  withAuthenticator,
} from "@aws-amplify/ui-react";
import { listNotes } from "./graphql/queries";
import {
  createNote as createNoteMutation,
  deleteNote as deleteNoteMutation,
} from "./graphql/mutations";

const client = generateClient();

const App = ({ signOut }) => {
  const [notes, setNotes] = useState([]);

  useEffect(() => {
    fetchNotes();
  }, []);

  async function fetchNotes() {
//    const apiData = await API.graphql({ query: listNotes });
    const apiData = await client.graphql({ query: listNotes });
    const notesFromAPI = apiData.data.listNotes.items;
    setNotes(notesFromAPI);
  }

  async function createNote(event) {
    event.preventDefault();
    const form = new FormData(event.target);
    const data = {
      name: form.get("name"),
      description: form.get("description"),
      send_cnt: form.get("send_cnt"),
      magx: form.get("magx"),
    };
//    await API.graphql({
    await client.graphql({
        query: createNoteMutation,
      variables: { input: data },
    });
    fetchNotes();
    event.target.reset();
  }

  async function deleteNote({ id }) {
    const newNotes = notes.filter((note) => note.id !== id);
    setNotes(newNotes);
//    await API.graphql({
    await client.graphql({
        query: deleteNoteMutation,
      variables: { input: { id } },
    });
  }

  // Hakuto start
  const labels = ["1 月", "2 月", "3 月", "4 月", "5 月", "6 月"];
  const graphData = {
    labels: labels,
    datasets: [
      {
        label: "A社",
        data: [65, 59, 60, 81, 56, 55],
        borderColor: "rgb(75, 192, 192)",
      },
      {
        label: "B社",
        data: [60, 55, 57, 61, 75, 50],
        borderColor: "rgb(75, 100, 192)",
      },
    ],
  };

  //const options: {} = {
  const options = {
    maintainAspectRatio: false,
  };

  /*
  const divStyle: React.CSSProperties = {
    marginLeft: "auto",
    marginRight: "auto",
    margin: "10px",
    width: "500px",
  };
  */
  // Hakuto end

  // Hakuto about "Line"
  return (
    <View className="App">
      <Heading level={1}>My Notes App</Heading>
      <View as="form" margin="3rem 0" onSubmit={createNote}>
        <Flex direction="row" justifyContent="center">
          <TextField
            name="name"
            placeholder="Note Name"
            label="Note Name"
            labelHidden
            variation="quiet"
            required
          />
          <TextField
            name="description"
            placeholder="Note Description"
            label="Note Description"
            labelHidden
            variation="quiet"
            required
          />
          <TextField
            name="send_cnt"
            placeholder="send_cnt"
            label="send_cnt"
            labelHidden
            variation="quiet"
            required
          />
          <TextField
            name="magx"
            placeholder="magx"
            label="magx"
            labelHidden
            variation="quiet"
            required
          />
          <Button type="submit" variation="primary">
            Create Note
          </Button>
        </Flex>
      </View>
      <Heading level={2}>Current Notes</Heading>
      <View margin="3rem 0">
        {notes.map((note) => (
          <Flex
            key={note.id || note.name}
            direction="row"
            justifyContent="center"
            alignItems="center"
          >
            <Text as="strong" fontWeight={700}>
              {note.name}
            </Text>
            <Text as="span">{note.description}</Text>
            <Text as="span">{note.send_cnt}</Text>
            <Text as="span">{note.magx}</Text>
            <Button variation="link" onClick={() => deleteNote(note)}>
              Delete note
            </Button>
          </Flex>
        ))}
      </View>
      <Button onClick={signOut}>Sign Out</Button>
      
      <Line
        height={300}
        width={300}
        data={graphData}
        options={options}
        id="chart-key"
      />
    </View>
  );
};

export default withAuthenticator(App);