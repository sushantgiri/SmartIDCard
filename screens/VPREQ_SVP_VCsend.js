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
var issuerURLOnUse = '';
var encryptionKeyOnUse ='';
var challenger = Math.floor(Math.random() *10000) + 1;


function createDualSigner (jwtSigner, ethAccount) {
  return { jwtSigner, ethAccount }
}
function VC({vc}){
  //date calculate
  var toDate = vc.exp * 1000
  var expDate = new Date(toDate)
  //if(JSON.stringify(vc.vc.type) == '["VerifiableCredential","certificate"]'){
    return (
    <View>
      <View style={styles.certificateCard}>
              <Text style={styles.vcText}>인증서</Text>
              <Text>만료일 : {expDate.toString()}</Text>
              <Text>이름 : {vc.vc.credentialSubject.name}</Text>
              <Text>Email: {vc.vc.credentialSubject.email}</Text>
              <Text>생일 : {vc.vc.credentialSubject.birthday}</Text>
              <Text>성별 : {vc.vc.credentialSubject.gender}</Text>
              <Text>Phone: {vc.vc.credentialSubject.phone}</Text>
      </View>

    </View>
    )
  //} //else {
  //return (
    //<View>
      //<View style={styles.vcCard}>
              //<Text style={styles.vcText}>운전 면허증</Text>
              //<Text>이름 : {vc.vc.credentialSubject.name}</Text>
              //<Text>발급 기관: {vc.vc.credentialSubject.issueAgency}</Text>
              //<Text>발급 날짜: {vc.vc.credentialSubject.issueDate}</Text>
              //<Text>ID : {vc.vc.credentialSubject.idNo}</Text>
      //</View>

    //</View>
  //)
  //}
}
export default class VPREQ_SVP_VCsend extends React.Component {
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
   *  VCclick :
   *        현재 클릭된 VC를 찾아 checkboxClicked()로 보내준다
   *        
   */
  VCclick = e =>{
    for (var i=0;this.state.VCarray.length;i++){
      if(e == this.state.VCarray[i]){
        this.checkboxClicked(i)
        return
      }
    }
  }

  /**
   * checkbocClicked :
   *        현재 index를 parameter로 받아, Array의 원소중 체크가 되어 있는지 확인하여,
   *        checked 의 값을 false 나 true로 바꿔주고 state에 저장한다.
   * @param {*} index 
   */
  checkboxClicked = index => {
    this.state.checkedArray[index].checked = !this.state.checkedArray[index].checked
    arrChecked = this.state.checkedArray
    this.setState({checkedArray: this.state.checkedArray})
  }

  /**
   * passwordCheck :
   *      입력된 password의 input값과 현재 state의 password가 일치하는지 확인
   * 
   */
  passwordCheck = () => {
    if(this.state.confirmCheckPassword == this.state.password){
     
      this.setState({modalVisible:false}, function(){
        this.pickVCinArray()
      })
     
    } else {
      alert('비밀번호 불일치')
    }
  }

  /**
   * pickVCinArray :
   *        현재 제출해야 하는 VC를 VCjwtArray에서 가져와 jwt로 제출할 수 있도록
   *        vcSubmitArr[] 에 포함시킨다.
   *        
   *        생성된 vcSubmitArr[]를 makeVCJWTandSign()로 보낸다
   * 
   */
  pickVCinArray = () => {
    var vcSubmitArr = [];
    for(var i = 0; i<this.state.VCjwtArray.length;i++){
      if(this.state.checkedArray[i].checked == true){
        var jwtString = this.state.VCjwtArray[i].split(',')[1].split(':')[1]
        vcSubmitArr = vcSubmitArr.concat([jwtString.substring(1,jwtString.length-2)])
      }
    }
    this.makeVCJWT(vcSubmitArr)
  }
  
  /**
   * makeVCJWT :
   *        pickVCinArray에서 전달받은 VC의 JWT를 VP로 만들어 제출
   * @param { pickVCinArray 로부터 전달받은 VCjwt의 array} vcjwtArray 
   */

  makeVCJWT = async (vcjwtArray) => {
    const privateKey = this.state.privateKey;
    const ethAccount = web3.eth.accounts.privateKeyToAccount(privateKey)
    const dualSigner = createDualSigner(didJWT.SimpleSigner(privateKey.replace('0x','')), ethAccount)
    const dualDid = new DualDID(dualSigner, 'Issuer(change later)', 'Dualauth.com(change later)',web3,'0x3CF0CB3cD457b959F6027676dF79200C8EF19907')
    
    const vp = await dualDid.createVP(vcjwtArray,nonce)
    
    var key = CryptoJS.enc.Hex.parse(encryptionKeyOnUse)
    var cipherText = CryptoJS.AES.encrypt(vp,key,{iv:key}).toString();
    ws.send('{"type":"vp", "data":"'+cipherText+'"}')
    ws.onmessage = (e) => {
            console.log(e)
            
    }
    alert("VP 제출 완료")
    this.successVPsubmit();
  }

  /**
   * checkVCexist :
   *        현재 선택된 VC가 있는지 확인하고,
   *        VC가 선택된 경우에만 modal을 open함
   */
  checkVCexist = () => {
    var empty = true;
    for( var i = 0; i< this.state.checkedArray.length;i++){
      if(this.state.checkedArray[i].checked == true){
        empty = false;
      }
    }
    if(empty) {
      alert("VC를 선택해 주세요")
    } else if (empty == false) {
      this.setState({ modalVisible: true})
    }
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
   *  modalCancel:
   * 
   *      현재 modal 창을 닫음
   * 
   */

  modalCancel = () => {
    this.setState({ modalVisible: false})
  }  


  cardStyle = bool => {
    
    if(this.state.checkedArray[bool] != null){
      if(this.state.checkedArray[bool].checked == true){    
        return{
          backgroundColor:'#8FF',
          borderRadius:12,
          width:300,
          margin:10,
          padding:10
        }
      } else {
        return{
          backgroundColor:'#eff',
          borderRadius:12,
          width:300,
          margin:10,
          padding:10
        }
      }
    }
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
    const issuerURL = navigation.getParam('issuerURL',"issuerURLVal")
    const encryptionKey = navigation.getParam('encryptKey',"encryptKeyVal")
    socketRoom = userRoom;
    socketURL = userSocket;
    nonce = userNonce;
    reqTypeOnUse = issuerReqType;
    issuerDIDOnUse = issuerDID;
    issuerURLOnUse = issuerURL;
    passwordInMobile = userPW;
    encryptionKeyOnUse = encryptionKey;

    
    return (
      <View style={styles.container}>
        <Modal animationType="slide" transparent={true} visible={modalVisible}>
          <View style={styles.centeredView}>
            <View style={styles.modalView}>
              <Text style={{fontWeight:"bold",fontSize:25}}> 비밀번호를 입력해주세요 </Text>
              <TextInput
                name='confirmCheckPassword'
                value={confirmCheckPassword}
                placeholder='비밀번호'
                secureTextEntry
                onChangeText={this.handleConfirmPWchange}
                style={styles.inputText}
              />
              <View style={styles.modalButtonGroup}>
              <TouchableHighlight
                style={styles.modalButton}
                onPress={this.passwordCheck}
                >
                <Text style={styles.textStyle}>확인</Text>
              </TouchableHighlight>
              <TouchableHighlight
                style={styles.modalCancel}
                onPress={this.modalCancel}
                >
                <Text style={styles.textStyle}>취소</Text>
              </TouchableHighlight>
              </View>
            </View>
          </View>
        </Modal>

        <View>
            <Text>SVP : {this.state.showingData}</Text>
            <Text>req Type : {reqTypeOnUse} </Text>
            <Text>issuerDID : {issuerDIDOnUse} </Text>
            <Text>issuerURL : {issuerURLOnUse}</Text>
        </View>

        <Text>VC를 선택해주세요</Text>
        
        <View>{this.state.VCarray.map((vc,index) => {return(
          <View>
          <TouchableOpacity  style={this.cardStyle(index)} onPress={() => this.VCclick(vc)}><VC vc={vc} key={vc.exp}/>
          </TouchableOpacity>   
          </View>
        )
        })}
        
        </View>

        <View style={{ flexDirection:"row"}}>
        <TouchableOpacity style={styles.bottomLeftButton} onPress={this.checkVCexist}><Text style={styles.buttonLeftText}>VP 생성 및 제출</Text></TouchableOpacity>
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
