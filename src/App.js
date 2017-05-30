import React, { Component } from 'react';
import fire from './fire';
import './App.css';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = { messages: [] }; // <- set up react state
    this.addMessage = this.addMessage.bind(this);
    this.clearMessages = this.clearMessages.bind(this);
  }
  componentWillMount(){
    console.log('componentWillMount');
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

  render() {
    return (
      <div>
          <form onSubmit={this.addMessage}>
            <input type="text" ref={ el => this.inputEl = el } />
            <input type="submit" value="Tallenna"/>
            <ul>
              { //Render the list of messages
                this.state.messages.map( message => <li key={message.id}>{message.text}</li> )
              }
            </ul>
          </form>
        <p><button onClick = {this.clearMessages}>Clear</button></p>
      </div>
    );
  }
}

export default App;

