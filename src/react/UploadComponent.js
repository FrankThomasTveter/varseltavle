import React, {Component} from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';

const styles = theme => ({
    load: {
	width: '100%',
    }
});

class Load extends Component {
    render() {
	const { classes, state } = this.props;
	let fileReader;
	const handleFileRead = (e) => {
	    const content = fileReader.result;
	    state.Default.resetSetup(state,content);
	}
	const handleFileChosen = (target) => {
	    let file=target.files[0];
	    state.Html.broadcast(state,"User uploaded "+file.name);
	    fileReader = new FileReader();
	    fileReader.onloadend = handleFileRead;
	    fileReader.readAsText(file);
	    state.Default.path=file;
	}
	return (
		<div className={classes.load}>
   	  	   <input type='file' id='file'
	              onChange={e=>handleFileChosen(e.target)}/>
		</div>
	);
    }
}

Load.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(Load);
