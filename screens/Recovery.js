import React from 'react'
import { StyleSheet, Text, View, Button, TextInput,  } from 'react-native'

import SecureStorage from 'react-native-secure-storage'
export default class Signup extends React.Component {
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
    ],
    showingData: ''
  }


  handlePasswordChange = password => {
    this.setState({ password })
  }
  goToMain = () => this.props.navigation.navigate('VCcontrol',{password:this.state.password})

  
  getDidData = async () => {
      await SecureStorage.getItem(this.state.password).then((state) => { 
        if( state == null){
          console.log("no item")
          alert("no account")
        } else {
          this.goToMain();
        }
      })
      

  }
  render() {
      const { password } = this.state
    return (
      <View style={styles.container}>
        <Text style={styles.textUpper}>복구 비밀번호 입력</Text>
        <View style={{ margin: 10 }}>
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
            secureTextEntry
            style={styles.inputSeed}
          />
          
          <Text style={styles.textContext}>최초 제공된 시드 형태의 단어들을 차례대로 입력해 주시기 바랍니다.</Text>
        </View>
        <Button title='복구' onPress={this.getDidData} />
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#00203F',
    alignItems: 'center',
    justifyContent: 'center'
  },
  inputText: {
    backgroundColor:'white',
    width: 370,
    padding:15,
    margin:20,
    borderRadius:12,
    
  },
  textUpper: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    textAlign:'left',
    width:'70%'
  },
  textContext: {
    color: '#fff',
    fontSize: 17,
    textAlign:'left',
    width:380,
    margin:10
  },inputSeed: {
    backgroundColor:'white',
    width: 370,
    padding:15,
    margin:20,
    height:300,
    borderRadius:12,
    
  }
})
