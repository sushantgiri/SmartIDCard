import React from 'react'
import { StyleSheet, View, Button,Text,TouchableOpacity, ScrollView, Image} from 'react-native'
import jwt_decode from "jwt-decode";
import CryptoJS from 'react-native-crypto-js';

import SecureStorage from 'react-native-secure-storage'
var AES = require("react-native-crypto-js").AES;

var estormLogo = require ('./estormLogo.png');
var passwordInMobile = '';

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
export default class VCselect extends React.Component {
  
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
    ]
  }
  
  //first setting data key for functions
  setKey = () => {
    const {navigation} = this.props
    const mobileKey = navigation.getParam('password',"value")
    passwordInMobile = mobileKey
  }

  clearArray = () => {
    this.setState({
      VCarray: []
    }, function() {
        let cipherData = CryptoJS.AES.encrypt(JSON.stringify(this.state), this.state.dataKey).toString();
        SecureStorage.setItem(this.state.dataKey, cipherData);
    })

  }

  setStateData = async () => {
  await SecureStorage.getItem(passwordInMobile).then((docKey) => {
      this.setState({dataKey: docKey}, function() {
          SecureStorage.getItem(this.state.dataKey).then((userData) => {
            if(userData != null) {
              
              let bytes = CryptoJS.AES.decrypt(userData, this.state.dataKey);
              let originalText = bytes.toString(CryptoJS.enc.Utf8);
              
              this.setState(JSON.parse(originalText))
              this.setinVCarray();
            }
          })
      })
    })
  }

  

  setinVCarray = () => {
    const {navigation} = this.props
    const receivedVC = navigation.getParam('VCdata',"VCvalue")
    if(receivedVC != "VCvalue"){
      const decodedVC = JSON.stringify(receivedVC).substring(28,JSON.stringify(receivedVC).length-2)
      const VCform = jwt_decode(decodedVC)
      this.setState({
        VCarray: this.state.VCarray.concat([VCform]),
        VCjwtArray: this.state.VCjwtArray.concat([receivedVC])
        }, function(){
        
        let cipherData = CryptoJS.AES.encrypt(JSON.stringify(this.state), this.state.dataKey).toString();
        SecureStorage.setItem(this.state.dataKey, cipherData);
        
      })

    } else {
      console.log("no receive new vc")
    }
    
                
              
  }

  goToMain = () => {
    this.props.navigation.navigate('VCcontrol')

  }

  

  render() {
    
    return (
      <View style={styles.container}>
      <Text style={styles.textTop}><Image style={{height:40,width:40}} source = {estormLogo}></Image>VC 관리</Text>
        <View style={styles.vcContainter}>
          <ScrollView>{this.state.VCarray.map((vc)=>
          <View>
            <VC vc={vc}/>
          </View>
          )}
        
          </ScrollView>
        </View>
        
        
        
        <ScrollView style={styles.bottomFix}>
        
        <TouchableOpacity style={styles.testButton} title='array clear' onPress={this.clearArray}><Text>Array clear</Text></TouchableOpacity>
        <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.bottomButton} onPress={this.goToVCselect}><Text style={styles.buttonText}>VC 관리</Text></TouchableOpacity>
        <TouchableOpacity style={styles.bottomButton} ><Text style={styles.buttonText}>CVC 관리</Text></TouchableOpacity>
        <TouchableOpacity style={styles.bottomButton} onPress={this.goToMain}><Text style={styles.buttonText}>프로필</Text></TouchableOpacity>
        <TouchableOpacity style={styles.bottomButton} ><Text style={styles.buttonText}>가이드</Text></TouchableOpacity>
        <TouchableOpacity style={styles.bottomButton} ><Text style={styles.buttonText}>설정</Text></TouchableOpacity>
        </View>
        </ScrollView>
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
  },
  textTop: {
    color: '#fff',
    fontSize:30,
    fontWeight: 'bold',
    textAlign:"center",
    width:'70%',
    marginTop:'4%',
    marginBottom:'4%'
    
  },
  vcContainter:{
    height:600
  },
  testButton: {
    width:40,
    margin:20,
    backgroundColor:'#FFF'
  },
  textMarginer: {
    margin:20
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
    borderRadius:12,
    width:300,
    backgroundColor: '#DFF',
    margin:10,
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
  }
})
