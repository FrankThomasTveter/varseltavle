import React, {Component} from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';

import SettingsIcon from '@material-ui/icons/Settings';

import Undo         from './UndoComponent';
import Redo         from './RedoComponent';
import Mode         from './ModeComponent';
import View         from './ViewComponent';
import Key          from './KeyCollectMenuComponent';
import Reload       from './ReloadComponent';
import Tooltip      from './TooltipComponent';
import Order        from './OrderMenuComponent';
import Home         from './HomeMenuComponent';
import Film         from './FilmMenuComponent';
import File         from './FileMenuComponent';
import Archive      from './ArchiveMenuComponent';
import Font         from './FontComponent';
import FullScreen   from './FullScreenComponent';
import SettingsMenu from './SettingsMenuComponent';

const styles = theme => ({
    settings: {
        marginRight: 'auto',
	color:'red',
    },
    button:{color:'white'},
});

class Settings extends Component {
    constructor(props) {
        super(props);
        const {state} = props;
        state.React.Settings=this;
    };
    show(state) {
	//console.log("Called Config.show...");
	this.forceUpdate();
    };
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
		   settings={{float:'right'}}
                   id="settings-menu"
	           anchorEl={this.state.anchor}
                   open={Boolean(this.state.anchor)}
                   onClose={this.onClose}
	          >
		    <MenuItem key="reload" onClose={this.onClose}>
		<Reload state={state} classes={{button:classes.button}}  visible={true}/>
		    </MenuItem>
		    <MenuItem key="undo" onClose={this.onClose}>
		       <Undo state={state} classes={{button:classes.button}} visible={true}/>
		    </MenuItem>
		    <MenuItem key="redo" onClose={this.onClose}>
		       <Redo state={state} classes={{button:classes.button}} visible={true}/>
		    </MenuItem>
		    <MenuItem key="mode" onClose={this.onClose}>
		       <Mode state={state} classes={{button:classes.button}} visible={true}/>
		    </MenuItem>
		    <MenuItem key="view" onClose={this.onClose}>
		       <View state={state} classes={{button:classes.button}} visible={true}/>
		    </MenuItem>
		    <MenuItem key="key" onClose={this.onClose}>
		       <Key state={state} classes={{button:classes.button}} visible={true}/>
		    </MenuItem>
		    <MenuItem key="Tooltip" onClose={this.onClose}>
		       <Tooltip state={state} classes={{button:classes.button}} visible={true}/>
		    </MenuItem>
		    <MenuItem key="Order" onClose={this.onClose}>
		       <Order state={state} classes={{button:classes.button}} visible={true}/>
		    </MenuItem>
		    <MenuItem key="Home" onClose={this.onClose}>
		       <Home state={state} classes={{button:classes.button}} visible={true}/>
		    </MenuItem>
		    <MenuItem key="Film" onClose={this.onClose}>
		       <Film state={state} classes={{button:classes.button}} visible={true}/>
		    </MenuItem>
		    <MenuItem key="file" onClose={this.onClose}>
		       <File state={state} classes={{button:classes.button}} visible={true}/>
		    </MenuItem>
		    <MenuItem key="archive" onClose={this.onClose}>
		       <Archive state={state} classes={{button:classes.button}} visible={true}/>
		    </MenuItem>
		    <MenuItem key="font" onClose={this.onClose}>
		       <Font state={state} classes={{button:classes.button}} visible={true}/>
		    </MenuItem>
		    <MenuItem key="fullscreen" onClose={this.onClose}>
		       <FullScreen state={state} classes={{button:classes.button}} visible={true}/>
		    </MenuItem>
		    <MenuItem key="set" onClose={this.onClose}>
		       <SettingsMenu state={state} classes={{button:classes.button}} visible={true}/>
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
