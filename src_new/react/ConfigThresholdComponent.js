import React, {Component} from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';

import NoThresholdIcon from '@material-ui/icons/ThresholdsNone';
import LoadThresholdIcon from '@material-ui/icons/Thresholds';
import LevelThresholdIcon from '@material-ui/icons/ThresholdImportant';

const styles = theme => ({
    view: {
        marginLeft: 'title',
    },
    button:{
	color:'white'
    },
    buttonInvisible:{
	color:'gray'
    },
});
function ThresholdIconMode (props) {
    const {state} = props;
    //console.log("ConfigThresholdComponent:",state.Layout.state.threshold);
    var mode=state.Database.getThresholdMode(state);
    if (mode===0) {
	return (<NoThresholdIcon/>);
    } else if (mode===1) {
	return (<LoadThresholdIcon/>);
    } else if (mode===2) {
	return (<LevelThresholdIcon/>);
    } else {
	return (<NoThresholdIcon/>);
    }
};
class Threshold extends Component {
    render() {
	const {classes, state, visible}=this.props;
	var onclick, title;
	if (visible !== undefined && ! visible && state.Settings.isInvisible(state,"Threshold")) {
	    return null;
	} else if (visible !== undefined) {
	    onclick = (event) => state.Database.toggleThreshold(state);
	    title="Show threshold";
	    return (
		<div className={classes.view}>
		   <Button
                      className={classes.button}
                      onClick={onclick}
	              title={title}
		    >
	  	       {<ThresholdIconMode state={state}/>}
                    </Button>
		</div>
	    );
	} else {
	    title="Show Threshold";
	    onclick = (event) => state.Settings.toggle(state,"Threshold");
	    if (state.Settings.isInvisible(state,"Threshold")) {
		return <Button key="threshold" className={classes.buttonInvisible} onClick={onclick} title={title}><ThresholdIconMode state={state}/></Button>;
	    } else {
		return <Button key="threshold" className={classes.button} onClick={onclick} title={title}><ThresholdIconMode state={state}/></Button>;
	    };
	};
    }
}

Threshold.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(Threshold);
