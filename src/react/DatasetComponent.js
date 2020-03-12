import React, {Component} from "react";
import {withStyles} from "@material-ui/core";
import PropTypes from  "prop-types";
import Path      from  "./PathComponent";
import Table     from  "./TableComponent";
import List      from  "./ListComponent";
import Map       from  "./MapComponent";
import Progress  from './Progress';

//console.log("Inside Dataset.")

const styles = theme => ({
    dataset:{},
    content:{},
});
//        maxWidth: theme.spacing.getMaxWidth.maxWidth,

function Switcher(props) {
    const { state, classes, progress } = props;
    //var skeys=state.Matrix.sortedKeys(state,state.Matrix.keyCnt);
    //var dim        = state.Layout.getDim(state)
    var mode       = state.Layout.getLayoutMode(props.state);
    //console.log(">>>>>> Switcher Dim:",dim," mode:",mode);
    if (mode === state.Layout.modes.layout.Map) {
	//console.log("Showing map...");
	return (<Map   state={state}   classes={classes}/>);
    } else if (progress) { // processing
	return (<div style={{width:'100%',margin:'0 auto'}}>
	          <Progress/>
	       </div>);
    } else if (mode === state.Layout.modes.layout.Table) {
	return (<Table state={state}   classes={classes}/>);
    } else if (mode === state.Layout.modes.layout.List) {
	return (<List  state={state}   classes={classes}/>);
    }
};

class Dataset extends Component {
    constructor(props) {
        super(props);
        const {state} = props;
        state.React.Dataset=this;
	this.state={progress:false,mode:0};
    };
    showMatrix(state,matrix) {
	state.React.matrix=matrix;
	this.forceUpdate();
	//console.log("Datacomponent matrix:",JSON.stringify(state.React.matrix));
    };
    setProgress(state,active) {
	var mode       = state.Layout.getLayoutMode(state);
	//console.log(">>>>>> Switcher Dim:",dim," mode:",mode);
	//console.log("Setting progress:",active,mode);
	if (mode === state.Layout.modes.layout.Map && mode===this.state.mode) {
	    this.setState({progress:active});
	    //this.state.progress=active;
	} else {
	    state.React.Dataset.setState({progress:active,mode:mode});
	    //this.forceUpdate();
	}
    };
    render() {
        const { classes, state } = this.props;
        return (
            <div className={classes.dataset}>
                <Path     state={state}/>
		<Switcher state={state} classes={{content:classes.content}} progress={this.state.progress}/>
            </div>
        );
    }

}

Dataset.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(Dataset);
