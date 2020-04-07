import React, {Component} from "react";
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';

import {teal_palette} from '../mui/metMuiThemes';

import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';

import SummaryCell from './SummaryCell';
import SeriesCell  from './SeriesCell';
import CanvasText  from './CanvasTextComponent';
import Tooltip  from './TooltipContainer';

const styles = theme => ({
    content:{},
    divHdrLeft : {
	display: 'inline-block',
	justifyContent: 'left',
	cursor: "pointer",
    },
    divHdrRight : {
	display: 'inline-block',
	justifyContent: 'right',
	cursor: "pointer",
    },
    paper: {
//	overflow: 'hidden',
	tableLayout: 'fixed',
	padding:0,
	margin:0,
    },
    divEmpty :{
	width: '100%',
	height: '100%',
    },
    divTable :{
	display: 'table',
	width: '100%',
//	border:  '1px solid red',
    },
    divTableRow:  {
	backgroundColor:teal_palette.main,
	border: '0px solid #999999',
	display: 'table-row',
	padding: '0px',
    },
    divTableCell:{
	border: '0px solid #999999',
	display: 'table-cell',
	padding: '0px',
    },
    divTableCellCursor:{
	cursor: "pointer",
	border: '0px solid #999999',
	display: 'table-cell',
	padding: '0px',
    },
    divTableHead : {
	border: '0px',
	display: 'table-cell',
	padding: '0px',
    },
    divTableHeading : {
	display: 'table-header-group',
    },
    divTableHeadingCenter : {
	display: 'flex',
	justifyContent: 'center',
    },
    divTableFoot : {
	backgroundColor: '#DDD',
	display: 'table-footer-group',
	fontWeight: 'bold',
    },
    divTableBody : {
	display: 'table-row-group',
    },
    paperImage: {
        textAlign: 'center',
        padding: theme.spacing(2),
    }
});

//const mui = createTheme({palette:teal_palette});

// ---------------- DATA
function FirstDataCell (props) {
    const { classes, state, colkey, rowkey, rowval, onclick, plan, rowindex } = props;
    var cursor=classes.divTableCell;
    if (onclick !== undefined) {
	cursor=classes.divTableCellCursor;
    }
    // width={plan.width} height={plan.height}
    var data;
    if (colkey==="" && rowkey==="") {
	data=null;
    } else {
	data=JSON.stringify({colkey:colkey,rowkey:rowkey,rowval:rowval}); 
    };
    if (rowindex%2 === 1) {
	return (<div className={cursor} onClick={onclick} style={{backgroundColor:'#DDD'}}
		data-for='cell' data-tip={data}>
		   <CanvasText state={state} label={rowval} plan={plan}/>
		</div>);
    } else {
	return (<div className={cursor} onClick={onclick} style={{backgroundColor:'#EEE'}}
		data-for='cell' data-tip={data}>
		<CanvasText state={state} label={rowval} plan={plan}/>
		</div>);
    }
}
//{rowval}
function DataCell(props) {
    const {classes,state,elements,mode,plan,rowindex,...other}=props;
    if (elements===undefined) {
	if (rowindex%2===1) {
	    return <div className={classes.divTableCell} style={{backgroundColor:'#EEE'}}/>
	} else {
	    return <div className={classes.divTableCell} style={{backgroundColor:'#FFF'}}/>
	}
    } else if (mode===state.Layout.modes.cell.Sum) {
	return <SummaryCell {...other} state={state} elements={elements} plan={plan}/>
	//return null;
    } else {
	return <SeriesCell {...other} state={state} elements={elements} plan={plan}/>
	//return null;
    }
}
function renderDataCell(classes,state,colkey,colvalues,rowkey,rowval,rowindex,rowwhere,range,mode,plan,val,index) {
    //console.log("Making data cell:",rowval,val,index,plan,JSON.stringify(colvalues));
    if (index%plan.step === 0) {
	// get elements and range
	//console.log("Processing:",val,colvalues[index],plan.step);
	var matrix=state.React.matrix;
	var elements=state.Matrix.getMatrixElements(colvalues,rowval,matrix,index,plan.step);
	//console.log("Elements:",rowval,index,' =>',JSON.stringify(elements));
	// get count and colwhere
        var cnt = Math.min(colvalues.length,index+plan.step)-index;
        var colwhere = state.Database.getColWhere(colkey,colvalues,index,plan.step);
	// make onclick
	var onclick=() => state.Navigate.selectItem(state,colkey,rowkey,colvalues[index],rowval,colwhere,rowwhere,cnt,1);
	return (<DataCell classes={classes} state={state} key={`col-${index}`} rowindex={rowindex} index={index} onclick={onclick}
		colkey={colkey} rowkey={rowkey} colvalues={colvalues} rowval={rowval} colwhere={colwhere} rowwhere={rowwhere} 
		elements={elements} mode={mode} plan={plan} range={range}
	    />);
    } else {
	return null;
    }
}
//{{rowkey:'test1',colkey:'test2'}}
function dataRow(classes,state,colkey,rowkey,colvalues,mode,plans,rowval,rowindex) {
    var rowwhere=state.Database.getWhereValue(rowkey,rowval);
    var onclick=() => {state.Navigate.selectKey(state,rowkey,rowval,rowwhere,1);}
    var range=[undefined,undefined];
    if (state.React.matrix!==undefined) {
	range=state.Matrix.getRange(state,state.React.matrix,colvalues,[rowval]);
    };
    //console.log("Making data cols.",rowval,colkey,JSON.stringify(colvalues));
    //console.log("We have a matrix(",rowval,") with range:",JSON.stringify(range));
    var mapFunction= (val,index)=>renderDataCell(classes,state,colkey,colvalues,rowkey,rowval,rowindex,rowwhere,range,mode,plans.cell,val,index);
    return (<div className={classes.divTableRow} key={rowindex.toString()}>
	    <FirstDataCell classes={classes} state={state} key={'0'} colkey={colkey} rowkey={rowkey} rowval={rowval} onclick={onclick} 
	                   plan={plans.row} rowindex={rowindex}/>
	       {colvalues.map(mapFunction)}
	    </div>);
};
function renderZeroRow(classes,state,colkey,colvalues,plans) {
    return (<div className={classes.divTableRow} key={1}>
	       <div className={classes.divTableCell} width={plans.cell.width}>No data available</div>
	    </div>);
};
function DataRows(props) {
    const { classes, state, plans, colkey, colvalues, rowkey, rowvalues, mode } = props;
    //console.log("Making data cols.",colkey,JSON.stringify(colvalues));
    var mapFunction= (val,index)=>dataRow(classes,state,colkey,rowkey,colvalues,mode,plans,val,index);
    if (rowvalues.length===0) {
	return renderZeroRow(classes,state,colkey,colvalues,plans);
    } else {
	return (rowvalues.map(mapFunction));
    }
}
// ---------------- HDR
function FirstHdrCell (props) {
    const { classes, state, colkey, rowkey, plans } = props; // plan
    //var width=plans.hdr.width;
    //var height=plans.hdr.height;
    //teal_palette
    //console.log("Making first header cell.",colkey,rowkey,plan.width,plan.height);
    //style={{backgroundColor:teal_palette.main}}
    var onclickCol=() => state.Navigate.switchTableKey(state,colkey);
    var onclickRow=() => state.Navigate.switchTableKey(state,rowkey);
    var data;
    if (colkey==="" && rowkey==="") {
	data=null;
    } else {
	data=JSON.stringify({colkey:colkey,rowkey:rowkey}); 
    };
    return (<div style={{width:plans.hdr.width}}>
	       <div className={classes.divHdrRight} width={plans.hd2.width} onClick={onclickRow} data-for='cell' data-tip={data}>
	          <CanvasText state={state} label={rowkey} plan={plans.hd2} color={'white'}/>
	       </div>
	       <div className={classes.divHdrLeft} width={plans.hd1.width} onClick={onclickCol} data-for='cell' data-tip={data}>
	          <CanvasText state={state} label={colkey} plan={plans.hd1} color={'white'}/>
	       </div>
	    </div>);
}
//

function renderHdrCell(classes,state,colkey,colvalues,rowkey,plan,val,index) {
    if (index%plan.step === 0) {
	//console.log("HdrCell:",index,plan.step);
        var cnt = Math.min(colvalues.length,index+plan.step)-index;
        var colwhere = state.Database.getColWhere(colkey,colvalues,index,plan.step);
	var onclick=() => state.Navigate.selectKey(state,colkey,colvalues[index],colwhere,cnt);
	var cursor=classes.divTableCell;
	if (onclick !== undefined) {
	    cursor=classes.divTableCellCursor;
	}
	//console.log("Plan:",JSON.stringify(plan));
	var data;
	if (colkey==="" && rowkey==="") {
	    data=null;
	} else {
	    data=JSON.stringify({colkey:colkey,rowkey:rowkey,colvalues:colvalues,index:index,step:plan.step}); 
	};
	return (<div className={cursor} onClick={onclick} style={{backgroundColor:'#DDD'}} key={`col-${index}`}  data-for='cell' data-tip={data}>
		   <CanvasText state={state} index={index} plan={plan} label={val}/>
 	        </div> );
     } else {
	return null;
    }
}
function HdrRow(props) {
    const { classes, state, plans, colkey, colvalues, rowkey } = props; //, rowvalues
    //console.log("Making header row.",colkey,JSON.stringify(colvalues));
    var mapFunction= (val,index)=>renderHdrCell(classes,state,colkey,colvalues,rowkey,plans.col,val,index);
    return (<div className={classes.divTableRow} key={0}>
	       <FirstHdrCell classes={classes} state={state} colkey={colkey} rowkey={rowkey} plans={plans} style={{height:"100%"}}/>
	       {colvalues.map(mapFunction)}
	    </div>);
}
// ---------------- Details
function Details(props) {
    const { classes, state } = props; // classes, element
    var colkey = state.Path.getColKey(state)||"";
    var rowkey = state.Path.getRowKey(state)||"";
    var colvalues = state.Path.filterKeys(state,state.Matrix.values[colkey]||[""]);
    var rowvalues = state.Path.filterKeys(state,state.Matrix.values[rowkey]||[""]);
    var cellMode  = state.Layout.getCellMode(state);
    //var ncol=colvalues.length + 1;
    //var nrow=rowvalues.length + 1;
    //DOM.style.font
    var border=0;
    if (cellMode===state.Layout.modes.cell.Sum) {
	border=1;
    };
    var width=0.9*window.innerWidth;
    var height=0.94*window.innerHeight - 100;
    var plans=state.Layout.makePlans(colkey,rowkey,colvalues,rowvalues,width,height,border);
    //console.log("Table Plans:",JSON.stringify(plans));
    //console.log("Heights:",window.innerHeight,height,plans.hdr.height,plans.cell.height);
    //console.log("Details => Width/Height:",window.innerWidth,window.innerHeight,plan.cell.width,plan.hdr.height)
    //console.log("Colkey:",colkey," colval:",JSON.stringify(colvalues));
    //console.log("Rowkey:",rowkey," rowval:",JSON.stringify(rowvalues));
    if (state.React.matrix === undefined) {
	var label="Processing..."
	var plan=state.Layout.makePlan(label,width,height);
	return (<div className={classes.divEmpty}>
		   <CanvasText state={state} label={label} plan={plan}/>
		</div>);
    } else {
	return (<div className={classes.divTable}>
		 <div className={classes.divTableBody}>
	          <HdrRow classes={classes} state={state} plans={plans} colkey={colkey} colvalues={colvalues} rowkey={rowkey} rowvalues={rowvalues}/>
	          <DataRows classes={classes} state={state} plans={plans} colkey={colkey} colvalues={colvalues} rowkey={rowkey} rowvalues={rowvalues} mode={cellMode}/>
		 </div>
		</div>);
    }
}
class Table extends Component {
    constructor(props) {
	super(props);
	const {state} = props;
	state.React.Table=this;
	this._ismounted=false;
    };
    showTable() {
	//console.log("Rebuilding table.",this._ismounted);
	if (this._ismounted) {
	    this.forceUpdate();
	};
    };
    componentDidMount() { 
	this._ismounted = true;
        window.addEventListener("resize", this.updateWindowDimensions);
    }
    componentWillUnmount() {
	this._ismounted = false;
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
	const { classes, state } = this.props;
	//console.log("##### Rendering Table.");
	return (<div ref={el=>{this.element(el)}} className={classes.content}>
		   <Grid container spacing={10}>
		      <Grid item xs={12} > 
                         { <Paper className={classes.paper}>
		              <Details state={state} classes={classes} element={this}/>
                           </Paper>}
                      </Grid>
                   </Grid>
		   <Tooltip state={state} classes={{button:classes.button}} element={this} type={'cell'}/>
	        </div>);
    }
}

Table.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(Table);
