import React, {Component} from "react";
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';

import {teal_palette} from '../mui/metMuiThemes';

//import Paper from '@material-ui/core/Paper';
//import Grid from '@material-ui/core/Grid';

//import SummaryCell from './SummaryCell';
//import SeriesCell  from './SeriesCell';
//import CanvasText  from './CanvasTextComponent';

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
	backgroundColor:teal_palette.light,
	border: '1px solid #000',
	display: 'table-row',
	padding: '5px',
    },
    divTableHdr:{
	border: '1px solid #000',
	display: 'table-cell',
	padding: '5px',
	backgroundColor:teal_palette.light,
	color:'black',
    },
    divTableKeyHdr:{
	border: '1px solid #000',
	display: 'table-cell',
	padding: '5px',
	backgroundColor:teal_palette.main,
	color:'white',
    },
    divTableCell:{
	border: '1px solid #000',
	display: 'table-cell',
	padding: '5px',
    },
    divTableCellCursor:{
	cursor: "pointer",
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
    const { classes, rowval, tkeys} = props;//,state, rowindex
    if (tkeys.indexOf(rowval) === -1) {
	return (<div className={classes.divTableHdr}>
		{rowval}
		</div>);
    } else {
	return (<div className={classes.divTableKeyHdr}>
		{rowval}
		</div>);
    };
}
//{rowval}
function DataCell(props) {
    const {classes,val,onclick,fgcolor,bgcolor,title}=props;//state,rowindex,
    var rval=val;
    if (isNaN(rval)) {
	rval=val;
    } else {
	rval=parseFloat(rval,0).toFixed(2);
    };// title="test"
    return <div className={(onclick !== undefined?classes.divTableCellCursor:classes.divTableCell)} style={{color:fgcolor,backgroundColor:bgcolor}} onClick={onclick} title={title}>{rval}</div>
}
function renderDataCell(classes,state,key,ckeys,tkeys,sub,rowindex,colindex) {
    var maxlev=sub["level"]||0;
    var bgcolor=state.Colors.getLevelBgColor(maxlev);
    var fgcolor=state.Colors.getLevelFgColor(maxlev);
    var rowkey=key;
    var rowval=sub[key];
    var rowwhere=state.Database.getWhereValue(rowkey,rowval);
    var title=state.Matrix.getTooltipTitle(state,sub,key);
    var onclick=(ckeys.indexOf(rowkey)===-1?undefined: () => {state.Navigate.selectKey(state,rowkey,rowval,rowwhere,1)});
    return (<DataCell classes={classes} state={state} key={`${rowindex}-${colindex}`} val={sub[key]} rowindex={rowindex} fgcolor={fgcolor} bgcolor={bgcolor} onclick={onclick} title={title}/>);
}
//{{rowkey:'test1',colkey:'test2',title:title}}
function dataRow(classes,state,key,ckeys,tkeys,subs,rowindex) {
    //return null; // no entries, ignore row...
    var mapFunction= (sub,colindex)=>renderDataCell(classes,state,key,ckeys,tkeys,sub,rowindex,colindex);
    return (<div className={classes.divTableRow} key={rowindex.toString()}>
	    <FirstDataCell classes={classes} state={state} key={'k-'+rowindex} rowval={key} tkeys={tkeys}/>
	    {subs.map(mapFunction)}
	    </div>);
};
// ---------------- Details
function Details(props) {
    const { classes, state, keys, ckeys, tkeys, subs } = props; // classes, element
    var mapFunction= (key,rowindex)=>dataRow(classes,state,key,ckeys,tkeys,subs,rowindex);
    return (<div className={classes.divTable}>
	       <div className={classes.divTableBody}>
	          {keys.map(mapFunction)}
	       </div>
            </div>);
 }
class TooltipTable extends Component {
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
	const { state, classes, keys, ckeys, tkeys, subs } = this.props;
	//console.log("##### Rendering TooltipTable.");
	if (tkeys===undefined || ckeys===undefined) {
	    return null;
	} else {
	    return (<div ref={el=>{this.element(el)}} className={classes.root}  style={{width: '100%', height: '100%'}}>
		    <Details state={state} classes={classes} element={this} keys={keys} ckeys={ckeys} tkeys={tkeys} subs={subs}/>
	            </div>);
	};
    }
}

TooltipTable.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(TooltipTable);
