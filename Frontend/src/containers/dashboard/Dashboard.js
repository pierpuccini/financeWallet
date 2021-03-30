/* React */
import React from "react";
/* Material Imports */
import { makeStyles } from "@material-ui/core/styles";
import Container from "@material-ui/core/Container";
import Grid from "@material-ui/core/Grid";
// import Paper from "@material-ui/core/Paper";
import Typography from "@material-ui/core/Typography";
import Button from "@material-ui/core/Button";
/* Icons */
import AddCircleIcon from "@material-ui/icons/AddCircle";

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
    padding: 0,
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
}));

const Dashboard = () => {
  const classes = useStyles();

  return (
    <Container className={classes.root}>
      <Typography variant="h4" gutterBottom>
        Budgets
      </Typography>
      <Button
        variant="contained"
        className={classes.button}
        startIcon={<AddCircleIcon />}
      >
        Create budget
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

export default Dashboard;
