import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import CanvasGraph from './CanvasGraphComponent';

//	textAlign: "center",
const styles = theme => ({
    pointer: {
	textAlign: "center",
	cursor:"pointer",
	padding: 0,
	overflow: 'hidden',
	tableLayout: 'fixed',
    },
    nopointer: {
	textAlign: "center",
	padding: 0,
	overflow: 'hidden',
	tableLayout: 'fixed',
    },
    div: {
	overflow: 'hidden',
	tableLayout: 'fixed',
    },
    divTableCell:{
	border: '0px solid #999999',
	display: 'table-cell',
	padding: '0px 0px',
    },
    divTableCellCursor:{
	cursor: "pointer",
	border: '0px solid #999999',
	display: 'table-cell',
	padding: '0px 0px',
    },
});
//	padding: "0px";
//	textAlign: "center",
function SeriesCell(props) {
    const { classes,state,onclick,index,rowindex,
	    colwhere,rowwhere,colkey,rowkey,colvalues,rowval,
	    elements,range,plan,key,layout,...other } = props;

    var style0={height:plan.height+"px",backgroundColor:'#FFF'};
    var style1={height:plan.height+"px",backgroundColor:'#EEE'};
    if (elements===undefined) {
	if (rowindex%2===1) {
	    return <div className={classes.divTableCell} style={style1}/>
	} else {
	    return <div className={classes.divTableCell} style={style0}/>
	}
    };
    var info=state.Matrix.getInfo(state,elements);
    //var cnt=info.cnt;
    var maxlev=info.maxlev;
    //var minlev=info.minlev;
    var bgcolor=state.Colors.getLevelBgColor(maxlev);
    var fgcolor=state.Colors.getLevelFgColor(maxlev);
    //console.log("SeriesCell:",JSON.stringify(elements));
    //console.log("SeriesCell:",lev,cnt,JSON.stringify(range));
    //console.log("Series Plan:",JSON.stringify(plan));
    var data=JSON.stringify({rowkey:rowkey,rowval:rowval,colkey:colkey,colvalues:colvalues,index:index,step:plan.step,layout:layout}); 
    return(
	    <div className={(onclick !== undefined?classes.divTableCellCursor:classes.divTableCell)} key={key}
	         style={{color:fgcolor,backgroundColor:bgcolor}} onClick={onclick} height={plan.height} width={plan.width}
	         data-for='cell' data-tip={data}>
  	       <CanvasGraph {...other} state={state} range={range} colkey={colkey} colvalues={colvalues} index={index}
	          onclick={onclick} elements={elements} level={maxlev} plan={plan} fgcolor={fgcolor} bgcolor={bgcolor}/>  
	     </div>
    );
}



SeriesCell.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(SeriesCell);
