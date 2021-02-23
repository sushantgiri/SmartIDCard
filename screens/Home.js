import React from 'react'
import {ScrollView, StyleSheet, Text, View, TextInput, Image, TouchableOpacity, LogBox} from 'react-native'
import CryptoJS from 'react-native-crypto-js';

import Clipboard from '@react-native-community/clipboard'

import SecureStorage from 'react-native-secure-storage'
var AES = require("react-native-crypto-js").AES;

import {FloatingAction} from "react-native-floating-action"

var estormLogo = require ('./emptyprofile.png');
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
  
  // 프로필의 name, email, phone number 를 관리
  handleName = name => {
    this.setState({ name })
  }
  handleEmail = email => {
    this.setState({ email })
  }
  handlePhone = phone => {
    this.setState({ phone })
  }

  /** getUserInfoFromToken : 
   * 페이지가 실행 되었을 때, userToken을 키로 이용해 password를 가져와 state에 저장하고,
   *  getDidData function 과 getProfileInfo function을 실행시킴
   * 
   */
  getUserInfoFromToken = async () => {
    await SecureStorage.getItem('userToken').then((res) => {
      this.setState({password: res}, async function() {
        this.getDidData();
        this.getProfileInfo();
      })
    })
  }

  /** saveProfileInfo : 현재 프로필 내의 name, email, phone number 에 입력된 값을,
   *                    각각 userName, userEmail, userPhone 으로 저장함.
   * 
   */
  saveProfileInfo = async () => {
    await SecureStorage.setItem('userName',this.state.name)
    await SecureStorage.setItem('userEmail',this.state.email)
    await SecureStorage.setItem('userPhone',this.state.phone)
    
  }

  /** getProfileInfo : 프로필에 등록된 정보(이름, email, phoneNumber)을
   *  각각 userName, userEmail, userPhone의 키를 이용하여 가져와, State 값에 저장
   */
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
  
  /** getDidData : 
   *        "현재 state의 password"를 이용하여 암호화된 State를 가져와 복호화 하여 State에 저장함
   *        saveUserToken() 과 연결
   * 
   */
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

  // 로그아웃
  logout = async () => {
    console.log("logout")
    await SecureStorage.removeItem('userToken');
    this.props.navigation.navigate('Auth');
  }

  // 현재 password를 userToken으로 저장
  saveUserToken = async () => {
    await SecureStorage.setItem('userToken', this.state.password);
  }

  // 시드 복사
  copySeed = () => {
    alert("시드가 복사되었습니다")
    Clipboard.setString(this.state.mnemonic)
  }

  //Navigation
  goToVCselect = () => {
    this.saveUserToken();
    this.props.navigation.navigate('VCselect',{password:this.state.password})
  }

  goToScan = () => {
    this.saveUserToken();
    this.props.navigation.navigate('ScanScreen',{password:this.state.password})
  }

  goToSetting = () => {
    this.saveUserToken();
    this.props.navigation.navigate('Setting',{password:this.state.password})
  }

  readying = () => {
    alert("준비중입니다")
  }
  //Navigation end

  floatButtonAction = (name) => {
    if (name == "scanqr"){
      this.saveUserToken();
      this.props.navigation.navigate('ScanScreen',{password:this.state.password})
    } else if (name == "bluetooth"){
      alert("bluetooth 준비중")
    }
  }


  render() {
    LogBox.ignoreAllLogs
    const { name,email,phone } = this.state
    return (
      <View style={styles.container}>
        <Text style={styles.textTop}>프로필</Text>

        <TouchableOpacity onPress={this.logout}><Text>로그아웃</Text></TouchableOpacity>

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
              <TouchableOpacity onPress={this.copySeed}>
                <Text style={{backgroundColor:'grey'}}>시드 복사</Text>
              </TouchableOpacity>
            </View>

          
         
          </ScrollView>
          
        </View>
        
        <ScrollView style={styles.bottomFix}>

          <View style={styles.bottomNav}>
           
            <TouchableOpacity style={styles.bottomButton} onPress={this.goToVCselect}><Text style={styles.buttonText}>VC 관리</Text></TouchableOpacity>
            <TouchableOpacity style={styles.bottomButton} ><Text style={styles.buttonText}>프로필</Text></TouchableOpacity>
            <TouchableOpacity style={styles.bottomButton} onPress={this.readying}><Text style={styles.buttonText}>가이드</Text></TouchableOpacity>
            <TouchableOpacity style={styles.bottomButton} onPress={this.goToSetting}><Text style={styles.buttonText}>설정</Text></TouchableOpacity>
          </View>
        </ScrollView>
        
          <FloatingAction style={styles.floatButton} actions={actions} onPressItem={name => {this.floatButtonAction(name)}}/>
      </View>
    )
  }
  componentDidMount(){
    this.getUserInfoFromToken();
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
  floatButton:{
    position:'absolute',
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
    zIndex:0,
    width: '100%',
    position: 'absolute',
    bottom:0,
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
