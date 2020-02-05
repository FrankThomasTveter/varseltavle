import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';

import {teal_palette} from '../mui/metMuiThemes';

import Grid from "@material-ui/core/Grid/Grid";
import Adress from "./Adress";
import Disclaimer from "./Disclaimer";
import Status from "./Status";


const styles = theme => ({
    footer: {
	backgroundColor:teal_palette.main,
	color:'white',
    },
    text: {
        maxWidth: theme.spacing.getMaxWidth.maxWidth,
        margin: theme.spacing.getMaxWidth.margin,
	width:'90%',
    },
});

function Footer(props) {
    const { classes, state } = props;
    return (
	<div className={classes.footer}>
            <Grid container spacing={24} className={classes.text}>
	       <Grid item xs={3}>
 	          <Adress />
	       </Grid>
	       <Grid item xs={6}>
	          <Disclaimer state={state}/>
	       </Grid>
	       <Grid item xs={5} style={{position: 'absolute', right: 0}}>
	          <Status state={state}/>
	       </Grid>
	    </Grid>
        </div>
    );
}
// style={{border: '1px solid red'}}

Footer.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(Footer);
