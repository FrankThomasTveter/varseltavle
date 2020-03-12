import React, {Component} from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Chip from '@material-ui/core/Chip';

import AddIcon from '@material-ui/icons/Add';

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
    const {classes,onadd}=props;//state,
    var title="Play or pause.";
    return <Button className={classes.button} onClick={onadd} title={title}><AddIcon/></Button>;
};
class ReelAdd extends Component {
    constructor(props) {
	super(props);
	const {state} = props;
	this.state={anchor:null, label:""};
	//state.Path.getLabel(state)
	this.onClick  = event => {this.setState({ anchor: event.currentTarget });};
	this.onAdd    = () => {state.Path.addFilm(state,state.Path.getSnapshot(state)); this.setState({label:""});state.Show.showSettings(state);};
	this.onRemove = (index) => {this.setState({label:state.Path.removeFilm(state,index)});};
	this.handleChange=(event) => {
	    //console.log("handleChange:",event.target.value);
	    state.Path.setLabel(state,event.target.value);
	    this.setState({label:event.target.value});
        }
	//
	this.onClick=this.onClick.bind(this);
	this.onAdd=this.onAdd.bind(this);
    };
    
    render() {
        const { classes, state } = this.props;
	//var label=state.Path.getLabel(state);
	//var items=state.Path.getReels(state);
	const input=<input type={"search"} value={this.state.label} onChange={this.handleChange} />;
	return (<div>
		<AddReel state={state} classes={{button:classes.button}} onadd={this.onAdd}/>
		<Chip icon={null} label={input}  onClick={onclick}/>
		</div>
	       );
    }
}

ReelAdd.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(ReelAdd);
