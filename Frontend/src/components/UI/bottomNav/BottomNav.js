/* React */
import React from "react";
/* Material Imports */
import { makeStyles } from "@material-ui/core/styles";
import BottomNavigation from "@material-ui/core/BottomNavigation";
import BottomNavigationAction from "@material-ui/core/BottomNavigationAction";
/* Icons */
import FolderOutlinedIcon from "@material-ui/icons/FolderOutlined";
import HomeOutlinedIcon from "@material-ui/icons/HomeOutlined";
import AccountBalanceWalletOutlinedIcon from "@material-ui/icons/AccountBalanceWalletOutlined";

const useStyles = makeStyles((theme) => ({
  bottomNav: {
    [theme.breakpoints.up("sm")]: {
      display: "none",
    },
    [theme.breakpoints.down("sm")]: {
      width: "100%",
      position: "fixed",
      bottom: "0",
    },
  },
}));

function BottomNav(props) {
  const classes = useStyles();

  const { onChange } = props;
  const navRoute = "home";

  return (
    <BottomNavigation
      id="footer"
      className={classes.bottomNav}
      value={navRoute}
      onChange={() => {
        onChange(null, navRoute);
      }}
      showLabels
    >
      <BottomNavigationAction
        label="Home"
        value="home"
        icon={<HomeOutlinedIcon />}
      />
      <BottomNavigationAction
        label="Wallet"
        value="wallet"
        icon={<AccountBalanceWalletOutlinedIcon />}
      />
      <BottomNavigationAction
        label="File Archive"
        value="file-archive"
        icon={<FolderOutlinedIcon />}
      />
    </BottomNavigation>
  );
}

export default BottomNav;
