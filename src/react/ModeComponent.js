import React, {Component} from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';

import FlagIcon from '@material-ui/icons/Flag';
import BarIcon from '@material-ui/icons/BarChart';
import ListIcon from '@material-ui/icons/Details';
import MapIcon from '@material-ui/icons/Map';

const styles = theme => ({
    view: {
        marginLeft: 'auto',
    },
    button:{
	color:'white'
    },
});
function getModes(state,mode) {
    if (mode !== undefined) {
	var layoutMode=0;
	var cellMode=0;
	if (mode === "Flags") {
	    layoutMode=state.Layout.code.layout.Table;
	    cellMode=state.Layout.code.cell.Sum;
	} else if (mode === "Bars") {
	    layoutMode=state.Layout.code.layout.Table;
	    cellMode=state.Layout.code.cell.Series;
	} else if (mode === "List") {
	    layoutMode=state.Layout.code.layout.List;
	} else if (mode === "Map") {
	    layoutMode=state.Layout.code.layout.Map;
	}
	return {layout:layoutMode,cell:cellMode};
    } else {
	return {layout:state.Layout.state.layoutMode,cell:state.Layout.state.cellMode};
    };
};
function ModeIcon (props) {
    const {state,mode} = props;
    var modes=getModes(state,mode);
    var layoutMode=modes.layout;
    var cellMode=modes.cell;
    if (layoutMode === state.Layout.code.layout.Table) {
	if (cellMode === state.Layout.code.cell.Sum) {
	    return (<FlagIcon/>);
	} else {
	    return (<BarIcon/>);
	}
    } else if (layoutMode === state.Layout.code.layout.List) {
	return (<ListIcon/>);
    } else {
	return (<MapIcon/>);
    }
};
function renderMode (state,classes,onclose,mode,index) {
    var modes=getModes(state,mode);
    var layoutMode=modes.layout;
    var cellMode=modes.cell;
    var onclick = (event) => {state.Layout.toggleMode(state,layoutMode,cellMode);onclose();};
    return (<MenuItem key={mode} onClose={onclose}>
	       <Button classes={{root:classes.button}} onClick={onclick} title={mode}>
	          <ModeIcon mode={mode} state={state}/>
	       </Button>
	    </MenuItem>);
	   };
class Mode extends Component {
    state = {anchor: null,};
    render() {
	const {classes, state}=this.props;
	var modes=["Flags","Bars","List","Map"];
	this.onClose = () => {this.setState({ anchor: null });};
	this.onClick = (event) => {this.setState({ anchor: event.currentTarget });};
	var mapFunction= (mode,index)=>renderMode(state,classes,this.onClose,mode,index);
	return (<div className={classes.view}>
		   <Button
                      className={classes.button}
                      aria-owns={this.state.anchor ? 'mode-menu' : undefined}
                      aria-haspopup="true"
                      onClick={this.onClick}
	              title={"Select mode."}
		   >
		      {<ModeIcon state={state}/>}
                   </Button>
	          <Menu
                   id="mode-menu"
	           anchorEl={this.state.anchor}
                   open={Boolean(this.state.anchor)}
                   onClose={this.onClose}
	          >
		    {modes.map(mapFunction)}
	          </Menu>
		</div>);
    }
}

Mode.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(Mode);
