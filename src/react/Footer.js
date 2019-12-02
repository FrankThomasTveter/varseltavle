import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Grid from "@material-ui/core/Grid/Grid";
import Adress from "./Adress";
import Status from "./Status";


const styles = theme => ({
    root: {
        backgroundColor: theme.palette.primary.main,
        marginTop: theme.spacing.unit * 8,
        bottom: 0,
        padding: `${theme.spacing.unit * 6}px 0`,
        color: '#FFF',
	justify: 'flex-start',
    },
    text: {
        maxWidth: theme.spacing.getMaxWidth.maxWidth,
        margin: theme.spacing.getMaxWidth.margin,
    },
});

function Footer(props) {
    const { classes, state } = props;
    return (
        <footer className={classes.root}>
            <Grid container spacing={24} className={classes.text}>
	       <Grid item xs={8}>
	          <Adress />
               </Grid>
	       <Grid item xs={4} style={{position: 'absolute', right: 0}}>
	          <Status state={state} />
               </Grid>
            </Grid>
        </footer>
    );
}

Footer.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(Footer);
