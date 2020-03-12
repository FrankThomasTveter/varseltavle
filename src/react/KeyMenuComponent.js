import React, {Component} from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
//import KeyIcon from '@material-ui/icons/VpnKey';
import KeyIcon from '@material-ui/icons/Visibility';
import Key     from './KeyComponent';

const styles = theme => ({
    settings:{},
    config: {
        marginLeft: 'auto',
    },
    othchip: {
        margin: theme.spacing(1),
	cursor: "pointer",
        color:"blue",
        borderColor:"blue",
    },
    trashchip: {
        margin: theme.spacing(1),
	cursor: "pointer",
        color:"gray",
        borderColor:"gray",
  },
    button:{
	color:'white'
    },
});
function uniq(a,ignore) {
    return a.sort().filter(function(item, pos, arr) {
	if (ignore.indexOf(item[0]) !== -1) {
	    return false;
	} else if (!pos) {
	    return true;
	} else {
	    if (item[0] !== arr[pos-1][0]) {
		return true;
	    } else {     // items are equal
		if (item[1] === "select") {
		    arr[pos-1][1]="select";
		} else if ( item[2] ) {
		    arr[pos-1][2]=true;
		}
		return false;
	    }
	}
    });
};
function renderMenuItem(classes,state,keyitem,keyindex) {
    //console.log("Keys:",keyitem,keyindex);
    return (<MenuItem key={keyitem[0]}>
	       <Key state={state} keyitem={keyitem[0]} keytype={keyitem[1]} keyactive={keyitem[2]}/> 
	    </MenuItem>);
}
class KeyMenu extends Component {
    state={anchor:null};
    render() {
	//console.log("Rendering KeyComponents...");
        const { classes, state } = this.props;
	//console.log("Keys.starting:",JSON.stringify(state.Path.other));
	this.onClick = event => {this.setState({ anchor: event.currentTarget });};
	this.onClose = () => {this.setState({ anchor: null });};
	var itms=state.Path.keys.path.map(function(item,index) {return [item,"select",false]}).concat(
	    state.Path.other.rest.map(function(item,index) {return [item,"rest",true]}),
	    state.Path.trash.map(function(item,index) {return [item,"trash",false]})
	).sort(state.Utils.ascendingArr);
	var items=uniq(itms,state.Path.other.table);
	var mapFunction= (item,index)=>renderMenuItem(classes,state,item,index);
	//console.log("Keys.rendering:",JSON.stringify(state.Path.other));
	//console.log("Keys.rendering",items.length,JSON.stringify(anchor),Boolean(anchor));
	return (
		<div className={classes.view}>
		   <Button
                      className={classes.button}
                      aria-owns={this.state.anchor ? 'keys-menu' : undefined}
                      aria-haspopup="true"
                      onClick={this.onClick}
	              title={"Available Table keys"}
		    >
	  	       {<KeyIcon state={state}/>}
                     </Button>
		     <Menu
                        id="keys-menu"
	                anchorEl={this.state.anchor}
                        open={Boolean(this.state.anchor)}
                        onClose={this.onClose}
		     >
		        {items.map(mapFunction)}
	             </Menu>
		</div>
	);
    }
}

KeyMenu.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(KeyMenu);
