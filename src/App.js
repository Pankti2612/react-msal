import React, { Component } from 'react';
import { BrowserRouter as Router, Route, NavLink as RouterNavLink } from 'react-router-dom';
import {
  Button,
  Collapse,
  Container,
  Navbar,
  NavbarToggler,
  NavbarBrand,
  Nav,
  NavItem,
  UncontrolledDropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
  Jumbotron
} from 'reactstrap';
import { UserAgentApplication } from 'msal';

import { config } from './Config';
import ErrorMessage from './ErrorMessage';
import { normalizeError, getUserProfile } from './utils/MSUtils';


import '@fortawesome/fontawesome-free/css/all.css';
import 'bootstrap/dist/css/bootstrap.css';

class App extends Component {
  constructor(props) {
    super(props);
    this.toggle = this.toggle.bind(this);
    this.state = {
      isOpen: false,
      error: null,
      isAuthenticated: false,
      user: {}
    };

    this.userAgentApplication = new UserAgentApplication({
      auth: {
        clientId: config.clientId,
        redirectUri: config.redirectUri
      },
      cache: {
        cacheLocation: "sessionStorage",
        storeAuthStateInCookie: true
      }
    });
  }

  toggle() {
    this.setState({
      isOpen: !this.state.isOpen
    });
  }

  async login() {
    try {
      await this.userAgentApplication.loginPopup(
        {
          scopes: config.scopes,
          prompt: "select_account"
        });

      const user = await getUserProfile(this.userAgentApplication, config.scopes);
      this.setState({
        isAuthenticated: true,
        user: {
          displayName: user.displayName,
          email: user.mail || user.userPrincipalName
        },
        error: null
      });
    }
    catch (err) {
      this.setState({
        isAuthenticated: false,
        user: {},
        error: normalizeError(err)
      });
    }
  }

  logout() {
    this.userAgentApplication.logout();
  }

  render() {
    let error = null;
    if (this.state.error) {
      error = <ErrorMessage
        message={this.state.error.message}
        debug={this.state.error.debug} />;
    }
    return (
      <Router>
        <div>
          <Navbar color="dark" dark expand="md" fixed="top">
            <Container>
              <NavbarBrand href="/">React Microsoft Login and Graph Tutorial</NavbarBrand>
              <NavbarToggler onClick={this.toggle} />
              <Collapse isOpen={this.state.isOpen} navbar>
                <Nav className="mr-auto" navbar>
                  <NavItem>
                    <RouterNavLink to="/" className="nav-link" exact>Home</RouterNavLink>
                  </NavItem>
                </Nav>
                <Nav className="justify-content-end" navbar>
                  {this.state.isAuthenticated ?
                    (
                      <UncontrolledDropdown>
                        <DropdownToggle nav caret>
                          <i
                            className="far fa-user-circle fa-lg rounded-circle align-self-center mr-2"
                            style={{ width: '32px' }}></i>
                        </DropdownToggle>
                        <DropdownMenu right>
                          <h5 className="dropdown-item-text mb-0">{this.state.user.displayName}</h5>
                          <p className="dropdown-item-text text-muted mb-0">{this.state.user.email}</p>
                          <DropdownItem divider />
                          <DropdownItem onClick={() => this.state.isAuthenticated ? this.logout() : this.login()}>Sign Out</DropdownItem>
                        </DropdownMenu>
                      </UncontrolledDropdown>
                    ) :
                    <NavItem>
                      <Button
                        onClick={() => this.login()}
                        className="btn-link nav-link border-0"
                        color="link">Sign In</Button>
                    </NavItem>
                  }
                </Nav>
              </Collapse>
            </Container>
          </Navbar>
          <Container>
            {error}
            <Route exact path="/"
              render={() =>
                <Jumbotron>
                  <h1>React Microsoft Login and Graph Tutorial</h1>
                  <p className="lead">
                    This sample app shows how to use the Microsoft Graph API to access Outlook and OneDrive data from React
                </p>

                  {this.state.isAuthenticated
                    ? <div>
                      <h4>Welcome {this.state.user.displayName}!</h4>
                      <p>Use the navigation bar at the top of the page to get started.</p>
                    </div>
                    : <Button color="primary" onClick={() => this.login()}>Click here to sign in</Button>
                  }
                </Jumbotron>
              } />
          </Container>
        </div>
      </Router>
    );
  }
}

export default App;