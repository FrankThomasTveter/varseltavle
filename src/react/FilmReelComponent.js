import React, {Component} from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import Chip from '@material-ui/core/Chip';

import ReelIcon from '@material-ui/icons/Theaters';
import TrashIcon from '@material-ui/icons/Delete';
import AddIcon from '@material-ui/icons/Add';
import UpwardIcon from '@material-ui/icons/ArrowUpward';

const styles = theme => ({
    reel: {
	display: 'inline-block',
        marginRight: 'auto',
	height:'100%',
    },
    tableReel: {
	display: 'inline-block',
        marginRight: 'auto',
    },
    button:{
	color:'white'
    },
});
function AddReel(props) {
    const {state,classes,onadd}=props;
    var title="Play or pause.";
    return <Button className={classes.button} onClick={onadd} title={title}><AddIcon/></Button>;
};
function RemoveReel(props) {
    const {state,classes,index,onRemove}=props;
    var onremove= () => {onRemove(index);};
    var title="Reel";
    return <Button className={classes.button} onClick={onremove} title={title}><TrashIcon/></Button>;
};
function UpwardReel(props) {
    const {state,classes,index,onUpward}=props;
    var onupward= () => {onUpward(index);};
    var title="Reel";
    return <Button className={classes.button} onClick={onupward} title={title}><UpwardIcon/></Button>;
};
function renderMenuItem(classes,state,keyitem,keyindex,onRemove,onUpward) {
    var onclick=() => {state.Path.nextFilm(state,keyindex);};
    if (keyindex===0) { // remove
	return ( <MenuItem className={classes.order} key={"film_" + keyindex}>
		<RemoveReel state={state} classes={{button:classes.button}} index={keyindex} onRemove={onRemove}/>
		<Chip icon={null} label={keyitem.label} onClick={onclick}/>
		</MenuItem>
	       );
    } else {
	return (<MenuItem className={classes.order} key={"film_" + keyindex}>
		<UpwardReel state={state} classes={{button:classes.button}} index={keyindex} onUpward={onUpward}/>
		<Chip icon={null} onClick={onclick} label={keyitem.label}/>
		</MenuItem>
	       );
    }
}
class ReelMenu extends Component {
    constructor(props) {
	super(props);
	const {state} = props;
	this.state={anchor:null, label:""};
	//state.Path.getLabel(state)
	this.onClick  = event => {this.setState({ anchor: event.currentTarget });};
	this.onClose  = () => {this.setState({ anchor: null });};
	this.onAdd    = () => {state.Path.addFilm(state,state.Path.getSnapshot(state)); this.setState({label:""});state.Show.showSettings(state);};
	this.onRemove = (index) => {this.setState({label:state.Path.removeFilm(state,index)});};
	this.onUpward = (index) => {state.Path.moveFilm(state,index);state.Show.showSettings(state);};
        this.handleChange=(event) => {
	    //console.log("handleChange:",event.target.value);
            state.Path.setLabel(state,event.target.value);
	    this.setState({label:event.target.value});
        }
	//
	this.onClick=this.onClick.bind(this);
	this.onClose=this.onClose.bind(this);
	this.onAdd=this.onAdd.bind(this);
	this.onRemove=this.onRemove.bind(this);
	this.onUpward=this.onUpward.bind(this);
	this.handleChange=this.handleChange.bind(this);
    };
    
    render() {
        const { classes, state } = this.props;
	//var label=state.Path.getLabel(state);
	var items=state.Path.getReels(state);
	var mapFunction= (item,index)=>renderMenuItem(classes,state,item,index,this.onRemove,this.onUpward);
	const input=<input type={"search"} value={this.state.label} onChange={this.handleChange} />;
	return (<div className={classes.tableReel}>
		   <Button
                      className={classes.button}
                      aria-owns={this.state.anchor ? 'reel-menu' : undefined}
                      aria-haspopup="true"
                      onClick={this.onClick}
	              title={"Value reel"}
		   >
	  	       {<ReelIcon state={state}/>}
                     </Button>
		<div>
		<AddReel state={state} classes={{button:classes.button}} onadd={this.onAdd}/>
		<Chip icon={null} label={input}  onClick={onclick}/>
		</div>
		     <Menu
	                className={classes.tableReel}
                        id="reel-menu"
	                anchorEl={this.state.anchor}
                        open={Boolean(this.state.anchor)}
                        onClose={this.onClose}
		     >
		        {items.map(mapFunction)}
	             </Menu>
		</div>
	);
    }
}
//			       value={label} 
//


ReelMenu.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(ReelMenu);
