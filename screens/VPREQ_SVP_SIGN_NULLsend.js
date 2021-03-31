import React from 'react'
import { StyleSheet, View,Text, Button,TextInput, TouchableOpacity, TouchableHighlight, Modal, LogBox} from 'react-native'

import CryptoJS from 'react-native-crypto-js';
import SecureStorage from 'react-native-secure-storage'

var AES = require("react-native-crypto-js").AES;
import {DualDID} from '@estorm/dual-did';
const didJWT = require('did-jwt')
const Web3 = require('web3')
const web3 = new Web3('http://182.162.89.51:4313')

var socketRoom ='';
var socketURL = '';
var passwordInMobile = '';
var nonce = '';
var ws = '';
var reqTypeOnUse = '';
var issuerDIDOnUse = '';
var signDataOnUse = '';
var signTypeOnUse ='';

var encryptionKeyOnUse ='';
var challenger = Math.floor(Math.random() *10000) + 1;


function createDualSigner (jwtSigner, ethAccount) {
  return { jwtSigner, ethAccount }
}

export default class VPREQ_SVP_SIGN_NULLsend extends React.Component {
    state = {
    password: '',
    dataKey: '',
    address: '',
    privateKey:'',
    mnemonic:'',
    VCarray:[],
    VCjwtArray:[],

    showingData: '',
    reqType:'',
    issuerDID:'',
    checkedArray:[],
    confirmCheckPassword:'',
    modalVisible: false
  }
  
  //비밀번호 확인 input control
  handleConfirmPWchange = confirmCheckPassword => {
    this.setState({ confirmCheckPassword })
  }
  /** getDidData : 
   *        "현재 state의 password"를 이용하여 암호화된 State를 가져와 복호화 하여 State에 저장함
   *        settingCheckArray()로 연결
   * 
   */
  getDidData = async () => {
      await SecureStorage.getItem(passwordInMobile).then((docKey) => {
        this.setState({dataKey: docKey}, async function() {
            await SecureStorage.getItem(this.state.dataKey).then((userData) => {
            if( userData != null){
              let bytes  = CryptoJS.AES.decrypt(userData, this.state.dataKey);
              let originalText = bytes.toString(CryptoJS.enc.Utf8);
              this.setState(JSON.parse(originalText))
              this.settingCheckArray();
            }
            })
        })
      })
  }
  /**
   *  settingCheckArray :
   *        체크된 array를 따로 구분하기 위한 arrChecked[] 를 state에 포함시킴
   *        현재 VC의 개수와 같은 길이의 array를 만들고, checked attribute를 false로 포함함
   */
  settingCheckArray = () => {
    arrChecked = [];
    for (var i = 1; i<=this.state.VCarray.length;i++){
      arrChecked = arrChecked.concat([{"checked" : false}])
    } 
    this.setState({
      checkedArray: arrChecked
    })
  }
  
  /**
   *  close :
   *      현재 진행상황을 취소하고 VC관리 페이지로 이동
   * 
   */
  close = () => {
    
    ws.send('{"type":"exit"}')
    this.props.navigation.navigate('VCselect',{password:this.state.password});
  }

  /**
   * makeVCSign :
   *      
   *        signData를 가져와 VC로 만들어 전달
   *        
   */

  makeVCSign = async () => {
    var vcjwtArray = [];
    const privateKey = this.state.privateKey;
    const ethAccount = web3.eth.accounts.privateKeyToAccount(privateKey)
    const dualSigner = createDualSigner(didJWT.SimpleSigner(privateKey.replace('0x','')), ethAccount)
    const dualDid = new DualDID(dualSigner, 'Issuer(change later)', 'Dualauth.com(change later)',web3,'0x3CF0CB3cD457b959F6027676dF79200C8EF19907')
    
    const signObj = {"data" : signDataOnUse};
    const signVC = await dualDid.createVC("http://www.smartidcard.com/vc/mobileSign",['VerifiableCredential', 'mobileSign'],"holderSign",signObj,{"type":"none"},parseInt(new Date().getTime()/1000) + 60 * 5,
    new Date().toISOString());

    vcjwtArray = vcjwtArray.concat([signVC.jwt]);

    const vp = await dualDid.createVP(vcjwtArray,nonce)
    
    var key = CryptoJS.enc.Hex.parse(encryptionKeyOnUse)
    var cipherText = CryptoJS.AES.encrypt(vp,key,{iv:key}).toString();
    ws.send('{"type":"vp", "data":"'+cipherText+'"}')
    ws.onmessage = (e) => {
            console.log(e)
            
    }
    alert("SIGN 제출 완료")
    this.successVPsubmit();
  }

  /**
   *  successVPsubmit :
   *      현재 page에서의 VP 전달 과정이 완료된 후, VCselect 페이지로 돌아감
   * 
   */
  successVPsubmit = () => {
    ws.send('{"type":"exit"}')
    this.props.navigation.navigate('VCselect',{password:this.state.password});
  }


  
  /**
   *  setConnection :
   *        웹소켓에 연결후, 현재 room Number를 전송함
   *        이후 challenger를 전달함
   *  sendChallenger :
   *        랜덤값인 challenger를 전달함
   *        받아온 SVP 데이터를 showingData에 저장함
   */

  setConnection = () => {
    ws = new WebSocket(socketURL);
    ws.onopen = () => {
        ws.send('{"type":"authm", "no":"'+socketRoom+'"}');
        ws.onmessage = (e) => {
            this.sendChallenger();
        }
    }
  }

  sendChallenger = () => {
      ws.send('{"type":"challenger","data":"'+challenger+'"}');
      ws.onmessage = (e) => {
          this.setState({showingData: JSON.stringify(e)})
      }
  }


  render() {
      
    LogBox.ignoreAllLogs(true)
    
    const { confirmCheckPassword, modalVisible} = this.state

    const {navigation} = this.props
    const userRoom = navigation.getParam('roomNo',"value")
    const userSocket = navigation.getParam('socketUrl',"Url")
    const userPW = navigation.getParam('userPW',"passwordValue")
    const userNonce = navigation.getParam('nonce',"nonceVal")
    const issuerReqType = navigation.getParam('reqType',"reqTypeVal")
    const issuerDID = navigation.getParam('issuerDID',"issuerDIDVal")
    const signData = navigation.getParam('signData',"signDataVal")
    const signType = navigation.getParam('signType',"signTypeVal")
    const encryptionKey = navigation.getParam('encryptKey',"encryptKeyVal")

    socketRoom = userRoom;
    socketURL = userSocket;
    nonce = userNonce;
    reqTypeOnUse = issuerReqType;
    issuerDIDOnUse = issuerDID;
    passwordInMobile = userPW;
    signTypeOnUse = signType;
    signDataOnUse = signData;
    encryptionKeyOnUse = encryptionKey;
    
    return (
      <View style={styles.container}>
        <View>
            <Text>SVP : {this.state.showingData}</Text>
            <Text>Sign Type : {signTypeOnUse}</Text>
            <Text>Sign Data : {signDataOnUse}</Text>
        </View>
        <Text>VP를 제출하지 않습니다</Text>
        
        
        <View style={{ flexDirection:"row"}}>
        <TouchableOpacity style={styles.bottomLeftButton} onPress={this.makeVCSign}><Text style={styles.buttonLeftText}>다음</Text></TouchableOpacity>
        <TouchableOpacity style={styles.bottomButton} onPress={this.close}><Text style={styles.buttonText}>취소</Text></TouchableOpacity>
        </View>
      </View>
    )
  }
  
  
  componentDidMount(){
   this.getDidData();
   this.setConnection();
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center'
  },
  modalButton: {
    backgroundColor: '#316BFF',
    alignContent:'center',
    justifyContent:'center',
    alignItems:'center',
    padding: 15,
    borderRadius: 12,
    width:120,
    margin:20
  },
  modalButtonGroup:{
    flexDirection: 'row'
  },
  modalCancel:{
    backgroundColor: '#f89',
    
    alignItems:'center',
    padding: 15,
    borderRadius: 12,
    width:120,
    margin:20
  },
  modalText: {
    marginBottom: 15,
    textAlign: "center"
  },
  bottomLeftButton:{
    backgroundColor: '#c3d4ff',
    paddingTop:10,
    paddingBottom:10,
    height:50,
    marginRight:5,

    borderRadius: 12,
    width:'40%',
    alignItems:'center'
  },
  buttonLeftText: {
    color: '#316BFF',
    fontWeight:'bold'
  },
  bottomButton: {
    backgroundColor: '#316BFF',
    paddingTop:10,
    paddingBottom:10,
    marginLeft:5,
    marginBottom:20,
    height:50,
    borderRadius: 12,
    width:'40%',
    alignItems:'center'
  },
})
