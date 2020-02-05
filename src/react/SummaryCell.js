import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';

import CanvasText  from './CanvasTextComponent';

const styles = theme => ({
    divTableCell:{
	border: '1px solid #EEE',
	display: 'table-cell',
	padding: '0px 0px',
    },
    divTableCellCursor:{
	cursor: "pointer",
	border: '1px solid #EEE',
	display: 'table-cell',
	padding: '0px 0px',
    },
});

//	borderCollapse: 'collapse',

function SummaryCell(props) {
    const { classes,state,onclick,index,rowindex,
	    colkey,rowkey,colvalues,rowval,
	    elements,plan,key,label } = props;
    console.log("Summary height:",plan.height);
    var style0={height:(plan.height)+"px",backgroundColor:'#FFF'};
    var style1={height:(plan.height)+"px",backgroundColor:'#EEE'};
    if (elements===undefined) {
	if (rowindex%2===1) {
	    return <div className={classes.divTableCell} style={style1}/>
	} else {
	    return <div className={classes.divTableCell} style={style0}/>
	}
    };
    var info=state.Matrix.getInfo(state,elements);
    var cnt=info.cnt;
    var maxlev=info.maxlev;
    var minlev=info.minlev;
    var lab="";
    if (label === undefined) {
	if (cnt > 1) {
	    lab=".";
	} else {
	    lab="";
	};
    };
    var invalid=(minlev < 0); 
    var bgcolor=state.Colors.getLevelBgColor(maxlev);
    var fgcolor=state.Colors.getLevelFgColor(maxlev);
    //console.log("Sending color:",fgcolor);
    //var stylec={height:plan.height+"px",backgroundColor:bgcolor};
    //console.log("SummaryCell:'"+lab+"' lev=",lev,elements.length,bgcolor,lab);
    //console.log("Found invalid.",invalid,minlev,maxlev,JSON.stringify(elements));
    //console.log("Summary Plan:",JSON.stringify(plan));
    //var data={colkey:colkey,rowkey:rowkey};
    var data=JSON.stringify({rowkey:rowkey,rowval:rowval,colkey:colkey,colvalues:colvalues,index:index,step:plan.step}); 
    return (
            <div className={(onclick !== undefined?classes.divTableCellCursor:classes.divTableCell)} key={key}
	         style={{color:fgcolor,backgroundColor:bgcolor}} onClick={onclick} height={plan.height} width={plan.width}
	         data-for='cell' data-tip={data}>
		<CanvasText state={state} label={lab} plan={plan} key={key} invalid={invalid} index={index}
					   colkey={colkey} rowkey={rowkey} colvalues={colvalues} rowval={rowval} color={fgcolor}/>
	    </div>
           );
}

SummaryCell.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(SummaryCell);
