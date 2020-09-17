import React, {Component} from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Tooltip  from './Tooltip';
//import Button from '@material-ui/core/Button';
//import Chip from '@material-ui/core/Chip';

const styles = theme => ({
    button:{},
});
class TooltipFloat extends Component {
    constructor(props) {
	super(props);
	const {state} = props;
	state.React.TooltipFloat=this;
	this.update=this.update.bind(this);
	this.visible=false;
	this.data=null;
	this.cnt=0;
    };
    toggle(visible) {
	if (visible !== undefined) {
	    this.visible=visible;
	} else {
	    this.visible=!this.visible;
	}
    }
    update(data) {
	if (this.data !== null && this.data.id === data.id) {
	    this.data=null;
	    this.toggle(false);
	} else {
	    this.toggle(this.data === null || this.data.id !== data.id)
	    this.data=data;
	}
	//console.log("Updating tooltip...");
	this.forceUpdate();
    };
    render() {
	const { state, update } = this.props; //classes, 
	if (state.Layout.state.tooltip!==2 && this.visible) {
	    return (
		    <div style={{position:'absolute',right:'0px',zIndex:100000, backgroundColor:"white"}} >
		    <Tooltip state={state} data={this.data} update={update}/>
		    </div> );
	} else {
	    return null;
	}
    }
};



TooltipFloat.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(TooltipFloat);
