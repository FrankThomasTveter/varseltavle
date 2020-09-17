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
    buttonInvisible:{
	color:'gray'
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
	const {classes, state, visible}=this.props;
	var onclick, title;
	if (visible !== undefined && ! visible && state.Settings.isInvisible(state,"FullScreen")) {
	    return null;
	} else if (visible !== undefined) {
	    onclick = (event) => state.Layout.toggleFullScreen(state);
	    title="Toggle Full Screen";
	    return (
		<Button
	              key="screen" 
                      className={classes.button}
                      onClick={onclick}
	              title={title}
		    >
	  	       {<FullscreenIconMode state={state}/>}
                    </Button>
	    );
	} else {
	    onclick=() => {state.Settings.toggle(state,"FullScreen");};
	    title="Show Screen";
	    if (state.Settings.isInvisible(state,"FullScreen")) {
		return (
		<Button
	              key="screen" 
                      className={classes.buttonInvisible}
                      onClick={onclick}
	              title={title}
		    >
	  	       {<FullscreenIconMode state={state}/>}
                    </Button>
		);
	    } else {
		return (
		<Button
	              key="screen" 
                      className={classes.button}
                      onClick={onclick}
	              title={title}
		    >
	  	       {<FullscreenIconMode state={state}/>}
                    </Button>
		);
	    }
	};
    }
}

Fullscreen.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(Fullscreen);
