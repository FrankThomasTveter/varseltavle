import React, {Component} from "react";
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';

import {teal_palette} from '../mui/metMuiThemes';

import ReactTooltip from 'react-tooltip'
import Button from '@material-ui/core/Button';
import Table  from './TooltipTable';

import InfoIcon from '@material-ui/icons/Info';
//import CancelIcon from '@material-ui/icons/Cancel';


const styles = theme => ({
    tooltip:{
	border: '0px solid #999999',
	backgroundColor:teal_palette.main,
	zIndex:100,
    },
    button: {
	color:'white',
	"&$buttonDisabled": {
            color: theme.palette.primary.main,
	},
    },
    buttonDisabled: {},
});
function TableDetails(props){
    const {state,data,tooltip}=props; //state,classes,element
    var colkey=data.colkey;
    var rowkey=data.rowkey;
    var colvalues=data.colvalues;
    var rowval=data.rowval;
    var click=[rowkey,colkey];
    state.Utils.cpArray(click,state.Path.tooltip.click);
    var keys=[];
    if (colvalues===undefined) {keys.push(colkey);}
    if (rowval===undefined) {keys.push(rowkey);}
    state.Utils.cpArray(keys,state.Path.tooltip.keys);
    state.Utils.remArray(keys,state.Path.keys.path);
    //state.Utils.remArray(keys,state.Path.other.table);
    keys=state.Utils.keepHash(keys,tooltip);
    //console.log("Keys:",JSON.stringify(keys),JSON.stringify(state.Path.keys.path));
    var key=data.rowkey+":"+data.colkey;
    return (<div key={key}>
	    <Table state={state} keys={keys} click={click} subs={tooltip}/>
	    </div>
	   );
};
function ButtonDetails(props) {
    const {classes,onclick}=props; // state,element,data,
    return (<div>
	    <Button className={classes.button} onClick={onclick}><InfoIcon/></Button>
	    </div>
	   );
};
//	    <h3>Rowkey: {data.rowkey} Colkey: {data.colkey}</h3>
//	    <p>Some details.</p>
function Tooltip(props) {
    const {state,classes,data,element}=props;
    var tooltip=state.Matrix.getTooltip(state,data);
    var available=state.Matrix.checkTooltip(state,data);
    if (available) {
	return (<TableDetails state={state} classes={classes} data={data} tooltip={tooltip}/>);
    } else {
	var onclick=() => {state.Matrix.addTooltip(state,data);element.update();}
	return (<ButtonDetails state={state} classes={classes} data={data} onclick={onclick} tooltip={tooltip}/>);
    }
};
class TooltipContainer extends Component {
    constructor(props) {
	super(props);
	const {state} = props;
	state.React.Tooltip=this;
    };
    rebuild() {
	//console.log("Rebuilding tooltip.");
	//ReactTooltip.rebuild();
    };
    update() {
	//console.log("Rebuilding tooltip.");
	this.forceUpdate();
	ReactTooltip.rebuild();
    };
    componentDidUpdate(){
	ReactTooltip.rebuild()
    } 
    render() {
	const { classes, state, type } = this.props;
	var overridePosition = ({ left, top },currentEvent, currentTarget, node) => {
	    const d = document.documentElement;
	    //console.log("Top:",top,node.clientHeight," left:",left,node.clientWidth," window:",d.clientHeight,d.clientWidth);
	    left = Math.min(d.clientWidth - node.clientWidth, left);
	    top = Math.min(d.clientHeight - node.clientHeight, top);
	    left = Math.max(0, left);
	    top = Math.max(75, top);
	    return { top, left }
	};
	var getConstant=(dataTip) =>{
	    if (dataTip==null) {
		return null;
	    } else {
		const data=JSON.parse(dataTip);
		//console.log("Tooltip:",JSON.stringify(dataTip),JSON.stringify(data));
		return (<Tooltip state={state} classes={classes} data={data} element={this}/>);
	    }
	};
	//console.log("##### Rendering TooltipContainer.");
	if (state.Layout.state.tooltip===2) {
	    return null;
	} else {
	    return (<ReactTooltip id={type}
		    className={classes.tooltip}
		    overridePosition={overridePosition}
		    getContent={getConstant}
		    effect='solid'
		    delayHide={500}
		    delayShow={200}
		    delayUpdate={500}
		    place={'bottom'}
		    border={true}
		    type={'light'}
		    />);
	}
    };
};
TooltipContainer.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(TooltipContainer);
