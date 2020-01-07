import * as actionTypes from "../actions/actionTypes";
import { updateObject } from "../../Helpers/utility";

const initialState = {
  error: false,
  loading: false,
  success: false,
  message: null
};

const messageStart = (state, action) => {
  return updateObject(state, { loading: true, success: false, error: false, message: null });
};

const messageSuccess = (state, action) => {
  return updateObject(state, { loading: false, success: true, message: action.message });
};

const messageFailed = (state, action) => {
  return updateObject(state, { loading: false, error: true });
};

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case actionTypes.MESSAGE_START: return messageStart(state, action);
    case actionTypes.MESSAGE_SUCCESS: return messageSuccess(state, action);
    case actionTypes.MESSAGE_FAILED: return messageFailed(state, action);
    default:
      return state;
  }
};

export default reducer;
