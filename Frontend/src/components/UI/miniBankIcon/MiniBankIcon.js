/* React */
import React from "react";
/* Material UI */
import SvgIcon from "@material-ui/core/SvgIcon";
/* App icons */
import { ReactComponent as miniBank } from "../../../assets/miniBank.svg";

const CoinIcon = (props) => {
  return <SvgIcon {...props} component={miniBank}></SvgIcon>;
};

export default CoinIcon;
