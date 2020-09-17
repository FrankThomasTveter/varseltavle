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
    buttonInvisible:{
	color:'gray'
    },
});
class Reload extends Component {
    render() {
	const {state, classes, onclose, visible}=this.props;
	var onclick,title;
	if (visible !== undefined && ! visible && state.Settings.isInvisible(state,"Reload")) {
	    return null;
	} else if (visible!==undefined) {
	    if (onclose === undefined) {
		onclick = (event) => state.Show.show(state,true);
	    } else {
		onclick = (event) => {state.Show.show(state,true);onclose();};
	    };
	    title="Reload table";
	    return (<Button
		key="reload"
		className={classes.button}
		onClick={onclick}
		title={title}
		>
		{<ReloadIcon state={state}/>}
		</Button>
	       );
	} else {
	    onclick = () => {state.Settings.toggle(state,"Reload");};
	    title="Show Reload"
	    if (state.Settings.isInvisible(state,"Reload")) {
		return (<Button
		key="reload"
		className={classes.buttonInvisible}
		onClick={onclick}
		title={title}
		>
		{<ReloadIcon state={state}/>}
		</Button>
		   );
	    } else {
		return (<Button
		key="reload"
		className={classes.button}
		onClick={onclick}
		title={title}
		>
		{<ReloadIcon state={state}/>}
		</Button>
		   );
	    };
	}
    }
}

Reload.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(Reload);
