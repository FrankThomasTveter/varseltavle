import React, {Component} from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import Chip from '@material-ui/core/Chip';
import SelIcon from '@material-ui/icons/Done';
import NullIcon from '@material-ui/icons/Clear';
import SelectValue from './SelectValueComponent';
import MoveKey     from './MoveKeyComponent';
import Reload      from './ConfigReloadComponent';
import Edit     from './EditComponent';
import {teal_palette} from '../mui/metMuiThemes';

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
	backgroundColor:'white',
	"&&:hover":{
	    backgroundColor:teal_palette.light,
	},
	"&&:focus":{
	    backgroundColor:teal_palette.main,
	}
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
    move: {
	display: 'inline-block',
        marginRight: 'auto',
	height:'100%',
    },
    button:{},
    buttonInvisible:{},
    buttonDisabled:{},
});
function renderMoveItem(classes,state,item,index,keyitem,onClose) {
    var cls={button:classes.button,buttonInvisible:classes.buttonInvisible,buttonDisabled:classes.buttonDisabled};
    return (<MenuItem key={item.target} onClose={onclose} className={classes.remove}>
	     <MoveKey state={state} keyitem={keyitem} onclick={item.onclick}
	        target={item.target} onclose={onclose} classes={cls}/>
	    </MenuItem>);
};
function renderMenuItem(classes,state,keyitem,valueitem,valueindex) {
    var vals=state.Path.select.val[keyitem]||[];
    //console.log("SelectValues:",keyitem,valueitem,JSON.stringify(vals));
    var tpos=-1;
    if (vals !== undefined) {
	//console.log("Vals:",JSON.stringify(vals));
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
        const { classes, state, keyitem, title, label, remove, target, focusPoints, focusType } = this.props;
	this.focusPoints=focusPoints;
	this.focusType=focusType;
	this.onClick = event => {
	    this.setState({ anchor: event.currentTarget });
	    state.Path.setPathFocus(state,keyitem+(this.focusType||""));
	};
	this.onClose = () => {this.setState({ anchor: null });};
	this.pushToTable = () => {
	    console.log("Setting focus to:",keyitem);
	    state.Path.setPathFocus(state,keyitem);
	    state.Navigate.pushKeyToTable(state,keyitem);
	    this.onClose();
	};
	var items=state.Database.getKeyValues(state,keyitem);
	if (remove !== undefined) {
	    this.remove = () => {
		remove();this.onClose();
	    };
	    this.target=target;
	} else {
	    this.remove = () => {
		//console.log("Setting focus to:",keyitem);
		state.Path.setPathFocus(state,keyitem);
		state.Navigate.pushSelectToTable(state,keyitem);
		this.onClose();
	    };
	    this.target="table";
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
	var moves=[{onclick:this.remove,target:this.target}];
	if (target!=="table" && state.Path.other.ignore.indexOf(keyitem)===-1) {
	    moves.push({onclick:this.pushToTable,target:"table"});
	};
	var mapFunction= (item,index)=>renderMenuItem(classes,state,keyitem,item,index);
	var moveFunction= (item,index)=>renderMoveItem(classes,state,item,index,keyitem,this.onClose);
	//console.log("Values.rendering",items.length,JSON.stringify(anchor),Boolean(anchor));
	var cls={button:classes.button};
	if (items.length > 0) { // items
	    return (
 	      <div key={"selectValue-"+keyitem}>
	       <Chip
                  icon={icon}
                  label={lab}
                  title={title}
                  className={classes.selectchip}
                  variant="outlined"
                  aria-owns={this.state.anchor ? 'values-menu' : undefined}
                  aria-haspopup="true"
                  onClick={this.onClick}
		  ref={(input)=>{
		    if (this.focusPoints !== undefined) {
			var name=keyitem + (this.focusType||"");
			//console.log("###### Found focus point:",name,this.focusType);
			this.focusPoints[name]=input;
		    } else {
			//console.log("SVM-No focus points...");
		    }}
		      }/>
	        <Menu
		    id="values-menu"
		    anchorEl={this.state.anchor}
		    open={Boolean(this.state.anchor)}
		    onClose={this.onClose}
		    >
		    {moves.map(moveFunction)}
		    {mapFunction(state.Database.makeKeytrg(state,keyitem,state.Database.keytrg.Min),-1)}
		    {items.map(mapFunction)}
		    {mapFunction(state.Database.makeKeytrg(state,keyitem,state.Database.keytrg.Max),-1)}
		    {mapFunction("",-1)}
		    <MenuItem key="reload" onClose={this.onClose} className={classes.reload}>
		    <Reload state={state} onclose={this.onClose} classes={cls} visible={true}/>
		    </MenuItem>
		    </Menu>
	    </div>);
	} else { // range
	    var range=state.Path.getRange(state,keyitem);
	    //console.log("Range:",JSON.stringify(range));
	    var setValue=function(range,index,value) {
		state.Path.setRangeValue(state,range,index,value);
	    };
	    var ecls={input:classes.button, edit:classes.edit};
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
		  ref={(input)=>{
		    if (this.focusPoints !== undefined) {
			var name=keyitem + (this.focusType||"");
			//console.log("###### Found focus point:",name,this.focusType);
			this.focusPoints[name]=input;
		    } else {
			//console.log("SVM-No focus points...");
		    }}
		      }/>
                 <Menu id="values-menu" anchorEl={this.state.anchor} open={Boolean(this.state.anchor)}
		                        onClose={this.onClose}>
		   {moves.map(moveFunction)}
	            <Edit state={state} classes={ecls} label={"Min:"} index={0} range={range}
		                        setvalue={setValue} onclose={this.onClose}/>
	            <Edit state={state} classes={ecls} label={"Max:"} index={1} range={range}
		                        setvalue={setValue} onclose={this.onClose}/>
	           <MenuItem key="reload" onClose={this.onClose} className={classes.reload}>
	              <Reload state={state} onclose={this.onClose} classes={cls} visible={true}/>
	           </MenuItem>
	         </Menu>
	    </div>);
	}
    }
}

SelectValueMenu.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(SelectValueMenu);
