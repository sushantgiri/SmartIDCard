import React from 'react'
import { StyleSheet, Text, View, Button, TextInput, Linking  } from 'react-native'
import CryptoJS from 'react-native-crypto-js';
import SecureStorage from 'react-native-secure-storage'
import axios from 'axios';
var AES = require("react-native-crypto-js").AES;
var roomNo = '';
var socketUrl = '';
var nonce = '';
            
export default class WebRequest extends React.Component {
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


  linkTest = () => {
    Linking.getInitialURL().then(url =>{
        console.log(url.substring(30,url.length))
        axios.get('http://182.162.89.72:30600/rest/connector/' + url.substring(30,url.length)).then(
          res => {
            var getQRdata = res.data.data.url + "/rest/qrdata/" + url.substring(30,url.length)
            axios.get(getQRdata).then(response => {
                
            roomNo = response.data.data.no;
            socketUrl = response.data.data.websocketUrl;
            nonce = response.data.data.nonce;
            
            }
          )
      })
    })
  }
  handlePasswordChange = password => {
    this.setState({ password })
  }
  
  getDidData = async () => {
      await SecureStorage.getItem(this.state.password).then((docKey) => {
        this.setState({dataKey: docKey},async function() {
            await SecureStorage.getItem(this.state.dataKey).then((userData) => {
            
            if( userData != null){
              let bytes  = CryptoJS.AES.decrypt(userData, this.state.dataKey);
              //console.log(bytes)
              let originalText = bytes.toString(CryptoJS.enc.Utf8);
              this.setState(JSON.parse(originalText), function(){
                  var ws = new WebSocket(socketUrl);
                  ws.onopen = () => {
                      ws.send('{"type":"authm", "no":"'+roomNo+'"}')
                      ws.onmessage = (e) => {
                        
                        ws.send('{"type":"did", "data":'+this.state.address+'"}')
                       
                        console.log(this.state.address)
                        }

                  }
                  
                 Linking.openURL("googlechrome://navigate")
              })
            }
            })

        })
      })
      

  }
  render() {
      const { password } = this.state
    return (
      <View style={styles.container}>
        <Text>비밀번호를 입력해 주세요.</Text>
        <View style={{ margin: 10 }}>
          <TextInput
            name='password'
            value={password}
            placeholder='Enter password'
            secureTextEntry
            onChangeText={this.handlePasswordChange}
          />
        </View>
        <Button title='확인' onPress={this.getDidData} />
      </View>
    )
  }
  
  
  componentDidMount(){
    this.linkTest();
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
