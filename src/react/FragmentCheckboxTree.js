import React, {Component} from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import CheckboxTree from 'react-checkbox-tree';

const styles = theme => ({
    settings:{},
    order:{},
    tableOrder:{},
    buttonInvisible:{},
    config: {
        marginLeft: 'auto',
    },
    button:{
	color:'white'
    },
});

class Fragment extends Component {
    constructor() {
        super();
        this.state = {
            checked: [],
            expanded: [],
        };
    }
    componentDidMount() {
        const { state } = this.props;
	var checked=state.Database.getFragmentActive(state);
	this.setState({ checked });
    }
    render() {
        const { state, items, force  } = this.props; //classes,
	this.checkfunction=checked => {
	    this.setState({ checked });
	    state.Database.setFragmentActive(state,checked);
	};
	this.expandfunction=expanded => {
	    this.setState({ expanded });
	    force();
	};
        return (
            <CheckboxTree
                nodes={items}
                checked={this.state.checked}
                expanded={this.state.expanded}
            onCheck={this.checkfunction}
	    onExpand={this.expandfunction}
            />
        );
    };
}

Fragment.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(Fragment);
