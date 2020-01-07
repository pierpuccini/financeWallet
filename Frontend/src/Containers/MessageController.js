/* React Imports */
import React, { useState } from "react";
//Redux
import { connect } from "react-redux";
import * as actions from "../Store/actions/index";
/* App imports */
import Message from "../Components/Message";
import { updateObject, checkValidity } from "../Helpers/utility";

const MessageController = props => {
  const { sendMessage, loading, success, error, message } = props;

  const [text, setText] = useState({
    text: {
      value: "",
      validation: {
        required: true
      },
      valid: false,
      touched: false
    }
  });

  const inputChangeHandler = (event, controlName) => {
    const updatedControls = updateObject(text, {
      [controlName]: updateObject(text[controlName], {
        value: event.target.value,
        valid: checkValidity(event.target.value, text[controlName].validation),
        touched: true
      })
    });
    setText(updatedControls);
  };

  const handleSubmit = event => {
    event.preventDefault();
    console.log("submited");
    sendMessage(text);
  };

  return (
    <Message
      handleSubmit={handleSubmit}
      text={text}
      inputChangeHandler={inputChangeHandler}
      isLoading={loading}
      textResponse={message}
      success={success}
      error={error}
    />
  );
};

const mapStateToProps = state => {
  return {
    loading: state.loading,
    success: state.success,
    error: state.error,
    message: state.message
  };
};

const mapDispatchToProps = dispatch => {
  return {
    sendMessage: (payload, typeOfLogin) =>
      dispatch(actions.sendMessage(payload))
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(MessageController);
