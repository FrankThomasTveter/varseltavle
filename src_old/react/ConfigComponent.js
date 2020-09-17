import React, {Component} from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';

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

import Settings from './SettingsComponent';

const styles = theme => ({
    horisontal: {
        marginLeft: 'auto',
	display: 'flex',
	justifyContent: 'flex-end',
	alignItems:'right',
    },
    button: {
	color:'white',
	"&$buttonDisabled": {
            color: theme.palette.primary.main,
	},
    },
    buttonDisabled: {},
});

class Config extends Component {
    constructor(props) {
        super(props);
        const {state} = props;
        state.React.Config=this;
    };
    show(state) {
	//console.log("Called Config.show...");
	this.forceUpdate();
    };
    render() {
        const { classes, state } = this.props;
	//console.log("Rendering Config...");
	return (<div className={classes.horisontal}>
		<Undo state={state} classes={classes} visible={false}/>
                <Redo state={state} classes={classes} visible={false}/>
		<Mode state={state} classes={{button:classes.button}} visible={false}/>
		<View state={state} classes={{button:classes.button}} visible={false}/>
		<Key state={state} classes={{button:classes.button}} visible={false}/>
		<Reload state={state} classes={{button:classes.button}} visible={false}/>
		<Tooltip state={state} classes={{button:classes.button}} visible={false}/>
		<Order state={state} classes={{button:classes.button}} visible={false}/>
		<Home state={state} classes={{button:classes.button}} visible={false}/>
		<Film state={state} classes={{button:classes.button}} visible={false}/>
		<File state={state} classes={{button:classes.button}} visible={false}/>
		<Archive state={state} classes={{button:classes.button}} visible={false}/>
		<Font state={state} classes={{button:classes.button}} visible={false}/>
		<FullScreen state={state} classes={{button:classes.button}} visible={false}/>
                <Settings state={state} classes={{button:classes.button}} visible={false}/>
		</div>);
    }
}

Config.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(Config);



