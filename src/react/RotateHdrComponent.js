import React, {Component} from "react";
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';

import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';

import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableRow from '@material-ui/core/TableRow';
import TableHead from '@material-ui/core/TableHead';
import TableCell from '@material-ui/core/TableCell';
import ReactDOM from 'react-dom';

//console.log("Inside Table.")

//        flexGrow: 1,
const styles = theme => ({
    cell : {
	cursor: "pointer",
	padding: theme.spacing.unit*0,
	width:theme.spacing.unit*0,
	borderStyle: 'solid',
    },
    rotate : {
	cursor: "pointer",
	padding: theme.spacing.unit*0,
	width:theme.spacing.unit*0,
	borderStyle: 'solid',
	width:"20px",
//	textAlign:"right",
    },
});


class Rotate extends Component {
    render() {
	const { classes, state, key, index,onClick,title,val} = this.props;
	console.log("RotateHdr:",title,index);
	if (index < 51) {
	    return (<TableCell className={classes.rotate} key={key} index={index} onClick={onClick} title={title}>{index}</TableCell>);
	} else {
	    return null;
	}
    }
}

Rotate.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(Rotate);
