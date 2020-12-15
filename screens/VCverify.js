import React from 'react'
import { StyleSheet, View, Button, TextInput,Text, TouchableOpacity } from 'react-native'

import CryptoJS from 'react-native-crypto-js';
import jwt_decode from "jwt-decode";
import SecureStorage from 'react-native-secure-storage'

var AES = require("react-native-crypto-js").AES;

var passwordInMobile = '';
var VCshow = [];
function VC({vc}){
  console.log(vc)
  if(JSON.stringify(vc.vc.type) == '["VerifiableCredential","certificate"]'){
    return (
    <View>
      <View style={styles.certificateCard}>
              <Text style={styles.vcText}>증명서</Text>
              <Text>이름 : {vc.vc.credentialSubject.name}</Text>
              <Text>Email: {vc.vc.credentialSubject.email}</Text>
              <Text>생일 : {vc.vc.credentialSubject.birthday}</Text>
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
    VCjwtArray:[{"dummy":'data','vc':{
      'credentialSubject': 'none'
      }},{"dummy":'data','vc':{
      'credentialSubject': 'none'
      }}
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
    console.log("erer")
    const {navigation} = this.props
    const receivedVC = navigation.getParam('VCdata',"VCvalue")
    const decodedVC = JSON.stringify(receivedVC).substring(28,JSON.stringify(receivedVC).length-2)
    const VCform = jwt_decode(decodedVC)
    
    this.setState({
      showingData: this.state.showingData.concat([VCform])
      }, function(){
      console.log(this.state.showingData)
    })
  }

  gotoNext = () => {
    const {navigation} = this.props
    const receivedVC = navigation.getParam('VCdata',"VCvalue")
    this.props.navigation.navigate('VCselect',{VCdata:receivedVC,password:this.state.password})
  }

  render() {
    

    return (
      <View style={styles.container}>
      <Text style={styles.textTop}>VC 생성완료</Text>
      <Text style={styles.textContext}>VC가 성공적으로 발급되었습니다.</Text>
        <View>{this.state.showingData.map((vc) =>
          <VC vc={vc}/>
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
    backgroundColor: '#00203F',
    alignItems: 'center',
    justifyContent: 'center'
  },
  vcCard:{
    
    borderRadius:12,
    width:300,
    backgroundColor: '#AAF',
    margin:10,
    padding:10
  },
  textContext: {
    color: '#fff',
    fontSize: 17,
    textAlign:'center',
    width:380,
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
    backgroundColor:'white',
    padding: 10,
    borderRadius:20
  },
  textTop: {
    color: '#fff',
    fontSize:30,
    fontWeight: 'bold',
    textAlign:"center",
    width:'70%',
    marginTop:'4%',
    marginBottom:'4%'
    
  }
})
