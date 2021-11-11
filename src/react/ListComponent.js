import React, {Component} from "react";
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';

import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';

//import SummaryCell from './SummaryCell';
//import CanvasText  from './CanvasTextComponent';
//import Text        from './TextComponent';

//	overflow: 'hidden',

const styles = theme => ({
    dataset: {},
    content: {},
    root: {
	height: '100%',
    },
    button:{},
    buttonDisabled:{},
    paper: {
	tableLayout: 'fixed',
	padding:0,
	margin:0,
    },
    divTable :{
	display: 'table',
	width: '100%',
    },
    divTableRow:  {
	display: 'table-row',
    },
    divTableCell:{
	border: '0px solid #999999',
	display: 'table-cell',
	padding: '3px 3px',
    },
    divTableCellCursor:{
	cursor: "pointer",
	border: '0px solid #999999',
	display: 'table-cell',
	padding: '0px 0px',
    },
    divTableHead : {
	border: '0px solid #999999',
	display: 'table-cell',
	padding: '0px 0px',
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
    }
});
// ---------------- DATA
class List extends Component {
    constructor() {
        super();
	this.dirs={};
	this.order=[];
	this.Details=this.Details.bind(this);
	this.HdrRow=this.HdrRow.bind(this);
    };
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
    renderDataList(classes,state,doc,plan,skey,index){
	if (doc===undefined) {
	    return <div className={classes.divTableCell} style={{backgroundColor:'#EEE'}}/>
	} else {
	    var val=doc[skey];
	    var where=state.Database.getWhereValue(skey,val);
	    var range;
	    var title=state.Matrix.getTooltipTitle(state,doc,skey); // get threshold... ala 
	    var lev=doc.__lev;
	    if (doc._thr !== undefined && doc._thr.level !== undefined) {
		lev=doc._thr.level;
	    }
	    var bgcolor=state.Colors.getLevelBgColor(lev);
	    var fgcolor=state.Colors.getLevelFgColor(lev);
	    var onClick=()=>{state.Navigate.selectKeys(state,skey,val,range,where,1);};
	    if (val === undefined) {val="";};
	    //console.log("Key:",skey," Val:",JSON.stringify(val),JSON.stringify(doc[skey]));
	    return (
		    <div className={classes.divTableCell} style={{color:fgcolor,backgroundColor:bgcolor,cursor: "pointer"}} key={skey} onClick={onClick} title={title}>
		    {val}
		</div>
	    );
	}
    };
    renderDoc(classes,state,skeys,plan,doc,index) {
	//console.log("We have a matrix(",rowval,") with range:",JSON.stringify(range));
	var mapFunction= (skey,index)=>this.renderDataList(classes,state,doc,plan,skey,index);
	return (<div className={classes.divTableRow} key={index.toString()}>
		{skeys.map(mapFunction)}
		</div>);
    };
    getDataRowList(classes,state,skeys,plans,dirs,order) {
	const items=[];
	const docs=[];
	var matrix=state.React.matrix;
	//var ret=null;
	if (matrix!==undefined) {
	    var elements=state.Matrix.getMatrixElements(state,matrix);
	    elements.forEach( element => {
		if (element !== undefined && element.docs !== undefined) {
		    let lev=element.maxlev;
		    element.docs.forEach((doc)=>{doc.__lev=lev;});
		    docs.push.apply(docs,element.docs);
		};
	    });
	};
	// sort
	//console.log("Sorting:",JSON.stringify(dirs),JSON.stringify(order),docs.length);
	var sort=docs.sort((a,b) => {
	    var leno=order.length;
	    for (var ii=0;ii<leno;ii++) {
		var col=order[ii];
		var key=col;
		var dir=dirs[col];
		var ka=a[key];
		var kb=b[key];
		if (dir === "up") {
		    if (ka === null && kb !== null) {
			return -1;
		    } else if (ka !== null && kb === null) {
			return 1;
		    } else if (ka > kb) {
			return -1;
		    } else if (ka < kb) {
			return 1;
		    };
		} else if (dir === "down") {
		    if (ka === null && kb !== null) {
			return -1;
		    } else if (ka !== null && kb === null) {
			return 1;
		    } else if (ka > kb) {
			return 1;
		    } else if (ka < kb) {
			return -1;
		    };
		}
	    }
	    return 0;
	});
	//console.log("Sorted:",JSON.stringify(sort));
	// make react-components...
	var mapFunction=(doc,index) =>this.renderDoc(classes,state,skeys,plans.cell,doc,index);
	items.push(sort.map(mapFunction));
	//console.log("Docs:",JSON.stringify(docs));
	return items;
    };
    // ---------------- HDR
    renderHdrList(classes,state,plan,val,index,dirs,order) {
	//console.log("HdrCell:",val);
	var up="↑";
	var down="↓";
	var label=val;
//	if (state.Path.sortKey(val)) {
	if (order.length > 0 && order[0] === val) {
	    var dir =dirs[val];
	    if (dir === "up") {
		label=label + up;
	    } else if (dir === "down") {
		label=label + down;
	    };
	}
	var cursor=classes.divTableCell;
	var onClick=() => {
	    var dir=dirs[val];
	    if (dir === undefined) {
		dir="up";
	    } else if (dir === "up") {
		dir="down";
	    } else if (dir === "down") {
		dir=undefined;
	    };
	    if (dir === undefined) {
		if (val in dirs) {delete dirs[val];};
	    } else {
		dirs[val]=dir;
	    };
	    // remove target key
	    var index=order.indexOf(val);
	    if (index !== -1) {
		order.splice(index,1);
	    };
	    if (dir !== undefined ) { // put in front of array
		order.unshift(val);
	    };
	    //console.log("Clicked:",val,dir,JSON.stringify(dirs),JSON.stringify(order));
	    state.Show.showMatrix(state,state.React.matrix,true);
	};
	return (<div className={cursor} style={{backgroundColor:'#DDD',cursor: "pointer",}} key={`col-${index}`} onClick={onClick}>
		{label}
 		</div> );
    }
    HdrRow(props) {
	const { classes, state, plans, skeys, dirs, order } = props; //, rowvalues, label, cellMode
	var mapFunction= (val,index)=>this.renderHdrList(classes,state,plans.col,val,index,dirs,order);
	//console.log("Making header List row.",JSON.stringify(skeys));
	return (<div className={classes.divTableRow} key={'hdr'}>
		{skeys.map(mapFunction)}
		</div>);
    };
    // ---------------- Details
    Details(props) {
	const { classes, state, dirs, order } = props; // classes, 
	var cellMode  = state.Layout.getCellMode(state);
	if (state.React.matrix === undefined) {
	    return (<div className={classes.divTable}>
		    <div className={classes.divTableBody}>
		    <div className={classes.devTableCell}>
		    {"No Matrix defined"}
		    </div>
		    </div>
		    </div>
		   );
	} else {
            var skeys = state.Path.getVisibleKeys(state);
	    //console.log("Skeys:",skeys);
 	    //DOM.style.font
	    var border=2;
	    var label="";
	    var width=0.9*window.innerWidth;
	    var height=0.94*window.innerHeight - 180;
	    //var height=0.8*(window.innerHeight-200);
	    var plans=state.Layout.makePlans(label,[""],[""],width,height,border,cellMode);
	    var items=this.getDataRowList(classes,state,skeys,plans,dirs,order);
	    //console.log("Details => Width/Height:",window.innerWidth,window.innerHeight,plan.cell.width,plan.hdr.height)
	    return (<div className={classes.divTable}>
		    <div className={classes.divTableBody}>
		    <this.HdrRow classes={classes} state={state} key={"hdr"} plans={plans} label={label} cellMode={cellMode} skeys={skeys} dirs={dirs} order={order}/>
		    {items}
		    </div>
		    </div>
		   );
	}
    };
    render() {
	const { classes, state } = this.props;
	//console.log("##### Rendering List.");
	return (<div ref={el=>{this.element(el)}} className={classes.root}  style={{width: '100%', height: '100%'}}>
		<Grid container>
		<Grid item xs={12} > 
                { <Paper className={classes.paper}>
		  <this.Details state={state} classes={classes} element={this} dirs={this.dirs} order={this.order}/>
                  </Paper>}
                </Grid>
                </Grid>
	        </div>);
    }
}

List.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(List);
