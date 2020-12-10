import React from 'react'
import { StyleSheet, View, Text, TouchableOpacity, Image} from 'react-native'

import Swiper from 'react-native-swiper'

var estormLogo = require ('./estormLogo.png');

export default class Login extends React.Component {
  state = {
    email: '',
    password: ''
  }


  handlePasswordChange = password => {
    this.setState({ password })
  }

  onLogin = async () => {
    const { password } = this.state
    try {
      if (password.length > 0) {
        this.props.navigation.navigate('App')
      }
    } catch (error) {
      alert(error)
    }
  }

  goToSignup = () => this.props.navigation.navigate('Signup')
  goToRecovery = () => this.props.navigation.navigate('Recovery')
  goToScan = () => {

    this.props.navigation.navigate('ScanScreen')
  
  }

  
  render() {
    const { password } = this.state

    return (
      <View style={styles.container}>
        <View>
          <Image style={{height:200,width:200}} source = {estormLogo}></Image>
        </View>
        <View style={{ flexDirection:"row"}}>
          <Text style={styles.helpingPeople}>Helping People</Text>
          <Text style={styles.dotheRight}>Do the Right</Text>
        </View>
        <Swiper style={styles.wrapper} showsButtons={true}>
        <View style={styles.slide1}>
          <Text style={styles.textUpper}>활용성 1</Text>
          <Text style={styles.textContext}>중요한 정보의 수신과 저장</Text>
        </View>
        <View style={styles.slide2}>
          <Text style={styles.textUpper}>활용성 2</Text>
          <Text style={styles.textContext}>프라이버시 보호.</Text>
          <Text style={styles.textContext}>공유하기 전에는 누구도 정보를 확인 할 수 없습니다.</Text>
        </View>
        <View style={styles.slide3}>
          <Text style={styles.textUpper}>활용성 3</Text>
          <Text style={styles.textContext}>빠른 인증, 가입</Text>
        </View>
      </Swiper>
        <View style={{ flexDirection:"row"}}>
        <TouchableOpacity style={styles.bottomButton} title='계정 생성' onPress={this.goToSignup}><Text style={styles.buttonText}>계정 생성</Text></TouchableOpacity>
        <TouchableOpacity style={styles.bottomButton} title='계정 복구' onPress={this.goToRecovery}><Text style={styles.buttonText}>계정 복구</Text></TouchableOpacity>
        </View>
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
  wrapper: { },
  slide1: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#00203F'
  },
  slide2: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#00203F'
  },
  slide3: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#00203F'
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
    width:'70%'
  },
  bottomButton: {
    backgroundColor: '#316BFF',
    padding: 15,
    margin: 50,
    borderRadius: 12

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
