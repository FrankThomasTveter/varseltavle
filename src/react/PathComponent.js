import React, {Component} from "react";
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';

import SelectPath from './SelectPathComponent';
import TablePath from './TablePathComponent';
import RestPath from './RestPathComponent';
//console.log("Inside PathComponent.")
//calc(95% - 5px)

const styles = theme => ({
    root: {
	width:'100%',
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
    buttonInvisible:{},
    buttonDisabled: {},
    dataset:{},
});
function Details(props) {
    const { state,classes } = props; // 
    if (state.Layout.state.viewMode === state.Layout.modes.view.path) {
	return (
		<div className={classes.root}>
		<SelectPath    state={state} key={"select"} classes={{button:classes.button,buttonInvisible:classes.buttonInvisible,buttonDisabled:classes.buttonDisabled}}/>
		   <TablePath  state={state} key={"table"} classes={{button:classes.button,buttonInvisible:classes.buttonInvisible,buttonDisabled:classes.buttonDisabled}}/>
		   <RestPath   state={state} key={"rest"} classes={{button:classes.button,buttonInvisible:classes.buttonInvisible,buttonDisabled:classes.buttonDisabled}}/>
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

PathComponent.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(PathComponent);
