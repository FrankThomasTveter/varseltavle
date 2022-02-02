import React, {Component} from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import CanvasText  from './CanvasTextComponent';
import Key from './KeyComponent';

const styles = theme => ({
    left : {
	display: 'inline-block',
	justifyContent: 'left',
	cursor: "pointer",
	"&:hover":{backdropFilter:"brightness(90%)"},
    },
    right : {
	display: 'inline-block',
	justifyContent: 'right',
	cursor: "pointer",
	"&:hover":{backdropFilter:"brightness(90%)"},
    },
    dataset:{},
    tooltip:{},
    content:{},
    divHdrLeft:{},
    divHdrRight:{},
    divEmpty:{},
    divTable:{},
    divTableRow:{},
    divTableCell:{},
    divTableCellCursor:{},
    divTableBody:{},
    paperImage:{},
    button:{},
    buttonInvisible:{},
    buttonDisabled:{},
});

function renderMenuItem(classes,state,keyitem,keyindex,key,onClose) {
    var keytype=state.Path.getKeyType(state,keyitem)
    if (key === keyitem || (keytype !=="table" && keytype !=="rest") ) {
	return null;
    } else {
	var onclick=() => {state.Navigate.replaceTableKey(state,keyitem,key);onClose();};
	return (<MenuItem key={keyitem}>
		<Key state={state} name={keyitem} onclick={onclick}/> 
		</MenuItem>);
    };
}

class TableMenu extends Component {
    state={anchorCol:null,anchorRow:null};
    render() {
	// style={{height:"100%"}
	const { classes, state, colkey, rowkey, plans } = this.props; // plan
	this.pushColToOther = () => {state.Navigate.pushTableToRest(state,colkey,true);this.onClose();};
	this.pushRowToOther = () => {state.Navigate.pushTableToRest(state,rowkey,true);this.onClose();};
	var items=state.Utils.cp(state.Path.keys.other);
	items=items.sort(state.Utils.ascending);
	var mapFunctionCol= (item,index)=>renderMenuItem(classes,state,item,index,colkey,this.onClose);
	var mapFunctionRow= (item,index)=>renderMenuItem(classes,state,item,index,rowkey,this.onClose);
	//var cls={button:classes.button,buttonInvisible:classes.buttonInvisible,buttonDisabled:classes.buttonDisabled};
	this.onclickCol=() => state.Navigate.switchTableKey(state,colkey);
	this.onclickRow=() => state.Navigate.switchTableKey(state,rowkey);
	this.onClose = () => {
	    if (this.state.anchorCol !== null) {
		this.setState({anchorCol:null});
	    } else {
		this.setState({anchorRow:null});
	    };
	};
	this.clickRow= (event)=>{this.setState({anchorRow:event.currentTarget});};
	this.clickCol= (event)=>{this.setState({anchorCol:event.currentTarget});};
	// width={plan.width} height={plan.height}
	var data;
	if (colkey==="" && rowkey==="") {
	    data=null;
	} else {
	    data=JSON.stringify({keys:[rowkey,colkey],vals:[[],[]]}); 
	};
	
	//console.log("Hdr:",JSON.stringify(plans.hdr),JSON.stringify(plans.hd2),JSON.stringify(plans.hd1));
	// onMouseEnter={changeBackground} onMouseLeave={revertBackground}
	return (<div style={{width:plans.hdr.width}}  >
		<div className={classes.right} width={plans.hd2.width} onClick={this.clickRow}
		data-for='cell' data-tip={data}
		aria-owns={this.state.anchorRow ? 'table-menu' : undefined}
		aria-haspopup="true"
		>
		<CanvasText state={state} label={rowkey} plan={plans.hd2} color={'white'}/>
		</div>
		<Menu
		id="table-menu"
		anchorEl={this.state.anchorRow}
		open={Boolean(this.state.anchorRow)}
		onClose={this.onClose}
		>
		{items.map(mapFunctionRow)}
		</Menu>
		<div className={classes.left} width={plans.hd1.width} onClick={this.clickCol}
		data-for='cell' data-tip={data}>
		<CanvasText state={state} label={colkey} plan={plans.hd1} color={'white'}/>
		</div>
		<Menu
		id="table-menu"
		anchorEl={this.state.anchorCol}
		open={Boolean(this.state.anchorCol)}
		onClose={this.onClose}
		>
		{items.map(mapFunctionCol)}
		</Menu>
		</div>);
	


    }
}

TableMenu.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(TableMenu);
