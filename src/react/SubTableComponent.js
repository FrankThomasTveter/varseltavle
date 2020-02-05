import React, {Component} from "react";
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';

import {teal_palette} from '../mui/metMuiThemes';

import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';

import SummaryCell from './SummaryCell';
import SeriesCell  from './SeriesCell';
import CanvasText  from './CanvasTextComponent';
import CellTooltip  from './CellTooltip';

const styles = theme => ({
    root: {
	height: '100%',
    },
    paper: {
	overflow: 'hidden',
	tableLayout: 'fixed',
	padding:0,
	margin:0,
    },
    divTable :{
	display: 'table',
	width: '100%',
    },
    divTableRow:  {
	backgroundColor:teal_palette.main,
	border: '1px solid #000',
	display: 'table-row',
	padding: '5px',
    },
    divTableHdr:{
	border: '1px solid #000',
	display: 'table-cell',
	padding: '5px',
	backgroundColor:teal_palette.main,
	color:'black',
    },
    divTableCell:{
	border: '1px solid #000',
	display: 'table-cell',
	padding: '5px',
    },
    divTableBody : {
	display: 'table-row-group',
    },
});

//const mui = createTheme({palette:teal_palette});

// ---------------- DATA
function FirstDataCell (props) {
    const { classes, state, rowval, rowindex} = props;
    return (<div className={classes.divTableHdr}>
	    {rowval}
	    </div>);
}
//{rowval}
function DataCell(props) {
    const {classes,state,val,rowindex,fgcolor,bgcolor}=props;
    var rval=val;
    if (isNaN(rval)) {
	rval=val;
    } else {
	rval=parseFloat(rval,0).toFixed(2);
    };
    return <div className={classes.divTableCell} style={{color:fgcolor,backgroundColor:bgcolor}}>{rval}</div>
}
function renderDataCell(classes,state,key,sub,rowindex,colindex) {
    var maxlev=sub["level"]||0;
    var bgcolor=state.Colors.getLevelBgColor(maxlev);
    var fgcolor=state.Colors.getLevelFgColor(maxlev);
    return (<DataCell classes={classes} state={state} key={`${rowindex}-${colindex}`} val={sub[key]} rowindex={rowindex} fgcolor={fgcolor} bgcolor={bgcolor}/>);
}
//{{rowkey:'test1',colkey:'test2',title:title}}
function dataRow(classes,state,key,subs,rowindex) {
    var cnt=1, ii=subs.length;
    // calculate number of entries
    //while (ii--) {if (typeof subs[ii][key] !== "undefined") cnt++;}
    if (cnt===0) {
	return null; // no entries, ignore row...
    } else {
	var mapFunction= (sub,colindex)=>renderDataCell(classes,state,key,sub,rowindex,colindex);
	return (<div className={classes.divTableRow} key={rowindex.toString()}>
		<FirstDataCell classes={classes} state={state} key={'k-'+rowindex} rowval={key}/>
		{subs.map(mapFunction)}
		</div>);
    };
};
// ---------------- Details
function Details(props) {
    const { classes, state, keys, subs } = props; // classes, element
    var mapFunction= (key,rowindex)=>dataRow(classes,state,key,subs,rowindex);
    return (<div className={classes.divTable}>
	       <div className={classes.divTableBody}>
	          {keys.map(mapFunction)}
	       </div>
            </div>);
 }
class SubTable extends Component {
    componentDidMount() {
        window.addEventListener("resize", this.updateWindowDimensions);
    } 
    updateWindowDimensions = () => {
        this.width= window.innerWidth;
	this.height=window.innerHeight;
	this.bbx=this.el.getBoundingClientRect();
	//console.log("Width/Height:",this.width,this.height,this.bbx.width,this.bbx.height)
    };
    element(el) {
	if (el !== undefined && el !== null) {
	    this.el=el;
	    this.bbx=this.el.getBoundingClientRect();
	    //console.log("BBX width/height:",this.bbx.width,this.bbx.height);
	};
    };
    render() {
	const { state, classes, keys, subs } = this.props;
	//console.log("##### Rendering SubTable.");
	return (<div ref={el=>{this.element(el)}} className={classes.root}  style={{width: '100%', height: '100%'}}>
		   <Details state={state} classes={classes} element={this} keys={keys} subs={subs}/>
	        </div>);
    }
}

SubTable.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(SubTable);
