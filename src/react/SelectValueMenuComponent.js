import React, {Component} from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import Chip from '@material-ui/core/Chip';
import SelIcon from '@material-ui/icons/Done';
import NullIcon from '@material-ui/icons/Clear';
import SelectValue from './SelectValueComponent';
import Remove     from './RemoveComponent';
import Reload     from './ReloadComponent';

const styles = theme => ({
    settings:{},
    button:{},
    values: {
	display: 'inline-block',
        marginLeft: 'auto',
    },
    selectchip: {
        margin: theme.spacing.unit,
	cursor: "pointer",
        color:"red",
        borderColor:"blue",
    },
    reload: {
	display: 'inline-block',
        marginRight: 'auto',
	height:'100%',
    },
    remove: {
	display: 'inline-block',
        marginRight: 'auto',
	height:'100%',
    },
});
function renderMenuItem(classes,state,keyitem,valueitem,valueindex) {
    var vals=state.Path.select.val[keyitem]
    //console.log("SelectValues:",keyitem,valueitem,JSON.stringify(vals));
    var tpos=-1;
    if (vals !== undefined) {
	tpos=vals.indexOf(valueitem);
    };
    if (valueitem !== undefined) {
	return (<MenuItem value={valueitem} key={valueitem}>
		<SelectValue state={state} keyitem={keyitem} valueitem={valueitem} tpos={tpos}/> 
		</MenuItem>);
    } else {
	return null;
    };
}
class SelectValueMenu extends Component {
    state={anchor:null};
    render() {
        const { classes, state, keyitem, title, label, remove } = this.props;
	this.onClick = event => {this.setState({ anchor: event.currentTarget });};
	this.onClose = () => {this.setState({ anchor: null });};
	var items=state.Database.getKeyValues(state,keyitem);
	if (remove !== undefined) {
	    this.remove = () => {state.Navigate.onClickPath(state,remove,keyitem);this.onClose();};
	} else {
	    this.remove = () => {state.Navigate.onClickPath(state,'path',keyitem);this.onClose();};
	};
	items.sort(state.Utils.ascending);
	var mapFunction= (item,index)=>renderMenuItem(classes,state,keyitem,item,index);
	//console.log("Values.rendering",items.length,JSON.stringify(anchor),Boolean(anchor));
	var icon,lab;
	if (label==="") {
	    icon=<NullIcon/>;
	    lab=keyitem;
	} else {
	    icon=<SelIcon/>;
	    lab=label;
	};
	return (
		<div className={classes.values} key={"selectValue-"+keyitem}>
		   <Chip
                     icon={icon}
                      label={lab}
                      title={title}
                      className={classes.selectchip}
                      variant="outlined"
                      aria-owns={this.state.anchor ? 'values-menu' : undefined}
                      aria-haspopup="true"
                      onClick={this.onClick}
	           />
		     <Menu
                        id="values-menu"
	                anchorEl={this.state.anchor}
                        open={Boolean(this.state.anchor)}
                        onClose={this.onClose}
		     >
		       <MenuItem key="remove" onClose={this.onClose} className={classes.remove}>
		          <Remove state={state} classes={{button:classes.button}} keyitem={keyitem} onclick={this.remove} onclose={this.onClose}/>
		       </MenuItem>
		        {mapFunction(state.Database.makeKeytrg(state,keyitem,state.Database.keytrg.Min),-1)}
		        {items.map(mapFunction)}
		        {mapFunction(state.Database.makeKeytrg(state,keyitem,state.Database.keytrg.Max),-1)}
		        {mapFunction("",-1)}
		       <MenuItem key="reload" onClose={this.onClose} className={classes.reload}>
		          <Reload state={state} onclose={this.onClose}/>
		       </MenuItem>
	             </Menu>
		</div>
	);
    }
}

SelectValueMenu.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(SelectValueMenu);
