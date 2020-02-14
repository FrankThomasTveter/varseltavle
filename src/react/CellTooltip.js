import React, {Component} from "react";
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';

import {teal_palette} from '../mui/metMuiThemes';

import ReactTooltip from 'react-tooltip'
import Button from '@material-ui/core/Button';
import SubTable  from './SubTableComponent';

import InfoIcon from '@material-ui/icons/Info';
//import CancelIcon from '@material-ui/icons/Cancel';


const styles = theme => ({
    tooltip:{
	border: '0px solid #999999',
	backgroundColor:teal_palette.main,
    },
    button: {
	color:'white',
	"&$buttonDisabled": {
            color: theme.palette.primary.main,
	},
    },
    buttonDisabled: {},
});
function FullDetails(props){
    const {state,data,tooltip}=props; //state,classes,element
    var keys=[];
    state.Utils.cpArray(keys,state.Path.tooltip.keys);
    state.Utils.remArray(keys,state.Path.keys.path);
    //state.Utils.remArray(keys,state.Path.other.table);
    keys=state.Utils.keepHash(keys,tooltip);
    //console.log("Keys:",JSON.stringify(keys),JSON.stringify(state.Path.keys.path));
    return (<div>
	       <SubTable state={state} keys={keys} subs={tooltip}/>
	    </div>
	   );
};
function GeneralDetails(props) {
    const {classes,data,onclick}=props; // state,element
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
	return (<FullDetails state={state} classes={classes} data={data} tooltip={tooltip}/>);
    } else {
	var onclick=() => {console.log("Clicked me");state.Matrix.addTooltip(state,data);element.update();}
	return (<GeneralDetails state={state} classes={classes} data={data} onclick={onclick} tooltip={tooltip}/>);
    }
};
class CellTooltip extends Component {
    constructor(props) {
	super(props);
	const {state} = props;
	state.React.Tooltip=this;
    };
    rebuild() {
	//console.log("Rebuilding tooltip.");
	ReactTooltip.rebuild();
    };
    update() {
	//console.log("Rebuilding tooltip.");
	this.forceUpdate();
	ReactTooltip.rebuild();
    };
    render() {
	const { classes, state } = this.props;
	//console.log("##### Rendering CellTooltip.");
	return (<ReactTooltip id='cell'
		className={classes.tooltip}
		getContent={(dataTip) =>{if (dataTip==null) {
		    return null;
		} else {
		    const data=JSON.parse(dataTip);
		    //console.log("Tooltip:",JSON.stringify(dataTip),JSON.stringify(data));
		    return (<Tooltip state={state} classes={classes} data={data} element={this}/>);
		}}}
		effect='solid'
		delayHide={500}
		delayShow={200}
		delayUpdate={500}
		place={'bottom'}
		border={true}
		type={'light'}
		/>);
	// {console.log("Datatip:",dataTip);
	//				  
    };
};
CellTooltip.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(CellTooltip);
