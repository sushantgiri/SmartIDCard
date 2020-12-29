import React from 'react'
import { StyleSheet, Text, View, Button, TextInput, TouchableOpacity  } from 'react-native'
import CryptoJS from 'react-native-crypto-js';
var AES = require("react-native-crypto-js").AES;
import SecureStorage from 'react-native-secure-storage'
export default class Signup extends React.Component {
    state = {
    password: '',
    dataKey: '',
    address: '',
    privateKey:'',
    mnemonic:'',
    VCarray:[],
    VCjwtArray:[
    ],
    showingData: '',
    seed:''
  }


  handlePasswordChange = password => {
    this.setState({ password })
  }
  goToMain = async () => {
    await SecureStorage.setItem('userToken',this.state.password)
    this.props.navigation.navigate('App')
  }

  handleSeedChange = seed => {
    this.setState({ seed })
  }
  
  getDidData = async () => {
      await SecureStorage.getItem(this.state.password).then((state) => { 
        if( state == null){
          alert("no account")
        } else {
          //Seed 관련 확인 부분 TODO: 활성화
          
          this.setState({dataKey: state}, async function(){
            await SecureStorage.getItem(this.state.dataKey). then((userData) => {
              if( userData != null){
                let bytes  = CryptoJS.AES.decrypt(userData, this.state.dataKey);
                //console.log(bytes)
                let originalText = bytes.toString(CryptoJS.enc.Utf8);
                //console.log(originalText)
                this.setState(JSON.parse(originalText))
                this.checkSeed()
              }
            })
          })
          
          
          

          //
          //this.goToMain();
        }
      })
      

  }
  checkSeed = () => {
    console.log(this.state.mnemonic)
    console.log(this.state.seed)
    if(this.state.mnemonic == this.state.seed){
      this.goToMain()
    }
  }
  render() {
      const { password,seed } = this.state
    return (
      <View style={styles.container}>
        <Text style={styles.textUpper}>복구 비밀번호 입력</Text>
        
          <TextInput
            name='password'
            value={password}
            placeholder='Enter password'
            style={styles.inputText}
            secureTextEntry
            onChangeText={this.handlePasswordChange}
          />
          <Text style={styles.textContext}>최초 계정을 생성할 때에 사용되었던 비밀번호를 입력해 주시기 바랍니다.</Text>
          <TextInput
            placeholder='Space를 포함한 시드를 입력하여 주시기 바랍니다.'
            value={seed}
            onChangeText={this.handleSeedChange}
            style={styles.inputSeed}
          />
          
          <Text style={styles.textContext}>최초 제공된 시드 형태의 단어들을 차례대로 입력해 주시기 바랍니다.</Text>
        
        <TouchableOpacity style={styles.bottomButton} onPress={this.getDidData}><Text style={{color:'white'}}>계정 복구</Text></TouchableOpacity>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center'
  },
  inputText: {
    backgroundColor:'white',
    width: 370,
    padding:15,
    margin:20,
    borderRadius:12,
    borderColor:'black',
    borderWidth:1
  },
  bottomButton: {
    backgroundColor: '#316BFF',
    padding: 15,
    margin: 20,
    borderRadius: 12

  },
  textUpper: {
    color: 'black',
    fontSize: 20,
    fontWeight: 'bold',
    textAlign:'left',
    width:'70%'
  },
  textContext: {
    color: 'black',
    fontSize: 17,
    textAlign:'left',
    width:'80%',
    margin:10
  },inputSeed: {
    backgroundColor:'white',
    width: 370,
    padding:15,
    margin:20,
    height:300,
    borderRadius:12,
    borderColor:'black',
    borderWidth:1
    
  }
})
