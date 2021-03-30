/* React */
import React from "react";
/* Material UI */
import SvgIcon from "@material-ui/core/SvgIcon";
/* App icons */
import { ReactComponent as miniBank } from "../../../assets/svgs/miniBank.svg";

const BankIcon = (props) => {
  return <SvgIcon {...props} component={miniBank}></SvgIcon>;
};

export default BankIcon;
