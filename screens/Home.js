import React from 'react'
import {ScrollView, StyleSheet, Text, View, Button, TextInput, Linking, Image, TouchableOpacity} from 'react-native'
import CryptoJS from 'react-native-crypto-js';
import axios from 'axios';

import SecureStorage from 'react-native-secure-storage'
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
  












  //Web과 QR 데이터를 받아서 원활히 통신이 되는지
  getDidDataFromWeb = () => {
    const item = this.props.navigation.getParam('data',{})
    this.setState({VCdataFromWeb: item})
    console.log(item)

    axios.get('http://182.162.89.72:30600/rest/connector/' + item)
    .then(res => {
      var getSocketURL = res.data.data.url + "/rest/qrdata/" + item;
      console.log(getSocketURL)
      alert(getSocketURL)
      axios.get(getSocketURL).then(response => {
        
        roomtest = response.data.data.no;
        socket = response.data.data.websocketUrl

      })
    })
    

  }

  
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
        
        <Text>DID : </Text><Text>{this.state.address}</Text>
        <Text>12시드 : </Text><Text>{this.state.mnemonic}</Text>
         
        </View>
        
        <Button title='자세히보기' onPress={this.getDidData}/>

        <ScrollView style={styles.bottomFix}>
        
        <Button title='QR 코드 스캔' onPress={this.goToScan} />
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
  
  componentDidMount(){
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#00203F',
    
  },
  profileCard:{
    width:'100%',
    backgroundColor:'white',
    height:'40%'
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
