/* React */
import React from "react";
/* React Router */
import { useHistory } from "react-router-dom";
/* Material Imports */
import { makeStyles } from "@material-ui/core/styles";
import Container from "@material-ui/core/Container";
import Grid from "@material-ui/core/Grid";
import Paper from "@material-ui/core/Paper";
import Typography from "@material-ui/core/Typography";
import IconButton from "@material-ui/core/IconButton";
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
}));

const AccCreator = () => {
  const classes = useStyles();
  const history = useHistory();

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
          <Paper className={classes.paper}>
            <BankIcon style={{ fontSize: 59 }} />
            Bank Link
          </Paper>
        </Grid>
        <Grid item xs={6}>
          <Paper className={classes.paper}>
            <CardWithCoinsIcon style={{ fontSize: 59 }} />
            Manual Account
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default AccCreator;
