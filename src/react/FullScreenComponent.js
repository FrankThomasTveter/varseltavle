import React, {Component} from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';

import FullscreenIcon from '@material-ui/icons/Fullscreen';
import NoFullscreenIcon from '@material-ui/icons/FullscreenExit';

const styles = theme => ({
    view: {
        marginLeft: 'auto',
    },
    button:{
	color:'white'
    },
});
function FullscreenIconMode (props) {
    const {state} = props;
    if (state.Layout.fullscreen) {
	return (<NoFullscreenIcon/>);
    } else {
	return (<FullscreenIcon/>);
    }
};
class Fullscreen extends Component {
    render() {
	const {classes, state}=this.props;
	var onclick = (event) => state.Layout.toggleFullScreen(state);
	return (
		<div className={classes.view}>
		   <Button
                      className={classes.button}
                      onClick={onclick}
	              title={"Toggle Full Screen"}
		    >
	  	       {<FullscreenIconMode state={state}/>}
                    </Button>
		</div>
	);
    }
}

Fullscreen.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(Fullscreen);
