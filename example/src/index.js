import React from 'react';
import ReactDOM from 'react-dom';
import MySizeAwareComponent from './MySizeAwareComponent.js';

const container = document.getElementById(`app`);

ReactDOM.render((
  <div style={{ width: `100%`, height: `100%` }}>
    <MySizeAwareComponent />
    <MySizeAwareComponent />

    <div className="clearfix">
      <div style={{ float: `left`, width: `60%` }}>
        <MySizeAwareComponent style={{ height: `500px` }} />
      </div>

      <div style={{ float: `left`, width: `40%` }}>
        <MySizeAwareComponent style={{ height: `245px` }} />
        <MySizeAwareComponent style={{ height: `245px` }} />
      </div>
    </div>


  </div>
), container);
