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
        <Text>계정복구</Text>
        <View style={{ margin: 10 }}>
          <TextInput
            name='password'
            value={password}
            placeholder='Enter password'
            secureTextEntry
            onChangeText={this.handlePasswordChange}
          />
        </View>
        <Button title='복구' onPress={this.getDidData} />
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center'
  }
})
