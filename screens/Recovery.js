import React from 'react'
import { StyleSheet, Text, View, Button, TextInput, TouchableOpacity  } from 'react-native'
import CryptoJS from 'react-native-crypto-js';
var AES = require("react-native-crypto-js").AES;
import SecureStorage from 'react-native-secure-storage'
export default class Recovery extends React.Component {
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

  // State 의 password 값 적용 
  handlePassword = password => {
    this.setState({ password })
  }
  // State 의 Seed 값 적용
  handleSeedChange = seed => {
    this.setState({ seed })
  }
  
  // 복구된 사용자의 password를 현재 user의 token 으로 지정하여 저장한후 이동 
  goToMain = async () => {
    await SecureStorage.setItem('userToken',this.state.password)
    this.props.navigation.navigate('App')
  }

  // 사용자의 password를 사용하여 현재 기기의 secure storage에 저장된  state가 있는지 확인후, state의 값을 복구
  getDidData = async () => {
      await SecureStorage.getItem(this.state.password).then((state) => { 
        if( state == null){
          alert("no account")
        } 
        
        else {
          this.setState({dataKey: state}, async function(){
            await SecureStorage.getItem(this.state.dataKey). then((userData) => {
              if( userData != null){

                let bytes  = CryptoJS.AES.decrypt(userData, this.state.dataKey);
                
                let originalText = bytes.toString(CryptoJS.enc.Utf8);
                
                this.setState(JSON.parse(originalText))

                this.checkSeed()
              }
            })
          })
        }
      })
  }

  // 사용자가 입력한 Seed 값을 비교 
  checkSeed = () => {
    if(this.state.mnemonic == this.state.seed){
      this.goToMain()
    } else {
      alert("시드가 일치하지 않습니다")
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
            onChangeText={this.handlePassword}
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
