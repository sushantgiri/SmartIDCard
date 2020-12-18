import {DualDID} from '@estorm/dual-did';

const Web3 = require('web3')
const web3 = new Web3('http://182.162.89.51:4313')
import React from 'react'
import { StyleSheet, View,Text, Button, TouchableOpacity } from 'react-native'
import CryptoJS from 'react-native-crypto-js';
import SecureStorage from 'react-native-secure-storage'
var AES = require("react-native-crypto-js").AES;
var socketRoom ='';
var socketURL = '';
var passwordInMobile = '';
var nonce = '';
var ws = '';
var arr = '';


function VC({vc}){
    return (
    <View>
      <View style={styles.certificateCard}>
              <Text style={styles.vcText}>인증서</Text>
              <Text>이름 : {vc.vc.credentialSubject.name}</Text>
              <Text>Email: {vc.vc.credentialSubject.email}</Text>
              <Text>생일 : {vc.vc.credentialSubject.birthday}</Text>
              <Text>성별 : {vc.vc.credentialSubject.gender}</Text>
              <Text>Phone: {vc.vc.credentialSubject.phone}</Text>
      </View>
    </View>

    

    )
}

export default class QRscreenVP extends React.Component {
  state = {
    password: '',
    dataKey: '',
    address: '',
    privateKey:'',
    mnemonic:'',
    VCarray:[],
    VCjwtArray:[],
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
        
        
      }

    }
  }

  
  close = () => {
    
    this.props.navigation.navigate('VCselect',{password:this.state.password});
  }

  VCclick = e =>{
    
    for (var i=0;this.state.VCarray.length;i++){
      
      if(e == this.state.VCarray[i]){
        
        
        this.next(i)
        return
      }
    }
  
  }
  next = async (i) => {
    
    const vcjwtForm = JSON.stringify(this.state.VCjwtArray[i])
    const privateKey = this.state.privateKey;
    const ethAccount = web3.eth.accounts.privateKeyToAccount(privateKey)
    const dualDid = new DualDID(ethAccount, 'Issuer(change later)', 'Dualauth.com(change later)',web3,'')
    const vp = await dualDid.createVP(vcjwtForm.substring(29,vcjwtForm.length-4),nonce)
    ws.send('{"type":"vp", "data":"'+vp+'"}')
    ws.onmessage = (e) => {
            
            
    }
    
    this.close()
  }
  render() {
    console.disableYellowBox = true;
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
        <Text>VC를 선택해주세요</Text>
        <View>{this.state.VCarray.map((vc) => {return(
          <TouchableOpacity onPress={() => this.VCclick(vc)}><VC vc={vc} key={vc.exp}/>
          </TouchableOpacity>
        )
        })}
        </View>

        
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
  certificateCard:{
    borderRadius:12,
    width:300,
    backgroundColor: '#DFF',
    margin:10,
    padding:10
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
