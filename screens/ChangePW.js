import React from 'react'
import {ScrollView, StyleSheet, Text, View, Button, TextInput, Linking, Image, TouchableOpacity, LogBox} from 'react-native'
import CryptoJS from 'react-native-crypto-js';
import axios from 'axios';

import SecureStorage from 'react-native-secure-storage'
import {TouchableHighlight} from 'react-native-gesture-handler';
var AES = require("react-native-crypto-js").AES;


var estormLogo = require ('./emptyprofile.png');
export default class ChangePW extends React.Component {
  state = {
    name:'name',
    email:'email@email.com',
    phone:'010-0000-0000',
    password: '',
    dataKey: '',
    address: '',
    privateKey:'',
    mnemonic:'',
    VCarray:[
    ],
    VCjwtArray:[],

    passwordCheck:'',
    passwordCH:'',
    confirmPasswordCH:''
  }

  changePW = async () => {
      this.clearPWinput();
      this.setState({password:this.state.passwordCH}, await function(){
        let cipherData = CryptoJS.AES.encrypt(JSON.stringify(this.state), this.state.dataKey).toString();
      
        SecureStorage.setItem(this.state.dataKey, cipherData);
      
        SecureStorage.setItem(this.state.password,this.state.dataKey);
        this.saveUserToken();
      })
      
  }
  cancel = () => {
      this.props.navigation.navigate('Setting',{password:this.state.password})
  }
  saveUserToken = async () => {
    await SecureStorage.setItem('userToken', this.state.password);
    
    alert("비밀번호 변경이 완료되었습니다")
    this.props.navigation.navigate('Setting',{password:this.state.password})
    
  }
  getUserToken = async () => {
    await SecureStorage.getItem('userToken').then((res) => {
      this.setState({password: res}, async function() {
        this.getDidData();
        
      })
    })
  }
  
  getDidData = async () => {
    
      await SecureStorage.getItem(this.state.password).then((docKey) => {
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
  clearPWinput = () => {
      this.setState({passwordCheck:'',passwordCH:'',confirmPasswordCH:''}, function(){
          console.log(this.state)
      })
      
  }

  finalCheck = () => {
      if(this.state.password == this.state.passwordCheck) {
          if(this.state.passwordCH == this.state.confirmPasswordCH){
            this.changePW();
          } else {
              alert("새 비밀번호와 새 비밀번호 확인이 일치하지 않습니다")
          }
      } else {
          alert("현재 비밀번호가 일치하지 않습니다")
      }
  }



  handleCheckPassword = passwordCheck => {
      this.setState({ passwordCheck })
  }

  handlePasswordChange = passwordCH => {
    this.setState({ passwordCH })

  }
  handleConfirmPWchange = confirmPasswordCH => {
    this.setState({ confirmPasswordCH })
  }
  render() {
    LogBox.ignoreAllLogs(true)
    return (
      <View style={styles.container}>
        <Text style={styles.textTop}>비밀번호 변경</Text>
        <View style={{ margin: 10 }}>
          <TextInput
            name='passwordCheck'
            value={this.state.passwordCheck}
            placeholder='현재 비밀번호'
            style={styles.inputText}
            secureTextEntry
            onChangeText={this.handleCheckPassword}
          />
          <TextInput
            name='passwordCH'
            value={this.state.passwordCH}
            placeholder='새 비밀번호'
            style={styles.inputText}
            secureTextEntry
            onChangeText={this.handlePasswordChange}
          />
          <TextInput
            name='confirmPasswordCH'
            placeholder='새 비밀번호 확인'
            value={this.state.confirmPasswordCH}
            style={styles.inputText}
            secureTextEntry
            onChangeText={this.handleConfirmPWchange}
          />
        </View>
        <View style={styles.modalButtonGroup}>
        <TouchableHighlight
                style={styles.modalButton}
                onPress={this.finalCheck}
                >
                <Text style={styles.textStyle}>확인</Text>
              </TouchableHighlight>
              <TouchableHighlight
                style={styles.modalCancel}
                onPress={this.cancel}
                >
                <Text style={styles.textStyle}>취소</Text>
              </TouchableHighlight>
        </View>
      </View>
    )
  }
  componentDidMount(){
      this.getUserToken();
      this.clearPWinput();
  }
  
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    alignItems:'center'
  },
  profileCardSaveButton:{
    textAlign:'center',
    alignItems:'center',
    alignContent:'center',
    backgroundColor:'white',
    width:"30%",
    justifyContent:'center',
    right:"-10%",
    padding:5,
    marginTop:15,
    borderRadius:10
  },
  scrollCard:{
    height:'75%',
    marginLeft:'5%'
  },
  profileTitle:{
    textAlign:"center",
    fontSize:15,
    fontWeight:"bold",
    marginBottom:30
  },
  qrText: {
    color:'white',
    fontWeight:'bold'
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
  },modalButton: {
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
  bannerButton: {
    width:'90%',
    textAlign:"center",
    alignItems:"center",
    alignContent:'center',
    textAlign: 'center',
    justifyContent: 'center',
    backgroundColor:'#AAA',
    paddingTop:'2%',
    paddingBottom:'2%',
    borderBottomLeftRadius:12,
    borderBottomRightRadius:12,
    
    alignContent:'center',
    justifyContent:'center',
    textAlign:'center'
  },
  profileCard:{
    width:'95%',
    marginTop:'5%',
    padding:15,
    backgroundColor:'#f7f7f7',
    borderRadius:12,
    alignContent:'center',
    justifyContent:'center',
    textAlign:'center',

  },
  textTop: {
    color: 'black',
    fontSize:30,
    fontWeight: 'bold',
    textAlign:"center",
    width:'70%',
    marginTop: 20
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
  inputProfileText: {
    backgroundColor:'white',
    width:'90%',
    borderRadius:12,
    textAlign:"center",
    margin:20,
    marginTop:5,
    padding:0,
    marginBottom:5,
    
    alignContent:'center',
    justifyContent:'center',
    textAlign:'center'
  }
})
