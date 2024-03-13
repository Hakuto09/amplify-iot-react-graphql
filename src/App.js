import React, { useState, useEffect } from "react";
//import { ColumnDef, flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table';
import { ColumnDef, flexRender, getCoreRowModel, useReactTable } from 'react-table';

import 'chartjs-adapter-moment';
import moment from "moment";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale,
} from "chart.js";

import { Line } from "react-chartjs-2";

import 'flatpickr/dist/flatpickr.min.css'
import { Japanese } from 'flatpickr/dist/l10n/ja.js'
import Flatpickr from 'react-flatpickr'

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

/*
async function flatpickrInit() {
  const holidays = await fetchHolidays();
  flatpickr('#js-datepicker-5', {
    locale      : Japanese,
    dateFormat  : 'Y.m.d (D) H:i',
    defaultDate : minDate,
    minDate     : minDate,
    maxDate     : maxDate,
    enableTime  : true,
    minTime     : '09:00',
    maxTime     : '18:00',
    onDayCreate : (dObj, dStr, fp, dayElem) => {
      this.addHolidayClass(dayElem);
    }
  });
}

flatpickrInit();
*/

var fetchById = true;

var g_devices = [];
var maxLenList = 1000;
var maxLenGraph = 50;
//var labels = new Array(maxLenGraph);
var labels = [];
//var data0s = new Array(maxLenGraph);
var data0s = [];
//var data1s = new Array(maxLenGraph);
var data1s = [];

let numOfDevices = 0;
let g_displayRegisters = true;
let completeFetchReg = false;
let completeFetchReg2 = false;
let completeFetchData = false;
let deviceNames = [];

//let sleep_cnt = 0;

// All the devices in the list (those that have been sending telemetry)
/*
class TrackedDevices {
  constructor() {
    this.devices = [];
  }

  getDevicesCount() {
    return this.devices.length;
  }
}
*/

//const trackedDevices = new TrackedDevices();
var numOfCreatedDevices = 0;
let needsAutoSelect = true;
var g_selectedIndex = -1/*0*/;

console_logger.warn('Before App.');

const App = ({ signOut }) => {
//const App = async ({ signOut }) => {
  console_logger.warn('App() In');

  const [notes, setNotes] = useState([]);
  console_logger.warn('App() After useState():', ' notes ', notes);
  const [disableButtons, setDisableButtons] = useState(false);

  useEffect(() => {
    fetchNotes(true);
  }, []);

  const [start, setStart] = useState()
  /** 開始日の設定 */
  const start_option = {
      locale: Japanese,
      dateFormat: 'Y/m/d(D)',
      minDate: new Date(),
  }

  /**終了日の設定 */
  const end_option = {
      locale: Japanese,
      dateFormat: 'Y/m/d(D)',
      minDate: start,
  }
  
  function update(event) {
    setDisableButtons(true);
    event.preventDefault();
    fetchNotes(false);
    setDisableButtons(false);
    event.target.reset();
  }

  async function fetchNotes(displayRegisters) {
    console_logger.warn('fetchNotes(): In:', ' displayRegisters ', displayRegisters);

    var notesFromAPI = [];
    var idForSort = "";
    let sortDirection = "";
    let filter = {};
    var nextToken = null;
//    var limit = 200;
    var limit = 1000;

    if(displayRegisters == true) {
      idForSort = "register";
      sortDirection = "ASC";
    }
    else {
      if(completeFetchReg == false) {
        console_logger.warn('fetchNotes(): Before return by if(completeFetchReg == false):', ' displayRegisters ', displayRegisters);
        return;
      }

      /*
      if(g_selectedIndex === listOfDevices.selectedIndex) {
        console_logger.warn('fetchNotes(): Before return by if(g_selectedIndex === listOfDevices.selectedIndex):', ' displayRegisters ', displayRegisters);
        return;
      }
      else {
      */
        g_selectedIndex = listOfDevices.selectedIndex;
      /*
      }
      */

      sortDirection = "DESC";
      if(fetchById == true) {
        idForSort = deviceNames[g_selectedIndex];
      }
      else {
        idForSort = "multi001";
        filter = { nickname: { eq: deviceNames[g_selectedIndex] } };
      }
      console_logger.warn('fetchNotes(): After filter input:', ' flter ', filter, ' deviceNames[g_selectedIndex] ', deviceNames[g_selectedIndex], ' g_selectedIndex ', g_selectedIndex, ' displayRegisters ', displayRegisters);
    }

    while(1) {
      console_logger.warn('fetchNotes(): Before graphql(listNotes): ', ' displayRegisters ', displayRegisters, ' idForSort ', idForSort, ' sortDirection ', sortDirection, ' filter ', filter, ' nextToken ', nextToken, ' limit ', limit);
      let apiData = [];
      let variables = {};

      if(fetchById == true) {
        variables = { id: idForSort, sortDirection: sortDirection, limit: limit, nextToken: nextToken };
      }
      else {
        variables = { id: idForSort, sortDirection: sortDirection, filter: filter, limit: limit, nextToken: nextToken };
      }
      console_logger.warn('fetchNotes(): Before graphql(listNotes):', ' variables ', variables);

      apiData = await client.graphql({
        query: listNotes,
        variables: variables,
      });

      Array.prototype.push.apply(notesFromAPI, apiData.data.listNotes.items);
      nextToken = apiData.data.listNotes.nextToken;

      console_logger.warn('fetchNotes(): After graphql(listNotes) etc.:', ' displayRegisters ', displayRegisters, ' apiData ', apiData, ' notesFromAPI ', notesFromAPI, ' nextToken ', nextToken);

      if(notesFromAPI.length > maxLenList) {
        notesFromAPI.length = maxLenList;
      }

      if(!nextToken || notesFromAPI.length >= maxLenList) {
        break;
      }
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
    setDisableButtons(true);
    event.preventDefault();
    const form = new FormData(event.target);
    let deviceid;
    if(fetchById) {
      deviceid = form.get("device_id");
    }
    else {
      deviceid = form.get("nickname");
    }
    const deviceid_split = deviceid.split("_");
    const num_in_deviceid = Number(deviceid_split[1]);

//    if(num_in_deviceid !== NaN) {
    if(isNaN(num_in_deviceid)) {
      console_logger.warn('createNote(): After if(isNaN(num_in_deviceid)):', ' num_in_deviceid ', num_in_deviceid);
    }
    else {
  //      const d = ('000' + numOfDevices).slice(-3);
      const d = ('000' + num_in_deviceid).slice(-3);
      console_logger.warn('createNote(): Before newDateForResister:', ' d ', d, ' deviceid ', deviceid, ' deviceid_split ', deviceid_split, ' num_in_deviceid ', num_in_deviceid);
      const newDateForResister = "1970-01-01T00:00:00." + d + "Z"
      console_logger.warn('createNote(): After newDateForResister:', ' d ', d, ' newDateForResister ', newDateForResister);
      const data = {
//        id: form.get("id"),
        id: "register",
//        date: form.get("date"),
        date: newDateForResister, 
//        nickname: nickname,/
        nickname: deviceid,
//        send_cnt: form.get("send_cnt"),
//        magx: form.get("magx"),
//        magy: form.get("magy"),
//        magz: form.get("magz"),
//        degree: form.get("degree"),
//        distance: form.get("distance"),
//        pres: form.get("pres"),
//        temp: form.get("temp"),
//        humi: form.get("humi"),
        postType: 'OPEN',
      };

      console_logger.warn('createNote(): Before graphql(query: createNoteMutation):', ' data ', data);
      //    await API.graphql({
      const apiDataCreate = await client.graphql({
        query: createNoteMutation,
        variables: { input: data },
      });
      console_logger.warn('createNote(): After graphql(query: createNoteMutation):', ' apiDataCreate ', apiDataCreate);
    }

    g_displayRegisters = true;
    fetchNotes(g_displayRegisters);

//    console_logger.warn('createNote(): Before numOfDevices++:  numOfDevices ', numOfDevices);
//    numOfDevices++;
//    console_logger.warn('createNote(): After numOfDevices++:  numOfDevices ', numOfDevices);
    setDisableButtons(false);
    event.target.reset();
  }

//  async function deleteNote({ id }) {
  async function deleteNote({ id, date }) {
    setDisableButtons(true);
    console_logger.warn('deleteNote(): In:');
    // Use notes.filter. But is it necessary ?
//    console_logger.warn('deleteNote(): Before notes.filter() id ', id, ' notes ', notes)
    console_logger.warn('deleteNote(): Before notes.filter():', ' id ', id, ' date ', date, ' notes ', notes);
//    const newNotes = notes.filter((note) => note.id !== id);
//    console_logger.warn('deleteNote(): After notes.filter() newNotes --> ', newNotes)
//    const newNotes2 = notes.filter((note) => note.date !== date);
//    console_logger.warn('deleteNote(): After notes.filter() newNotes2 --> ', newNotes2)
    const newNotes3 = notes.filter((note) => note.id === id && note.date !== date);
    console_logger.warn('deleteNote(): After notes.filter():', ' newNotes3 ', newNotes3);

    console_logger.warn('deleteNote(): Before setNotes():', ' id ', id, ' date ', date, ' notes ', notes);
//    setNotes(newNotes);
    setNotes(newNotes3);
    console_logger.warn('deleteNote(): After setNotes():', ' id ', id, ' date ', date, ' notes ', notes);

    //    await API.graphql({
    const apiDataDelete = await client.graphql({
      query: deleteNoteMutation,
//      variables: { input: { id } },
      variables: { input: { id, date } },
    });

    console_logger.warn('deleteNote(): After client.graphql(deleteNoteMutation):', ' apiDataDelete ', apiDataDelete)

    fetchNotes(g_displayRegisters);
    console_logger.warn('deleteNote(): After fetchNotes():', ' g_displayRegisters ', g_displayRegisters);
    setDisableButtons(false);
  }

  ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    TimeScale
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

    // Graph data reset.
    labels = [];
    data0s = [];
    data1s = [];

    const numOfNotesTotal = notesFromAPI.length;
    console_logger.warn('onMessage(): numOfNotesTotal ', numOfNotesTotal);
    if(displayRegisters == true) {
      numOfDevices = numOfNotesTotal;
      deviceCount.innerText = numOfDevices === 1 ? `${numOfDevices} device` : `${numOfDevices} devices`;
      console_logger.warn('onMessage(): After deviceCount.innerText input:', ' deviceCount.innerText ', deviceCount.innerText, ' numOfDevices ', numOfDevices);

      // select box reset.
      let loops = listOfDevices.length;
      console_logger.warn('onMessage(): Before select box reset.:', ' loops ', loops, ' listOfDevices.length ', listOfDevices.length, ' listOfDevices ', listOfDevices);
      for(let i = loops - 1; i >= 0; --i) {
        console_logger.warn('onMessage(): Before listOfDevices.removeChild():', ' i ', i, ' listOfDevices ', listOfDevices);
        listOfDevices.removeChild(listOfDevices.options[i]);
        console_logger.warn('onMessage(): After listOfDevices.removeChild():', ' i ', i, ' listOfDevices ', listOfDevices);
      }

      // deviceNames reset.
      deviceNames = [];

      // add device name to the UI list.
      for(let i = 0; i < numOfDevices; ++i) {
        var deviceName = notesFromAPI[i].nickname;

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
    else {
      // add graph data.
      let loops = Math.min(numOfNotesTotal, maxLenGraph);
      console_logger.warn('onMessage(): Before graph data. input loop:', ' loops ', loops);
      for(let i = 0; i < loops; ++i) {
        let j = loops - i - 1;
//        const date = new Date();
//        const nowUnix = date.getTime();
//        labels[i] = notesFromAPI[j].date;
//        labels.push(notesFromAPI[j].date);
//        labels.push(notesFromAPI[j].date.substr(0, 10));
        let date_nt = notesFromAPI[j].date.replace('T', ' ');
//        let date_ntnz = date_nt.replace('Z', '');
        let date_nt_jst = date_nt.substr(0, 23);
//        let data0s_tmp = { x: date_ntnz, y: notesFromAPI[j].temp };

//        labels.push(date_ntnz);
        labels.push(date_nt_jst);
//        const moment = new Moment();
//        labels.push(moment.utc(nowUnix).format(moment.HTML5_FMT.DATETIME_LOCAL_MS));
//        data0s[i] = notesFromAPI[j].temp;
        data0s.push(notesFromAPI[j].temp);
//        data0s.push(data0s_tmp);
//        data1s[i] = notesFromAPI[j].general_data00;
        data1s.push(notesFromAPI[j].general_data00);
      }
      console_logger.warn('onMessage(): After graph data. input loop:', ' loops ', loops, ' labels ', labels, ' data0s ', data0s, ' data1s ', data1s);
    }
 
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

  const chartOptions = {
//    options: {
//      responsive: true,
      spanGaps: true,   //点をつなげる場合
      /*
      plugins: {
        title: {
          display: true,
          text: 'Min and Max Settings'
        }
      },
      */
      /*
      scales: {
        x: {
          scaleLabel: {
              display: true,
              labelString: '時刻'
          },
          type: 'time',
          time: {
              parser: 'YYYY-MM-DDTHH:mm:ss.SSSZ',
              unit: 'minutes',
              stepSize: 1,
              displayFormats: {
                  'minutes': 'mm分'
              }
          }
        },
        y: {
          min: 0,
          max: 200,
        },
      }
      */
      scales: {
        x: {
          type: 'time',
          time: {
//            parser: 'YYYY-MM-DDTHH:mm:ss.SSSZ',
//            parser: 'YYYY-MM-DDTHH:mm:ss.SSS',
//            parser: 'YYYY-MM-DD HH:mm:ss.SSS',
//            unit: 'week',
//            unit: 'day',
            unit: 'minute',
//            unit: 'min',
//            unit: 'seconds',
//            unit: 'second',
//            unit: 'ss',
//              unit: 'millisecond',
            displayFormats: {
//              week: 'yyyy-MM-dd'
//              day: 'yyyy-MM-DD'
//              min: 'YYYY-MM-DD HH:mm'
//              seconds: 'YYYY-MM-DDTHH:mm:ss'
//              second: 'h:mm:ss a'
//              ss: 'YYYY-MM-DD HH:mm:ss'
            }
          },
        }
      }
//    }
  };

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

//  const moment = new Moment();
//  console_logger.warn('App(): before rutern. 1:', ' moment1 ', moment("2010-10-20 4:30 +0000", "YYYY-MM-DD HH:mm Z"));
//  console_logger.warn('App(): before rutern. 1:', ' moment2ss ', moment("2010-10-20 4:30:50 +0000", "YYYY-MM-DD HH:mm:ss Z"));
//  console_logger.warn('App(): before rutern. 1:', ' moment3SSS ', moment("2010-10-20 4:30:50.123 +0000", "YYYY-MM-DD HH:mm:ss.SSS Z"));

  var m1 = moment("20150101", "YYYYMMDD"); // 第一引数：指定日時、第二引数：フォーマット
  var m1_output = m1.format('YYYY年MM月DD日 HH:mm:ss dddd');
  console_logger.warn('App(): before rutern. 1:', ' moment m1_output ', m1_output); // => 2015年01月01日 00:00:00 Thursday 

  var m2 = moment("1970-01-01 00:00:00", "YYYY-MM-DD HH:mm:ss");
  var m2_output = m2.format('YYYY年MM月DD日 HH:mm:ss');
  console_logger.warn('App(): before rutern. 1:', ' moment m2_output ', m2_output);
  
  var m3 = moment("1970-01-01 00:00:00.007", "YYYY-MM-DD HH:mm:ss.SSS");
  var m3_output = m3.format('YYYY年MM月DD日 HH:mm:ss.SSS');
  console_logger.warn('App(): before rutern. 1:', ' moment m3_output ', m3_output); // => 2015年01月01日 00:00:00 Thursday 


  console_logger.warn('App(): before rutern. 1:', ' chartOptions ', chartOptions, ' chartData ', chartData);

  /*
  const chartOptions2 = {
    spanGaps: true,   //点をつなげる場合
    scales: {
      x: {
        type: 'time',
        time: {
//          unit: 'week',    //週に線
          unit: 'day',
//          unit: 'yMDH',
//          unit: 'yMDHm',
          displayFormats: {
//            week: 'yyyy-MM-dd'
//            week: 'yyyy-MM-DD'
//            yMDHm: 'yyyy-MM-DD HH'
//            yMDHm: 'yyyy-MM-DD HH:mm'
          }
        },
      }
    }
  };
  */
  
  /*
  const values = [
    {x:"2020-02-01", y:100},
    {x:"2020-02-02", y:200},
    {x:"2020-02-03", y:300},
    {x:"2020-02-04", y:400},
    {x:"2020-02-07", y:200},
    {x:"2020-02-14", y:600},
  ];
  */
  /*
  const values = [
    {x:"2020-02-01 01:01:01", y:100},
    {x:"2020-02-02 02:02:02", y:200},
    {x:"2020-02-03 03:03:03", y:300},
    {x:"2020-02-04 04:04:04", y:400},
    {x:"2020-02-07 05:05:05", y:200},
    {x:"2020-02-14 06:06:06", y:600},
  ];
  */
  /*
  const values = [
    {x:"2020-02-01 01:01:01.111", y:100},
    {x:"2020-02-02 02:02:02.222", y:200},
    {x:"2020-02-03 03:03:03.333", y:300},
    {x:"2020-02-04 04:04:04.444", y:400},
    {x:"2020-02-07 05:05:05.555", y:200},
    {x:"2020-02-14 06:06:06.666", y:600},
  ];

  const chartData2 = {
    datasets: [{
      label: "値1",
      fill: false,
      borderColor: 'rgba(0, 0, 255, 0.5)',
      lineTension: 0.1,   //曲線にする度合
      data: values,
    }],
  };
  */

  /*
  const tableData2 = [
    {id: 1, name: 'Taro', pv: Math.random()},
    {id: 2, name: 'Jiro', pv: Math.random()},
    {id: 3, name:'Saburo', pv: Math.random()},
    {id: 4, name:'Shiro', pv: Math.random()},
    {id: 5, name: 'Goro', pv: Math.random()},
    {id: 6, name: 'Mutsumi', pv: Math.random()},
    {id: 7, name: 'Nanako', pv: Math.random()},
    {id: 8, name: 'Yaeko', pv: Math.random()},
    {id: 9, name: 'Kyuro', pv: Math.random()},
    {id: 10, name: 'juro', pv: Math.random()}
  ];
  */

//  console_logger.warn('App(): before rutern. 2:', ' chartOptions2 ', chartOptions2, ' chartData2 ', chartData2);
//  console_logger.warn('App(): before rutern. 2:', ' chartOptions2 ', chartOptions2, ' chartData2 ', chartData2, ' tableData2 ', tableData2);

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

  /*
  const _sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  let sleep_cnt_local = 0;
  console_logger.warn("App(): Before while sleep loop:", ' sleep_cnt ', sleep_cnt, ' sleep_cnt_local ', sleep_cnt_local, ' completeFetchReg2 ', completeFetchReg2, ' completeFetchData ', completeFetchData);
  if(sleep_cnt >= 2) {
    while(!completeFetchReg2 || !completeFetchData) {
      //sleep(5, sleep_cnt, function (cnt) {
      //  console_logger.warn("App(): After sleep() with setInterval and clearInterval: 5秒経過しました", ' cnt ', cnt);
      //});
      //sleep(1, sleep_cnt, null);
      //console_logger.warn("App(): After sleep():", ' sleep_cnt ', sleep_cnt, ' completeFetchReg2 ', completeFetchReg2, ' completeFetchData ', completeFetchData);
      await _sleep(2000);
      sleep_cnt_local++;
    }
  }

  console_logger.warn("App(): After while sleep loop:", ' sleep_cnt ', sleep_cnt, ' sleep_cnt_local ', sleep_cnt_local, ' completeFetchReg2 ', completeFetchReg2, ' completeFetchData ', completeFetchData);
  sleep_cnt++;

  completeFetchReg2 = false;
  completeFetchData = false;
  */

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
/*
  listOfDevices.addEventListener('change', fetchNotes(false), false);
  console_logger.warn('App(): After listOfDevices.addEventListener():', ' listOfDevices ', listOfDevices);
*/

  console_logger.warn('App(): before rutern:');

  return (
    <View className="App">
      <View as="form" margin="3rem 0" onSubmit={update}>
        <Flex direction="row" justifyContent="center">
          <Button disabled={disableButtons} type="submit" variation="primary">
            Update
          </Button>
        </Flex>
      </View>
      <Line options={chartOptions} data={chartData}/>
      {/*<Line options={chartOptions2} data={chartData2}/>*/}
      {/*<Heading level={1}>My Notes App</Heading>*/}
      {/*<input type="text" name="datepicker" id="js-datepicker"></input>*/}
      <form className='grid gap-4 place-content-center min-h-screen'>
        <div>
          <label>開始日</label>
          <Flatpickr
            options={start_option}
            className="bg-white border border-gray-300 block w-full p-2.5 shadow;"
            onChange={([date]) => {
              setStart(date)
              field.onChange(date)
            }}
          />
        </div>
        <div>
          <label>終了日</label>
          <Flatpickr
            className="bg-white border border-gray-300 block w-full p-2.5 shadow;"
            options={end_option}
            onChange={([date]) => field.onChange(date)}
          />
        </div>
      </form>
      <View as="form" margin="3rem 0" onSubmit={createNote}>
        <Flex direction="row" justifyContent="center">
          {/*<TextField
            name="id"
            placeholder="Id"
            label="Id"
            labelHidden
            variation="quiet"
            //required
          />*/}
          {/*<TextField
            name="date"
            placeholder="Date"
            label="Date"
            labelHidden
            variation="quiet"
            //required
          />*/}
          {/*<TextField
            name="nickname"
            placeholder="Nickname"
            label="Nickname"
            labelHidden
            variation="quiet"
            //required
          />*/}
          <TextField
            name="device_id"
            placeholder="Device_id"
            label="Device_id"
            labelHidden
            variation="quiet"
            //required
          />
          <Button type="submit" disabled={disableButtons} variation="primary">
           {/*Create Note*/}Register
          </Button>
        </Flex>
      </View>
      <Heading level={2}>Current Data</Heading>
      {/*<View margin="3rem 0">
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
//            <Text as="span">{note.magx}</Text>
            <Text as="span">{note.temp}</Text>
//            <Text as="span">{note.humi}</Text>
            <Text as="span">{note.general_data00}</Text>
//            <Text as="span">{note.postType}</Text>
            <Button variation="link" disabled={disableButtons} onClick={() => deleteNote(note)}>
              Delete data
            </Button>
          </Flex>
        ))}
      </View>*/}
      {/*<h1>テーブルを作る ０</h1>*/}
      <table border="1" width="1000">
        <thead className="table-dark">
          <tr>
            <th scope="col">id</th>
            <th scope="col">date</th>
            {/*<th scope="col">nickname</th>*/}
            <th scope="col">device_id</th>
            <th scope="col">send_cnt</th>
            <th scope="col">temp</th>
            <th scope="col">general_data00</th>
            <th scope="col">delete</th>
          </tr>
        </thead>
        <tbody>
          {notes.map((note) => (
            <tr>
              <th scope="row">{note.id}</th>
              <td>{note.date}</td>
              <td>{note.nickname}</td>
              <td>{note.send_cnt}</td>
              <td>{note.temp}</td>
              <td>{note.general_data00}</td>
              <td>
                <Button disabled={disableButtons} variation="link" onClick={() => deleteNote(note)}>
                  Delete data
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <Button disabled={disableButtons} onClick={signOut}>Sign Out</Button>
      {/*<h1>テーブルを作る １</h1>
        <table className="table" border="1" width="800">
          <thead className="table-dark">
            <tr>
              <th scope="col-2">id</th>
              <th scope="col-4">name</th>
              <th scope="col-6">pv</th>
            </tr>
          </thead>
          <tbody>
            {tableData1.map((value) =>
              <tr>
                <th scope="row">{value.id}</th>
                <td>{value.name}</td>
                <td>{value.pv}</td>
              </tr>
            )}
          </tbody>
        </table>*/}
    </View>
  );
};

export default withAuthenticator(App);