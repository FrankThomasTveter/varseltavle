import React, {Component} from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Typography from "@material-ui/core/Typography/Typography";
import { CompactPicker as Picker } from 'react-color';



const styles = theme => ({
    root: {
        backgroundColor: theme.palette.primary.main,
        marginTop: theme.spacing.unit * 8,
        bottom: 0,
        padding: `${theme.spacing.unit * 6}px 0`,
        color: '#FFF'
    },
    horisontal: {
        marginLeft: 'auto',
	display: 'flex',
	justifyContent: 'flex-end',
	alignItems:'right',
    },
    text: {
        maxWidth: theme.spacing.getMaxWidth.maxWidth,
        margin: theme.spacing.getMaxWidth.margin,
    },
    divTable :{
	display: 'table',
	width: '100%',
//	border:  '1px solid red',
    },
    divTableBody : {
	display: 'table-row-group',
    },
    divTableRow:  {
	border: '0px solid #999999',
	display: 'table-row',
	padding: '0px',
    },
    divTableCell:{
	border: '0px solid #999999',
	display: 'table-cell',
	padding: '0px',
//	border:  '1px solid blue',
    },
});
function renderItem(classes,state,bg,fg,level,el) {
    var plans=state.Layout.makePlans();
    //console.log("Showing palette:",bg,fg,JSON.stringify(plans.hd2));
    var onclick=() => {el.setState({ color:bg, level:level, pickerVisible: !el.state.pickerVisible })};
    return (<div key={level} style={{color:fg,backgroundColor:bg,textAlign:'center'}} onClick={onclick} className={classes.divTableCell}>{level}</div>);
};
class Disclaimer extends Component {
    state = {anchor: null,};
    constructor(props) {
        super(props);
        const {state} = props;
        state.React.Disclaimer=this;
    };
    state = {
	pickerVisible: false,
	color:"#333",
	level:0,
    }
    showDisclaimer(state) {
	this.forceUpdate();
    }
    render() {
	const { classes, state } = this.props;
	this.onClose = () => {this.setState({ anchor: null });};
	this.onClick = (event) => {this.setState({ anchor: event.currentTarget });};
	const handleColorChange = ({ hex }) => {state.Colors.setLevelBgColor(state,this.state.level,hex);state.Show.show(state,false);}
	var bgcolors=[];
	var fgcolors=[];
	if (state.Colors.colors !== undefined) {
	    bgcolors=state.Colors.colors.background;
	    fgcolors=state.Colors.colors.foreground;
	} else {
	    console.log("No colors...");
	}
	var mapFunction= (val,index)=>renderItem(classes,state,bgcolors[index],fgcolors[index],index,this);
	return (
		<div onClick={this.onClick} onClose={this.onClose}>
		      { this.state.pickerVisible && (
	 		<div style={{ position: 'absolute' }}>
 			   <Picker 
		              color={this.state.color}
		              onChangeComplete={ handleColorChange }
			   />
			</div>
		      ) }
  		   <div className={classes.divTable}>
		      <div className={classes.divTableBody}>
		         <div className={classes.divTableRow}>
	    	            {bgcolors.map(mapFunction)}
	                 </div>
	              </div>
		   </div>
		</div>
	);
    }
};

//		<Typography color={"inherit"}>
//		***Colors do not represent official warning levels***
//		</Typography>


    
Disclaimer.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(Disclaimer);
