import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Typography from "@material-ui/core/Typography/Typography";
import Grid from "@material-ui/core/Grid/Grid";

const styles = theme => ({
    root: {
        backgroundColor: theme.palette.primary.main,
        marginTop: theme.spacing(8),
        bottom: 0,
        padding: theme.spacing(6),
        color: '#FFF'
    },
    button:{},
    text: {
	maxWidth: "100%",
	margin: "1%",
    },
});

const { REACT_APP_DATE } = process.env;

//text        maxWidth: theme.spacing.getMaxWidth.maxWidth,
//text        margin: theme.spacing.getMaxWidth.margin,

function FragTime(props) {
    const {frag, strs} = props;
    var str=strs[frag];
    console.log(frag);
    return (
	<tr>
	    <td style={{border: "1px solid black", textAlign:"right"}}> {str['age']}</td>
	    <td style={{border: "1px solid black", textAlign:"right"}}> {str['epoch']}</td>
	    <td style={{border: "1px solid black", textAlign:"right"}}> {str['cnt']}</td>
	    <td style={{border: "1px solid black", textAlign:"center"}}> {str['frag']}</td>
	</tr>
    );    
};
function Frag(props) {
    const { state } = props;
    var fragments=state.Database.getFragmentActive(state);
    var strs=state.Database.getFragTimes(state);
    var fragFunction= (frag) => {return (<FragTime key={frag} frag={frag} strs={strs}/>)};
    return (
	    <table style={{border: "1px solid black"}}>
	    <tr>
            <th style={{border: "1px solid black"}}>Age</th>
	    <th style={{border: "1px solid black"}}>Load time</th>
	    <th style={{border: "1px solid black"}}>Records</th>
	    <th style={{border: "1px solid black"}}>Active fragment</th>
	    </tr>
	    {fragments.map(fragFunction)}
	</table>
    );
}

Frag.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(Frag);
