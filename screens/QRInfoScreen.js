import React from 'react'
import { StyleSheet, View,Text, Buttonm } from 'react-native'
import CryptoJS from 'react-native-crypto-js';
import {TouchableOpacity} from 'react-native-gesture-handler';
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
    VCjwtArray:[
    ],
    showingData: ''
  }
  getDidData = async () => {
      await SecureStorage.getItem(passwordInMobile).then((docKey) => {
        this.setState({dataKey: docKey}, async function() {
            await SecureStorage.getItem(this.state.dataKey).then((userData) => {
            //console.log(JSON.stringify(userData))
            if( userData != null){
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
        
        ws.send('{"type":"did", "data":"'+this.state.address+'"}')
        ws.onmessage = (e) => {
        
        this.setState({VC: e.data}, 
            this.next()
          )

      

        
        
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
    this.props.navigation.navigate('VCverify',{VCdata:this.state.VC,password:this.state.password});
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
        <Text style={styles.actText}>VC 발급 대기중입니다.</Text>
        
        
        
        <TouchableOpacity style={styles.bottomButton} onPress={this.close}><Text style={styles.buttonText}>취소</Text></TouchableOpacity>
        
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
  actText:{
    fontSize:30,
    fontWeight:'bold'
  },
  buttonText:{
    color:'white'
  },
  bottomButton: {
    backgroundColor: '#316BFF',
    paddingTop:10,
    paddingBottom:10,
    marginLeft:5,
    marginBottom:20,
    marginTop:200,
    height:50,
    borderRadius: 12,
    width:200,
    alignItems:'center',
    justifyContent:'center'
  },
})
