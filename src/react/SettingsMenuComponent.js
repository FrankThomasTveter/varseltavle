import React, {Component} from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';

import Undo         from './ConfigUndoComponent';
import Redo         from './ConfigRedoComponent';
import Mode         from './ConfigModeComponent';
import ViewPath     from './ConfigViewPathComponent';
import Collect      from './ConfigCollectComponent';
import Reload       from './ConfigReloadComponent';
import Tooltip      from './ConfigTooltipComponent';
import Order        from './ConfigOrderComponent';
import Home         from './ConfigHomeComponent';
import Film         from './ConfigFilmComponent';
import Star         from './ConfigStarComponent';
import File         from './ConfigFileComponent';
import ViewPolygon  from './ConfigViewPolygonComponent';
import Polygon      from './ConfigPolygonComponent';
import Archive      from './ConfigArchiveComponent';
import Font         from './ConfigFontComponent';
import Dims         from './ConfigDimComponent';
import Focus        from './ConfigFocusComponent';
import FullScreen   from './ConfigFullScreenComponent';
import About        from './ConfigAboutComponent';

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
	var cls={button:classes.button};
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
		       <Undo state={state} classes={cls}/>
		    </MenuItem>
		    <MenuItem className={classes.order} key="redo" onClose={this.onClose}>
		       <Redo state={state} classes={cls}/>
		    </MenuItem>
		    <MenuItem className={classes.order} key="mode" onClose={this.onClose}>
		       <Mode state={state} classes={cls}/>
		    </MenuItem>
		    <MenuItem className={classes.order} key="path" onClose={this.onClose}>
		       <ViewPath state={state} classes={cls}/>
		    </MenuItem>
		    <MenuItem className={classes.order} key="key" onClose={this.onClose}>
		       <Collect state={state} classes={cls}/>
		    </MenuItem>
		    <MenuItem className={classes.order} key="reload" onClose={this.onClose}>
		       <Reload state={state} classes={cls}/>
		    </MenuItem>
		    <MenuItem className={classes.order} key="tooltip" onClose={this.onClose}>
		       <Tooltip state={state} classes={cls}/>
		    </MenuItem>
		    <MenuItem className={classes.order} key="order" onClose={this.onClose}>
		       <Order state={state} classes={cls}/>
		    </MenuItem>
		    <MenuItem className={classes.order} key="home" onClose={this.onClose}>
		       <Home state={state} classes={cls}/>
		    </MenuItem>
		    <MenuItem className={classes.order} key="film" onClose={this.onClose}>
		       <Film state={state} classes={cls}/>
		    </MenuItem>
		    <MenuItem className={classes.order} key="star" onClose={this.onClose}>
		       <Star state={state} classes={cls}/>
		    </MenuItem>
		    <MenuItem className={classes.order} key="file" onClose={this.onClose}>
		       <File state={state} classes={cls}/>
		    </MenuItem>
		    <MenuItem className={classes.order} key="viewPoly" onClose={this.onClose}>
		       <ViewPolygon state={state} classes={cls}/>
		    </MenuItem>
		    <MenuItem className={classes.order} key="polygon" onClose={this.onClose}>
		       <Polygon state={state} classes={cls}/>
		    </MenuItem>
		    <MenuItem className={classes.order} key="archive" onClose={this.onClose}>
		       <Archive state={state} classes={cls}/>
		    </MenuItem>
		    <MenuItem className={classes.order} key="font" onClose={this.onClose}>
		       <Font state={state} classes={cls}/>
		    </MenuItem>
		    <MenuItem className={classes.order} key="dims" onClose={this.onClose}>
		       <Dims state={state} classes={cls}/>
		    </MenuItem>
		    <MenuItem className={classes.order} key="focus" onClose={this.onClose}>
		       <Focus state={state} classes={cls}/>
		    </MenuItem>
		    <MenuItem className={classes.order} key="fullscreen" onClose={this.onClose}>
		       <FullScreen state={state} classes={cls}/>
		    </MenuItem>
		    <MenuItem className={classes.order} key="about" onClose={this.onClose}>
		       <About state={state} classes={cls}/>
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
