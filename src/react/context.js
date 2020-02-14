import React, { createContext, useState } from "react";
import PropTypes from "prop-types";

export const Context = createContext({});

export const Provider = props => {
  // Initial values are obtained from the props

  // Use State to keep the values
  const [markers, setMarkers] = useState([]);

  // Make the context object:
  const usersContext = {
      markers,
      setMarkers
  };

  // pass the value in provider and return
  return <Context.Provider value={usersContext}></Context.Provider>;
};

export const { Consumer } = Context;

Provider.propTypes = {
  markers: PropTypes.array
};

Provider.defaultProps = {
  markers: []
};

export {
    Context  as UsersContext,
    Provider as UsersContextProvider,
    Consumer as UsersContextConsumer
}

