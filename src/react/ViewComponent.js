import React, {Component} from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';

import ViewIcon from '@material-ui/icons/Explore';
import NoViewIcon from '@material-ui/icons/ExploreOff';
//import ViewIcon from '@material-ui/icons/Visibility';
//import NoViewIcon from '@material-ui/icons/VisibilityOff';

const styles = theme => ({
    view: {
        marginLeft: 'auto',
    },
    button:{
	color:'white'
    },
});
function ViewIconMode (props) {
    const {state} = props;
    var mode=state.Layout.state.viewMode;
    if (mode === state.Layout.modes.view.path) {
	return (<ViewIcon/>);
    } else {
	return (<NoViewIcon/>);
    }
};
class View extends Component {
    render() {
	const {classes, state}=this.props;
	var onclick = (event) => state.Layout.toggleView(state);
	return (
		<Button
	           className={classes.button}
                   onClick={onclick}
	           title={"Show path"}
		 >
	  	    {<ViewIconMode state={state}/>}
                 </Button>
	);
    }
}

View.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(View);
