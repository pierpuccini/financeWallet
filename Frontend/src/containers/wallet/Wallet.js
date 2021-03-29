/* React */
import React from "react";
/* Material Imports */
import { makeStyles } from "@material-ui/core/styles";
import Container from "@material-ui/core/Container";
import Grid from "@material-ui/core/Grid";
import Paper from "@material-ui/core/Paper";

const useStyles = makeStyles((theme) => ({
  paper: {
    height: 140,
    width: 100,
  },
}));

const Wallet = () => {
  const classes = useStyles();

  return (
    <Container>
      <Grid item xs={12}>
        <Grid container justify="center" spacing={2}>
          {[0, 1, 2].map((value) => (
            <Grid key={value} item>
              <Paper className={classes.paper} />
            </Grid>
          ))}
        </Grid>
      </Grid>
    </Container>
  );
};

export default Wallet;
