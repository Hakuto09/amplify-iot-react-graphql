import React, { useState, useEffect, useRef, Component } from "react";
//import { ColumnDef, flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table';
//import { ColumnDef, flexRender, getCoreRowModel, useReactTable } from 'react-table';

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

import {
  TiArrowSortedDown,
  TiArrowSortedUp,
  TiArrowUnsorted,
} from "react-icons/ti";

import { mkConfig, generateCsv, asString } from "export-to-csv";
//import { writeFile } from "node:fs";
//import { writeFile } from "fs";
//  import { writeFile } from "fs-extra";
//import { Buffer } from "node:buffer";
import { Buffer } from "buffer";

import Select from "react-select";


const select_options1 = [
  { value: 100, label: "100" },
  { value: 500, label: "500" },
  { value: 1000, label: "1000" },
];

/*
const csvConfig = mkConfig({ useKeysAsHeaders: true });

const addNewLine = (s) => s + "\n";

const mockData = [
  {
    name: "Rouky",
    date: "2023-09-01",
    percentage: 0.4,
    quoted: '"Pickles"',
  },
  {
    name: "Keiko",
    date: "2023-09-01",
    percentage: 0.9,
    quoted: '"Cactus"',
  },
];

// Converts your Array<Object> to a CsvOutput string based on the configs
const csvOutput = generateCsv(csvConfig)(mockData);

// This unpacks CsvOutput which turns it into a string before use
const csvOutputWithNewLine = addNewLine(asString(csvOutput));
*/

// Converts your Array<Object> to a CsvOutput string based on the configs
//const csv = generateCsv(csvConfig)(mockData);
//const csvFilename = `${csvConfig.filename}.csv`;
//const csvBuffer = new Uint8Array(Buffer.from(asString(csv)));

// Write the csv file to disk
/*
writeFile(csvFilename, csvBuffer, (err) => {
  if (err) throw err;
  console.log("file saved: ", csvFilename);
});
*/

//const csv = arrayToCsv(data);
//const blob = new Blob([csv], {type: "text/csv"});
//const url = URL.createObjectURL(blob);
//const a = document.createElement("a");
//a.href = url;
//a.download = "data.csv";
//a.click();
//URL.revokeObjectURL(url);


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

const LOG_LEVEL = 'INFO'  //どのレベルのログまでロギングするか

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
//var maxLenGraph = 50;
var maxLenGraph = maxLenList;
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
let graphRangeMode = 1;   // 0: By data existence, 1: By user setting

//let sleep_cnt = 0;

var numOfCreatedDevices = 0;
let needsAutoSelect = true;
var g_selectedIndex = -1/*0*/;


//console_logger.warn('For csv output: ', " csvOutput ", csvOutput, " csvOutputWithNewLine ", csvOutputWithNewLine, ' csv ', csv, ' csvFilename ', csvFilename, " csvBuffer ", csvBuffer);
//console_logger.warn('For csv output: ', " blob ", blob, " url ", url, ' a ', a);



console_logger.warn('Before App.');

const App = ({ signOut }) => {
//const App = async ({ signOut }) => {
  console_logger.warn('App() In');

  const deviceCount = document.getElementById('deviceCount');
  console_logger.warn('App(): After document.getElementById(\'deviceCount\'):', ' deviceCount ', deviceCount);

  const listOfDevices = document.getElementById('listOfDevices');
  console_logger.warn('App(): After document.getElementById(\'listOfDevices\'):', ' listOfDevices ', listOfDevices);

  const [notes, setNotes] = useState([]);
  console_logger.warn('App() After useState():', ' notes ', notes);

  const [disableButtons, setDisableButtons] = useState(false);
  console_logger.warn('App() After useState():', ' disableButtons ', disableButtons);

  const [selectedValue1, setSelectedValue1] = useState(select_options1[0]);
  console_logger.warn('App() After useState():', ' selectedValue1 ', selectedValue1);

  useEffect(() => {
    fetchNotes(true);
  }, []);

//  const anchorRef = useRef<HTMLAnchorElement>(null);


  /** 開始日の設定 */
  let today0 = new Date();
  today0.setHours(0);
  today0.setMinutes(0);
  const start_option = {
    locale: Japanese,
//    dateFormat: 'Y/m/d(D)',
//    dateFormat  : 'Y.m.d（D）H:i',
    dateFormat  : 'Y-m-d  H:i',
    defaultDate : today0,
    enableTime  : true,
//    minDate: new Date(),
//    timeFormat: "HH:mm",      
  }

  /**終了日の設定 */
  let tomorrow0 = new Date();
  tomorrow0.setDate(tomorrow0.getDate() + 1);
  tomorrow0.setHours(0);
  tomorrow0.setMinutes(0);
  const end_option = {
    locale: Japanese,
//    dateFormat: 'Y/m/d(D)',
//    dateFormat  : 'Y.m.d（D）H:i',
    dateFormat  : 'Y-m-d  H:i',
    defaultDate : tomorrow0,
//    maxDate: new Date(),
    enableTime  : true,
//    timeFormat: "HH:mm",      
  }

  const [startDateTime, setStartDateTime] = useState(today0)
  console_logger.warn('App() After useState():', ' startDateTime ', startDateTime);
  console_logger.warn('App() After useState():', ' startDateTime.toISOString() ', startDateTime.toISOString());
  /* ISO形式かつ日本時間へ変換していく */
  let startDateTimeJstTmp = new Date(startDateTime);
  // UTCとローカルタイムゾーンとの差を取得し、分からミリ秒に変換
  //const startDT_diff = startDateTime.getTimezoneOffset() * 60 * 1000    // -540 * 60 * 1000 = -32400000
  // toISOString()で、UTC時間になってしまう（-9時間）ので、日本時間に9時間足しておく
  startDateTimeJstTmp.setHours(startDateTimeJstTmp.getHours() + 9);
  //const startDT_plusLocal = new Date(startDateTime + startDT_diff)    // Thu Apr 23 2020 07:39:03 GMT+0900 (Japan Standard Time)
  // ISO形式に変換（UTCタイムゾーンで日本時間、というよくない状態）
  //startDateTime = startDT_plusLocal.toISOString()   // "2020-04-22T22:39:03.397Z"
  let startDateTimeJstIso = startDateTimeJstTmp.toISOString();   // "2020-04-22T22:39:03.397Z"
  // UTCタイムゾーン部分は消して、日本のタイムゾーンの表記を足す
  startDateTimeJstIso = startDateTimeJstIso.slice(0, 23) + '+09:00'    // "2020-04-22T22:39:03+09:00"
  console_logger.warn('App() After toISOString():', ' startDateTimeJstIso ', startDateTimeJstIso, ' startDateTimeJstTmp ', startDateTimeJstTmp);

  const [endDateTime, setEndDateTime] = useState(tomorrow0);
  console_logger.warn('App() After useState():', ' endDateTime ', endDateTime);
  console_logger.warn('App() After useState():', ' endDateTime.toISOString() ', endDateTime.toISOString());
  /* ISO形式かつ日本時間へ変換していく */
  let endDateTimeJstTmp = new Date(endDateTime);
  // toISOString()で、UTC時間になってしまう（-9時間）ので、日本時間に9時間足しておく
  endDateTimeJstTmp.setHours(endDateTimeJstTmp.getHours() + 9);
  // ISO形式に変換（UTCタイムゾーンで日本時間、というよくない状態）
  let endDateTimeJstIso = endDateTimeJstTmp.toISOString();   // "2020-04-22T22:39:03.397Z"
  // UTCタイムゾーン部分は消して、日本のタイムゾーンの表記を足す
  endDateTimeJstIso = endDateTimeJstIso.slice(0, 23) + '+09:00'    // "2020-04-22T22:39:03+09:00"
  console_logger.warn('App() After toISOString():', ' endDateTimeJstIso ', endDateTimeJstIso, ' endDateTimeJstTmp ', endDateTimeJstTmp);

  /*
  function handleSubmit(e) {
    // Prevent the browser from reloading the page
    e.preventDefault();
    // Read the form data
    const form = e.target;
    console_logger.warn('handleSubmit() After form = e.target: ', ' e ', e, ' form ', form);
    const formData = new FormData(form);
    // You can pass formData as a fetch body directly:
    fetch('/some-api', { method: form.method, body: formData });
    // You can generate a URL out of it, as the browser does by default:
    console_logger.warn('handleSubmit() After fetch(/some-api): ', ' new URLSearchParams(formData).toString() ', new URLSearchParams(formData).toString());
    // You can work with it as a plain object.
    const formJson = Object.fromEntries(formData.entries());
    console_logger.warn('handleSubmit() After Object.fromEntries(): ', ' formJson ', formJson); // (!) This doesn't include multiple select values
    // Or you can get an array of name-value pairs.
    console_logger.warn('handleSubmit() After Object.fromEntries(): ', ' [...formData.entries()] ', [...formData.entries()]);
  }
  */

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
//    var limitForFetch = 200;
    var limitForFetch = 1000;

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
//        filter = { date: { between: [ startDateTime.toISOString(), endDateTime.toISOString() ] } };
//        filter = { date: { between: [ "2024-03-13T00:00:00.000+0900", "2024-03-13T23:59:59.999+0900" ] } };
//        filter = { createdAt: { between: [ "2024-03-13T00:00:00.000+0900", "2024-03-13T23:59:59.999+0900" ] } };
//        filter = { createdAt: { between: [ startDateTime.toISOString(), endDateTime.toISOString() ] } };
        filter = { createdAt: { between: [ startDateTimeJstIso, endDateTimeJstIso ] } };
      }
      else {
        idForSort = "multi001";
        filter = { nickname: { eq: deviceNames[g_selectedIndex] } };
      }
      console_logger.warn('fetchNotes(): After filter input:', ' flter ', filter, ' deviceNames[g_selectedIndex] ', deviceNames[g_selectedIndex], ' g_selectedIndex ', g_selectedIndex, ' displayRegisters ', displayRegisters);
    }

    while(1) {
      console_logger.warn('fetchNotes(): Before graphql(listNotes): ', ' displayRegisters ', displayRegisters, ' idForSort ', idForSort, ' sortDirection ', sortDirection, ' filter ', filter, ' nextToken ', nextToken, ' limitForFetch ', limitForFetch);
      let apiData = [];
      let variables = {};

      if(fetchById == true) {
//        variables = { id: idForSort, sortDirection: sortDirection, limit: limitForFetch, nextToken: nextToken };
        variables = { id: idForSort, sortDirection: sortDirection, filter: filter, imit: limitForFetch, nextToken: nextToken };
      }
      else {
        variables = { id: idForSort, sortDirection: sortDirection, filter: filter, limit: limitForFetch, nextToken: nextToken };
      }
      console_logger.warn('fetchNotes(): Before graphql(listNotes):', ' variables ', variables);

      apiData = await client.graphql({
        query: listNotes,
        variables: variables,
      });

      Array.prototype.push.apply(notesFromAPI, apiData.data.listNotes.items);
      nextToken = apiData.data.listNotes.nextToken;

      console_logger.warn('fetchNotes(): After graphql(listNotes) etc.:', ' displayRegisters ', displayRegisters, ' apiData ', apiData, ' notesFromAPI ', notesFromAPI, ' nextToken ', nextToken);

      /*
      if(notesFromAPI.length > maxLenList) {
        notesFromAPI.length = maxLenList;
      }
      */
      notesFromAPI.length = Math.min(notesFromAPI.length, maxLenList);
      notesFromAPI.length = Math.min(notesFromAPI.length, selectedValue1.value);

//      if(!nextToken || notesFromAPI.length >= maxLenList) {
      if(!nextToken || notesFromAPI.length >= Math.min(maxLenList, selectedValue1.value)) {
          break;
      }
    }

    console_logger.warn('fetchNotes(): After while loop of client.graphql(listNotes):', ' displayRegisters ', displayRegisters, ' notesFromAPI ', notesFromAPI)

    setNotes(notesFromAPI);
    console_logger.warn('fetchNotes(): After setNotes():', ' displayRegisters ', displayRegisters, ' notesFromAPI ', notesFromAPI);

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
        /*
        send_cnt: form.get("send_cnt"),
        magx: form.get("magx"),
        magy: form.get("magy"),
        magz: form.get("magz"),
        degree: form.get("degree"),
        distance: form.get("distance"),
        pres: form.get("pres"),
        temp: form.get("temp"),
        humi: form.get("humi"),
        */
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

  /*
  const convertToCSV = () => {
    const key = User.key()
    const values = users.map((user) => user.value())
    const array = [key].concat(values)
    
    return array.map((a) => a.join(',')).join('\n')
  }
  */

  function convertJSONtoCSV(/*jsons*/) {
    let numOfColumns = 6;
    let numOfRows = notes.length;
//    let keys = [""];
    let keys = ["id", "date", "device_id", "send_cnt", "temp", "general_data00"];
    let values = [];
    let csvStr = "";

//    console_logger.warn('convertJSONtoCSV() In: '/*, " jsons ", jsons*/);
    console_logger.warn('convertJSONtoCSV() In: ', ' numOfColumns ', numOfColumns, ' numOfRows ', numOfRows);

    /*
    JSON.parse(jsons[0], (key) => {
      if(key) {
        keys.push(key);   // keyの取得
        count++;
      }
    })
    */
  
    console_logger.warn('convertJSONtoCSV() Before convert keys: ', " keys ", keys);

    for(let i = 0; i < numOfColumns; i++) {
      if(i == numOfColumns - 1) {   // 行末の処理
        csvStr = csvStr.concat(keys[i],"\n");
      }
      else {
        csvStr = csvStr.concat(keys[i],", ");
      }
    }

    console_logger.warn('convertJSONtoCSV() After convert keys: ', " csvStr ", csvStr);

    /*
    let j = 0;
    while(jsons[j] !== null) {
      JSON.parse(jsons[j], (key, value) => {
        if(key) { values.push(value); }
      })
  
      console_logger.warn('convertJSONtoCSV() Before convert values: ', " values ", values);

      for(let i = 0; i < count; i++) {
        if(i == count - 1)  { csvStr = csvStr.concat(values[i],"\n"); }   // 行末の処理
        else                { csvStr = csvStr.concat(values[i],", "); }
      }

      j++;
    }
    */

    for(let i = 0; i < numOfRows; i++) {
      csvStr = csvStr.concat(notes[i].id,", ");
      csvStr = csvStr.concat(notes[i].date,", ");
      csvStr = csvStr.concat(notes[i].nickname,", ");
      csvStr = csvStr.concat(notes[i].send_cnt,", ");
      csvStr = csvStr.concat(notes[i].temp,", ");
      csvStr = csvStr.concat(notes[i].general_data00,"\n");
    }

    console_logger.warn('convertJSONtoCSV() After convert values: ', " csvStr ", csvStr);

    return csvStr;
  }

  async function writeCSV(event/*, filename*/) {
    setDisableButtons(true);
    event.preventDefault();

    console_logger.warn("writeCSV() In:");

    const opts = {
      suggestedName: 'example',
      types: [{
        description: 'CSV file',
        accept: {'text/csv': ['.csv']},
      }],
    };
    const handle = await window.showSaveFilePicker(opts);
    const writable = await handle.createWritable();
    const csv = convertJSONtoCSV(/*notes*/);
  
    console_logger.warn('writeCSV() For csv output: ', " opts ", opts, " handle ", handle, ' writable ', writable, ' csv ', csv);
  
    await writable.write(csv);
    await writable.close();

    /*
    if(csvStr == "") {
      console_logger.warn("empty Text .")
      return 
    }
  
    // 既存ファイルの上書き "overwrite" / 既存ファイルの書き換え "rewrite"
    const WRITE_CONFIG = "rewrite"
  
    if (WRITE_CONFIG == "rewrite") {
      fse.writeFileSync(filename, csvStr)
      console_logger.warn("Rewrite csv file.")
    }
//    else if (WRITE_CONFIG == "overwrite") {
//      fs.appendFileSync("./test.csv",csvStr);
//      console.log("overwrite csv file .")
//    }
    else {
      console_logger.warn("Please check! cannot write csvfile.")
    }
    */

    setDisableButtons(false);
    event.target.reset();
  }

  async function sortNotes(event, downOrUp, columnName) {
    setDisableButtons(true);
    event.preventDefault();

    let ifC1Bigger = (!downOrUp) ? 1 : -1;  // 1 if down
    let ifC2Bigger = (!downOrUp) ? -1 : 1;  // -1 if down
    let notesSorted = [];

    switch(columnName) {
      case 'id' :
        notes.sort((c1, c2) => (c1.id < c2.id) ? ifC2Bigger : (c1.id > c2.id) ? ifC1Bigger : 0);
        break;
      case 'date' :
        notes.sort((c1, c2) => (c1.date < c2.date) ? ifC2Bigger : (c1.date > c2.date) ? ifC1Bigger : 0);
        break;
      case 'nickname' :   // device_id
        notes.sort((c1, c2) => (c1.nickname < c2.nickname) ? ifC2Bigger : (c1.nickname > c2.nickname) ? ifC1Bigger : 0);
        break;
      case 'send_cnt' :
        notes.sort((c1, c2) => (c1.send_cnt < c2.send_cnt) ? ifC2Bigger : (c1.send_cnt > c2.send_cnt) ? ifC1Bigger : 0);
        break;
      case 'temp' :
        notes.sort((c1, c2) => (c1.temp < c2.temp) ? ifC2Bigger : (c1.temp > c2.temp) ? ifC1Bigger : 0);
        break;
      case 'general_data00' :
        notes.sort((c1, c2) => (c1.general_data00 < c2.general_data00) ? ifC2Bigger : (c1.general_data00 > c2.general_data00) ? ifC1Bigger : 0);
        break;
    }
    console_logger.warn('fetchNotes(): After sort():', ' g_displayRegisters ', g_displayRegisters, ' notes ', notes, ' columnName ', columnName);

    Array.prototype.push.apply(notesSorted, notes);
    setNotes(notesSorted);
    console_logger.warn('fetchNotes(): After sort() and setNotes():', ' downOrUp ', downOrUp, ' notesSorted ', notesSorted);

    setDisableButtons(false);
//    event.target.reset();
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
      if(graphRangeMode == 1) {
        // Set graph start datetime.
        labels.push(startDateTimeJstIso.slice(0, 23));
        data0s.push(null);
        data1s.push(null);
      }

      // add graph data.
      let loops = Math.min(numOfNotesTotal, maxLenGraph);
      loops = Math.min(loops, selectedValue1.value);
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

      if(graphRangeMode == 1) {
        // Set graph end datetime.
        labels.push(endDateTimeJstIso.slice(0, 23));
        data0s.push(null);
        data1s.push(null);
      }

      console_logger.warn('onMessage(): After graph data. input loop:', ' loops ', loops, ' labels ', labels, ' data0s ', data0s, ' data1s ', data1s);
    }
  };

  console_logger.warn('App(): before rutern. 0b: labels ', labels, ' data0s ', data0s, ' data1s ', data1s);

  const chartOptions = {
//    options: {
//      responsive: true,
    responsive: false,    // グラフのスクロール対応
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
//            unit: 'millisecond',
            displayFormats: {
//              week: 'yyyy-MM-dd'
//              day: 'yyyy-MM-DD'
//              min: 'YYYY-MM-DD HH:mm'
              minute: 'YYYY-MM-DD HH:mm'
//              seconds: 'YYYY-MM-DDTHH:mm:ss'
//              second: 'h:mm:ss a'
//              ss: 'YYYY-MM-DD HH:mm:ss'
            }
          },
        },
        yleft: {
          stacked: false,
//          max: totalScoreMax,
//          min: 0,
        },
        /** yright (y軸・右): Y軸が、複数あるので yleft と yright のように軸にIDを付ける */
        yright: {
          stacked: false,
          position: "right",
//          max: totalScoreMax,
//          min: 0,
        },
      }
  };

  const datasets0 = {
    //fill: false,
    label: 'Temperature (left)',
    //yAxisID: 'Temperature',
    ////borderColor: 'rgba(255, 204, 0, 1)',
    //pointBoarderColor: 'rgba(255, 204, 0, 1)',
    ////backgroundColor: 'rgba(255, 204, 0, 0.4)',
    //pointHoverBackgroundColor: 'rgba(255, 204, 0, 1)',
    //pointHoverBorderColor: 'rgba(255, 204, 0, 1)',
    //spanGaps: true,
    yAxisID: "yleft",

    fill: false,
    backgroundColor: "#3A7AC9",
    borderWidth: 2,
    borderColor: "rgba(2,63,138,0.8)",
    pointBorderColor: "#fff",
    pointBackgroundColor: "rgba(2,63,138,0.8)",
    pointBorderWidth: 2,
    pointHoverRadius: 5,
    pointHoverBackgroundColor: "#1D5191",
    pointHoverBorderColor: "#fff",
    pointHoverBorderWidth: 2,
    tension: 0,
    data: data0s,
  };

  const datasets1 = {
    //fill: false,
    // label: 'Humidity',
    label: 'General data (right)',
    //yAxisID: 'Humidity',
    ////borderColor: 'rgba(24, 120, 240, 1)',
    //pointBoarderColor: 'rgba(24, 120, 240, 1)',
    ////backgroundColor: 'rgba(24, 120, 240, 0.4)',
    //pointHoverBackgroundColor: 'rgba(24, 120, 240, 1)',
    //pointHoverBorderColor: 'rgba(24, 120, 240, 1)',
    //spanGaps: true,
    yAxisID: "yright",

    fill: false,
    backgroundColor: "#DB514E",
    borderWidth: 2,
    borderColor: "rgba(201,60,58,0.8)",
    pointBorderColor: "#fff",
    pointBackgroundColor: "rgba(201,60,58,0.8)",
    pointBorderWidth: 2,
    pointHoverRadius: 5,
    pointHoverBackgroundColor: "#9A1B19",
    pointHoverBorderColor: "#fff",
    pointHoverBorderWidth: 2,
    tension: 0,
    data: data1s,
  };

  const chartData = {
    labels: labels,
    datasets: [
      datasets0,
      datasets1
    ]
  };
   
//  const ctx = this.refs.canvas.getContext('2d');
  const ctx = Component.refs.canvas.getContext('2d');
  const xAxisLabelMinWidth = 15;      // データ当たりの幅を設定
  const graph_width = labels.length * xAxisLabelMinWidth;     // グラフ全体の幅を計算

  // グラフのキャンバスに幅を設定
  Component.refs.canvas.style.width = `${graph_width}px`;
  Component.refs.canvas.style.height = '200px';      // 高さはお好みで設定

  new ChartJS(ctx, {
    type: 'line',
    data: {
      labels: labels,     // ラベルを設定
      datasets: [
        datasets0,
        datasets1
      ]
    },
    options: chartOptions
  });

//  const moment = new Moment();
//  console_logger.warn('App(): before rutern. 1:', ' moment1 ', moment("2010-10-20 4:30 +0000", "YYYY-MM-DD HH:mm Z"));
//  console_logger.warn('App(): before rutern. 1:', ' moment2ss ', moment("2010-10-20 4:30:50 +0000", "YYYY-MM-DD HH:mm:ss Z"));
//  console_logger.warn('App(): before rutern. 1:', ' moment3SSS ', moment("2010-10-20 4:30:50.123 +0000", "YYYY-MM-DD HH:mm:ss.SSS Z"));

//  var m1 = moment("20150101", "YYYYMMDD"); // 第一引数：指定日時、第二引数：フォーマット
//  var m1_output = m1.format('YYYY年MM月DD日 HH:mm:ss dddd');
//  console_logger.warn('App(): before rutern. 1:', ' moment m1_output ', m1_output); // => 2015年01月01日 00:00:00 Thursday 

//  var m2 = moment("1970-01-01 00:00:00", "YYYY-MM-DD HH:mm:ss");
//  var m2_output = m2.format('YYYY年MM月DD日 HH:mm:ss');
//  console_logger.warn('App(): before rutern. 1:', ' moment m2_output ', m2_output);
  
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
      <form className='grid gap-4 place-content-center min-h-screen'>
        <div>
          <label>開始日時</label>
          <Flatpickr
            options={start_option}
            className="bg-white border border-gray-300 block w-full p-2.5 shadow;"
            onChange={([date]) => {
              setStartDateTime(date)
            }}
          />
        </div>
        <div>
          <label>終了日時</label>
          <Flatpickr
            className="bg-white border border-gray-300 block w-full p-2.5 shadow;"
            options={end_option}
            onChange={([date]) => {
              setEndDateTime(date)
            }}
          />
        </div>
      </form>
      {/*<form method="post" margin="0 2rem" onChange={handleSubmit}>
        <label>
          データ数
          <select name="selectedFruit" defaultValue="orange">
            <option value="100">100</option>
            <option value="500">500</option>
            <option value="1000">1000</option>
          </select>
        </label>
      /form>*/}
      <br></br>
      {/*<div style={{ width: "600px", margin: "50px" }}>*/}
      <div style={{ width: "100px" }}>
        <label>表示データ数 (Max)</label>
        <Select
          options={select_options1}
          defaultValue={selectedValue1}
          onChange={(selectedValue) => {
            setSelectedValue1(selectedValue)
            /*selectedValue ? setSelectedValue1(selectedValue) : null;*/
          }}
        />
      </div>
      <View as="form" margin="3rem 0" onSubmit={update}>
        <Flex direction="row" justifyContent="center">
          <Button disabled={disableButtons} type="submit" variation="primary">
            Update
          </Button>
        </Flex>
      </View>
      <div className="chartWrapper" style={{ position: 'relative', overflowX: 'scroll' }}>
        <div className="chartContainer" style={{ height: '200px' }}>
          {/*<Line options={chartOptions} data={chartData}/>*/}
          <canvas ref="canvas" style={{ position: 'absolute', left: 0, top: 0 }}></canvas>
        </div>
      </div>
      {/*<Line options={chartOptions2} data={chartData2}/>*/}
      {/*<Heading level={1}>My Notes App</Heading>*/}
      {/*<input type="text" name="datepicker" id="js-datepicker"></input>*/}
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
      <View as="form" margin="0 0" onSubmit={(event) => writeCSV(event/*, 'test_output.csv'*/)}>
        <Flex direction="row" justifyContent="right">
          <Button disabled={disableButtons} type="submit" variation="primary">
            Output CSV
          </Button>
        </Flex>
      </View>
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
      <div>
        <table border="1" cellpadding="5" /*width="1000"*/>
          <thead className="table-dark">
            <tr>
              <th scope="col">
                id
                <Button disabled={disableButtons} size="small" onClick={(event) => sortNotes(event, 1, "id")}>
                  <TiArrowSortedUp/>
                </Button>
                <Button disabled={disableButtons} size="small" onClick={(event) => sortNotes(event, 0, "id")}>
                  <TiArrowSortedDown/>
                </Button>
              </th>
              <th scope="col">
                date
                <Button disabled={disableButtons} size="small" onClick={(event) => sortNotes(event, 1, "date")}>
                  <TiArrowSortedUp/>
                </Button>
                <Button disabled={disableButtons} size="small" onClick={(event) => sortNotes(event, 0, "date")}>
                  <TiArrowSortedDown/>
                </Button>
              </th>
              {/*<th scope="col">nickname</th>*/}
              <th scope="col">
                device_id
                <Button disabled={disableButtons} size="small" onClick={(event) => sortNotes(event, 1, "nickname")}>
                  <TiArrowSortedUp/>
                </Button>
                <Button disabled={disableButtons} size="small" onClick={(event) => sortNotes(event, 0, "nickname")}>
                  <TiArrowSortedDown/>
                </Button>
              </th>
              <th scope="col">
                send_cnt
                <Button disabled={disableButtons} size="small" onClick={(event) => sortNotes(event, 1, "send_cnt")}>
                  <TiArrowSortedUp/>
                </Button>
                <Button disabled={disableButtons} size="small" onClick={(event) => sortNotes(event, 0, "send_cnt")}>
                  <TiArrowSortedDown/>
                </Button>
              </th>
              <th scope="col">
                temp
                {/*<br>*/}
                  <Button disabled={disableButtons} size="small" onClick={(event) => sortNotes(event, 1, "temp")}>
                    <TiArrowSortedUp/>
                  </Button>
                  <Button disabled={disableButtons} size="small" onClick={(event) => sortNotes(event, 0, "temp")}>
                {/*<Button disabled={disableButtons} size="small" onClick={sortNotes}>*/}
                    <TiArrowSortedDown/>
                  </Button>
                {/*</br>*/}
              </th>
              <th scope="col">
                general_data00
                <Button disabled={disableButtons} size="small" onClick={(event) => sortNotes(event, 1, "general_data00")}>
                  <TiArrowSortedUp/>
                </Button>
                <Button disabled={disableButtons} size="small" onClick={(event) => sortNotes(event, 0, "general_data00")}>
                  <TiArrowSortedDown/>
                </Button>
              </th>
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
                  <Button disabled={disableButtons} variation="link" size="small" onClick={() => deleteNote(note)}>
                    Delete data
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/*<Button disabled={disableButtons} onClick={signOut}>Sign Out</Button>*/}
      <Button disabled={disableButtons} margin="3rem 1rem" onClick={signOut}>Sign Out</Button>
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