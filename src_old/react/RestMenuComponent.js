import React, {Component} from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import Chip from '@material-ui/core/Chip';
//import FullIcon from '@material-ui/icons/HourglassFull';
//import EmptyIcon from '@material-ui/icons/HourglassEmpty';
import Remove     from './RemoveComponent';
import OtherFullIcon from '@material-ui/icons/HourglassFull';
import OtherEmptyIcon from '@material-ui/icons/HourglassEmpty';

import RestValue from './RestValueComponent';

const styles = theme => ({
    config: {
	margin:'0px',
        marginLeft: 'auto',
    },
    tabchip: {
        margin: theme.spacing(1),
	cursor: "pointer",
        color:"red",
        borderColor:"blue",
    },
    remove: {
	display: 'inline-block',
        marginRight: 'auto',
	height:'100%',
    },
});
function getChipIcon(keytype) {
    if (keytype === "otherRest") {
	return <OtherFullIcon/>;
    } else {
	return <OtherEmptyIcon/>;
    }
}
function renderMenuItem(classes,state,item,index,keyitem,keytype,onClose) {
    //console.log("KeyItem:",keyitem);
    if (item !== undefined) {
	return (<MenuItem key={'rest-'+item}>
		<RestValue state={state} keyvalue={item} keytype={keytype} target={keyitem} onclose={onClose}/> 
	    </MenuItem>);
    } else {
	return null;
    }
}
class RestMenu extends Component {
    state={anchor:null};
    render() {
        const { classes, state, keyitem, keytype, remove } = this.props;
	this.onClick = event => {
	    if (items.length===0) {
		this.setState({ anchor: null });
	    } else {
		this.setState({ anchor: event.currentTarget });
	    };
	};
	this.onClose = () => {this.setState({ anchor: null });};
	if (remove !== undefined) {
	    this.remove = () => {state.Navigate.onClickPath(state,remove,keyitem);this.onClose();};
	} else {
	    this.remove = () => {state.Navigate.onClickPath(state,'trash',keyitem);this.onClose();};
	};
	var items=state.Database.getKeyValues(state,keyitem);//state.Database.values[keyitem];
	items=items.sort(state.Utils.ascending);
	var icon=getChipIcon(keytype);
	//console.log("Rest key:",keyitem,keytype);
	var mapFunction= (item,index)=>renderMenuItem(classes,state,item,index,keyitem,keytype,this.onClose);
	//console.log("RestMenu.rendering:",keyitem,JSON.stringify(items));
	return (<div className={classes.config} key={keyitem}>
		   <Chip key={keyitem}
                      label={keyitem}
	              icon={icon}
                      aria-owns={this.state.anchor ? 'keys-menu' : undefined}
                      aria-haspopup="true"
                      onClick={this.onClick}
                      className={classes.tabchip}
                      variant="outlined"/>
		     <Menu
                        id="keys-menu"
	                anchorEl={this.state.anchor}
                        open={Boolean(this.state.anchor)}
                        onClose={this.onClose}
		     >
		       <MenuItem key="remove" onClose={this.onClose} className={classes.remove}>
		<Remove state={state} keyitem={keyitem} onclick={this.remove} onclose={this.onClose}/>
		       </MenuItem>
		        {items.map(mapFunction)}
		        {mapFunction("",-1)}
	             </Menu>
	</div>);
    }
}


RestMenu.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(RestMenu);
