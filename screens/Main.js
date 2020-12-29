import React from 'react'
import { StyleSheet, View, Text, TouchableOpacity, Image} from 'react-native'

import Swiper from 'react-native-swiper'

import SecureStorage from 'react-native-secure-storage'

var estormLogo = require ('./ic-logo.svg');

export default class Login extends React.Component {
  state = {
    email: '',
    password: ''
  }


  handlePasswordChange = password => {
    this.setState({ password })
  }

  setTokenEmpty = async () => {
    await SecureStorage.removeItem('userToken');
  }

  goToSignup = () => this.props.navigation.navigate('Signup')
  goToRecovery = () => this.props.navigation.navigate('Recovery')
  

  
  render() {
    return (
      <View style={styles.container}>
        <View>
          <Image style={{height:200,width:200}} source = {estormLogo}></Image>
        </View>
        <Swiper style={styles.wrapper} showsButtons={true}>
        <View style={styles.slide1}>
          <Text style={styles.textContext}>중요한 정보의</Text><Text style={styles.textContext}> 수신과 저장에 용이합니다.</Text>
        </View>
        <View style={styles.slide2}>
          <Text style={styles.textContext}>프라이버시 보호.</Text>
          <Text style={styles.textContext}>공유하기 전에는 누구도 정보를</Text><Text style={styles.textContext}> 확인 할 수 없습니다.</Text>
        </View>
        <View style={styles.slide3}>
           <Text style={styles.textContext}>빠르게 인증을 받을 수 있고,</Text>
          <Text style={styles.textContext}>바로 서비스에 이용할 수 있습니다.</Text>
        </View>
      </Swiper>
        <View style={{ flexDirection:"row"}}>
        <TouchableOpacity style={styles.bottomLeftButton} title='계정 생성' onPress={this.goToSignup}><Text style={styles.buttonLeftText}>시작</Text></TouchableOpacity>
        <TouchableOpacity style={styles.bottomButton} title='계정 복구' onPress={this.goToRecovery}><Text style={styles.buttonText}>가져오기</Text></TouchableOpacity>
        </View>
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
  },
  wrapper: { },
  slide1: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    textAlign:'center',
    
    backgroundColor: '#fff'
  },
  slide2: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff'
  },
  slide3: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff'
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
    textAlign:'center',
    width:'70%'
  },
  bottomLeftButton:{
    backgroundColor: '#c3d4ff',
    paddingTop:10,
    paddingBottom:10,
    height:50,
    marginRight:5,

    borderRadius: 12,
    width:'40%',
    alignItems:'center'
  },
  buttonLeftText: {
    color: '#316BFF',
    fontWeight:'bold'
  },
  bottomButton: {
    backgroundColor: '#316BFF',
    paddingTop:10,
    paddingBottom:10,
    marginLeft:5,
    marginBottom:20,
    height:50,
    borderRadius: 12,
    width:'40%',
    alignItems:'center'
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold'
  },
  
  helpingPeople: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    textAlign:'left',
    margin:10
  },
  dotheRight: {
    color: 'yellow',
    fontSize: 20,
    fontWeight: 'bold',
    textAlign:'left',
    margin:10
  }
  
})
