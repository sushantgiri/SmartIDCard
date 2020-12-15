import React from 'react'
import {ScrollView, StyleSheet, Text, View, Button, TextInput, Linking, Image, TouchableOpacity} from 'react-native'
import CryptoJS from 'react-native-crypto-js';
import axios from 'axios';

import SecureStorage from 'react-native-secure-storage'
import {TouchableHighlight} from 'react-native-gesture-handler';
var AES = require("react-native-crypto-js").AES;


var estormLogo = require ('./estormLogo.png');

export default class Home extends React.Component {
  state = {
    password: '',
    dataKey: '',
    address: '',
    privateKey:'',
    mnemonic:'',
    VCarray:[
    ]
  }
  goToMain = () => this.props.navigation.navigate('Auth')
  
  goToScan = () => this.props.navigation.navigate('ScanScreen',{password:this.state.password})
  goToVerify = () => this.props.navigation.navigate('VCverify')
  goToQRInfo = () => this.props.navigation.navigate('QRInfoScreen')
  













  
  getDidData = async () => {
    console.log(this.state.password)
      await SecureStorage.getItem(this.state.password).then((docKey) => {
        this.setState({dataKey: docKey}, async function() {
            await SecureStorage.getItem(this.state.dataKey).then((userData) => {
            //console.log(JSON.stringify(userData))
            if( userData != null){
              console.log(this.state.dataKey)
              let bytes  = CryptoJS.AES.decrypt(userData, this.state.dataKey);
              //console.log(bytes)
              let originalText = bytes.toString(CryptoJS.enc.Utf8);
              //console.log(originalText)
              this.setState(JSON.parse(originalText))
            }
            })

        })
      })
      

  }
  //Navigation
  goToVCselect = () => {console.log(this.state.password)
  this.props.navigation.navigate('VCselect',{password:this.state.password})
  }




  //Navigation end
  render() {
    const {navigation} = this.props
    const userPassword = navigation.getParam('password','value')
    this.state.password = userPassword;
    return (
      <View style={styles.container}>
        <Text style={styles.textTop}><Image style={{height:40,width:40}} source = {estormLogo}></Image>프로필</Text>


        
        <View style={styles.profileCard}>
        <Text style={styles.profileTitle}>DID ( 개인용 )</Text>
        <Text>DID : </Text><Text>{this.state.address}</Text>
        <Text>시드 : </Text><Text>{this.state.mnemonic}</Text>
         
        </View>
        
        <TouchableOpacity style={styles.bannerButton}onPress={this.getDidData}><Text>자세히 보기</Text></TouchableOpacity>

        <ScrollView style={styles.bottomFix}>
        
        <TouchableOpacity style={styles.QRbutton} onPress={this.goToScan}><Text>QR 스캔</Text></TouchableOpacity>
        <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.bottomButton} onPress={this.goToVCselect}><Text style={styles.buttonText}>VC 관리</Text></TouchableOpacity>
        <TouchableOpacity style={styles.bottomButton} ><Text style={styles.buttonText}>CVC 관리</Text></TouchableOpacity>
        <TouchableOpacity style={styles.bottomButton} ><Text style={styles.buttonText}>프로필</Text></TouchableOpacity>
        <TouchableOpacity style={styles.bottomButton} ><Text style={styles.buttonText}>가이드</Text></TouchableOpacity>
        <TouchableOpacity style={styles.bottomButton} ><Text style={styles.buttonText}>설정</Text></TouchableOpacity>
        </View>
        </ScrollView>
      </View>
    )
  }
  
  
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#00203F',
    alignItems:'center'
  },
  profileTitle:{
    textAlign:"center",
    fontSize:15,
    fontWeight:"bold",
    marginBottom:30
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
    borderBottomRightRadius:12
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
    backgroundColor:'white',
    height:40,
    borderRadius:12
  },
  profileCard:{
    width:'90%',
    marginTop:'5%',
    padding:10,
    backgroundColor:'white',
    height:'30%',
    borderTopLeftRadius:12,
    borderTopRightRadius:12
  },
  textUpper: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    textAlign:'left',
    width:'70%'
  },
  textTop: {
    color: '#fff',
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
  }
})
