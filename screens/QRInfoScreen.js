import React from 'react'
import { StyleSheet, View,Text, Button } from 'react-native'
import CryptoJS from 'react-native-crypto-js';
import SecureStorage from 'react-native-secure-storage'
var AES = require("react-native-crypto-js").AES;
var socketRoom ='';
var socketURL = '';
var passwordInMobile = '';
var ws = '';



export default class QRInfoScreen extends React.Component {
  state = {
    password: '',
    dataKey: '',
    address: '',
    privateKey:'',
    mnemonic:'',
    VCarray:[],
    VCjwtArray:[{"dummy":'data','vc':{
      'credentialSubject': 'none'
      }},{"dummy":'data','vc':{
      'credentialSubject': 'none'
      }}
    ],
    showingData: ''
  }
  getDidData = async () => {
      await SecureStorage.getItem(passwordInMobile).then((docKey) => {
        this.setState({dataKey: docKey}, async function() {
            await SecureStorage.getItem(this.state.dataKey).then((userData) => {
            //console.log(JSON.stringify(userData))
            if( userData != null){
              console.log(this.state.dataKey)
              let bytes  = CryptoJS.AES.decrypt(userData, this.state.dataKey);
              //console.log(bytes)
              let originalText = bytes.toString(CryptoJS.enc.Utf8);
              //console.log(originalText)
              this.setState(JSON.parse(originalText))
            }
            })

        })
      })
      

  }

  receiveVC = () => {
    ws = new WebSocket(socketURL);
    ws.onopen = () => {
      ws.send('{"type":"authm", "no":"'+socketRoom+'"}');
      ws.onmessage = (e) => {
        alert(e.data)
        ws.send('{"type":"did", "data":"'+this.state.address+'"}')
        ws.onmessage = (e) => {
        alert(e.data)
        this.setState({VC: e.data})
        }

      

        
        
      }

    }

  

  }
  close = ()=> {
    ws.send('{"type":"exit"}')
    this.props.navigation.navigate('VCselect',{password:this.state.password});
  }

  next = () => {
    ws.send('{"type":"exit"}')
    this.props.navigation.navigate('VCselect',{VCdata:this.state.VC,password:this.state.password});
  }

  render() {
    
    const {navigation} = this.props
    const userRoom = navigation.getParam('roomNo',"value")
    const userSocket = navigation.getParam('socketUrl',"Url")
    const userPW = navigation.getParam('userPW',"passwordValue")
    socketRoom = userRoom;
    socketURL = userSocket;
    passwordInMobile = userPW;
    return (
      <View style={styles.container}>
        <Text>인증 중입니다</Text>
        

        <Button title="다음" onPress={this.next}></Button>
        
        <Button title="취소" onPress={this.close}></Button>
      </View>
    )
    
  }
  componentDidMount() {
    this.getDidData();
    this.receiveVC();
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center'
  },
  textMarginer: {
    margin:20
  },
  modalView: {
    margin: 20,
    backgroundColor: "white",
    borderRadius: 20,
    padding: 35,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5
  },
  openButton: {
    backgroundColor: "#F194FF",
    borderRadius: 20,
    padding: 10,
    elevation: 2
  },
  textStyle: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center"
  },
  modalText: {
    marginBottom: 15,
    textAlign: "center"
  }
})
