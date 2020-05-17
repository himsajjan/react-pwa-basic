import React, { useState } from 'react';
import logo from './logo.svg';
import './App.css';
import * as PushHandler from './push-subscriber';


function App() {
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          React PWA Demo
        </p>
        <a
          className="App-link"
          href="https://codelabs.developers.google.com/dev-pwa-training/"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn About PWA
        </a>
        <div className="actions">
          <button className="btn" onClick={PushHandler.displayNotification}> Notify me!</button>
          <button id="push-subscription-toggler" className="btn " onClick={PushHandler.handleSubscription}> Enable Push Messaging</button>
          <button id="push-notification" className="btn" onClick={PushHandler.publishMessage}> Push notification via server</button>
        </div>

        <p id="subscription-object"></p>
      </header>
    </div>
  );
}

export default App;
