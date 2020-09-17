import React, {Component} from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
//import ListKeyIcon from '@material-ui/icons/VpnListKey';
import ListKeyIcon from '@material-ui/icons/Details';
import ListKey     from './ListKeyComponent';

const styles = theme => ({
    settings:{},
    config: {
        marginLeft: 'auto',
    },
    othchip: {
        margin: theme.spacing(0),
	cursor: "pointer",
        color:"blue",
        borderColor:"blue",
    },
    trashchip: {
        margin: theme.spacing(0),
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
    //console.log("ListKeys:",keyitem,keyindex);
    return (<MenuItem key={keyitem[0]}>
	       <ListKey state={state} keyitem={keyitem[0]} keytype={keyitem[1]} keyactive={keyitem[2]}/> 
	    </MenuItem>);
}
class ListKeyMenu extends Component {
    state={anchor:null};
    render() {
	//console.log("Rendering ListKeyComponents...");
        const { classes, state } = this.props;
	//console.log("ListKeys.starting:",JSON.stringify(state.Path.other));
	this.onClick = event => {this.setState({ anchor: event.currentTarget });};
	this.onClose = () => {this.setState({ anchor: null });};
	var itms=state.Path.keys.path.map(function(item,index) {return [item,"select",false]}).concat(
	    state.Path.other.table.map(function(item,index) {return [item,"otherTable",true]}),
	    state.Path.other.rest.map(function(item,index) {return [item,"otherRest",true]}),
	    state.Path.other.ignore.map(function(item,index) {return [item,"otherIgnore",true]}),
	    state.Path.trash.found.map(function(item,index) {return [item,"trashFound",false]}),
	    state.Path.trash.rest.map(function(item,index) {return [item,"trashRest",false]}),
	    state.Path.trash.ignore.map(function(item,index) {return [item,"trashIgnore",false]}),
	    ["lat","lon"].map(function(item,index) {return [item,"ignore",false]}),
	    ["rank"].map(function(item,index) {return [item,"trashIgnore",false]})
	).sort(state.Utils.ascendingArr);
	var items=uniq(itms,[]);//state.Path.other.table
	//console.log("ListKeys.rendering:",JSON.stringify(items));
	//console.log("ListKeys.keys:",JSON.stringify(state.Path.keys));
	//console.log("ListKeys.other:",JSON.stringify(state.Path.other));
	//console.log("ListKeys.trash:",JSON.stringify(state.Path.trash));
	var mapFunction= (item,index)=>renderMenuItem(classes,state,item,index);
	//console.log("ListKeys.rendering:",JSON.stringify(state.Path.other));
	//console.log("ListKeys.rendering",items.length,JSON.stringify(anchor),Boolean(anchor));
	return (
		<div className={classes.view}>
		   <Button
                      className={classes.button}
                      aria-owns={this.state.anchor ? 'keys-menu' : undefined}
                      aria-haspopup="true"
                      onClick={this.onClick}
	              title={"List keys"}
		    >
	  	       {<ListKeyIcon state={state}/>}
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

ListKeyMenu.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(ListKeyMenu);
