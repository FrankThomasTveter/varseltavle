import React, {Component} from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import Chip from '@material-ui/core/Chip';
import TabIcon from '@material-ui/icons/Apps';

import TableKey from './TableKeyComponent';
import Remove   from './RemoveComponent';

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
});
function renderMenuItem(classes,state,keyitem,keyindex,key,onClose) {
    return (<MenuItem key={keyitem}>
	       <TableKey state={state} keyitem={keyitem} target={key} onclose={onClose}/> 
	    </MenuItem>);
}
class TableMenu extends Component {
    state={anchor:null};
    render() {
        const { classes, state, value } = this.props;
	this.onClick = event => {
	    //if (items.length===0) {
		//this.setState({ anchor: null });
	    //} else {
		this.setState({ anchor: event.currentTarget });
	    //};
	};
	this.onClose = () => {this.setState({ anchor: null });};
	this.remove = () => {state.Navigate.onClickPath(state,'trash',value);this.onClose();};
	var items=state.Utils.cp(state.Path.other.rest);
	items=items.sort(state.Utils.ascending);
	var mapFunction= (item,index)=>renderMenuItem(classes,state,item,index,value,this.onClose);
	//console.log("TableMenu.rendering:",value,JSON.stringify(items));
	return (
		<div className={classes.config} key={value}>
		   <Chip
                      icon={<TabIcon />}
                      label={value}
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
		          <Remove state={state} keyitem={value} onclick={this.remove} onclose={this.onClose}/>
		       </MenuItem>
		        {items.map(mapFunction)}
	             </Menu>
		</div>
	);
    }
}

TableMenu.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(TableMenu);
