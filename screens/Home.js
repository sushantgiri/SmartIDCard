import React from 'react'
import {ScrollView, StyleSheet, Text, View, Button, TextInput, Linking, Image, TouchableOpacity, LogBox} from 'react-native'
import CryptoJS from 'react-native-crypto-js';
import axios from 'axios';

import SecureStorage from 'react-native-secure-storage'
var AES = require("react-native-crypto-js").AES;


var estormLogo = require ('./emptyprofile.png');

export default class Home extends React.Component {
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
    VCjwtArray:[]
  }
  
  goToScan = () => this.props.navigation.navigate('ScanScreen',{password:this.state.password})
  goToVerify = () => this.props.navigation.navigate('VCverify')
  goToQRInfo = () => this.props.navigation.navigate('QRInfoScreen')
  

  handleName = name => {
    this.setState({ name })
  }

  
  handleEmail = email => {
    this.setState({ email })
  }

  
  handlePhone = phone => {
    this.setState({ phone })
  }






  getUserToken = async () => {
    await SecureStorage.getItem('userToken').then((res) => {
      this.setState({password: res}, async function() {
        this.getDidData();
        this.getProfileInfo();
      })
    })
  }
  saveProfileInfo = async () => {
    await SecureStorage.setItem('userName',this.state.name)
    await SecureStorage.setItem('userEmail',this.state.email)
    await SecureStorage.setItem('userPhone',this.state.phone)
    
  }
  getProfileInfo = async () => {
    await SecureStorage.getItem('userName').then((res) => {
      this.setState({name: res})
    })
    await SecureStorage.getItem('userEmail').then((res) => {
      this.setState({email: res})
    })
    await SecureStorage.getItem('userPhone').then((res) => {
      this.setState({phone: res})
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
              this.saveUserToken();
            }
            })

        })
      })
      

  }
  logout = async () => {
    console.log("logout")
    
    await SecureStorage.removeItem('userToken');
    this.props.navigation.navigate('Auth');
  }

  saveUserToken = async () => {
    await SecureStorage.setItem('userToken', this.state.password);
  }
  //Navigation
  goToVCselect = () => {
    this.saveUserToken();
    this.props.navigation.navigate('VCselect',{password:this.state.password})
  }


  //TODO: 테스트로 VP선택지까지 가는 functions
  

  //Navigation end
  render() {
    LogBox.ignoreAllLogs
    const { name,email,phone } = this.state
    return (
      <View style={styles.container}>
        <Text style={styles.textTop}>프로필</Text><TouchableOpacity onPress={this.logout}><Text>로그아웃</Text></TouchableOpacity>
        <View style={styles.scrollCard}>
        <ScrollView>
        <View style={styles.profileCard}>
          <Image source={estormLogo} style={{marginLeft:'25%',marginRight:"25%",marginTop:"5%",marginBottom:"5%",height:150 ,width:150}}></Image>
          <TextInput
            placeholder="name"
            name='name'
            value={name}
            style={styles.inputProfileText}
            onChangeText={this.handleName}
          />
          <TextInput
            placeholder="email"
            name='email'
            value={email}
            style={styles.inputProfileText}
            onChangeText={this.handleEmail}
          />
          <TextInput
            placeholder="phone"
            name='phone'
            value={phone}
            style={styles.inputProfileText}
            onChangeText={this.handlePhone}
          />
          <TouchableOpacity style={styles.profileCardSaveButton} onPress={this.saveProfileInfo}><Text>프로필 저장</Text></TouchableOpacity>
        </View>
        <View style={styles.profileCard}>
        <Text style={styles.profileTitle}>DID ( 개인용 )</Text>
        <View style={{flexDirection:"row"}}><Text>DID : {this.state.address}</Text></View>
        <View style={{flexDirection:"row"}}><Text>시드 : {this.state.mnemonic}</Text></View>
         
        </View>
        </ScrollView>
        </View>

        <ScrollView style={styles.bottomFix}>
        <TouchableOpacity style={styles.QRbutton} onPress={this.goToScan}><Text style={styles.qrText}>QR코드</Text></TouchableOpacity>
        <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.bottomButton} onPress={this.goToVCselect}><Text style={styles.buttonText}>VC 관리</Text></TouchableOpacity>
        
        <TouchableOpacity style={styles.bottomButton} ><Text style={styles.buttonText}>프로필</Text></TouchableOpacity>
        <TouchableOpacity style={styles.bottomButton} ><Text style={styles.buttonText}>가이드</Text></TouchableOpacity>
        <TouchableOpacity style={styles.bottomButton} ><Text style={styles.buttonText}>설정</Text></TouchableOpacity>
        </View>
        </ScrollView>
      </View>
    )
  }
  componentDidMount(){
    this.getUserToken();
  }
  
}
//<TouchableOpacity style={styles.bottomButton} ><Text style={styles.buttonText}></Text></TouchableOpacity>
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
