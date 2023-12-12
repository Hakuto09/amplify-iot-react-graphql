import React, { useState, useEffect } from "react";

// Hakuto start
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";
// Hakuto end

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

// Hakuto start
//import { Amplify, Logger, AWSCloudWatchProvider} from 'aws-amplify'
import { Amplify, AWSCloudWatchProvider} from 'aws-amplify'
import { ConsoleLogger } from 'aws-amplify/utils';

//import { Authenticator } from '@aws-amplify/ui-react'

import awsExports from './aws-exports'

const loggerPrefix = 'amplify-logger'
const appName = 'amplify-iot-react-graphql'
const username = 'amplify-user' //実際に利用するときは、未認証ユーザーにはUUID、認証済みユーザーにはusernameなどの識別子を入れてログを取ると良さそう

Amplify.configure({
  Logging: {
    logGroupName: `/${loggerPrefix}/${appName}/${process.env.NODE_ENV}`,
    logStreamName: username,
  },
  ...awsExports,
})

const LOG_LEVEL = 'INFO' //どのレベルのログまでロギングするか

//const logger = new Logger('TestLogger', LOG_LEVEL)
//Amplify.register(logger)
//logger.addPluggable(new AWSCloudWatchProvider())

const console_logger = new ConsoleLogger('foo');
// Hakuto end

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
  
    // Hakuto start
    console_logger.info('notesFromAPI -->')
    console_logger.info(notesFromAPI)
    //onMessage();
    // Hakuto end
  }

  async function createNote(event) {
    event.preventDefault();
    const form = new FormData(event.target);
    const data = {
      nickname: form.get("nickname"),
      date: form.get("date"),
      send_cnt: form.get("send_cnt"),
      magx: form.get("magx"),
      magy: form.get("magy"),
      magz: form.get("magz"),
      degree: form.get("degree"),
      distance: form.get("distance"),
      pres: form.get("pres"),
      temp: form.get("temp"),
      humi: form.get("humi"),
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
  class DeviceData {
    constructor(deviceId) {
      this.deviceId = deviceId;
      this.maxLen = 50;
      this.timeData = new Array(this.maxLen);
      this.temperatureData = new Array(this.maxLen);
      this.humidityData = new Array(this.maxLen);
    }

    addData(time, temperature, humidity) {
      this.timeData.push(time);
      this.temperatureData.push(temperature);
      this.humidityData.push(humidity || null);

      if (this.timeData.length > this.maxLen) {
        this.timeData.shift();
        this.temperatureData.shift();
        this.humidityData.shift();
      }
    }
  }

  // All the devices in the list (those that have been sending telemetry)
  class TrackedDevices {
    constructor() {
      this.devices = [];
    }

    // Find a device based on its Id
    findDevice(deviceId) {
      for (let i = 0; i < this.devices.length; ++i) {
        if (this.devices[i].deviceId === deviceId) {
          return this.devices[i];
        }
      }

      return undefined;
    }

    getDevicesCount() {
      return this.devices.length;
    }
  }

  const trackedDevices = new TrackedDevices();

  // Define the chart axes
  const chartData = {
    datasets: [
      {
        fill: false,
        label: 'Temperature',
        yAxisID: 'Temperature',
        borderColor: 'rgba(255, 204, 0, 1)',
        pointBoarderColor: 'rgba(255, 204, 0, 1)',
        backgroundColor: 'rgba(255, 204, 0, 0.4)',
        pointHoverBackgroundColor: 'rgba(255, 204, 0, 1)',
        pointHoverBorderColor: 'rgba(255, 204, 0, 1)',
        spanGaps: true,
      },
      {
        fill: false,
        label: 'Humidity',
        yAxisID: 'Humidity',
        borderColor: 'rgba(24, 120, 240, 1)',
        pointBoarderColor: 'rgba(24, 120, 240, 1)',
        backgroundColor: 'rgba(24, 120, 240, 0.4)',
        pointHoverBackgroundColor: 'rgba(24, 120, 240, 1)',
        pointHoverBorderColor: 'rgba(24, 120, 240, 1)',
        spanGaps: true,
      }
    ]
  };

  const chartOptions = {
    scales: {
      yAxes: [{
        id: 'Temperature',
        type: 'linear',
        scaleLabel: {
          labelString: 'Temperature (ºC)',
          display: true,
        },
        position: 'left',
        ticks: {
          suggestedMin: 0,
          suggestedMax: 100,
          beginAtZero: true
        }
      },
      {
        id: 'Humidity',
        type: 'linear',
        scaleLabel: {
          labelString: 'Humidity (%)',
          display: true,
        },
        position: 'right',
        ticks: {
          suggestedMin: 0,
          suggestedMax: 100,
          beginAtZero: true
        }
      }]
    }
  };

  //// Get the context of the canvas element we want to select
  //const ctx = document.getElementById('iotChart').getContext('2d');
  //const myLineChart = new Chart(
  //  ctx,
  //  {
  //    type: 'line',
  //    data: chartData,
  //    options: chartOptions,
  //  });

  // Manage a list of devices in the UI, and update which device data the chart is showing
  // based on selection
  let needsAutoSelect = true;
  const deviceCount = document.getElementById('deviceCount');
  const listOfDevices = document.getElementById('listOfDevices');
  function OnSelectionChange() {
    const device = trackedDevices.findDevice(listOfDevices[listOfDevices.selectedIndex].text);
    chartData.labels = device.timeData;
    chartData.datasets[0].data = device.temperatureData;
    chartData.datasets[1].data = device.humidityData;
    //myLineChart.update();
  }
  listOfDevices.addEventListener('change', OnSelectionChange, false);

  // When a web socket message arrives:
  // 1. Unpack it
  // 2. Validate it has date/time and temperature
  // 3. Find or create a cached device to hold the telemetry data
  // 4. Append the telemetry data
  // 5. Update the chart UI
  function onMessage(nickname, date, temp, humi) {
    try {
      //const messageData = JSON.parse(message.data);
      //console.log(messageData);

      //// time and either temperature or humidity are required
      //if (!messageData.MessageDate || (!messageData.IotData.temperature && !messageData.IotData.humidity)) {
      //  return;
      //}

      // find or add device to list of tracked devices
      const existingDeviceData = trackedDevices.findDevice(nickname/*messageData.DeviceId*/);

      if (existingDeviceData) {
        existingDeviceData.addData(date/*messageData.MessageDate*/, temp/*messageData.IotData.temperature*/, humi/*messageData.IotData.humidity*/);
      }
      else {
        const newDeviceData = new DeviceData(nickname/*messageData.DeviceId*/);
        trackedDevices.devices.push(newDeviceData);
        const numDevices = trackedDevices.getDevicesCount();
        deviceCount.innerText = numDevices === 1 ? `${numDevices} device` : `${numDevices} devices`;
        newDeviceData.addData(date/*messageData.MessageDate*/, temp/*messageData.IotData.temperature*/, humi/*messageData.IotData.humidity*/);

        // add device to the UI list
        const node = document.createElement('option');
        const nodeText = document.createTextNode(nickname/*messageData.DeviceId*/);
        node.appendChild(nodeText);
        listOfDevices.appendChild(node);

        // if this is the first device being discovered, auto-select it
        if (needsAutoSelect) {
          needsAutoSelect = false;
          listOfDevices.selectedIndex = 0;
          OnSelectionChange();
        }
      }

      //myLineChart.update();
    }
    catch (err) {
      console.error(err);
    }
  };
  // Hakuto end

  // Hakuto about "Line"
  return (
    <View className="App">
      <Line options={chartOptions} data={chartData} />
    
      <Heading level={1}>My Notes App</Heading>
      <View as="form" margin="3rem 0" onSubmit={createNote}>
        <Flex direction="row" justifyContent="center">
          <TextField
            name="nickname"
            placeholder="NickName"
            label="NickName"
            labelHidden
            variation="quiet"
            required
          />
          <TextField
            name="date"
            placeholder="Date"
            label="Date"
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
          <TextField
            name="magy"
            placeholder="magy"
            label="magy"
            labelHidden
            variation="quiet"
            required
          />
          <TextField
            name="magz"
            placeholder="magz"
            label="magz"
            labelHidden
            variation="quiet"
            required
          />
          <TextField
            name="degree"
            placeholder="degree"
            label="degree"
            labelHidden
            variation="quiet"
            required
          />
          <TextField
            name="distance"
            placeholder="distance"
            label="distance"
            labelHidden
            variation="quiet"
            required
          />
          <TextField
            name="pres"
            placeholder="pres"
            label="pres"
            labelHidden
            variation="quiet"
            required
          />
          <TextField
            name="temp"
            placeholder="temp"
            label="temp"
            labelHidden
            variation="quiet"
            required
          />
          <TextField
            name="humi"
            placeholder="humi"
            label="humi"
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
//            key={note.id || note.name}
            key={!!note.id}
            direction="row"
            justifyContent="center"
            alignItems="center"
          >
            <Text as="strong" fontWeight={700}>
              {note.nickname}
            </Text>
            <Text as="span">{note.date}</Text>
            <Text as="span">{note.send_cnt}</Text>
            <Text as="span">{note.magx}</Text>
            <Text as="span">{note.magy}</Text>
            <Text as="span">{note.magz}</Text>
            <Text as="span">{note.degree}</Text>
            <Text as="span">{note.distance}</Text>
            <Text as="span">{note.pres}</Text>
            <Text as="span">{note.temp}</Text>
            <Text as="span">{note.humi}</Text>
            <Button variation="link" onClick={() => deleteNote(note)}>
              Delete note
            </Button>
          </Flex>
        ))}
      </View>
      <Button onClick={signOut}>Sign Out</Button>
    </View>
  );
};

export default withAuthenticator(App);