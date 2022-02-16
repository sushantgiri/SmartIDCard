import React from 'react'
import { StyleSheet, View, Button,Text,TouchableOpacity, ScrollView, Image, Linking, LogBox, Modal, TextInput, TouchableHighlight} from 'react-native'
import jwt_decode from "jwt-decode";
import CryptoJS from 'react-native-crypto-js';

import {FloatingAction} from "react-native-floating-action"

import SecureStorage from 'react-native-secure-storage'
import {exp} from 'react-native-reanimated';
var AES = require("react-native-crypto-js").AES;
//Floating button
  const actions = [
  {
    text: "QR 스캔",
    name: "scanqr",
    position: 2
  },
  {
    text: "Bluetooth",
    name: "bluetooth",
    position: 1
  },
];
//사용자 패스워드
var passwordInMobile = '';
//삭제 선택된 VC
var target = [];

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

  
export default class VCselect extends React.Component {
  
  state = {
    password: '',
    dataKey: '',
    address: '',
    privateKey:'',
    mnemonic:'',
    VCarray:[],
    VCjwtArray:[],
    
    confirmCheckPassword:'',
    modalVisible: false
  }
  
  handleConfirmPWchange = confirmCheckPassword => {
    this.setState({ confirmCheckPassword })
  }

  /**
   *  getUserInfoFromNavPassword / setStateData : 최초 페이지 실행시 실행되며, 현재 사용자의 password를 받아 
   *           global variable : passwordInMobile 에 저장하고,
   *           setStateData function을 사용하여 State를 구성함
   * 
   */
  
  getUserInfoFromNavPassword = () => {
    const {navigation} = this.props
    const mobileKey = navigation.getParam('password',"value")
    passwordInMobile = mobileKey
    this.setStateData();
  }

  /**
   *  setStateData :
   *        newVCcheck() 과 연결
   *        "passwordInMobile global variable" 을 이용하여 State를 구성
   * 
   */

  setStateData = async () => {
  await SecureStorage.getItem(passwordInMobile).then((docKey) => {
      this.setState({dataKey: docKey}, function() {
          SecureStorage.getItem(this.state.dataKey).then((userData) => {
            if(userData != null) {
              let bytes = CryptoJS.AES.decrypt(userData, this.state.dataKey);
              let originalText = bytes.toString(CryptoJS.enc.Utf8);
              this.setState(JSON.parse(originalText))

              // newVCcheck로 현재 새 vc를 받았는지, 단순 페이지 이동인지 확인함
              this.newVCcheck();
            }
          })
      })
    })
  }

  /**
   *  newVCcheck : navigation을 통해 이동했을때, 'VCdata'를 새로 받은 경우,
   *              새로 받은 VCdata jwt를 decode 하여 VCarray와, VCjwtArray에 입력하고 저장함
   * 
   */
  newVCcheck = async () => {
    console.log('New VC');
    const {navigation} = this.props
    const receivedVC = navigation.getParam('VCdata',"VCvalue")
    // LogBox.ignoreAllLogs(true)
    if(receivedVC != "VCvalue"){
      const decodedVC = JSON.stringify(receivedVC).substring(28,JSON.stringify(receivedVC).length-2)
      const VCform = jwt_decode(decodedVC)
      console.log('VCForm', VCform);
      this.setState({
        VCarray: this.state.VCarray.concat([VCform]),
        VCjwtArray: this.state.VCjwtArray.concat([receivedVC])
        }, async function(){
          let cipherData = CryptoJS.AES.encrypt(JSON.stringify(this.state), this.state.dataKey).toString();
          await SecureStorage.setItem(this.state.dataKey, cipherData);  
      })

    } else {
      console.log('no received vc')
    }
    
                
              
  }


  /**
   *  passwordCheckAndDeleteVCinList :
   *          입력된 값과 현재 패스워드를 비교하여, 
   *          현재 state의 VCarray와 VCjwtArray에서 제외한 후,
   *          reArrangeState()와 연결
   * 
   */
  passwordCheckAndDeleteVCinList = () => {
    if(this.state.confirmCheckPassword == this.state.password){
     
      this.setState({modalVisible:false}, function(){
        this.setState(this.state.VCjwtArray.splice(this.state.VCarray.indexOf(target),1))
        this.setState(this.state.VCarray.splice(this.state.VCarray.indexOf(target),1))
        
        this.setState({confirmCheckPassword:""})
    
        this.reArrangeState();
      })
      
    } else {
      alert('비밀번호 불일치')
    }
    
  }

  /**
   *  reArrangeState :
   *          현재 State의 datakey를 키로 지정하여,
   *          새로 변경된 State의 data 값을 Secure Storage에 저장함
   * 
   */
  reArrangeState = () => {
        let cipherData = CryptoJS.AES.encrypt(JSON.stringify(this.state), this.state.dataKey).toString();
        SecureStorage.setItem(this.state.dataKey, cipherData);
  }


  /**
   *  deleteClicked :
   *        삭제하고자 하는 VC의 삭제 버튼을 눌렀을때
   *        "global variable target" 에 현재 선택된 VC를 저장
   *        비밀번호를 확인하는 Modal을 오픈
   */
  deleteClicked = e => {
    target = e;
    this.setState({ modalVisible: true })
  }
  
  // Modal을 닫음
  modalCancel = () => {
    this.setState({ modalVisible: false})
  }  

  // 현재 VC 의 개수에 따라 다른 Style을 return 함
  noVC = () => {
    if(this.state.VCarray.length == 0){
      return{
        margin:20
      }
    } else {
      return {
        width:0,
        height:0
      }
    }
  }

  //Navigations
  goToSetting = () => {
    this.props.navigation.navigate('Setting',{password:this.state.password})
  }
  goToMain = async () => {
    this.props.navigation.navigate('VCcontrol')
  }
  readying = () => {
    alert("준비중입니다")
  }


  floatButtonAction = (name) => {
    if (name == "scanqr"){
      this.props.navigation.navigate('ScanScreen',{password:this.state.password})
    } else if (name == "bluetooth"){
      alert("bluetooth 준비중")
    }
  }
  render() {
    const { confirmCheckPassword, modalVisible} = this.state
    
    LogBox.ignoreAllLogs
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
                onPress={this.passwordCheckAndDeleteVCinList}
                >
                <Text style={styles.textStyle}>다음</Text>
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
        <Text style={styles.textTop}>VC 관리</Text>
          <View>
          <ScrollView>
          <Text style={{fontWeight:'bold'}}>현재 보유한 VC</Text>
          <View >
            <Text style={this.noVC()}>현재 보유한 VC가 없습니다</Text>
          </View>
          <View style={styles.vcContainter}>
          
          <ScrollView>
          {this.state.VCarray.map((vc)=>
          
            <View>
            <VC vc={vc} key={vc.exp}></VC>
            <TouchableOpacity style={styles.deleteVCbutton} onPress={() => this.deleteClicked(vc)}><Text style={styles.deleteText}>삭제</Text></TouchableOpacity>
            </View>
          )}
          </ScrollView>
          
          </View>

          <Text style={{fontWeight:'bold'}}>생성 가능한 VC</Text>

            <View style={styles.vcContainter}>
              <TouchableOpacity style={styles.certificateCard} onPress={this.gotoURL}>
                <Text style={styles.vcText}>인증서</Text>
                <Text>요구정보: 성명, 생년월일, 이메일, 성별, 휴대폰번호</Text>
              </TouchableOpacity>
            </View>


          </ScrollView>
          
          </View>
          <FloatingAction actions={actions} onPressItem={name => {console.log('selected item: ${name}');}}/>
            
          <ScrollView style={styles.bottomFix}>
        
            <View style={styles.bottomNav}>
            <TouchableOpacity style={styles.bottomButton} onPress={this.goToVCselect}><Text style={styles.buttonText}>VC 관리</Text></TouchableOpacity>
            <TouchableOpacity style={styles.bottomButton} onPress={this.goToMain}><Text style={styles.buttonText}>프로필</Text></TouchableOpacity>
            <TouchableOpacity style={styles.bottomButton} onPress={this.readying}><Text style={styles.buttonText}>가이드</Text></TouchableOpacity>
            <TouchableOpacity style={styles.bottomButton} onPress={this.goToSetting}><Text style={styles.buttonText}>설정</Text></TouchableOpacity>
            </View>

          </ScrollView>
          <FloatingAction style={styles.floatButton} actions={actions} onPressItem={name => {this.floatButtonAction(name)}}/>
      </View>
      

    )
  }
  componentDidMount(){
    this.getUserInfoFromNavPassword();
    
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    alignItems: 'center',
    textAlign:'left'
  },
  qrText: {
    color:'white',
    fontWeight:'bold'
  },
  deleteVCbutton:{
    backgroundColor:'#f89',
    width:'94%',
    marginLeft:'3%',
    borderBottomLeftRadius:12,
    borderBottomRightRadius:12,
    justifyContent:'center',
    alignContent:'center',
    textAlign:'center'
  }, 
  deleteText:{
    color:'white',
    textAlign:'center',
    fontWeight:'bold'
  },  
  textTop: {
    color: 'black',
    fontSize:30,
    fontWeight: 'bold',
    textAlign:"center",
    width:'70%',
    marginTop:'4%',
    marginBottom:'4%'
    
  },
  vcContainter:{
    height:320,
    
  },
  testButton: {
    width:40,
    margin:20,
    backgroundColor:'#FFF'
  },
  textMarginer: {
    margin:20
  },
  QRbutton:{
    textAlign:"center",
    alignItems:"center",
    alignContent:'center',
    textAlign: 'center',
    justifyContent: 'center',
    width:'90%',
    marginLeft:'5%',
    marginBottom: '5%',
    backgroundColor:'#316BFF',
    height:40,
    borderRadius:12
  },
  buttonMarginer: {
      margin:10
  },
  vcbutton:{
    width:350,
    
  },
  vcCard:{
    
    borderRadius:12,
    width:300,
    backgroundColor: '#AAF',
    margin:10,
    padding:10
  },
  certificateCard:{
    borderTopLeftRadius:12,
    borderTopRightRadius:12,
    width:300,
    backgroundColor: '#DFF',
    margin:10,
    marginBottom:0,
    padding:10
  },
  vcText:{
    fontWeight:'bold',
    fontSize:20
  },
  
  bottomButton:{
    padding:15
  },
  bottomNav: {
    alignItems:"center",
    alignContent:'center',
    textAlign: 'center',
    justifyContent: 'center',
    flexDirection: "row",
    color:'white',
    backgroundColor:'white',
    height:50,  
  },
  bottomFix: {
    width: '100%',
    position: 'absolute', 
    bottom: 0,
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
  }
})
