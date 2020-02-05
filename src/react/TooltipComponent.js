import React, {Component} from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';

import TooltipIcon from '@material-ui/icons/Help';
import ClickTooltipIcon from '@material-ui/icons/HelpOutline';
import NoTooltipIcon from '@material-ui/icons/HighlightOff';

const styles = theme => ({
    view: {
        marginLeft: 'title',
    },
    button:{
	color:'white'
    },
});
function TooltipIconMode (props) {
    const {state} = props;
    //console.log("TooltipComponent:",state.Layout.state.tooltip);
    if (state.Layout.state.tooltip===0) {
	return (<TooltipIcon/>);
    } else if (state.Layout.state.tooltip===1) {
	return (<ClickTooltipIcon/>);
    } else {
	return (<NoTooltipIcon/>);
    }
};
class Tooltip extends Component {
    render() {
	const {classes, state}=this.props;
	var onclick = (event) => state.Layout.toggleTooltip(state);
	return (
		<div className={classes.view}>
		   <Button
                      className={classes.button}
                      onClick={onclick}
	              title={"Show tooltip"}
		    >
	  	       {<TooltipIconMode state={state}/>}
                    </Button>
		</div>
	);
    }
}

Tooltip.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(Tooltip);
