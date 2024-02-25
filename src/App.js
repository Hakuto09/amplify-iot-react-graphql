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

var g_devices = [];
var maxLenList = 1000;
var maxLenDisplay = 50;
var labels = new Array(maxLenDisplay);
var data0s = new Array(maxLenDisplay);
var data1s = new Array(maxLenDisplay);


// All the devices in the list (those that have been sending telemetry)
class TrackedDevices {
  constructor() {
    this.devices = [];
  }

/*
  // Find a device based on its Id
  findDevice(deviceId) {
    console_logger.warn('TrackedDevices.findDevice(): deviceId ', deviceId);
    console_logger.warn('TrackedDevices.findDevice(): this.devices ', this.devices);
    for (let i = 0; i < this.devices.length; ++i) {
      console_logger.warn('TrackedDevices.findDevice(): this.devices.length ', this.devices.length, ' i ', i);
      if (this.devices[i].deviceId === deviceId) {
        console_logger.warn('TrackedDevices.findDevice(): before return. i ', i, ' this.devices[i] ', this.devices[i]);
        return this.devices[i];
      }
    }

    return undefined;
  }
*/

  getDevicesCount() {
    return this.devices.length;
  }
}

const trackedDevices = new TrackedDevices();
var numOfCreatedDevices = 0;
let needsAutoSelect = true;
var g_selectedIndex = 0;


console_logger.warn('Before App.')  // Hakuto

const App = ({ signOut }) => {
  const [notes, setNotes] = useState([]);

  useEffect(() => {
    fetchNotes();
  }, []);

//  // Hakuto start
//    async function fetchNote(id) {
//    console_logger.warn('fetchNote(): In')  // Hakuto
//
//    const apiDataOfGet = await client.graphql({
//      query: getNote,
//      variables: { input: { id } },
//    });
//  
//    console_logger.warn('fetchNote(): After client.graphql() apiDataOfGet --> ', apiDataOfGet);  // Hakuto
//
//    const notesFromAPIofGet = apiDataOfGet.data.getNote.items;
//    console_logger.warn('fetchNote(): After client.graphql() notesFromAPIofGet --> ', notesFromAPIofGet)  // Hakuto
//  }
//  // Hakuto end

  async function fetchNotes() {
    console_logger.warn('fetchNotes(): In')  // Hakuto

//#if 0
/*
//    const apiData = await API.graphql({ query: listNotes });
    const apiData = await client.graphql({ query: listNotes });
    console_logger.warn('fetchNotes(): After client.graphql() apiData --> ', apiData);  // Hakuto

    const notesFromAPI = apiData.data.listNotes.items;
    console_logger.warn('fetchNotes(): After client.graphql() notesFromAPI --> ', notesFromAPI)  // Hakuto
*/
//#else
    var notesFromAPI = [];
    var idForSort = "multi001";
    var nextToken = null;
    var limit = 200;

    while(1) {
      const apiData = await client.graphql({
        query: listNotes,
//        variables: { limit: limit, nextToken: nextToken },
        variables: { id: idForSort, sortDirection: "DESC", limit: limit, nextToken: nextToken },
      });
      console_logger.warn('onMessage(): After client.graphql() apiData --> ', apiData);

      Array.prototype.push.apply(notesFromAPI, apiData.data.listNotes.items);
      nextToken = apiData.data.listNotes.nextToken;
      if(!nextToken || notesFromAPI.length > maxLenList - limit) break;
    }

    console_logger.warn('fetchNotes(): After while loop of client.graphql() notesFromAPI --> ', notesFromAPI)

//-------------------
/*
let sampleList = [];
const fetchList = async (token) => {
  const appSyncParams = {
    filter: {
      条件を記載
    },
    limit: 999999999
  };
  if (token) appSyncParams.nextToken = token;
  const res = await API.graphql(graphqlOperation(queries.listTests, appSyncParams));
  Array.prototype.push.apply(sampleList, res.data.listTests.items);
  if (!res.data.listTests.nextToken) return;
  await fetchList(res.data.listTests.nextToken);
}
await fetchList('');
*/
//-------------------

    setNotes(notesFromAPI);
    // Hakuto start
    console_logger.warn('fetchNotes(): After setNotes() notesFromAPI --> ', notesFromAPI)

    onMessage(notesFromAPI);
    // Hakuto end
  }

  async function createNote(event) {
    event.preventDefault();
    const form = new FormData(event.target);
    const data = {
      id: form.get("id"),
      date: form.get("date"),
      nickname: form.get("nickname"),
//      send_cnt: form.get("send_cnt"),
//      magx: form.get("magx"),
//      magy: form.get("magy"),
//      magz: form.get("magz"),
//      degree: form.get("degree"),
//      distance: form.get("distance"),
//      pres: form.get("pres"),
//      temp: form.get("temp"),
//      humi: form.get("humi"),
      postType: 'OPEN',
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
    console_logger.warn('deleteNote(): Before notes.filter() id ', id, ' notes ', notes)
    const newNotes = notes.filter((note) => note.id !== id);
    console_logger.warn('deleteNote(): After notes.filter() newNotes --> ', newNotes)


    setNotes(newNotes);

    //    await API.graphql({
    await client.graphql({
      query: deleteNoteMutation,
      variables: { input: { id } },
    });
  }

  // Hakuto start
  ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
  );

  class DeviceData {
    constructor(deviceId) {
      this.deviceId = deviceId;
      this.maxLen = maxLenDisplay;
//      this.maxLen = 50;
      this.timeData = new Array(this.maxLen);
      this.temperatureData = new Array(this.maxLen);
      this.humidityData = new Array(this.maxLen);
    }

    resetData() {
      this.timeData.length = 0;
      this.temperatureData.length = 0;
      this.humidityData.length = 0;
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
  /*
  class TrackedDevices {
    constructor() {
      this.devices = [];
    }

    // Find a device based on its Id
    findDevice(deviceId) {
      console_logger.warn('TrackedDevices.findDevice(): deviceId ', deviceId);
      console_logger.warn('TrackedDevices.findDevice(): this.devices ', this.devices);
      for (let i = 0; i < this.devices.length; ++i) {
        console_logger.warn('TrackedDevices.findDevice(): this.devices.length ', this.devices.length, ' i ', i);
        if (this.devices[i].deviceId === deviceId) {
          console_logger.warn('TrackedDevices.findDevice(): before return. i ', i, ' this.devices[i] ', this.devices[i]);
          return this.devices[i];
        }
      }

      return undefined;
    }

    getDevicesCount() {
      return this.devices.length;
    }
  }
  */

  //const trackedDevices = new TrackedDevices();

  /*
  var maxLen = 50;
  var labels = new Array(maxLen);
  var data0s = new Array(maxLen);
  var data1s = new Array(maxLen);
  */

  labels = [0, 1, 2];
  data0s = [3, 13, 23];
  data1s = [7, 17, 27];

  // Define the chart axes
  /*
  const chartData = {
    labels: labels,
    datasets: [
      {
        //fill: false,
        label: 'Temperature',
        //yAxisID: 'Temperature',
        borderColor: 'rgba(255, 204, 0, 1)',
        //pointBoarderColor: 'rgba(255, 204, 0, 1)',
        backgroundColor: 'rgba(255, 204, 0, 0.4)',
        //pointHoverBackgroundColor: 'rgba(255, 204, 0, 1)',
        //pointHoverBorderColor: 'rgba(255, 204, 0, 1)',
        //spanGaps: true,
        data: data0s
      },
      {
        //fill: false,
        label: 'Humidity',
        //yAxisID: 'Humidity',
        borderColor: 'rgba(24, 120, 240, 1)',
        //pointBoarderColor: 'rgba(24, 120, 240, 1)',
        backgroundColor: 'rgba(24, 120, 240, 0.4)',
        //pointHoverBackgroundColor: 'rgba(24, 120, 240, 1)',
        //pointHoverBorderColor: 'rgba(24, 120, 240, 1)',
        //spanGaps: true,
        data: data1s
      }
    ]
  };
  */

  const chartOptions = {
    options: {
      responsive: true,
      plugins: {
        title: {
          display: true,
          text: 'Min and Max Settings'
        }
      },
      scales: {
        y: {
          min: 0,
          max: 200,
        }
      }
    }
    /*
    options: {
      scales: {
        'Temperature': {
          type: 'linear',
          min: 0,
          max: 100,
          position: 'left'
        },
        'Humidity': {
          type: 'linear',
          min: 0,
          max: 200,
          position: 'right'
        }
      }
    }
    */
    /*
    options: {
      scales: {
        yAxes: [
          {
            id: 'Temperature',
            type: 'linear',
            scaleLabel: {
              labelString: 'Temperature (C)',
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
          }
        ]
      }
    }
    */
    /*
    options: {
      scales: {
        x: {
          type: "time",
          ticks: {
            autoSkip: true,
            maxTicksLimit: 20,
          },
          display: true,
          scaleLabel: {
            display: true,
            labelString: "Point"
          }
        },
        y: {
          display: true,
          scaleLabel: {
            display: true,
            labelString: "Value"
          },
          suggestedMin: 0,
          suggestedMax: 100
        }
      }
    }
    */
    /*
    scales: {
      yAxes: [{
        id: 'Temperature',
        type: 'linear',
        scaleLabel: {
          labelString: 'Temperature (C)',
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
    */
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

  //let needsAutoSelect = true;
  const deviceCount = document.getElementById('deviceCount');
  console_logger.info('deviceCount -->')
  console_logger.info(deviceCount)
  const listOfDevices = document.getElementById('listOfDevices');
  console_logger.info('listOfDevices -->')
  console_logger.info(listOfDevices)
  function OnSelectionChange() {
    console_logger.warn('OnSelectionChange(): In.  listOfDevices.selectedIndex ', listOfDevices.selectedIndex);
    g_selectedIndex = listOfDevices.selectedIndex;
    console_logger.warn('OnSelectionChange(): In.  g_selectedIndex ', g_selectedIndex);
    console_logger.warn('OnSelectionChange(): In.  trackedDevices.devices ', trackedDevices.devices);
    //const device = trackedDevices.findDevice(listOfDevices[listOfDevices.selectedIndex].text);
    const device = trackedDevices.devices[listOfDevices.selectedIndex];
    console_logger.warn('OnSelectionChange(): device ', device);
    //chartData.labels = structuredClone(device.timeData);
    labels = structuredClone(device.timeData);
    console_logger.warn('OnSelectionChange(): device.timeData ', device.timeData);
    //chartData.datasets[0].data = structuredClone(device.temperatureData);
    data0s = structuredClone(device.temperatureData);
    console_logger.warn('OnSelectionChange(): device.temperatureData ', device.temperatureData);
    //chartData.datasets[1].data = structuredClone(device.humidityData);
    data1s = structuredClone(device.humidityData);
    console_logger.warn('OnSelectionChange(): device.humidityData ', device.humidityData);
    /*
    for(let i = 0; i < maxLen; ++i) {
      chartData.labels[i] = device.timeData[i];
      chartData.datasets[0].data[i] = device.temperatureData[i];
      chartData.datasets[1].data[i] = device.humidityData[i];
    }
    */
    //console_logger.warn('OnSelectionChange(): chartData.labels ', chartData.labels);
    console_logger.warn('OnSelectionChange(): labels ', labels);
    //console_logger.warn('OnSelectionChange(): chartData.datasets[0].data ', chartData.datasets[0].data);
    console_logger.warn('OnSelectionChange(): data0s ', data0s);
    //console_logger.warn('OnSelectionChange(): chartData.datasets[1].data ', chartData.datasets[1].data);
    console_logger.warn('OnSelectionChange(): data1s ', data1s);
    
    //myLineChart.update();
  }

//  listOfDevices.addEventListener('change', OnSelectionChange, false);
  listOfDevices.addEventListener('change', fetchNotes, false);
//  listOfDevices.addEventListener('change', setNotes, false);

  // When a web socket message arrives:
  // 1. Unpack it
  // 2. Validate it has date/time and temperature
  // 3. Find or create a cached device to hold the telemetry data
  // 4. Append the telemetry data
  // 5. Update the chart UI
  async function onMessage(notesFromAPI) {
//  function onMessage(notesFromAPI) {

//    fetchNote('dummy001');  // want to get data for each ID.

    const numOfNotesTotal = notesFromAPI.length;
    console_logger.warn('onMessage(): numOfNotesTotal ', numOfNotesTotal);

    var separatorOfNotes = [];

    for(let i = 0; i < numOfNotesTotal; ++i) {
      if(i == 0) {
        separatorOfNotes.push(0);
        continue;
      }
      if(notesFromAPI[i].id !== notesFromAPI[i - 1].id) {
        separatorOfNotes.push(i);
      }
    }

    console_logger.warn('onMessage(): separatorOfNotes ', separatorOfNotes);
    console_logger.warn('onMessage(): separatorOfNotes.length ', separatorOfNotes.length);

    const numOfSeparator = separatorOfNotes.length
    console_logger.warn('onMessage(): numOfSeparator ', numOfSeparator);
    for(let i = 0; i < numOfSeparator; ++i) {
      console_logger.warn('onMessage(): Loop of numOfSeparator for id  i ', i, ' separatorOfNotes[i] ', separatorOfNotes[i], 'notesFromAPI[separatorOfNotes[i]].id ', notesFromAPI[separatorOfNotes[i]].id);
    }

    var numOfNotes = [];
    for(let i = 0; i < numOfSeparator; ++i) {
      if(i == numOfSeparator - 1) {
        numOfNotes.push(numOfNotesTotal - separatorOfNotes[i]);
      }
      else {
        numOfNotes.push(separatorOfNotes[i + 1] - separatorOfNotes[i]);
      }
    }
    console_logger.warn('onMessage(): numOfNotes.length ', numOfNotes.length);
    console_logger.warn('onMessage(): numOfNotes ', numOfNotes);

    console_logger.warn('onMessage(): Before numOfSeparator loop. trackedDevices ', trackedDevices);
    for(let i = 0; i < numOfSeparator; ++i) {
      if(i >= numOfCreatedDevices) {
        var id = notesFromAPI[separatorOfNotes[i]].id;
        const newDeviceData = new DeviceData(id);
        trackedDevices.devices.push(newDeviceData);
        console_logger.warn('onMessage(): After trackedDevices.devices.push(). newDeviceData ', newDeviceData);
    
        // add device to the UI list
        const node = document.createElement('option');
        const nodeText = document.createTextNode(id);
        node.appendChild(nodeText);
        listOfDevices.appendChild(node);

        let filter = {    // Hakuto. for debug only.
// NG          id: { not: "dummy2" },
// NG          id: { not: ["dummy2"] },
// NG          id: { eq: ["dummy2"] },
// NG          date: "2024-02-06T06:40:44.254Z",
// OK          date: { between: ["2023-12-15T04:26:45.800Z", "2023-12-15T04:31:16.900Z"] },
//          date: { ge: "2024-02-20T08:58:26.505Z" },
// OK          temp: { ge: 60.0 },
// OK          createdAt: { ge: "2024-02-21T04:20:43.031Z" },
          nickname: { eq: "neqto-disco2" },
        }

        const apiData2 = await client.graphql({
          query: listNotes,
//          variables: { input: { id } },
//          variables: { filter: { filter } },
//          variables: { filter: filter },
// NG          variables: { filter: filter, sortDirection: "ASC" },
// OK          variables: { id: "multi001", sortDirection: "ASC" },
          variables: { limit: 1000 },
        });   // Hakuto. for debug only.
        console_logger.warn('onMessage(): After client.graphql() apiData2 --> ', apiData2);  // Hakuto. for debug only.

        const apiData3 = await client.graphql({
          query: listNotes,
// NG          variables: { filter: filter, sortDirection: "DESC" },
// OK          variables: { id: "multi001", sortDirection: "DESC" },
          variables: { id: "multi001", sortDirection: "DESC", filter: filter },
        });   // Hakuto. for debug only.
        console_logger.warn('onMessage(): After client.graphql() apiData3 --> ', apiData3);  // Hakuto. for debug only.

        numOfCreatedDevices++;
      }
    }

    const numDevices = trackedDevices.getDevicesCount();
    console_logger.warn('onMessage(): numDevices ', numDevices);
    
    deviceCount.innerText = numDevices === 1 ? `${numDevices} device` : `${numDevices} devices`;
    console_logger.warn('onMessage(): deviceCount.innerText ', deviceCount.innerText);
    
    let k = 0;
    for(let i = 0; i < numOfSeparator; ++i) {     // Loop for Devices.
      trackedDevices.devices[i].resetData();
      g_devices[i] = trackedDevices.devices[i];
      for(let j = 0; j < numOfNotes[i]; ++j) {    // Loop for Notes of each Device.
        trackedDevices.devices[i].addData(notesFromAPI[k].date, notesFromAPI[k].temp, notesFromAPI[k].humi);
        //console_logger.warn('onMessage(): Loop of k.  k ', k, ' id ', notesFromAPI[k].id, ' date ', notesFromAPI[k].date, ' temp ', notesFromAPI[k].temp, ' humi ', notesFromAPI[k].humi);
        k++;
      }
      console_logger.warn('onMessage(): i Loop of numOfSeparator.  i ', i, ' trackedDevices.devices[i] ', trackedDevices.devices[i]);;
    }
    console_logger.warn('onMessage(): g_devices ', g_devices);

    // if this is the first device being discovered, auto-select it
    if(needsAutoSelect) {
      needsAutoSelect = false;
      listOfDevices.selectedIndex = 0;
      /*
      console_logger.warn('onMessage(): before OnSelectionChange()');
      OnSelectionChange();
      console_logger.warn('onMessage(): after OnSelectionChange()');
      */
    }

    OnSelectionChange();

//    try {
//      //const messageData = JSON.parse(message.data);
//      //console.log(messageData);
//
//      //// time and either temperature or humidity are required
//      //if (!messageData.MessageDate || (!messageData.IotData.temperature && !messageData.IotData.humidity)) {
//      //  return;
//      //}
//
//      // find or add device to list of tracked devices
//      const existingDeviceData = trackedDevices.findDevice(notesFromAPI[0].id/*messageData.DeviceId*/);
//
//      if (existingDeviceData) {
//        existingDeviceData.addData(notesFromAPI[0].date/*messageData.MessageDate*/, notesFromAPI[0].temp/*messageData.IotData.temperature*/, notesFromAPI[0].humi/*messageData.IotData.humidity*/);
//      }
//      else {
//        const newDeviceData = new DeviceData(notesFromAPI[0].id/*messageData.DeviceId*/);
//        trackedDevices.devices.push(newDeviceData);
//        const numDevices = trackedDevices.getDevicesCount();
//        deviceCount.innerText = numDevices === 1 ? `${numDevices} device` : `${numDevices} devices`;
//        newDeviceData.addData(notesFromAPI[0].date/*messageData.MessageDate*/, notesFromAPI[0].temp/*messageData.IotData.temperature*/, notesFromAPI[0].humi/*messageData.IotData.humidity*/);
//
//        // add device to the UI list
//        const node = document.createElement('option');
//        const nodeText = document.createTextNode(notesFromAPI[0].id/*messageData.DeviceId*/);
//        node.appendChild(nodeText);
//        listOfDevices.appendChild(node);
//
//        // if this is the first device being discovered, auto-select it
//        if (needsAutoSelect) {
//          needsAutoSelect = false;
//          listOfDevices.selectedIndex = 0;
//          OnSelectionChange();
//        }
//      }
//
//      //myLineChart.update();
//    }
//    catch (err) {
//      console.error(err);
//    }
  };
  // Hakuto end

  // Hakuto start

  //console_logger.warn('before App rutern. 0: chartOptions ', chartOptions, ' chartData ', chartData);
  console_logger.warn('before App rutern. 0: trackedDevices ', trackedDevices);
  console_logger.warn('before App rutern. 0: g_devices ', g_devices);

  if(g_devices.length) {
    let device2 = g_devices[0];
    console_logger.warn('before App rutern. 0: device2 ', device2, ' needsAutoSelect ', needsAutoSelect, ' listOfDevices ', listOfDevices);
    if(!needsAutoSelect) {
//      device2 = g_devices[listOfDevices.selectedIndex];
      console_logger.warn('before App rutern. 0: g_selectedIndex ', g_selectedIndex);
      device2 = g_devices[g_selectedIndex];
    }
    console_logger.warn('before App rutern. 0b: device2 ', device2);
  
    labels = structuredClone(device2.timeData);
    console_logger.warn('before App rutern. 0b: device2.timeData ', device2.timeData);
    data0s = structuredClone(device2.temperatureData);
    console_logger.warn('before App rutern. 0b: device2.temperatureData ', device2.temperatureData);
    data1s = structuredClone(device2.humidityData);
    console_logger.warn('before App rutern. 0b: device2.humidityData ', device2.humidityData);
  }

  /*
  if(g_devices.length) {
    labels = structuredClone(g_devices[0].timeData);
    console_logger.warn('before App rutern. 0b: g_devices[0].timeData ', g_devices[0].timeData);
    data0s = structuredClone(g_devices[0].temperatureData);
    console_logger.warn('before App rutern. 0b: g_devices[0].temperatureData ', g_devices[0].temperatureData);
    data1s = structuredClone(g_devices[0].humidityData);
    console_logger.warn('before App rutern. 0b: g_devices[0].humidityData ', g_devices[0].humidityData);
  }
  */

  //labels = [3, 4, 5];
  //data0s = [23, 13, 3];
  //data1s = [27, 17, 27];

  console_logger.warn('before App rutern. 0b: labels ', labels, ' data0s ', data0s, ' data1s ', data1s);

  const chartData = {
    labels: labels,
    datasets: [
      {
        //fill: false,
        label: 'Temperature',
        //yAxisID: 'Temperature',
        borderColor: 'rgba(255, 204, 0, 1)',
        //pointBoarderColor: 'rgba(255, 204, 0, 1)',
        backgroundColor: 'rgba(255, 204, 0, 0.4)',
        //pointHoverBackgroundColor: 'rgba(255, 204, 0, 1)',
        //pointHoverBorderColor: 'rgba(255, 204, 0, 1)',
        //spanGaps: true,
        data: data0s
      },
      {
        //fill: false,
        // label: 'Humidity',
        label: 'General data',
        //yAxisID: 'Humidity',
        borderColor: 'rgba(24, 120, 240, 1)',
        //pointBoarderColor: 'rgba(24, 120, 240, 1)',
        backgroundColor: 'rgba(24, 120, 240, 0.4)',
        //pointHoverBackgroundColor: 'rgba(24, 120, 240, 1)',
        //pointHoverBorderColor: 'rgba(24, 120, 240, 1)',
        //spanGaps: true,
        data: data1s
      }
    ]
  };

  console_logger.warn('before App rutern. 1: chartOptions ', chartOptions, ' chartData ', chartData);
  
  labels = [6, 7, 8];
  data0s = [53, 13, 93];
  data1s = [87, 17, 47];
  
  console_logger.warn('before App rutern. 2: chartOptions ', chartOptions, ' chartData ', chartData);
  // Hakuto end
  
  // Hakuto about "Line"
  return (
    <View className="App">
      <Line options={chartOptions} data={chartData} />
    
      <Heading level={1}>My Notes App</Heading>
      <View as="form" margin="3rem 0" onSubmit={createNote}>
        <Flex direction="row" justifyContent="center">
          <TextField
            name="id"
            placeholder="Id"
            label="Id"
            labelHidden
            variation="quiet"
            //required  // Hakuto
          />
          <TextField
            name="date"
            placeholder="Date"
            label="Date"
            labelHidden
            variation="quiet"
            //required  // Hakuto
          />
          <TextField
            name="nickname"
            placeholder="Nickname"
            label="Nickname"
            labelHidden
            variation="quiet"
            //required  // Hakuto
          />
          {/*
          <TextField
            name="send_cnt"
            placeholder="Send_cnt"
            label="Send_cnt"
            labelHidden
            variation="quiet"
            //required  // Hakuto
          />
          */}
          {/*
          <TextField
            //name="magx"
            //placeholder="Magx"
            //label="Magx"
            //labelHidden
            //variation="quiet"
            //required  // Hakuto
          />
          */}
          {/*
          <TextField
            name="magy"
            placeholder="Magy"
            label="Magy"
            labelHidden
            variation="quiet"
            //required  // Hakuto
          />
          */}
          {/*
          <TextField
            name="magz"
            placeholder="Magz"
            label="Magz"
            labelHidden
            variation="quiet"
            //required  // Hakuto
          />
          */}
          {/*
          <TextField
            name="degree"
            placeholder="Degree"
            label="Degree"
            labelHidden
            variation="quiet"
            //required  // Hakuto
          />
          */}
          {/*
          <TextField
            name="distance"
            placeholder="Distance"
            label="Distance"
            labelHidden
            variation="quiet"
            //required  // Hakuto
          />
          */}
          {/*
          <TextField
            name="pres"
            placeholder="Pres"
            label="Pres"
            labelHidden
            variation="quiet"
            //required  // Hakuto
          />
          */}
          {/*
          <TextField
            name="temp"
            placeholder="Temp"
            label="Temp"
            labelHidden
            variation="quiet"
            //required  // Hakuto
          />
          */}
          {/*
          <TextField
            name="humi"
            placeholder="Humi"
            label="Humi"
            labelHidden
            variation="quiet"
            //required  // Hakuto
          />
          */}
          
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
//            justifyContent="center"
            justifyContent="flex-start"
            alignItems="center"
          >
            <Text as="strong" fontWeight={700}>{note.id}</Text>
            <Text as="span">{note.date}</Text>
            <Text as="span">{note.send_cnt}</Text>
            <Text as="span">{note.magx}</Text>
            <Text as="span">{note.magy}</Text>
            <Text as="span">{note.magz}</Text>
            <Text as="span">{note.degree}</Text>
            <Text as="span">{note.distance}</Text>
            <Text as="span">{note.pres}</Text>
            <Text as="span">{note.temp}</Text>
            {/*<Text as="span">{note.humi}</Text>*/}
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