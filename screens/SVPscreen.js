import React from 'react'
import { StyleSheet, View,Text, Button,TextInput, TouchableOpacity, TouchableHighlight, Modal, LogBox} from 'react-native'


var socketRoom ='';
var socketURL = '';
var passwordInMobile = '';
var nonce = '';
var ws = '';
var challenger = 12345;
export default class SVPscreen extends React.Component {
    state = {
    showingData: ''
  }
  setConnection = () => {
    ws = new WebSocket(socketURL);
    ws.onopen = () => {
        ws.send('{"type":"authm", "no":"'+socketRoom+'"}');
        ws.onmessage = (e) => {
            console.log(e)
            this.sendChallenger();
        }
    }
  }

  sendChallenger = () => {
      ws.send('{"type":"challenger","data":"'+challenger+'"}');
      ws.onmessage = (e) => {
          this.setState({showingData: JSON.stringify(e)})
          console.log(e)
          alert(e)
      }
  }

  
  render() {
      
    const {navigation} = this.props
    const userRoom = navigation.getParam('roomNo',"value")
    const userSocket = navigation.getParam('socketUrl',"Url")
    const userPW = navigation.getParam('userPW',"passwordValue")
    const userNonce = navigation.getParam('nonce',"nonceVal")
    socketRoom = userRoom;
    socketURL = userSocket;
    nonce = userNonce;
    passwordInMobile = userPW;
    return (
      <View style={styles.container}>
        <View>
            <Text>{this.state.showingData}</Text>
        </View>
        <TouchableOpacity style={styles.bottomLeftButton}><Text style={styles.buttonLeftText}>VP 생성 및 제출</Text></TouchableOpacity>
        <TouchableOpacity style={styles.bottomButton} ><Text style={styles.buttonText}>취소</Text></TouchableOpacity>
      </View>
    )
  }
  
  
  componentDidMount(){
   this.setConnection();
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center'
  }
})
