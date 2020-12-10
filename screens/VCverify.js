import React from 'react'
import { StyleSheet, View, Button, TextInput } from 'react-native'

export default class VCverify extends React.Component {
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
  
  render() {
    

    return (
      <View style={styles.container}>
        <Text>
          VC 암호화키 (DID 프라이빗키)
        </Text>
        <Text>
          암호화된 VC
        </Text>
        
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
