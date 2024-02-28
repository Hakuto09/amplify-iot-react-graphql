import React, { useState, useEffect } from "react";

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

const client = generateClient();

var g_devices = [];
var maxLenList = 1000;
var maxLenGraph = 50;
var labels = new Array(maxLenGraph);
var data0s = new Array(maxLenGraph);
var data1s = new Array(maxLenGraph);

let numOfDevices = 0;
//let displayRegisters = true;
let completeFetchReg = false;
let completeFetchReg2 = false;
let completeFetchData = false;
let deviceNames = [];

let sleep_cnt = 0;

// All the devices in the list (those that have been sending telemetry)
class TrackedDevices {
  constructor() {
    this.devices = [];
  }

  getDevicesCount() {
    return this.devices.length;
  }
}

const trackedDevices = new TrackedDevices();
var numOfCreatedDevices = 0;
let needsAutoSelect = true;
var g_selectedIndex = -1/*0*/;


console_logger.warn('Before App.');  // Hakuto

//const App = ({ signOut }) => {
const App = async ({ signOut }) => {
    console_logger.warn('App() In');  // Hakuto

  const [notes, setNotes] = useState([]);

  useEffect(() => {
    fetchNotes(true);
  }, []);

  async function fetchNotes(displayRegisters) {
    console_logger.warn('fetchNotes(): In:', ' displayRegisters ', displayRegisters);

    let wait_ms = 5000;
    setTimeout(
      console_logger.warn('fetchNotes(): setTimeout(): wait_ms ', wait_ms),
      wait_ms
    );

    /*
    // for debug only.
    let cnt_debug = 0;
    for(let j = 0; j < 10000; ++j) {
      for(let i = 0; i < 1000000; ++i) {
        cnt_debug++;
      }
    }
    console_logger.warn('fetchNotes(): After cnt_debug loop:', ' cnt_debug ', cnt_debug, ' displayRegisters ', displayRegisters);
    */

    var notesFromAPI = [];
    var idForSort = "";
    let sortDirection = "";
    let filter = {};
    var nextToken = null;
    var limit = 200;

    if(displayRegisters == true) {
      idForSort = "register";
      sortDirection = "ASC";
    }
    else {
      if(completeFetchReg == false) {
        console_logger.warn('fetchNotes(): Before return by if(completeFetchReg == false):', ' displayRegisters ', displayRegisters);
        return;
      }

      if(g_selectedIndex === listOfDevices.selectedIndex) {
        // for debug only.
        let cnt_debug3 = 0;
        console_logger.warn('fetchNotes(): Before cnt_debug3 loop:', ' cnt_debug3 ', cnt_debug3, ' displayRegisters ', displayRegisters);
        for(let j = 0; j < 10000; ++j) {
          for(let i = 0; i < 1000000; ++i) {
            cnt_debug3++;
          }
        }
        console_logger.warn('fetchNotes(): After cnt_debug3 loop:', ' cnt_debug3 ', cnt_debug3, ' displayRegisters ', displayRegisters);
        console_logger.warn('fetchNotes(): Before return by if(g_selectedIndex === listOfDevices.selectedIndex):', ' displayRegisters ', displayRegisters);
        return;
      }
      else {
        g_selectedIndex = listOfDevices.selectedIndex;
      }

      idForSort = "multi001";
      sortDirection = "DESC";
      filter = { nickname: { eq: deviceNames[g_selectedIndex] } };
      console_logger.warn('fetchNotes(): After filter input:', ' flter ', filter, ' deviceNames[g_selectedIndex] ', deviceNames[g_selectedIndex], ' g_selectedIndex ', g_selectedIndex, ' displayRegisters ', displayRegisters);
    }

    while(1) {
      console_logger.warn('fetchNotes(): Before graphql(listNotes): ', ' displayRegisters ', displayRegisters, ' idForSort ', idForSort, ' sortDirection ', sortDirection, ' filter ', filter, ' nextToken ', nextToken, ' limit ', limit);
      let apiData = [];
      apiData = await client.graphql({
        query: listNotes,
        variables: { id: idForSort, sortDirection: sortDirection, filter: filter, limit: limit, nextToken: nextToken },
      });
      console_logger.warn('fetchNotes(): After graphql(listNotes):', ' displayRegisters ', displayRegisters, ' apiData ', apiData);
      
      // for debug only.
      let cnt_debug2 = 0;
      console_logger.warn('fetchNotes(): Before cnt_debug2 loop:', ' cnt_debug2 ', cnt_debug2, ' displayRegisters ', displayRegisters);
      for(let j = 0; j < 10000; ++j) {
        for(let i = 0; i < 1000000; ++i) {
          cnt_debug2++;
        }
      }
      console_logger.warn('fetchNotes(): After cnt_debug2 loop:', ' cnt_debug2 ', cnt_debug2, ' displayRegisters ', displayRegisters);

      Array.prototype.push.apply(notesFromAPI, apiData.data.listNotes.items);
      nextToken = apiData.data.listNotes.nextToken;
      if(!nextToken || notesFromAPI.length > maxLenList - limit) break;
    }

    console_logger.warn('fetchNotes(): After while loop of client.graphql(listNotes):', ' displayRegisters ', displayRegisters, ' notesFromAPI ', notesFromAPI)

    setNotes(notesFromAPI);
    console_logger.warn('fetchNotes(): After setNotes():', ' displayRegisters ', displayRegisters, ' notesFromAPI ', notesFromAPI)

    onMessage(notesFromAPI, displayRegisters);

    if(displayRegisters == true) {
      completeFetchReg = true;
      completeFetchReg2 = true;
    }
    else {
      completeFetchData = true;
    }
  }

  async function createNote(event) {
    event.preventDefault();
    const form = new FormData(event.target);
    const d = ('000' + numOfDevices).slice(-3);
    const newDateForResister = "1970-01-01T00:00:00." + d + "Z"
    console_logger.warn('createNote(): After newDateForResister:  d ', d, ' newDateForResister ', newDateForResister)
    const data = {
//      id: form.get("id"),
      id: "register",
//      date: form.get("date"),
      date: newDateForResister, 
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

    console_logger.warn('createNote(): Before graphql(query: createNoteMutation):  data ', data);
    //    await API.graphql({
    const apiDataCreate = await client.graphql({
      query: createNoteMutation,
      variables: { input: data },
    });
    console_logger.warn('createNote(): After graphql(query: createNoteMutation):  apiDataCreate ', apiDataCreate);

    fetchNotes(true);

    console_logger.warn('createNote(): Before numOfDevices++:  numOfDevices ', numOfDevices);
    numOfDevices++;
    console_logger.warn('createNote(): After numOfDevices++:  numOfDevices ', numOfDevices);
    event.target.reset();
  }

//  async function deleteNote({ id }) {
  async function deleteNote({ id, date }) {
//    console_logger.warn('deleteNote(): Before notes.filter() id ', id, ' notes ', notes)
    console_logger.warn('deleteNote(): Before notes.filter() id ', id, ' date ', date, ' notes ', notes)
    const newNotes = notes.filter((note) => note.id !== id);
    console_logger.warn('deleteNote(): After notes.filter() newNotes --> ', newNotes)
    const newNotes2 = notes.filter((note) => note.date !== date);
    console_logger.warn('deleteNote(): After notes.filter() newNotes2 --> ', newNotes2)
    const newNotes3 = notes.filter((note) => note.id === id && note.date !== date);
    console_logger.warn('deleteNote(): After notes.filter() newNotes3 --> ', newNotes3)

    console_logger.warn('deleteNote(): Before setNotes() id ', id, ' date ', date, ' notes ', notes)
//    setNotes(newNotes);
    setNotes(newNotes3);
    console_logger.warn('deleteNote(): After setNotes() id ', id, ' date ', date, ' notes ', notes)

    //    await API.graphql({
    const apiDataDelete = await client.graphql({
      query: deleteNoteMutation,
//      variables: { input: { id } },
      variables: { input: { id, date } },
    });

    console_logger.warn('deleteNote(): After client.graphql(deleteNoteMutation) apiDataDelete --> ', apiDataDelete)

    fetchNotes(false);
    console_logger.warn('deleteNote(): After fetchNotes() ')
  }

  ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
  );

/*
  class DeviceData {
    constructor(deviceId) {
      this.deviceId = deviceId;
      this.maxLen = maxLenGraph;
//      this.maxLen = 50;
      this.timeData = new Array(this.maxLen);
      this.temperatureData = new Array(this.maxLen);
      this.generalData00 = new Array(this.maxLen);
    }

    resetData() {
      this.timeData.length = 0;
      this.temperatureData.length = 0;
      this.generalData00.length = 0;
    }

    addData(time, temperature, humidity) {
      this.timeData.push(time);
      this.temperatureData.push(temperature);
      this.generalData00.push(humidity || null);

      if(this.timeData.length > this.maxLen) {
        this.timeData.shift();
        this.temperatureData.shift();
        this.generalData00.shift();
      }
    }
  }
*/

/*
  labels = [0, 1, 2];
  console_logger.warn('App(): After labels input0:', ' labels ', labels);
  data0s = [3, 13, 23];
  console_logger.warn('App(): After data0s input0:', ' data0s ', data0s);
  data1s = [7, 17, 27];
  console_logger.warn('App(): After data1s input0:', ' data1s ', data1s);
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
  };

/*
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
    console_logger.warn('OnSelectionChange():  ', labels);
    //chartData.datasets[0].data = structuredClone(device.temperatureData);
    data0s = structuredClone(device.temperatureData);
    console_logger.warn('OnSelectionChange(): device.temperatureData ', device.temperatureData);
    console_logger.warn('OnSelectionChange(): data0s ', data0s);
    //chartData.datasets[1].data = structuredClone(device.generalData00);
    data1s = structuredClone(device.generalData00);
    console_logger.warn('OnSelectionChange(): device.generalData00 ', device.generalData00);
    console_logger.warn('OnSelectionChange(): data1s ', data1s);
    
    //myLineChart.update();
  }
*/

  // When a web socket message arrives:
  // 1. Unpack it
  // 2. Validate it has date/time and temperature
  // 3. Find or create a cached device to hold the telemetry data
  // 4. Append the telemetry data
  // 5. Update the chart UI
  async function onMessage(notesFromAPI, displayRegisters) {

    console_logger.warn('onMessage(): In:', ' displayRegisters ', displayRegisters);

    const numOfNotesTotal = notesFromAPI.length;
    if(displayRegisters == true) {
      numOfDevices = numOfNotesTotal;
      deviceCount.innerText = numOfDevices === 1 ? `${numOfDevices} device` : `${numOfDevices} devices`;
      console_logger.warn('onMessage(): deviceCount.innerText ', deviceCount.innerText);

      for(let i = 0; i < numOfDevices; ++i) {
        var deviceName = notesFromAPI[i].nickname;

        // add device name to the UI list.
        const device = document.createElement('option');
        const deviceText = document.createTextNode(deviceName);
        device.appendChild(deviceText);
        listOfDevices.appendChild(device);
        console_logger.warn('onMessage(): After listOfDevices.appendChild(device):');

        // add device name to array.
        deviceNames.push(deviceName);
        console_logger.warn('onMessage(): After deviceNames.push():', ' i ', i, ' deviceName ', deviceName, ' deviceText ', deviceText, ' deviceNames ', deviceNames);
      }
    }
    console_logger.warn('onMessage(): numOfNotesTotal ', numOfNotesTotal);

    for(let i = 0; i < numOfNotesTotal; ++i) {
      labels[i] = notesFromAPI[i].date;
      data0s[i] = notesFromAPI[i].temp;
      data1s[i] = notesFromAPI[i].general_data00;
    }

    console_logger.warn('onMessage(): After labels input loop:', ' labels ', labels);
    console_logger.warn('onMessage(): After data0s input loop:', ' data0s ', data0s);
    console_logger.warn('onMessage(): After data1s input loop:', ' data1s ', data1s);
  
/*
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

        numOfCreatedDevices++;
      }
    }

    let numDevices = trackedDevices.getDevicesCount();
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
*/

    // if this is the first device being discovered, auto-select it
/*
    if(needsAutoSelect) {
      needsAutoSelect = false;
      listOfDevices.selectedIndex = 0;
    }
*/
//    OnSelectionChange();
  };

/*
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
    data1s = structuredClone(device2.generalData00);
    console_logger.warn('before App rutern. 0b: device2.generalData00 ', device2.generalData00);
  }
*/

  console_logger.warn('App(): before rutern. 0b: labels ', labels, ' data0s ', data0s, ' data1s ', data1s);

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

  console_logger.warn('App(): before rutern. 1: chartOptions ', chartOptions, ' chartData ', chartData);
 
  /*
  labels = [6, 7, 8];
  console_logger.warn('App(): After labels input1:', ' labels ', labels);
  data0s = [53, 13, 93];
  console_logger.warn('App(): After data0s input1:', ' data0s ', data0s);
  data1s = [87, 17, 47];
  console_logger.warn('App(): After data1s input1:', ' data1s ', data1s);
  */

  /*
  async function wait(msecond) {
    return new Promise(resolve => setTimeout(resolve, msecond));
  }

  async function waitWrap(msecond) {
    await wait(msecond);
  }

  console_logger.warn("App(): Before waitWrap(): 3秒後にログを表示します。");
  waitWrap(3000);
  console_logger.warn("App(): After waitWrap(): 3秒経過しました。");
  */

  /*
  // setIntervalを使う方法
  function sleep(waitSec, cnt, callbackFunc) {

    // 経過時間（秒）
    var spanedSec = 0;

    // 1秒間隔で無名関数を実行
    var id = setInterval(function () {

      spanedSec++;

      // 経過時間 >= 待機時間の場合、待機終了。
      if (spanedSec >= waitSec) {

          // タイマー停止
          clearInterval(id);

          // 完了時、コールバック関数を実行
          if (callbackFunc) callbackFunc(cnt, waitSec);
      }
    }, 1000);
  }
  */

  /*
  console_logger.warn("App(): Before sleep() with setInterval and clearInterval:", ' sleep_cnt ', sleep_cnt);
  const wsec = 60;
  sleep(wsec, sleep_cnt++, function (cnt, waitSec) {
    console_logger.warn("App(): After sleep() with setInterval and clearInterval:",  ' cnt ', cnt, ' waitSec ', waitSec);
  });
  */
  const _sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  let sleep_cnt_local = 0;
  console_logger.warn("App(): Before while sleep loop:", ' sleep_cnt ', sleep_cnt, ' sleep_cnt_local ', sleep_cnt_local, ' completeFetchReg2 ', completeFetchReg2, ' completeFetchData ', completeFetchData);
  if(sleep_cnt >= 2) {
    while(!completeFetchReg2 || !completeFetchData) {
      /*
      sleep(5, sleep_cnt, function (cnt) {
        console_logger.warn("App(): After sleep() with setInterval and clearInterval: 5秒経過しました", ' cnt ', cnt);
      });
      sleep(1, sleep_cnt, null);
      console_logger.warn("App(): After sleep():", ' sleep_cnt ', sleep_cnt, ' completeFetchReg2 ', completeFetchReg2, ' completeFetchData ', completeFetchData);
      */
      await _sleep(2000);
      sleep_cnt_local++;
    }
  }

  console_logger.warn("App(): After while sleep loop:", ' sleep_cnt ', sleep_cnt, ' sleep_cnt_local ', sleep_cnt_local, ' completeFetchReg2 ', completeFetchReg2, ' completeFetchData ', completeFetchData);
  sleep_cnt++;

  completeFetchReg2 = false;
  completeFetchData = false;

  // Manage a list of devices in the UI, and update which device data the chart is showing
  // based on selection

  //let needsAutoSelect = true;
  const deviceCount = document.getElementById('deviceCount');
  console_logger.warn('App(): After document.getElementById(\'deviceCount\'):', ' deviceCount ', deviceCount);

  const listOfDevices = document.getElementById('listOfDevices');
  console_logger.warn('App(): After document.getElementById(\'listOfDevices\'):', ' listOfDevices ', listOfDevices);

  if(needsAutoSelect) {
    needsAutoSelect = false;
    listOfDevices.selectedIndex = 0;
    console_logger.warn('App(): After listOfDevices.selectedIndex = 0:', ' needsAutoSelect ', needsAutoSelect, ' listOfDevices ', listOfDevices);

//    listOfDevices.addEventListener('change', fetchNotes(false), false);
//    console_logger.warn('App(): After listOfDevices.addEventListener():', ' needsAutoSelect ', needsAutoSelect, ' listOfDevices ', listOfDevices);
  }

//  listOfDevices.addEventListener('change', OnSelectionChange, false);
//  listOfDevices.addEventListener('change', setNotes, false);
  listOfDevices.addEventListener('change', fetchNotes(false), false);
  console_logger.warn('App(): After listOfDevices.addEventListener():', ' listOfDevices ', listOfDevices);

  console_logger.warn('App(): before rutern. 2: chartOptions ', chartOptions, ' chartData ', chartData);
  
  // Hakuto about "Line"
  return (
    <View className="App">
      <Line options={chartOptions} data={chartData} />
    
      {/*<Heading level={1}>My Notes App</Heading>*/}
      <View as="form" margin="3rem 0" onSubmit={createNote}>
        <Flex direction="row" justifyContent="center">
          {/*<TextField
            name="id"
            placeholder="Id"
            label="Id"
            labelHidden
            variation="quiet"
            //required  // Hakuto
          />*/}
          {/*<TextField
            name="date"
            placeholder="Date"
            label="Date"
            labelHidden
            variation="quiet"
            //required  // Hakuto
          />*/}
          <TextField
            name="nickname"
            placeholder="Nickname"
            label="Nickname"
            labelHidden
            variation="quiet"
            //required  // Hakuto
          />
          {/*<TextField
            name="send_cnt"
            placeholder="Send_cnt"
            label="Send_cnt"
            labelHidden
            variation="quiet"
            //required  // Hakuto
          />*/}
          {/*<TextField
            //name="magx"
            //placeholder="Magx"
            //label="Magx"
            //labelHidden
            //variation="quiet"
            //required  // Hakuto
          />*/}
          <Button type="submit" variation="primary">
           {/*Create Note*/}Register
          </Button>
        </Flex>
      </View>
      <Heading level={2}>Current {/*Notes*/}Data</Heading>
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
            <Text as="span">{note.nickname}</Text>
            <Text as="span">{note.send_cnt}</Text>
            {/*<Text as="span">{note.magx}</Text>*/}
            <Text as="span">{note.temp}</Text>
            {/*<Text as="span">{note.humi}</Text>*/}
            <Text as="span">{note.general_data00}</Text>
            {/*<Text as="span">{note.postType}</Text>*/}
            <Button variation="link" onClick={() => deleteNote(note)}>
              Delete {/*note*/}data
            </Button>
          </Flex>
        ))}
      </View>
      <Button onClick={signOut}>Sign Out</Button>
    </View>
  );
};

export default withAuthenticator(App);