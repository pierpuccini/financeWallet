import * as actionTypes from "./actionTypes";
import axios from "../../Helpers/axios";

export const messageStart = () => {
  return {
    type: actionTypes.MESSAGE_START
  };
};

export const messageSuccess = (message) => {
  return {
    type: actionTypes.MESSAGE_SUCCESS,
    message: message
  };
};

export const messageFailed = () => {
  return {
    type: actionTypes.MESSAGE_FAILED
  };
};

export const sendMessage = payload => {
  return dispatch => {
    dispatch(messageStart());
    payload = { text: payload.text.value };
    axios
      .post("/text", payload)
      .then(res => {
        console.log("res", res);
        dispatch(messageSuccess(res.data.message));
      })
      .catch(error => {
        console.log("error", error);
        dispatch(messageFailed());
      });
  };
};
