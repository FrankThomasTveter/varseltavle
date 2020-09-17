import React, {Component} from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';

const styles = theme => ({
    input: {},
    edit: {
        marginLeft: 'auto',
    },
});
class Edit extends Component {
    state={range:null};
    render() {
	const {label, index, range, setvalue }=this.props;
	//state, classes, onclick, onclose, 
	this.setState={range:range};
	this.handleChange=function(event) {
	    setvalue(range,index,event.target.value);
	    this.forceUpdate();
	}.bind(this);
	if (range === undefined) {
	    return null;
	} else {
	    return (<div>{label}<input type="text" name={label} value={range[index]} onChange={this.handleChange} /></div>);
	}
    }
}

Edit.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(Edit);
