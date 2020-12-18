import React from 'react'
import { StyleSheet, View, Button, TextInput,Text, TouchableOpacity } from 'react-native'

import CryptoJS from 'react-native-crypto-js';
import jwt_decode from "jwt-decode";
import SecureStorage from 'react-native-secure-storage'

var AES = require("react-native-crypto-js").AES;

var passwordInMobile = '';
var VCshow = [];
function VC({vc}){
  if(JSON.stringify(vc.vc.type) == '["VerifiableCredential","certificate"]'){
    return (
    <View>
      <View style={styles.certificateCard}>
              <Text style={styles.vcText}>인증서</Text>
              <Text>이름 : {vc.vc.credentialSubject.name}</Text>
              <Text>Email: {vc.vc.credentialSubject.email}</Text>
              <Text>생일 : {vc.vc.credentialSubject.birthday}</Text>
              <Text>성별 : {vc.vc.credentialSubject.gender}</Text>
              <Text>Phone: {vc.vc.credentialSubject.birthday}</Text>
      </View>

    </View>
    )
  } else {
  return (
    <View>
      <View style={styles.vcCard}>
              <Text style={styles.vcText}>운전 면허증</Text>
              <Text>이름 : {vc.vc.credentialSubject.name}</Text>
              <Text>발급 기관: {vc.vc.credentialSubject.issueAgency}</Text>
              <Text>발급 날짜: {vc.vc.credentialSubject.issueDate}</Text>
              <Text>ID : {vc.vc.credentialSubject.idNo}</Text>
      </View>

    </View>
  )
  }
}
export default class VCverify extends React.Component {
  state = {
    password: '',
    dataKey: '',
    address: '',
    privateKey:'',
    mnemonic:'',
    VCarray:[],
    VCjwtArray:[
    ],
    showingData: []
  }
  setKey = () => {
    const {navigation} = this.props
    const mobileKey = navigation.getParam('password',"value")
    passwordInMobile = mobileKey
  }
  
  setStateData = async () => {
  await SecureStorage.getItem(passwordInMobile).then((docKey) => {
      this.setState({dataKey: docKey}, function() {
          SecureStorage.getItem(this.state.dataKey).then((userData) => {
            if(userData != null) {
              
              let bytes = CryptoJS.AES.decrypt(userData, this.state.dataKey);
              let originalText = bytes.toString(CryptoJS.enc.Utf8);
              
              this.setState(JSON.parse(originalText))
              this.showVC();
            }
          })
      })
    })
  }

  showVC = () => {
    const {navigation} = this.props
    const receivedVC = navigation.getParam('VCdata',"VCvalue")
    const decodedVC = JSON.stringify(receivedVC).substring(28,JSON.stringify(receivedVC).length-2)
    const VCform = jwt_decode(decodedVC)
    
    this.setState({
      showingData: this.state.showingData.concat([VCform])
      }, function(){
    })
  }

  gotoNext = () => {
    const {navigation} = this.props
    const receivedVC = navigation.getParam('VCdata',"VCvalue")
    this.props.navigation.navigate('VCselect',{VCdata:receivedVC,password:this.state.password})
  }

  test = () => {
    const {navigation} = this.props
    const receivedVC = navigation.getParam('VCdata',"VCvalue")
    var iv = this.state.dataKey;
    let vcBytes = CryptoJS.AES.encrypt(JSON.stringify(receivedVC),this.state.dataKey,{iv:iv});
    
    this.props.navigation.navigate('TestKey',{dataKey:this.state.dataKey,savedData:vcBytes,receivedVC:receivedVC})
    //alert("this is datakey :" + this.state.dataKey  +'\n' + '\n' +
    //       'saved data :' + vcBytes +'\n' + '\n'+ 'received vc :' + receivedVC )
    
  }

  render() {
    

    return (
      <View style={styles.container}>
      <Text style={styles.textTop}>VC 생성완료</Text>
      <Text style={styles.textContext}>Smart ID Card VC를 성공적으로 생성하였습니다.</Text>
        <View>{this.state.showingData.map((vc) =>
          <VC vc={vc} key={vc.exp}/>
        )}
        </View>
        
      <TouchableOpacity style={styles.nextButton} onPress={this.gotoNext}><Text>다음</Text></TouchableOpacity>
      
      </View>
    )
  }
  componentDidMount(){
    this.setKey();
    this.setStateData();
    
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center'
  },
  vcText:{
    fontWeight:'bold',
    fontSize:20
  },
  vcCard:{
    
    borderRadius:12,
    width:300,
    backgroundColor: '#AAF',
    margin:10,
    padding:10
  },
  textContext: {
    color: 'black',
    fontSize: 17,
    textAlign:'left',
    width:'80%',
    margin:10
  },
  certificateCard:{
    borderRadius:12,
    width:300,
    backgroundColor: '#DFF',
    margin:10,
    padding:10
  },
  nextButton: {
    textAlign:"center",
    alignItems:"center",
    alignContent:'center',
    textAlign: 'center',
    justifyContent: 'center',
    width:'85%',
    marginTop:'30%',
    marginBottom: '5%',
    backgroundColor:'#316BFF',
    height:40,
    borderRadius:12
  },
  textTop: {
    color: 'black',
    fontSize:30,
    fontWeight: 'bold',
    textAlign:"left",
    width:'70%',
    marginTop:'4%',
    marginBottom:'4%'
    
  }
})
