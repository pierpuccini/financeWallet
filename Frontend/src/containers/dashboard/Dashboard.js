/* React */
import React from "react";
/* Redux */
import { useSelector } from "react-redux";
/* Material Imports */
import { makeStyles } from "@material-ui/core/styles";
import Container from "@material-ui/core/Container";
import Grid from "@material-ui/core/Grid";
import Paper from "@material-ui/core/Paper";
import Typography from "@material-ui/core/Typography";

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
  },
  paper: {
    padding: theme.spacing(2),
    textAlign: "center",
    color: theme.palette.text.secondary,
  },
  skeleton: {
    borderRadius: theme.spacing(2),
  },
}));

const Dashboard = () => {
  const classes = useStyles();
  const profile = useSelector((state) => state.firebase.profile);

  return (
    <Container className={classes.root}>
      <Typography variant="h4" gutterBottom>
        Budgets
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Paper className={classes.paper}>No banks configured</Paper>
        </Grid>
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
