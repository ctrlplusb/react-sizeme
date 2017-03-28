import React from 'react'
import { render } from 'react-dom'

import MySizeAwareComponent from './MySizeAwareComponent.js'

function App() {
  return (
    <div style={{ width: '100%', height: '100%' }}>
      <MySizeAwareComponent
        style={{ height: '100px', backgroundColor: 'rgb(139, 155, 244)' }}
      />
      <MySizeAwareComponent
        style={{ height: '100px', backgroundColor: 'rgb(145, 252, 141)' }}
      />

      <div className="clearfix">
        <div style={{ float: 'left', width: '60%' }}>
          <MySizeAwareComponent
            style={{ height: '500px', backgroundColor: 'rgb(112, 209, 207)' }}
          />
        </div>

        <div style={{ float: 'left', width: '40%' }}>
          <MySizeAwareComponent
            style={{
              height: '250px',
              backgroundColor: 'rgb(29, 165, 154)',
              position: 'relative',
            }}
          >
            <MySizeAwareComponent
              style={{
                height: '50px',
                backgroundColor: 'rgb(88, 164, 29)',
                position: 'absolute',
                bottom: 0,
                left: 0,
                width: '100%',
              }}
            />
          </MySizeAwareComponent>
          <MySizeAwareComponent
            style={{ height: '250px', backgroundColor: 'rgb(252, 181, 193)' }}
          />
        </div>
      </div>
    </div>
  )
}

render(<App />, document.getElementById('app'))
