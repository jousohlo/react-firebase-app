import React, { Component } from 'react';
import fire from './fire';
import firebase from 'firebase'
import './App.css';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = { 
      messages: [],
      signedIn: 'Kirjaudu'
      }; // <- set up react state
  }


  componentWillMount(){
    console.log('componentWillMount');
    fire.auth().onAuthStateChanged(user => {
      if (user !== null) {
        this.setState({signedIn: 'Kirjautunut: ' + user.displayName});
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
      this.setState({ messages: [] });
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

  authenticate() {
    var provider = new firebase.auth.GoogleAuthProvider();
    fire.auth().signInWithRedirect(provider);
    fire.auth().getRedirectResult().then(function(result) {
      if (result.credential) {
        // This gives you a Google Access Token. You can use it to access the Google API.
        var token = result.credential.accessToken;
        // ...
      }
      // The signed-in user info.
      //var user = result.user;
    }).catch(function(error) {
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

  render() {
    return (
      <div className='page'>
        <form onSubmit={this.addMessage.bind(this)}>
          <input type="text" ref={ el => this.inputEl = el } />
          <input type="submit" value="Tallenna"/>
        </form>
        <div className='section'>
          <ul>
            { //Render the list of messages
              this.state.messages.map( message => <li key={message.id}>{message.text}</li> )
            }
          </ul>
        </div>
        <button onClick = {this.clearMessages.bind(this)}>Tyhjennä</button>
        <button onClick = {this.authenticate.bind(this)}>{this.state.signedIn}</button>
      </div>
    );
  }
}

export default App;

