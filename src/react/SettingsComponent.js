import React, {Component} from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';

import SettingsIcon from '@material-ui/icons/Settings';
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
        marginLeft: 'auto',
	color:'red',
    },
    button:{color:'white'},
});
function Home(props) {
    const {state,classes}=props;
    var onclick=() => {state.Path.setHome(state);};
    var title="Set home";
    return <Button className={classes.button} onClick={onclick} title={title}><HomeIcon/></Button>;
};
function Font(props) {
    const {state,classes}=props;
    var onclick=() => {state.Layout.changeFont(state);};
    var title="Change font";
    return <Button className={classes.button} onClick={onclick} title={title}><FontIcon/></Button>;
};
class Settings extends Component {
    state = {anchor: null,};
    render() {
        const { state,classes } = this.props;
	//console.log("Rendering Settings...");
	this.onClose = () => {this.setState({ anchor: null });};
	this.onClick = (event) => {this.setState({ anchor: event.currentTarget });};
	return (<div>
		  <Button
		    className={classes.button}
                    aria-owns={this.state.anchor ? 'settings-menu' : undefined}
                    aria-haspopup="true"
                    onClick={this.onClick}
		    title={"Settings"}
		   >
		   {<SettingsIcon />}
                  </Button>
	          <Menu
                   id="settings-menu"
	           anchorEl={this.state.anchor}
                   open={Boolean(this.state.anchor)}
                   onClose={this.onClose}
	          >
		    <MenuItem key="reload" onClose={this.onClose}>
		       <Reload state={state} classes={{button:classes.button}}/>
		    </MenuItem>
		    <MenuItem key="view" onClose={this.onClose}>
		       <View state={state} classes={{button:classes.button}}/>
		    </MenuItem>
		    <MenuItem key="auto" onClose={this.onClose}>
		       <Auto state={state} classes={{button:classes.button}}/>
		    </MenuItem>
		    <MenuItem key="tooltip" onClose={this.onClose}>
		       <Tooltip state={state} classes={{button:classes.button}}/>
		    </MenuItem>
		    <MenuItem key="select" onClose={this.onClose}>
		       <SelectMenu state={state} classes={{button:classes.button}}/>
		    </MenuItem>
		    <MenuItem key="order" onClose={this.onClose}>
		       <OrderMenu state={state} classes={{button:classes.button}}/>
		    </MenuItem>
		    <MenuItem key="keys" onClose={this.onClose}>
		       <KeyMenu state={state} classes={{button:classes.button}}/>
		    </MenuItem>
		    <MenuItem key="priorities" onClose={this.onClose}>
		       <PriorityMenu state={state} classes={{button:classes.button}}/>
		    </MenuItem>
		    <MenuItem key="home" onClose={this.onClose}>
		       <Home state={state} classes={{button:classes.button}}/>
		    </MenuItem>
		    <MenuItem key="font" onClose={this.onClose}>
		       <Font state={state} classes={{button:classes.button}}/>
		    </MenuItem>
		    <MenuItem key="file" onClose={this.onClose}>
		       <FileMenu state={state} classes={{button:classes.button}}/>
		    </MenuItem>
		    <MenuItem key="archive" onClose={this.onClose}>
		       <ArchiveMenu state={state} classes={{button:classes.button}}/>
		    </MenuItem>
		    <MenuItem key="screen" onClose={this.onClose}>
		       <FullScreen state={state} classes={{button:classes.button}}/>
		    </MenuItem>
	          </Menu>
		</div>
	       );
    }
}

Settings.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(Settings);
