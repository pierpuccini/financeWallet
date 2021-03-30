/* React */
import React from "react";
/* React Router */
import { useHistory } from "react-router-dom";
/* Material Imports */
import { makeStyles } from "@material-ui/core/styles";
import Container from "@material-ui/core/Container";
import Grid from "@material-ui/core/Grid";
// import Paper from "@material-ui/core/Paper";
import Typography from "@material-ui/core/Typography";
import Button from "@material-ui/core/Button";
import IconButton from "@material-ui/core/IconButton";
/* Icons */
import KeyboardBackspaceIcon from "@material-ui/icons/KeyboardBackspace";
import AddCircleIcon from "@material-ui/icons/AddCircle";

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
    padding: 0,
  },
  row: {
    display: "flex",
  },
  paper: {
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
      <Button
        variant="contained"
        className={classes.button}
        startIcon={<AddCircleIcon />}
      >
        Create account
      </Button>
      <Grid container spacing={3}>
        <Grid item xs={12}></Grid>
        {/* {banks.map((bank, i) => {
          return (
            <Grid item key={i} xs={6} sm={3}>
              <Paper className={classes.paper}>xs=6 sm=3</Paper>
            </Grid>
          );
        })} */}
      </Grid>
    </Container>
  );
};

export default AccCreator;
