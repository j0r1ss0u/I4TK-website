import { Base64 } from "js-base64";

export const parseBase64DataURL = (dataURL) => {
  if (!dataURL.startsWith("data:application/json;base64,")) {
    throw new Error("Invalid data URL format");
  }
  const base64String = dataURL.replace("data:application/json;base64,", "");
  const jsonString = Base64.decode(base64String);
  const jsonObject = JSON.parse(jsonString);
  return jsonObject;
};

export const timestampToDateString = (timestamp) => {
  const date = new Date(timestamp);
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const day = String(date.getDate()).padStart(2, "0");
  const month = monthNames[date.getMonth()];
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");
  return `${day} ${month} ${year}, ${hours}:${minutes}:${seconds}`;
};