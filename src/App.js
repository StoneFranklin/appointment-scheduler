import React from 'react'
import './App.css';
import {
  BrowserRouter as Router,
  Switch,
  Route,
} from 'react-router-dom'
import Register from './screens/Register';
import Dashboard from './screens/Dashboard';
import Login from './screens/Login';
import Landing from './screens/Landing';

function App() {
  return (
    <div className="App">
      <Router>
        <Switch>
          <Route path="/register">
            <Register />
          </Route>
          <Route path="/login">
            <Login />
          </Route>
          <Route path="/landing">
            <Landing />
          </Route>
          <Route path="/">
            <Dashboard />
          </Route>
        </Switch>
      </Router>
    </div>
  );
}

export default App;
