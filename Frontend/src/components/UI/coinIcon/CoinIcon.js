/* React */
import React from "react";
/* Material UI */
import { makeStyles } from "@material-ui/core/styles";
import Icon from "@material-ui/core/Icon";
/* App icons */
import coinIcon from "../../../assets/images/coin-logo.png";

const useStyles = makeStyles((theme) => ({
  imageIcon: {
    height: "100%",
  },
  iconRootCoin: {
    textAlign: "center",
    "font-size": "unset",
  },
}));

/**
 * width for icon
 * height for icon
 * @param {*} props
 * @returns
 */
const CoinIcon = (props) => {
  const classes = useStyles();
  const { width, height } = props;

  return (
    <Icon
      classes={{ root: classes.iconRootCoin }}
      style={{ width: width, height: height }}
    >
      <img className={classes.imageIcon} src={coinIcon} alt="coin icon" />
    </Icon>
  );
};

export default CoinIcon;
