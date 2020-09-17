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
import Edit     from './EditComponent';

const styles = theme => ({
    settings:{},
    values: {
	display: 'inline-block',
        marginLeft: 'auto',
    },
    selectchip: {
        margin: theme.spacing(0),
	cursor: "pointer",
        color:"red",
        borderColor:"blue",
    },
    reload: {
	display: 'inline-block',
        marginRight: 'auto',
	height:'100%',
    },
    edit: {
	display: 'inline-block',
        marginRight: 'auto',
	height:'100%',
    },
    remove: {
	display: 'inline-block',
        marginRight: 'auto',
	height:'100%',
    },
    button:{},
    buttonInvisible:{},
    buttonDisabled:{},
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
function Items(props) {
    //onclick,title, label, 
    const {state,classes,anchor,onclose,items,keyitem,remove}=props;
    var mapFunction= (item,index)=>renderMenuItem(classes,state,keyitem,item,index);
    //console.log("Values.rendering",items.length,JSON.stringify(anchor),Boolean(anchor));
    return (<Menu
               id="values-menu"
	       anchorEl={anchor}
               open={Boolean(anchor)}
               onClose={onclose}
	    >
	     <MenuItem key="remove" onClose={onclose} className={classes.remove}>
	        <Remove state={state} classes={{button:classes.button}} keyitem={keyitem} onclick={remove} onclose={onclose}/>
	     </MenuItem>
	     {mapFunction(state.Database.makeKeytrg(state,keyitem,state.Database.keytrg.Min),-1)}
	     {items.map(mapFunction)}
	     {mapFunction(state.Database.makeKeytrg(state,keyitem,state.Database.keytrg.Max),-1)}
	     {mapFunction("",-1)}
	     <MenuItem key="reload" onClose={onclose} className={classes.reload}>
	    <Reload state={state} onclose={onclose} classes={{button:classes.button}} visible={true}/>
	     </MenuItem>
	    </Menu>
	   );
}
function Range(props) {
    //onclick,title, label, 
    const {state,classes,anchor,onclose,keyitem, remove}=props;
    var range=state.Path.getRange(state,keyitem);
    //console.log("Range:",JSON.stringify(range));
    var setValue=function(range,index,value) {
	state.Path.setRangeValue(state,range,index,value);
    };
    return (<Menu
               id="values-menu"
	       anchorEl={anchor}
               open={Boolean(anchor)}
               onClose={onclose}
	    >
	     <MenuItem key="remove" onClose={onclose} className={classes.remove}>
	        <Remove state={state} classes={{button:classes.button}} keyitem={keyitem} onclick={remove} onclose={onclose}/>
	     </MenuItem>
	     <MenuItem key="min" onClose={onclose} className={classes.edit}>
	        <Edit state={state} classes={{input:classes.button}} label={"Min:"} index={0} range={range} setvalue={setValue} onclose={onclose}/>
	     </MenuItem>
	     <MenuItem key="max" onClose={onclose} className={classes.edit}>
	        <Edit state={state} classes={{input:classes.button}} label={"Max:"} index={1} range={range} setvalue={setValue} onclose={onclose}/>
	     </MenuItem>
	     <MenuItem key="reload" onClose={onclose} className={classes.reload}>
	    <Reload state={state} onclose={onclose} classes={{button:classes.button}} visible={true}/>
	     </MenuItem>
	    </Menu>
	   );
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
	var icon,lab;
	if (label==="") {
	    icon=<NullIcon/>;
	    lab=keyitem;
	} else {
	    icon=<SelIcon/>;
	    lab=label;
	};
	items.sort(state.Utils.ascending);
	let menu;
	if (items.length > 0) {
	    menu=<Items anchor={this.state.anchor} 
		          state={state}
		          classes={classes}
		          onclose={this.onClose}
		          onclick={this.onClick}
		          items={items}
		          keyitem={keyitem}
		          title={title}
		          label={label}
		          remove={this.remove}
		/>;
	} else {
	    menu=<Range anchor={this.state.anchor} 
		          state={state}
		          classes={classes}
		          onclose={this.onClose}
		          onclick={this.onClick}
		          items={items}
		          keyitem={keyitem}
		          title={title}
		          label={label}
		          remove={this.remove}
		/>;
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
	        {menu}
	    </div>);
    }
}

SelectValueMenu.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(SelectValueMenu);
