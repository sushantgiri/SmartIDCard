import React from 'react'
import { StyleSheet, View, Button,Text,TouchableOpacity, ScrollView} from 'react-native'
import jwt_decode from "jwt-decode";
import CryptoJS from 'react-native-crypto-js';

import SecureStorage from 'react-native-secure-storage'
var AES = require("react-native-crypto-js").AES;

var passwordInMobile = '';

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
        <View><View>{this.state.VCarray.map((vc)=>
          <View>
          <View key={vc.exp} style={styles.vcCard}>
          
            <Text>Type: {vc.vc.type}</Text>
            <Text>Name : {vc.vc.credentialSubject.name}</Text>
            <Text>ID no :{vc.vc.credentialSubject.idNo}</Text>
            <Text>Exp : {vc.exp}</Text>
          </View>
          
          </View>
        )}</View>
        </View>
        
        
        
        <ScrollView style={styles.bottomFix}>
        
        <Button title='array clear' onPress={this.clearArray} />
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
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center'
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
    width:300,
    backgroundColor: '#AAF',
    margin:10,
    padding:10
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
