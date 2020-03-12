import React, {Component} from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import Chip from '@material-ui/core/Chip';
import Remove     from './RemoveComponent';

import RestValue from './RestValueComponent';

const styles = theme => ({
    config: {
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
function renderMenuItem(classes,state,item,index,keyitem,onClose) {
    //console.log("KeyItem:",keyitem);
    if (item !== undefined) {
	return (<MenuItem key={'rest-'+item}>
	       <RestValue state={state} keyvalue={item} target={keyitem} onclose={onClose}/> 
	    </MenuItem>);
    } else {
	return null;
    }
}
class RestMenu extends Component {
    state={anchor:null};
    render() {
        const { classes, state, keyitem, remove } = this.props;
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
	var mapFunction= (item,index)=>renderMenuItem(classes,state,item,index,keyitem,this.onClose);
	//console.log("RestMenu.rendering:",keyitem,JSON.stringify(items));
	return (
		<div className={classes.config} key={keyitem}>
		   <Chip
                      label={keyitem}
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
		</div>
	);
    }
}

RestMenu.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(RestMenu);
