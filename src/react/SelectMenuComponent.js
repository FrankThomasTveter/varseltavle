import React, {Component} from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import SelectIcon from '@material-ui/icons/Done';
import SelectKey from './SelectKeyComponent';

const styles = theme => ({
    select: {
	display: 'inline-block',
        marginRight: 'auto',
	height:'100%',
    },
    tableSelect: {
	display: 'inline-block',
        marginRight: 'auto',
    },
    button:{
	color:'white',
	"&$buttonDisabled": {
            color: theme.palette.primary.main,
	}
    },
    buttonDisabled: {},
});
//   className={classes.select}  -> horisontal layout
function renderMenuItem(classes,state,keyitem,keyindex) {
    return (<MenuItem key={keyitem}>  
	       <SelectKey state={state} title={keyitem} keyitem={keyitem}/>
	    </MenuItem>
	   );
}
class SelectMenu extends Component {
    state={anchor:null};
    render() {
        const { classes, state } = this.props;
	this.onClick = event => {this.setState({ anchor: event.currentTarget });};
	this.onClose = () => {this.setState({ anchor: null });};
	var items=state.Path.keys.path||[];
	//items=items.sort(state.Utils.ascending);
	var mapFunction= (item,index)=>renderMenuItem(classes,state,item,index);
	//console.log("Select.rendering",items.length,JSON.stringify(anchor),Boolean(anchor));
	var disabled=(items.length===0);
	//className={classes.button}
	if (disabled) {
	    return (
		   <Button
                      classes={{root:classes.button,disabled:classes.buttonDisabled}} 
                      aria-owns={this.state.anchor ? 'selects-menu' : undefined}
                      aria-haspopup="true"
                      onClick={this.onClick}
	              title={"Selected order"}
		      disabled={disabled} 
		    >
	  	       <SelectIcon state={state}/>
                     </Button>
	    );
	} else {
	    return (
		<div className={classes.tableSelect}>
		   <Button
                       classes={{root:classes.button,disabled:classes.buttonDisabled}} 
                      aria-owns={this.state.anchor ? 'selects-menu' : undefined}
                      aria-haspopup="true"
                      onClick={this.onClick}
	              title={"Selected order"}
		      disabled={disabled} 
		    >
	  	       <SelectIcon state={state}/>
                     </Button>
		     <Menu
	                className={classes.tableSelect}
                        id="selects-menu"
	                anchorEl={this.state.anchor}
                        open={Boolean(this.state.anchor)}
                        onClose={this.onClose}
		     >
		        {items.map(mapFunction)}
	             </Menu>
		</div>
	    );
	};
    }
}

SelectMenu.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(SelectMenu);
