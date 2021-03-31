/* React */
import React, { useState, Fragment } from "react";
/* React Router */
import { useHistory } from "react-router-dom";
/* Material Imports */
import { makeStyles } from "@material-ui/core/styles";
import Container from "@material-ui/core/Container";
import Grid from "@material-ui/core/Grid";
import Paper from "@material-ui/core/Paper";
import Typography from "@material-ui/core/Typography";
import IconButton from "@material-ui/core/IconButton";
import TextField from "@material-ui/core/TextField";
import MenuItem from "@material-ui/core/MenuItem";
/* Icons */
import KeyboardBackspaceIcon from "@material-ui/icons/KeyboardBackspace";
/* CustomIcons */
import BankIcon from "../../components/UI/bankIcon/BankIcon";
import CardWithCoinsIcon from "../../components/UI/cardWithCoinsIcon/CardWithCoinsIcon";

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
    padding: 0,
  },
  row: {
    display: "flex",
  },
  gridParent: {
    marginTop: 0,
  },
  paper: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    padding: theme.spacing(2),
    textAlign: "center",
    color: theme.palette.text.secondary,
    borderRadius: "10px",
    borderColor: "transparent",
    borderWidth: "3px",
    borderStyle: "solid",
    "&:hover": {
      cursor: "pointer",
      borderColor: theme.palette.primary.main,
      borderWidth: "3px",
      borderStyle: "solid",
    },
  },
  button: {
    margin: theme.spacing(1),
    fontWeight: 600,
    width: "-webkit-fill-available",
  },
  noPaddingIconButton: {
    padding: 0,
  },
  headerTypography: {
    marginLeft: theme.spacing(1),
  },
  form: {
    marginTop: theme.spacing(3),
  },
  textField: {
    margin: theme.spacing(1, 0),
    width: "100%",
  },
}));

const banks = [
  { name: "Davivienda", key: "davi" },
  { name: "Bancolombia", key: "bcol" },
];

const AccCreator = () => {
  const classes = useStyles();
  const history = useHistory();

  const [linkType, setLinkType] = useState(null);
  const [bankCode, setBankCode] = useState("");

  const handleBankChange = (event) => {
    setBankCode(event.target.value);
  };

  return (
    <Container className={classes.root}>
      <div className={classes.row}>
        <IconButton
          className={classes.noPaddingIconButton}
          aria-label="go back"
          component="span"
          onClick={() => {
            history.goBack();
          }}
        >
          <KeyboardBackspaceIcon />
        </IconButton>
        <Typography className={classes.headerTypography} variant="h5">
          Create Account
        </Typography>
      </div>
      <Typography variant="subtitle" gutterBottom>
        Chose category
      </Typography>

      <Grid
        className={classes.gridParent}
        container
        justify="center"
        spacing={3}
      >
        <Grid item xs={6}>
          <Paper className={classes.paper} onClick={() => setLinkType("bank")}>
            <BankIcon style={{ fontSize: 59 }} />
            Bank Link
          </Paper>
        </Grid>
        <Grid item xs={6}>
          <Paper
            className={classes.paper}
            onClick={() => setLinkType("manual")}
          >
            <CardWithCoinsIcon style={{ fontSize: 59 }} />
            Manual Account
          </Paper>
        </Grid>
      </Grid>

      {!linkType ? null : (
        <form className={classes.form} noValidate autoComplete="off">
          {linkType === "manual" ? (
            <TextField
              className={classes.textField}
              id="name"
              type="text"
              label="Budget Name"
              helperText="Must enter a name for this budget."
            />
          ) : (
            <Fragment>
              <TextField
                className={classes.textField}
                id="selected-bank"
                select
                label="Select"
                value={bankCode}
                onChange={handleBankChange}
                helperText="Please select your bank"
              >
                {banks.map((option) => (
                  <MenuItem key={option.key} value={option.key}>
                    {option.name}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                className={classes.textField}
                id="username"
                type="text"
                label="Username/ID"
                helperText="Bank User/ID requiered for bank connection"
              />
              <TextField
                className={classes.textField}
                id="password"
                type="password"
                label="Password"
                helperText="Bank password requiered for bank connection"
              />
            </Fragment>
          )}
          <TextField
            className={classes.textField}
            id="budget"
            type="number"
            label="Enter Budget"
            helperText="Must enter your budgets amount."
          />
        </form>
      )}
    </Container>
  );
};

export default AccCreator;
