import React, {Component} from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';

import ReloadIcon from '@material-ui/icons/Autorenew';

const styles = theme => ({
    reload: {
        marginLeft: 'auto',
    },
    button:{
	color:'white'
    },
});
class Reload extends Component {
    render() {
	const {state, classes, onclose}=this.props;
	var onclick;
	if (onclose === undefined) {
	    onclick = (event) => state.Show.show(state,true);
	} else {
	    onclick = (event) => {state.Show.show(state,true);onclose();};
	};
	return (
	   <Button
              className={classes.button}
	      onClick={onclick}
              title={"Reload table"}
	   >
              {<ReloadIcon state={state}/>}
           </Button>
	);
    }
}

Reload.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(Reload);
