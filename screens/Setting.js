import React from 'react'
import {ScrollView, StyleSheet, Text, View, TouchableOpacity, LogBox} from 'react-native'
import CryptoJS from 'react-native-crypto-js';
import SecureStorage from 'react-native-secure-storage'

var AES = require("react-native-crypto-js").AES;


export default class Setting extends React.Component {
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

  /** getUserInfoFromToken : 
   * 페이지가 실행 되었을 때, userToken을 키로 이용해 password를 가져와 state에 저장하고,
   *  getDidData function을 실행시킴
   * 
   */
  getUserInfoFromToken = async () => {
    await SecureStorage.getItem('userToken').then((res) => {
      this.setState({password: res}, async function() {
        this.getDidData();
      })
    })
  }
  /** getDidData : 
   *        "현재 state의 password"를 이용하여 암호화된 State를 가져와 복호화 하여 State에 저장함
   *        
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
            }
            })
        })
      })
  }

  //Navigation
  goToVCselect = () => {
    this.props.navigation.navigate('VCselect',{password:this.state.password})
  }
  goToMain = async () => {
    this.props.navigation.navigate('VCcontrol')

  }
  changePW = () => {
      this.props.navigation.navigate('ChangePW')
  }
  readying = () => {
    alert("준비중입니다")
  }
  //Navigation end


  render() {
    LogBox.ignoreAllLogs(true)
    return (
      <View style={styles.container}>
        <Text style={styles.textTop}>설정</Text>
        <Text style={{margin:20}}>스마트 ID 카드 ver.1.0</Text>

        <TouchableOpacity onPress={this.changePW}><Text>비밀번호 변경</Text></TouchableOpacity>


        <ScrollView style={styles.bottomFix}>
        <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.bottomButton} onPress={this.goToVCselect}><Text style={styles.buttonText}>VC 관리</Text></TouchableOpacity>
        
        <TouchableOpacity style={styles.bottomButton} onPress={this.goToMain}><Text style={styles.buttonText}>프로필</Text></TouchableOpacity>
        <TouchableOpacity style={styles.bottomButton} onPress={this.readying}><Text style={styles.buttonText}>가이드</Text></TouchableOpacity>
        <TouchableOpacity style={styles.bottomButton} ><Text style={styles.buttonText}>설정</Text></TouchableOpacity>
        </View>
        </ScrollView>
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
