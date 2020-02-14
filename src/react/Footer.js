import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';

import {teal_palette} from '../mui/metMuiThemes';

import Grid from "@material-ui/core/Grid/Grid";
import Adress from "./Adress";
import LevelBar from "./LevelBar";
import Status from "./Status";

const styles = theme => ({
    footer: {
	backgroundColor:teal_palette.main,
	color:'white',
    },
    text: {
	maxWidth: "100%",
	margin: "1%",
	width:'90%',
    },
    icon: {
	height:'100%',
	width:'100%',
	fill:'Red',
    }
});

//text        maxWidth: theme.spacing.getMaxWidth.maxWidth,
//text        margin: theme.spacing.getMaxWidth.margin,



function Footer(props) {
    const { classes, state } = props;
    return (
	    <div className={classes.footer}>
            <Grid container spacing={24} className={classes.text}>
	       <Grid item xs={3}>
 	          <Adress />
	       </Grid>
	       <Grid item xs={6}>
	          <LevelBar state={state}/>
	       </Grid>
	       <Grid item xs={5} style={{position: 'absolute', right: 0}}>
	          <Status state={state}/>
	       </Grid>
	    </Grid>
        </div>
    );
}

//import Test from "./test.jsx";
//import Vessel from "./vesselicing.jsx";
//
//const SvgIcon = () => (<svg fill='Red' stroke="Red" width="30px" height="30px" preserveAspectRatio="none">
//		       <Test/>
//</svg>)
//
// style={{border: '1px solid red'}}
//	    <Grid item xs={3} style={{fill:"Red"}}>
//	    <div style={{width:'30px', height:'30px',fill:'White',stroke:'White',background:"Red"}}> <Vessel/> </div>
//	    <SvgIcon/>
//	    </Grid>

Footer.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(Footer);
