/***************************************************************************
 * The contents of this file were generated with Amplify Studio.           *
 * Please refrain from making any modifications to this file.              *
 * Any changes to this file will be overwritten when running amplify pull. *
 **************************************************************************/

/* eslint-disable */
import * as React from "react";
import {
  Button,
  Flex,
  Grid,
  SelectField,
  TextField,
} from "@aws-amplify/ui-react";
import { fetchByPath, getOverrideProps, validateField } from "./utils";
import { generateClient } from "aws-amplify/api";
import { createNote } from "../graphql/mutations";
const client = generateClient();
export default function NoteCreateForm(props) {
  const {
    clearOnSuccess = true,
    onSuccess,
    onError,
    onSubmit,
    onValidate,
    onChange,
    overrides,
    ...rest
  } = props;
  const initialValues = {
    name: "",
    description: "",
    nickname: "",
    date: "",
    createdAt: "",
    updatedAt: "",
    send_cnt: "",
    magx: "",
    magy: "",
    magz: "",
    degree: "",
    distance: "",
    pres: "",
    temp: "",
    humi: "",
    general_data00: "",
    general_data01: "",
    postType: "",
  };
  const [name, setName] = React.useState(initialValues.name);
  const [description, setDescription] = React.useState(
    initialValues.description
  );
  const [nickname, setNickname] = React.useState(initialValues.nickname);
  const [date, setDate] = React.useState(initialValues.date);
  const [createdAt, setCreatedAt] = React.useState(initialValues.createdAt);
  const [updatedAt, setUpdatedAt] = React.useState(initialValues.updatedAt);
  const [send_cnt, setSend_cnt] = React.useState(initialValues.send_cnt);
  const [magx, setMagx] = React.useState(initialValues.magx);
  const [magy, setMagy] = React.useState(initialValues.magy);
  const [magz, setMagz] = React.useState(initialValues.magz);
  const [degree, setDegree] = React.useState(initialValues.degree);
  const [distance, setDistance] = React.useState(initialValues.distance);
  const [pres, setPres] = React.useState(initialValues.pres);
  const [temp, setTemp] = React.useState(initialValues.temp);
  const [humi, setHumi] = React.useState(initialValues.humi);
  const [general_data00, setGeneral_data00] = React.useState(
    initialValues.general_data00
  );
  const [general_data01, setGeneral_data01] = React.useState(
    initialValues.general_data01
  );
  const [postType, setPostType] = React.useState(initialValues.postType);
  const [errors, setErrors] = React.useState({});
  const resetStateValues = () => {
    setName(initialValues.name);
    setDescription(initialValues.description);
    setNickname(initialValues.nickname);
    setDate(initialValues.date);
    setCreatedAt(initialValues.createdAt);
    setUpdatedAt(initialValues.updatedAt);
    setSend_cnt(initialValues.send_cnt);
    setMagx(initialValues.magx);
    setMagy(initialValues.magy);
    setMagz(initialValues.magz);
    setDegree(initialValues.degree);
    setDistance(initialValues.distance);
    setPres(initialValues.pres);
    setTemp(initialValues.temp);
    setHumi(initialValues.humi);
    setGeneral_data00(initialValues.general_data00);
    setGeneral_data01(initialValues.general_data01);
    setPostType(initialValues.postType);
    setErrors({});
  };
  const validations = {
    name: [],
    description: [],
    nickname: [],
    date: [{ type: "Required" }],
    createdAt: [],
    updatedAt: [],
    send_cnt: [],
    magx: [],
    magy: [],
    magz: [],
    degree: [],
    distance: [],
    pres: [],
    temp: [],
    humi: [],
    general_data00: [],
    general_data01: [],
    postType: [{ type: "Required" }],
  };
  const runValidationTasks = async (
    fieldName,
    currentValue,
    getDisplayValue
  ) => {
    const value =
      currentValue && getDisplayValue
        ? getDisplayValue(currentValue)
        : currentValue;
    let validationResponse = validateField(value, validations[fieldName]);
    const customValidator = fetchByPath(onValidate, fieldName);
    if (customValidator) {
      validationResponse = await customValidator(value, validationResponse);
    }
    setErrors((errors) => ({ ...errors, [fieldName]: validationResponse }));
    return validationResponse;
  };
  const convertToLocal = (date) => {
    const df = new Intl.DateTimeFormat("default", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      calendar: "iso8601",
      numberingSystem: "latn",
      hourCycle: "h23",
    });
    const parts = df.formatToParts(date).reduce((acc, part) => {
      acc[part.type] = part.value;
      return acc;
    }, {});
    return `${parts.year}-${parts.month}-${parts.day}T${parts.hour}:${parts.minute}`;
  };
  return (
    <Grid
      as="form"
      rowGap="15px"
      columnGap="15px"
      padding="20px"
      onSubmit={async (event) => {
        event.preventDefault();
        let modelFields = {
          name,
          description,
          nickname,
          date,
          createdAt,
          updatedAt,
          send_cnt,
          magx,
          magy,
          magz,
          degree,
          distance,
          pres,
          temp,
          humi,
          general_data00,
          general_data01,
          postType,
        };
        const validationResponses = await Promise.all(
          Object.keys(validations).reduce((promises, fieldName) => {
            if (Array.isArray(modelFields[fieldName])) {
              promises.push(
                ...modelFields[fieldName].map((item) =>
                  runValidationTasks(fieldName, item)
                )
              );
              return promises;
            }
            promises.push(
              runValidationTasks(fieldName, modelFields[fieldName])
            );
            return promises;
          }, [])
        );
        if (validationResponses.some((r) => r.hasError)) {
          return;
        }
        if (onSubmit) {
          modelFields = onSubmit(modelFields);
        }
        try {
          Object.entries(modelFields).forEach(([key, value]) => {
            if (typeof value === "string" && value === "") {
              modelFields[key] = null;
            }
          });
          await client.graphql({
            query: createNote.replaceAll("__typename", ""),
            variables: {
              input: {
                ...modelFields,
              },
            },
          });
          if (onSuccess) {
            onSuccess(modelFields);
          }
          if (clearOnSuccess) {
            resetStateValues();
          }
        } catch (err) {
          if (onError) {
            const messages = err.errors.map((e) => e.message).join("\n");
            onError(modelFields, messages);
          }
        }
      }}
      {...getOverrideProps(overrides, "NoteCreateForm")}
      {...rest}
    >
      <TextField
        label="Name"
        isRequired={false}
        isReadOnly={false}
        value={name}
        onChange={(e) => {
          let { value } = e.target;
          if (onChange) {
            const modelFields = {
              name: value,
              description,
              nickname,
              date,
              createdAt,
              updatedAt,
              send_cnt,
              magx,
              magy,
              magz,
              degree,
              distance,
              pres,
              temp,
              humi,
              general_data00,
              general_data01,
              postType,
            };
            const result = onChange(modelFields);
            value = result?.name ?? value;
          }
          if (errors.name?.hasError) {
            runValidationTasks("name", value);
          }
          setName(value);
        }}
        onBlur={() => runValidationTasks("name", name)}
        errorMessage={errors.name?.errorMessage}
        hasError={errors.name?.hasError}
        {...getOverrideProps(overrides, "name")}
      ></TextField>
      <TextField
        label="Description"
        isRequired={false}
        isReadOnly={false}
        value={description}
        onChange={(e) => {
          let { value } = e.target;
          if (onChange) {
            const modelFields = {
              name,
              description: value,
              nickname,
              date,
              createdAt,
              updatedAt,
              send_cnt,
              magx,
              magy,
              magz,
              degree,
              distance,
              pres,
              temp,
              humi,
              general_data00,
              general_data01,
              postType,
            };
            const result = onChange(modelFields);
            value = result?.description ?? value;
          }
          if (errors.description?.hasError) {
            runValidationTasks("description", value);
          }
          setDescription(value);
        }}
        onBlur={() => runValidationTasks("description", description)}
        errorMessage={errors.description?.errorMessage}
        hasError={errors.description?.hasError}
        {...getOverrideProps(overrides, "description")}
      ></TextField>
      <TextField
        label="Nickname"
        isRequired={false}
        isReadOnly={false}
        value={nickname}
        onChange={(e) => {
          let { value } = e.target;
          if (onChange) {
            const modelFields = {
              name,
              description,
              nickname: value,
              date,
              createdAt,
              updatedAt,
              send_cnt,
              magx,
              magy,
              magz,
              degree,
              distance,
              pres,
              temp,
              humi,
              general_data00,
              general_data01,
              postType,
            };
            const result = onChange(modelFields);
            value = result?.nickname ?? value;
          }
          if (errors.nickname?.hasError) {
            runValidationTasks("nickname", value);
          }
          setNickname(value);
        }}
        onBlur={() => runValidationTasks("nickname", nickname)}
        errorMessage={errors.nickname?.errorMessage}
        hasError={errors.nickname?.hasError}
        {...getOverrideProps(overrides, "nickname")}
      ></TextField>
      <TextField
        label="Date"
        isRequired={true}
        isReadOnly={false}
        type="datetime-local"
        value={date && convertToLocal(new Date(date))}
        onChange={(e) => {
          let value =
            e.target.value === "" ? "" : new Date(e.target.value).toISOString();
          if (onChange) {
            const modelFields = {
              name,
              description,
              nickname,
              date: value,
              createdAt,
              updatedAt,
              send_cnt,
              magx,
              magy,
              magz,
              degree,
              distance,
              pres,
              temp,
              humi,
              general_data00,
              general_data01,
              postType,
            };
            const result = onChange(modelFields);
            value = result?.date ?? value;
          }
          if (errors.date?.hasError) {
            runValidationTasks("date", value);
          }
          setDate(value);
        }}
        onBlur={() => runValidationTasks("date", date)}
        errorMessage={errors.date?.errorMessage}
        hasError={errors.date?.hasError}
        {...getOverrideProps(overrides, "date")}
      ></TextField>
      <TextField
        label="Created at"
        isRequired={false}
        isReadOnly={false}
        type="datetime-local"
        value={createdAt && convertToLocal(new Date(createdAt))}
        onChange={(e) => {
          let value =
            e.target.value === "" ? "" : new Date(e.target.value).toISOString();
          if (onChange) {
            const modelFields = {
              name,
              description,
              nickname,
              date,
              createdAt: value,
              updatedAt,
              send_cnt,
              magx,
              magy,
              magz,
              degree,
              distance,
              pres,
              temp,
              humi,
              general_data00,
              general_data01,
              postType,
            };
            const result = onChange(modelFields);
            value = result?.createdAt ?? value;
          }
          if (errors.createdAt?.hasError) {
            runValidationTasks("createdAt", value);
          }
          setCreatedAt(value);
        }}
        onBlur={() => runValidationTasks("createdAt", createdAt)}
        errorMessage={errors.createdAt?.errorMessage}
        hasError={errors.createdAt?.hasError}
        {...getOverrideProps(overrides, "createdAt")}
      ></TextField>
      <TextField
        label="Updated at"
        isRequired={false}
        isReadOnly={false}
        type="datetime-local"
        value={updatedAt && convertToLocal(new Date(updatedAt))}
        onChange={(e) => {
          let value =
            e.target.value === "" ? "" : new Date(e.target.value).toISOString();
          if (onChange) {
            const modelFields = {
              name,
              description,
              nickname,
              date,
              createdAt,
              updatedAt: value,
              send_cnt,
              magx,
              magy,
              magz,
              degree,
              distance,
              pres,
              temp,
              humi,
              general_data00,
              general_data01,
              postType,
            };
            const result = onChange(modelFields);
            value = result?.updatedAt ?? value;
          }
          if (errors.updatedAt?.hasError) {
            runValidationTasks("updatedAt", value);
          }
          setUpdatedAt(value);
        }}
        onBlur={() => runValidationTasks("updatedAt", updatedAt)}
        errorMessage={errors.updatedAt?.errorMessage}
        hasError={errors.updatedAt?.hasError}
        {...getOverrideProps(overrides, "updatedAt")}
      ></TextField>
      <TextField
        label="Send cnt"
        isRequired={false}
        isReadOnly={false}
        type="number"
        step="any"
        value={send_cnt}
        onChange={(e) => {
          let value = isNaN(parseInt(e.target.value))
            ? e.target.value
            : parseInt(e.target.value);
          if (onChange) {
            const modelFields = {
              name,
              description,
              nickname,
              date,
              createdAt,
              updatedAt,
              send_cnt: value,
              magx,
              magy,
              magz,
              degree,
              distance,
              pres,
              temp,
              humi,
              general_data00,
              general_data01,
              postType,
            };
            const result = onChange(modelFields);
            value = result?.send_cnt ?? value;
          }
          if (errors.send_cnt?.hasError) {
            runValidationTasks("send_cnt", value);
          }
          setSend_cnt(value);
        }}
        onBlur={() => runValidationTasks("send_cnt", send_cnt)}
        errorMessage={errors.send_cnt?.errorMessage}
        hasError={errors.send_cnt?.hasError}
        {...getOverrideProps(overrides, "send_cnt")}
      ></TextField>
      <TextField
        label="Magx"
        isRequired={false}
        isReadOnly={false}
        type="number"
        step="any"
        value={magx}
        onChange={(e) => {
          let value = isNaN(parseFloat(e.target.value))
            ? e.target.value
            : parseFloat(e.target.value);
          if (onChange) {
            const modelFields = {
              name,
              description,
              nickname,
              date,
              createdAt,
              updatedAt,
              send_cnt,
              magx: value,
              magy,
              magz,
              degree,
              distance,
              pres,
              temp,
              humi,
              general_data00,
              general_data01,
              postType,
            };
            const result = onChange(modelFields);
            value = result?.magx ?? value;
          }
          if (errors.magx?.hasError) {
            runValidationTasks("magx", value);
          }
          setMagx(value);
        }}
        onBlur={() => runValidationTasks("magx", magx)}
        errorMessage={errors.magx?.errorMessage}
        hasError={errors.magx?.hasError}
        {...getOverrideProps(overrides, "magx")}
      ></TextField>
      <TextField
        label="Magy"
        isRequired={false}
        isReadOnly={false}
        type="number"
        step="any"
        value={magy}
        onChange={(e) => {
          let value = isNaN(parseFloat(e.target.value))
            ? e.target.value
            : parseFloat(e.target.value);
          if (onChange) {
            const modelFields = {
              name,
              description,
              nickname,
              date,
              createdAt,
              updatedAt,
              send_cnt,
              magx,
              magy: value,
              magz,
              degree,
              distance,
              pres,
              temp,
              humi,
              general_data00,
              general_data01,
              postType,
            };
            const result = onChange(modelFields);
            value = result?.magy ?? value;
          }
          if (errors.magy?.hasError) {
            runValidationTasks("magy", value);
          }
          setMagy(value);
        }}
        onBlur={() => runValidationTasks("magy", magy)}
        errorMessage={errors.magy?.errorMessage}
        hasError={errors.magy?.hasError}
        {...getOverrideProps(overrides, "magy")}
      ></TextField>
      <TextField
        label="Magz"
        isRequired={false}
        isReadOnly={false}
        type="number"
        step="any"
        value={magz}
        onChange={(e) => {
          let value = isNaN(parseFloat(e.target.value))
            ? e.target.value
            : parseFloat(e.target.value);
          if (onChange) {
            const modelFields = {
              name,
              description,
              nickname,
              date,
              createdAt,
              updatedAt,
              send_cnt,
              magx,
              magy,
              magz: value,
              degree,
              distance,
              pres,
              temp,
              humi,
              general_data00,
              general_data01,
              postType,
            };
            const result = onChange(modelFields);
            value = result?.magz ?? value;
          }
          if (errors.magz?.hasError) {
            runValidationTasks("magz", value);
          }
          setMagz(value);
        }}
        onBlur={() => runValidationTasks("magz", magz)}
        errorMessage={errors.magz?.errorMessage}
        hasError={errors.magz?.hasError}
        {...getOverrideProps(overrides, "magz")}
      ></TextField>
      <TextField
        label="Degree"
        isRequired={false}
        isReadOnly={false}
        type="number"
        step="any"
        value={degree}
        onChange={(e) => {
          let value = isNaN(parseFloat(e.target.value))
            ? e.target.value
            : parseFloat(e.target.value);
          if (onChange) {
            const modelFields = {
              name,
              description,
              nickname,
              date,
              createdAt,
              updatedAt,
              send_cnt,
              magx,
              magy,
              magz,
              degree: value,
              distance,
              pres,
              temp,
              humi,
              general_data00,
              general_data01,
              postType,
            };
            const result = onChange(modelFields);
            value = result?.degree ?? value;
          }
          if (errors.degree?.hasError) {
            runValidationTasks("degree", value);
          }
          setDegree(value);
        }}
        onBlur={() => runValidationTasks("degree", degree)}
        errorMessage={errors.degree?.errorMessage}
        hasError={errors.degree?.hasError}
        {...getOverrideProps(overrides, "degree")}
      ></TextField>
      <TextField
        label="Distance"
        isRequired={false}
        isReadOnly={false}
        type="number"
        step="any"
        value={distance}
        onChange={(e) => {
          let value = isNaN(parseFloat(e.target.value))
            ? e.target.value
            : parseFloat(e.target.value);
          if (onChange) {
            const modelFields = {
              name,
              description,
              nickname,
              date,
              createdAt,
              updatedAt,
              send_cnt,
              magx,
              magy,
              magz,
              degree,
              distance: value,
              pres,
              temp,
              humi,
              general_data00,
              general_data01,
              postType,
            };
            const result = onChange(modelFields);
            value = result?.distance ?? value;
          }
          if (errors.distance?.hasError) {
            runValidationTasks("distance", value);
          }
          setDistance(value);
        }}
        onBlur={() => runValidationTasks("distance", distance)}
        errorMessage={errors.distance?.errorMessage}
        hasError={errors.distance?.hasError}
        {...getOverrideProps(overrides, "distance")}
      ></TextField>
      <TextField
        label="Pres"
        isRequired={false}
        isReadOnly={false}
        type="number"
        step="any"
        value={pres}
        onChange={(e) => {
          let value = isNaN(parseFloat(e.target.value))
            ? e.target.value
            : parseFloat(e.target.value);
          if (onChange) {
            const modelFields = {
              name,
              description,
              nickname,
              date,
              createdAt,
              updatedAt,
              send_cnt,
              magx,
              magy,
              magz,
              degree,
              distance,
              pres: value,
              temp,
              humi,
              general_data00,
              general_data01,
              postType,
            };
            const result = onChange(modelFields);
            value = result?.pres ?? value;
          }
          if (errors.pres?.hasError) {
            runValidationTasks("pres", value);
          }
          setPres(value);
        }}
        onBlur={() => runValidationTasks("pres", pres)}
        errorMessage={errors.pres?.errorMessage}
        hasError={errors.pres?.hasError}
        {...getOverrideProps(overrides, "pres")}
      ></TextField>
      <TextField
        label="Temp"
        isRequired={false}
        isReadOnly={false}
        type="number"
        step="any"
        value={temp}
        onChange={(e) => {
          let value = isNaN(parseFloat(e.target.value))
            ? e.target.value
            : parseFloat(e.target.value);
          if (onChange) {
            const modelFields = {
              name,
              description,
              nickname,
              date,
              createdAt,
              updatedAt,
              send_cnt,
              magx,
              magy,
              magz,
              degree,
              distance,
              pres,
              temp: value,
              humi,
              general_data00,
              general_data01,
              postType,
            };
            const result = onChange(modelFields);
            value = result?.temp ?? value;
          }
          if (errors.temp?.hasError) {
            runValidationTasks("temp", value);
          }
          setTemp(value);
        }}
        onBlur={() => runValidationTasks("temp", temp)}
        errorMessage={errors.temp?.errorMessage}
        hasError={errors.temp?.hasError}
        {...getOverrideProps(overrides, "temp")}
      ></TextField>
      <TextField
        label="Humi"
        isRequired={false}
        isReadOnly={false}
        type="number"
        step="any"
        value={humi}
        onChange={(e) => {
          let value = isNaN(parseFloat(e.target.value))
            ? e.target.value
            : parseFloat(e.target.value);
          if (onChange) {
            const modelFields = {
              name,
              description,
              nickname,
              date,
              createdAt,
              updatedAt,
              send_cnt,
              magx,
              magy,
              magz,
              degree,
              distance,
              pres,
              temp,
              humi: value,
              general_data00,
              general_data01,
              postType,
            };
            const result = onChange(modelFields);
            value = result?.humi ?? value;
          }
          if (errors.humi?.hasError) {
            runValidationTasks("humi", value);
          }
          setHumi(value);
        }}
        onBlur={() => runValidationTasks("humi", humi)}
        errorMessage={errors.humi?.errorMessage}
        hasError={errors.humi?.hasError}
        {...getOverrideProps(overrides, "humi")}
      ></TextField>
      <TextField
        label="General data00"
        isRequired={false}
        isReadOnly={false}
        type="number"
        step="any"
        value={general_data00}
        onChange={(e) => {
          let value = isNaN(parseFloat(e.target.value))
            ? e.target.value
            : parseFloat(e.target.value);
          if (onChange) {
            const modelFields = {
              name,
              description,
              nickname,
              date,
              createdAt,
              updatedAt,
              send_cnt,
              magx,
              magy,
              magz,
              degree,
              distance,
              pres,
              temp,
              humi,
              general_data00: value,
              general_data01,
              postType,
            };
            const result = onChange(modelFields);
            value = result?.general_data00 ?? value;
          }
          if (errors.general_data00?.hasError) {
            runValidationTasks("general_data00", value);
          }
          setGeneral_data00(value);
        }}
        onBlur={() => runValidationTasks("general_data00", general_data00)}
        errorMessage={errors.general_data00?.errorMessage}
        hasError={errors.general_data00?.hasError}
        {...getOverrideProps(overrides, "general_data00")}
      ></TextField>
      <TextField
        label="General data01"
        isRequired={false}
        isReadOnly={false}
        type="number"
        step="any"
        value={general_data01}
        onChange={(e) => {
          let value = isNaN(parseFloat(e.target.value))
            ? e.target.value
            : parseFloat(e.target.value);
          if (onChange) {
            const modelFields = {
              name,
              description,
              nickname,
              date,
              createdAt,
              updatedAt,
              send_cnt,
              magx,
              magy,
              magz,
              degree,
              distance,
              pres,
              temp,
              humi,
              general_data00,
              general_data01: value,
              postType,
            };
            const result = onChange(modelFields);
            value = result?.general_data01 ?? value;
          }
          if (errors.general_data01?.hasError) {
            runValidationTasks("general_data01", value);
          }
          setGeneral_data01(value);
        }}
        onBlur={() => runValidationTasks("general_data01", general_data01)}
        errorMessage={errors.general_data01?.errorMessage}
        hasError={errors.general_data01?.hasError}
        {...getOverrideProps(overrides, "general_data01")}
      ></TextField>
      <SelectField
        label="Post type"
        placeholder="Please select an option"
        isDisabled={false}
        value={postType}
        onChange={(e) => {
          let { value } = e.target;
          if (onChange) {
            const modelFields = {
              name,
              description,
              nickname,
              date,
              createdAt,
              updatedAt,
              send_cnt,
              magx,
              magy,
              magz,
              degree,
              distance,
              pres,
              temp,
              humi,
              general_data00,
              general_data01,
              postType: value,
            };
            const result = onChange(modelFields);
            value = result?.postType ?? value;
          }
          if (errors.postType?.hasError) {
            runValidationTasks("postType", value);
          }
          setPostType(value);
        }}
        onBlur={() => runValidationTasks("postType", postType)}
        errorMessage={errors.postType?.errorMessage}
        hasError={errors.postType?.hasError}
        {...getOverrideProps(overrides, "postType")}
      >
        <option
          children="Open"
          value="OPEN"
          {...getOverrideProps(overrides, "postTypeoption0")}
        ></option>
        <option
          children="Secret"
          value="SECRET"
          {...getOverrideProps(overrides, "postTypeoption1")}
        ></option>
      </SelectField>
      <Flex
        justifyContent="space-between"
        {...getOverrideProps(overrides, "CTAFlex")}
      >
        <Button
          children="Clear"
          type="reset"
          onClick={(event) => {
            event.preventDefault();
            resetStateValues();
          }}
          {...getOverrideProps(overrides, "ClearButton")}
        ></Button>
        <Flex
          gap="15px"
          {...getOverrideProps(overrides, "RightAlignCTASubFlex")}
        >
          <Button
            children="Submit"
            type="submit"
            variation="primary"
            isDisabled={Object.values(errors).some((e) => e?.hasError)}
            {...getOverrideProps(overrides, "SubmitButton")}
          ></Button>
        </Flex>
      </Flex>
    </Grid>
  );
}
