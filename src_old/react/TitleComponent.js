import React, {Component} from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';

import TitleIcon from '@material-ui/icons/HelpOutline';
import NoTitleIcon from '@material-ui/icons/HighlightOff';

const styles = theme => ({
    view: {
        marginLeft: 'title',
    },
    button:{
	color:'white'
    },
});
function TitleIconMode (props) {
    const {state} = props;
    if (state.Layout.state.title===1) {
	return (<TitleIcon/>);
    } else {
	return (<NoTitleIcon/>);
    }
};
class Title extends Component {
    render() {
	const {classes, state}=this.props;
	var onclick = (event) => state.Layout.toggleTitle(state);
	return (
		<div className={classes.view}>
		   <Button
                      className={classes.button}
                      onClick={onclick}
	              title={"Show tooltip"}
		    >
	  	       {<TitleIconMode state={state}/>}
                    </Button>
		</div>
	);
    }
}

Title.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(Title);
