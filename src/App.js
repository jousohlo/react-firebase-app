import React, { Component } from 'react';
import fire from './fire';
import firebase from 'firebase'
import './App.css';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = { 
      messages: [],
      signedIn: false,
      user: ''
      }; // <- set up react state
  }


  componentWillMount(){
    console.log('componentWillMount');
    fire.auth().onAuthStateChanged(user => {
      if (user !== null) {
        this.setState({
          signedIn: true,
          user: user.displayName});
      }
    });
    /* Create reference to messages in Firebase Database */
    let messagesRef = fire.database().ref('messages').orderByKey().limitToLast(100);
    messagesRef.on('child_added', snapshot => {
      /* Update React state when message is added at Firebase Database */
      let message = { text: snapshot.val(), id: snapshot.key };
      this.setState({ messages: [message].concat(this.state.messages) });
    })
    messagesRef.on('child_removed', snapshot => {
      var messages = this.state.messages;
      messages.forEach(elem => {
        if (elem.id === snapshot.key) {
          messages.splice(messages.indexOf(elem),1);
        }
      })
      this.setState({messages: messages});
    })
  }

  addMessage(e){
    e.preventDefault(); // <- prevent form submit from reloading the page
    /* Send the message to Firebase */
    fire.database().ref('messages').push( this.inputEl.value );
    this.inputEl.value = ''; // <- clear the input
  }

  clearMessages(){
    fire.database().ref('messages').set( null );
    this.setState({ messages: [] });
  }

  deleteMessage(e, id) {
    e.preventDefault();
    fire.database().ref('messages/' + id).remove();
  }

  authenticate() {
    var provider = new firebase.auth.GoogleAuthProvider();
    fire.auth().signInWithRedirect(provider);
    fire.auth().getRedirectResult().then(result => {
      if (result.credential) {
        // This gives you a Google Access Token. You can use it to access the Google API.
        var token = result.credential.accessToken;
        // ...
      }
      // The signed-in user info.
      //var user = result.user;
    }).catch(error => {
      // Handle Errors here.
      var errorCode = error.code;
      var errorMessage = error.message;
      // The email of the user's account used.
      var email = error.email;
      // The firebase.auth.AuthCredential type that was used.
      var credential = error.credential;
      console.log('Authentication error: ' + errorMessage);
      // ...
    });
  } 

  signOut() {
    fire.auth().signOut().then(()=>{
      this.setState({
        messages: [],
        signedIn: false})
    });
  }

  render() {
    let authButton;
    let buttonText = 'Sign in';
    if (!this.state.signedIn) {
      authButton = (<AuthenticationButton authenticate={this.authenticate.bind(this)} buttonText={buttonText}/>);
    } else {
      let buttonText = 'Sign out: ' + this.state.user;
      authButton = (<AuthenticationButton authenticate={this.signOut.bind(this)} buttonText={buttonText}/>);
    }
    return (
      <div className='page'>
        <form onSubmit={this.addMessage.bind(this)}>
          <input type="text" ref={ el => this.inputEl = el } />
          <input type="submit" value="Save"/>
        </form>
        <div className='section'>
          <List removeItem={this.deleteMessage.bind(this)} messages={this.state.messages}></List>
        </div>
        <button onClick = {this.clearMessages.bind(this)}>Clear</button>
        {authButton}
      </div>
    );
  }
}

class List extends Component {
  constructor(props) {
    super(props);
  }
  render() {
    return(
      <ul>
      {//Render the list of messages
        this.props.messages.map( message => <ListItem key={message.id} removeItem={this.props.removeItem} message={message}></ListItem> )
      }
      </ul>
    )
  };
}

class ListItem extends Component {
  constructor(props) {
    super(props);
  }
  render() {
    return(
      <li data-id={this.props.message.id} onClick={e => this.props.removeItem(e,this.props.message.id)}>{this.props.message.text}</li> 
    )
  };
}

class AuthenticationButton extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return(
       <button onClick = {this.props.authenticate}>{this.props.buttonText}</button> 
    );
  }
}

export default App;

