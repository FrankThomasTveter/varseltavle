import React, {Component} from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';

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
import Focus        from './FocusComponent';
import FullScreen   from './FullScreenComponent';
import About        from './AboutComponent';

import SettingsIcon from '@material-ui/icons/Visibility';

const styles = theme => ({
    order: {
	display: 'inline-block',
        marginRight: 'auto',
	height:'100%',
    },
    tableOrder: {
	display: 'inline-block',
        marginRight: 'auto',
    },
    button:{
	color:'white'
    },
    buttonInvisible:{
	color:'gray'
    },
});
// 
class SettingsMenu extends Component {
    show(state) {
	//console.log("Called Config.show...");
	this.forceUpdate();
    };
    state={anchor:null};
    

    render() {
        const { classes, state } = this.props;
	this.onClick = event => {this.setState({ anchor: event.currentTarget });};
	this.onClose = () => {this.setState({ anchor: null });};
	return (<div className={classes.tableOrder}>
		   <Button
                      className={classes.button}
                      aria-owns={this.state.anchor ? 'tablecollects-menu' : undefined}
                      aria-haspopup="true"
                      onClick={this.onClick}
	              title={"Visible options"}
		   >
	  	       {<SettingsIcon state={state}/>}
                     </Button>
		     <Menu
	                className={classes.tableOrder}
                        id="tablecollects-menu"
	                anchorEl={this.state.anchor}
                        open={Boolean(this.state.anchor)}
                        onClose={this.onClose}
		     >
		    <MenuItem className={classes.order} key="undo" onClose={this.onClose}>
		       <Undo state={state} classes={{button:classes.button}}/>
		    </MenuItem>
		    <MenuItem className={classes.order} key="redo" onClose={this.onClose}>
		       <Redo state={state} classes={{button:classes.button}}/>
		    </MenuItem>
		    <MenuItem className={classes.order} key="mode" onClose={this.onClose}>
		       <Mode state={state} classes={{button:classes.button}}/>
		    </MenuItem>
		    <MenuItem className={classes.order} key="path" onClose={this.onClose}>
		       <View state={state} classes={{button:classes.button}}/>
		    </MenuItem>
		    <MenuItem className={classes.order} key="key" onClose={this.onClose}>
		       <Key state={state} classes={{button:classes.button}}/>
		    </MenuItem>
		    <MenuItem className={classes.order} key="reload" onClose={this.onClose}>
		       <Reload state={state} classes={{button:classes.button}}/>
		    </MenuItem>
		    <MenuItem className={classes.order} key="tooltip" onClose={this.onClose}>
		       <Tooltip state={state} classes={{button:classes.button}}/>
		    </MenuItem>
		    <MenuItem className={classes.order} key="order" onClose={this.onClose}>
		       <Order state={state} classes={{button:classes.button}}/>
		    </MenuItem>
		    <MenuItem className={classes.order} key="home" onClose={this.onClose}>
		       <Home state={state} classes={{button:classes.button}}/>
		    </MenuItem>
		    <MenuItem className={classes.order} key="film" onClose={this.onClose}>
		       <Film state={state} classes={{button:classes.button}}/>
		    </MenuItem>
		    <MenuItem className={classes.order} key="file" onClose={this.onClose}>
		       <File state={state} classes={{button:classes.button}}/>
		    </MenuItem>
		    <MenuItem className={classes.order} key="archive" onClose={this.onClose}>
		       <Archive state={state} classes={{button:classes.button}}/>
		    </MenuItem>
		    <MenuItem className={classes.order} key="font" onClose={this.onClose}>
		       <Font state={state} classes={{button:classes.button}}/>
		    </MenuItem>
		    <MenuItem className={classes.order} key="focus" onClose={this.onClose}>
		       <Focus state={state} classes={{button:classes.button}}/>
		    </MenuItem>
		    <MenuItem className={classes.order} key="fullscreen" onClose={this.onClose}>
		       <FullScreen state={state} classes={{button:classes.button}}/>
		    </MenuItem>
		    <MenuItem className={classes.order} key="fullscreen" onClose={this.onClose}>
		       <About state={state} classes={{button:classes.button}}/>
		    </MenuItem>
	             </Menu>
		</div>
	);
    }
}

SettingsMenu.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(SettingsMenu);
