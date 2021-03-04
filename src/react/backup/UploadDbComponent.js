import React, {Component} from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';

const styles = theme => ({
    loadDb: {
	width: '100%',
    }
});

class LoadDb extends Component {
    constructor(props) {
	super(props);
	this.loaded="";
    };
    render() {
	const { classes, state, append } = this.props;
	let fileReader;
	const handleFileRead = (e) => {
	    const content = fileReader.result;
	    state.Database.setLoaded(state,this.loaded);
	    state.Database.setAppend(state,append);
	    state.Database.resetDb(state,content);
	    // resetDb will reset append to false...
	};
	const handleFileChosen = (target) => {
	    let file=target.files[0];
	    state.Html.broadcast(state,"Uploading "+file.name);
	    //console.log("File:",file.name);
	    this.loaded=file.name;
	    fileReader = new FileReader();;
	    fileReader.onloadend = handleFileRead;
	    fileReader.readAsText(file);
	};
	return (
		<div className={classes.loadDb}>
   	  	   <input type='file' id='file'
	              onChange={e=>handleFileChosen(e.target)}
	              onClick={e=> {e.target.value = null}}/>
		</div>
	);
    }
}

LoadDb.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(LoadDb);
