import * as React from 'react';
import { render } from 'react-dom';
import ReactGlobe from 'react-globe';

import markers from './markers';
import markerRenderer from './markerRenderer';

import './styles.css';

function App() {
  return (
    <div className="App">
      <ReactGlobe
        globeOptions={{
          texture:
            'https://raw.githubusercontent.com/chrisrzhou/react-globe/master/textures/globe_dark.jpg',
        }}
        markers={markers}
        markerOptions={{ renderer: markerRenderer }}
      />
    </div>
  );
}

const rootElement = document.getElementById('root');
render(<App />, rootElement);
