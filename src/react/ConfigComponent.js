import React, {Component} from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
//import Grid from "@material-ui/core/Grid/Grid";

import Settings from './SettingsComponent';
import Mode         from './ModeComponent';

import UndoIcon from '@material-ui/icons/Undo';
import RedoIcon from '@material-ui/icons/Redo';

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
function Undo(props) {
    const {state,classes}=props;
    var onclick=() => state.Navigate.undo(state);
    var disundo=! state.Navigate.canUndo(state);
    var title="Undo";
    return <Button classes={{root:classes.button,disabled:classes.buttonDisabled}} disabled={disundo} onClick={onclick} title={title}><UndoIcon/></Button>;
};
function Redo(props) {
    const {state,classes}=props;
    var onclick=() => state.Navigate.redo(state);
    var disredo=! state.Navigate.canRedo(state);
    var title="Redo";
    return <Button classes={{root:classes.button,disabled:classes.buttonDisabled}} disabled={disredo} onClick={onclick} title={title}><RedoIcon/></Button>;
};
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
		   <Undo state={state} classes={classes}/>
                   <Redo state={state} classes={classes}/>
		   <Mode state={state} classes={{button:classes.button}}x/>
                   <Settings state={state} classes={{button:classes.button}}/>
		</div>);
    }
}

Config.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(Config);



