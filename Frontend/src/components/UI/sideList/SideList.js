//React Imports
import React from "react";
//MaterialUI Imports
import List from "@material-ui/core/List";
import Divider from "@material-ui/core/Divider";
import ListItem from "@material-ui/core/ListItem";
//Icons
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemText from "@material-ui/core/ListItemText";
import HomeOutlinedIcon from "@material-ui/icons/HomeOutlined";
// import FolderOutlinedIcon from "@material-ui/icons/FolderOutlined";
import AccountBalanceWalletOutlinedIcon from "@material-ui/icons/AccountBalanceWalletOutlined";
//App imports
import CoinIcon from "../coinIcon/CoinIcon";

const SideList = (props) => {
  const { toggleDrawer, onChange } = props;

  //Items above divider
  const sideNavigationItems = [
    {
      text: "Banky",
      url: "home",
      icon: <CoinIcon width="32px" height="32px" />,
    },
  ];
  //Items below diveider
  const secondSideNavigationItems = [
    {
      text: "Home",
      url: "home",
      icon: <HomeOutlinedIcon />,
    },
    {
      text: "Wallet",
      url: "wallet",
      icon: <AccountBalanceWalletOutlinedIcon />,
    },
    // {
    //   text: "File Archive",
    //   url: "file-archive",
    //   icon: <FolderOutlinedIcon />,
    // },
  ];
  return (
    <div
      role="presentation"
      onClick={() => {
        toggleDrawer(false);
      }}
      onKeyDown={() => {
        toggleDrawer(false);
      }}
    >
      <List>
        {sideNavigationItems.map((item) => (
          <ListItem
            button
            key={item.url}
            onClick={() => {
              onChange(null, item.url);
            }}
          >
            <ListItemIcon>{item.icon}</ListItemIcon>
            <ListItemText primary={item.text} />
          </ListItem>
        ))}
      </List>
      <Divider />
      <List>
        {secondSideNavigationItems.map((items) => (
          <ListItem
            button
            key={items.url}
            onClick={() => {
              onChange(null, items.url);
            }}
          >
            <ListItemIcon>{items.icon}</ListItemIcon>
            <ListItemText primary={items.text} />
          </ListItem>
        ))}
      </List>
    </div>
  );
};

export default SideList;
