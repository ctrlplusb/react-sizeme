import React from 'react';
import ReactDOM from 'react-dom';
import MySizeAwareComponent from './MySizeAwareComponent.js';

const container = document.getElementById(`app`);

ReactDOM.render((
  <div style={{ width: `100%`, height: `100%` }}>
    <MySizeAwareComponent style={{ backgroundColor: `rgb(139, 155, 244)` }} />
    <MySizeAwareComponent style={{ backgroundColor: `rgb(145, 252, 141)` }} />

    <div className="clearfix">
      <div style={{ float: `left`, width: `60%` }}>
        <MySizeAwareComponent style={{ height: `500px`, backgroundColor: `rgb(112, 209, 207)` }} />
      </div>

      <div style={{ float: `left`, width: `40%` }}>
        <MySizeAwareComponent style={{ height: `245px`, backgroundColor: `rgb(29, 165, 154)` }} />
        <MySizeAwareComponent style={{ height: `245px`, backgroundColor: `rgb(252, 181, 193)` }} />
      </div>
    </div>


  </div>
), container);
