import React, {Component} from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';

import EditLvlIcon from '@material-ui/icons/EditLvl';
import HomeIcon from '@material-ui/icons/Home';
import FontIcon from '@material-ui/icons/TextFields';

import Reload       from './ReloadComponent';
import View         from './ViewComponent';
import Auto         from './AutoComponent';
import Tooltip      from './TooltipComponent';
import SelectMenu   from './SelectMenuComponent';
import KeyMenu      from './KeyMenuComponent';
import OrderMenu    from './OrderMenuComponent';
import PriorityMenu from './PriorityMenuComponent';
import FileMenu     from './FileMenuComponent';
import ArchiveMenu  from './ArchiveMenuComponent';
import FullScreen   from './FullScreenComponent';

const styles = theme => ({
    settings: {
        marginRight: 'auto',
	color:'red',
    },
    button:{color:'white'},
});
class EditLvl extends Component {
    state = {anchor: null,};
    render() {
        const { state,classes } = this.props;
	//console.log("Rendering EditLvl...");
	this.onClose = () => {this.setState({ anchor: null });};
	this.onClick = (event) => {this.setState({ anchor: event.currentTarget });};
	return (<div className={classes.divTableCell} >
		  <div
		    className={classes.button}
                    aria-owns={this.state.anchor ? 'settings-menu' : undefined}
                    aria-haspopup="true"
                    onClick={this.onClick}
		    title={"EditLvl"}
		   >
		   lvl
                  </div>
	          <Menu
		   settings={{float:'right'}}
                   id="settings-menu"
	           anchorEl={this.state.anchor}
                   open={Boolean(this.state.anchor)}
                   onClose={this.onClose}
	          >
		    <MenuItem key="reload" onClose={this.onClose}>
		       colorpicker
		    </MenuItem>
	          </Menu>
		</div>
	       );
    }
}

EditLvl.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(EditLvl);
