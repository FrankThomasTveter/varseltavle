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
    body: {
        margin: theme.spacing.getMaxWidth.margin,
	width: '90%',
	height: '90%',
    },
    table: {
        textAlign: 'left',
        padding: theme.spacing.unit * 0,
	height: '100%',
	width: '100%',
	borderStyle: 'solid',
    },
    row  :{alignItems: "stretch"},
    cell : {cursor: "pointer"},
});
//        maxWidth: theme.spacing.getMaxWidth.maxWidth,

function Switcher(props) {
    const { state, progress } = props;
    //var skeys=state.Matrix.sortedKeys(state,state.Matrix.keyCnt);
    //var dim        = state.Layout.getDim(state)
    var mode       = state.Layout.getLayoutMode(props.state);
    //console.log(">>>>>> Switcher Dim:",dim," mode:",mode);
    if (progress) { // processing
	return (<div style={{width:'100%',margin:'0 auto'}}>
	          <Progress/>
	       </div>);
    } else if (mode === state.Layout.code.layout.Table) {
	return (<Table state={state}/>);
    } else if (mode === state.Layout.code.layout.List) {
	return (<List state={state}/>);
    } else if (mode === state.Layout.code.layout.Map) {
	return (<Map state={state}/>);
    }
};

class Dataset extends Component {
    constructor(props) {
        super(props);
        const {state} = props;
        state.React.Dataset=this;
	this.state={progress:false};
    };
    showMatrix(state,matrix) {
	state.React.matrix=matrix;
	//console.log("Datacomponent matrix:",JSON.stringify(state.React.matrix));
	this.forceUpdate();
    };
    setProgress(state,active) {
	this.setState({progress:active});
	//this.forceUpdate();
    };
    render() {
        const { classes, state } = this.props;
        return (
            <div className={classes.body}>
                <Path     state={state}/>
		<Switcher state={state} progress={this.state.progress}/>
            </div>
        );
    }

}

Dataset.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(Dataset);
