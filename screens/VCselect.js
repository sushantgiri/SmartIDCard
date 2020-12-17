import React from 'react'
import { StyleSheet, View, Button,Text,TouchableOpacity, ScrollView, Image, Linking} from 'react-native'
import jwt_decode from "jwt-decode";
import CryptoJS from 'react-native-crypto-js';

import SecureStorage from 'react-native-secure-storage'
var AES = require("react-native-crypto-js").AES;

var estormLogo = require ('./estormLogo.png');
var passwordInMobile = '';

function VC({vc}){
  //console.log(vc)
  //if(JSON.stringify(vc.vc.type) == '["VerifiableCredential","certificate"]'){
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
var dataforTTA = '';
export default class VCselect extends React.Component {
  
  state = {
    password: '',
    dataKey: '',
    address: '',
    privateKey:'',
    mnemonic:'',
    VCarray:[],
    VCjwtArray:[]
  }
  
  //first setting data key for functions
  setKey = () => {
    const {navigation} = this.props
    const mobileKey = navigation.getParam('password',"value")
    passwordInMobile = mobileKey
    this.setStateData();
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
        let vcData = CryptoJS.AES.encrypt(JSON.stringify(this.state.VCjwtArray), this.state.dataKey);
        dataforTTA = vcData;
      })

    } else {
      console.log('no received vc')
    }
    
                
              
  }
  goToScan = () => this.props.navigation.navigate('ScanScreen',{password:this.state.password})
  goToMain = () => {
    this.props.navigation.navigate('VCcontrol')

  }


  

  render() {
    
    return (
      <View style={styles.container}>
      <Text style={styles.textTop}>VC 관리</Text>
        <View style={styles.vcContainter}>
          <Text>현재 보유한 VC</Text>
          <ScrollView>{this.state.VCarray.map((vc)=>
          <View>
            <VC vc={vc} key={vc.exp}/>
          </View>
          )}
        
          </ScrollView>
        </View>

        <View style={styles.vcContainter}>
          <Text>생성 가능한 VC</Text>
          <TouchableOpacity style={styles.certificateCard} onPress={this.gotoURL}>
              <Text style={styles.vcText}>인증서</Text>
          </TouchableOpacity>
        </View>
        
        
        <ScrollView style={styles.bottomFix}>
        
        
        <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.bottomButton} onPress={this.goToVCselect}><Text style={styles.buttonText}>VC 관리</Text></TouchableOpacity>
        
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
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    alignItems: 'center',
  },
  qrText: {
    color:'white',
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
    height:320
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
