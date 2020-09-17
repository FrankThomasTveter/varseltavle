import React, {Component} from "react";
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
//import TrashIcon from '@material-ui/icons/Delete';

import SelectPath from './SelectPathComponent';
import TablePath from './TablePathComponent';
import RestPath from './RestPathComponent';
//console.log("Inside PathComponent.")

const styles = theme => ({
    root: {
	width:'calc(95% - 5px)',
	display:'flex',
	flexWrap:'wrap',
	alignContent:'flex-start',
	border:0,
	fontSize:'0px',
	//	border:  '1px solid red',
    },
    paper: {
        padding: theme.spacing(2),
        textAlign: 'left',
    },
    paperImage: {
        textAlign: 'center',
        padding: theme.spacing(2),
    },
    button : {
	color: 'white',
    },
    dataset:{},
});
function Details(props) {
    const { state,classes } = props; // 
    if (state.Layout.state.viewMode === state.Layout.modes.view.path) {
	return (
		<div className={classes.root}>
		   <SelectPath state={state} key={"select"}/>
		   <TablePath  state={state} key={"table"}/>
		   <RestPath   state={state} key={"rest"}/>
		</div>
	);
    } else {
	return (null);
    };
}
class PathComponent extends Component {
    constructor(props) {
	super(props);
	const {state} = props;
	state.React.Path=this;
    };
    showPath(state) {
	//console.log("Showing PathComponent.",JSON.stringify(state.Path.keys));
	this.forceUpdate();
    };
    render() {
        const { classes, state } = this.props;
        return (
            <div className={classes.root}>
		       <Details classes={classes} state={state}/>
            </div>
        );
    }
}
//                <Grid container spacing={0}>
//                    <Grid item xs={0}>
//                    </Grid>
//                </Grid>

PathComponent.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(PathComponent);
