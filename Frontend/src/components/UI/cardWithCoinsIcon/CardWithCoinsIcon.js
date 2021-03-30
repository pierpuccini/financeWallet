/* React */
import React from "react";
/* Material UI */
import SvgIcon from "@material-ui/core/SvgIcon";
/* App icons */
import { ReactComponent as cardWithCoins } from "../../../assets/svgs/cardWithCoins.svg";

const CardWithCoinsIcon = (props) => {
  return <SvgIcon {...props} component={cardWithCoins}></SvgIcon>;
};

export default CardWithCoinsIcon;
