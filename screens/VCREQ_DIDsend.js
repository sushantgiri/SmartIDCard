import React from 'react'
import { StyleSheet, View,Text, TouchableHighlight} from 'react-native'

import CryptoJS from 'react-native-crypto-js';
import SecureStorage from 'react-native-secure-storage'

// global variables
var socketRoom ='';
var socketURL = '';
var passwordInMobile = '';
var nonce = '';
var ws = '';
var reqTypeOnUse = '';
var issuerURLOnUse = '';

// 랜덤한 값을 생성 : challenger로 이용 
var challenger = Math.floor(Math.random() *10000) + 1;


export default class VCREQ_DIDsend extends React.Component {
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
  
  
  /** getDidData : 
   *        "현재 state의 password"를 이용하여 암호화된 State를 가져와 복호화 하여 State에 저장함
   *        
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
            }
            })
        })
      })
  }


  /**
   *  setConnection :
   *        웹소켓에 연결후, 현재 room Number를 전송함
   *        이후 DID를 전달함
   *  sendDID :
   *        사용자의 DID를 전달한 후
   *        받은 VC 데이터를 현재 State의 VC에 저장함
   */
  setConnection = () => {
    ws = new WebSocket(socketURL);
    ws.onopen = () => {
        ws.send('{"type":"authm", "no":"'+socketRoom+'"}');
        ws.onmessage = (e) => {
            this.sendDID();
        }
    }
  }

  sendDID = () => {
      ws.send('{"type":"did","data":"'+this.state.address+'"}')
      ws.onmessage = (e) => {
            this.setState({VC: e.data})
      }
  }

  // Navigations
  goToNext = () => {
    ws.send('{"type":"exit"}')
    this.props.navigation.navigate('VCverify',{VCdata:this.state.VC,password:this.state.password});
  }
  goBack = () => {
    ws.send('{"type":"exit"}')
    this.props.navigation.navigate('VCselect',{password:this.state.password});
  }
  // Navigations end

  render() {
      

    const {navigation} = this.props
    const userRoom = navigation.getParam('roomNo',"value")
    const userSocket = navigation.getParam('socketUrl',"Url")
    const userPW = navigation.getParam('userPW',"passwordValue")
    const userNonce = navigation.getParam('nonce',"nonceVal")
    const issuerReqType = navigation.getParam('reqType',"reqTypeVal")
    const issuerURL = navigation.getParam('issuerURL',"issuerURLVal")
    socketRoom = userRoom;
    socketURL = userSocket;
    nonce = userNonce;
    reqTypeOnUse = issuerReqType;
    issuerURLOnUse = issuerURL;
    passwordInMobile = userPW;


    return (
      <View style={styles.container}>
        <View>
            <Text>SVP를 전달받지 않습니다</Text>
        </View>
        <View style={styles.modalButtonGroup}>
              <TouchableHighlight
                style={styles.modalButton}
                onPress={this.goToNext}
                >
                <Text style={styles.textStyle}>다음</Text>
              </TouchableHighlight>
              <TouchableHighlight
                style={styles.modalCancel}
                onPress={this.goBack}
                >
                <Text style={styles.textStyle}>취소</Text>
              </TouchableHighlight>
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
})
