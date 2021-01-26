'use strict';

import React, { Component } from 'react';


import {
  View,
  StyleSheet,
  Text, Button, LogBox
} from 'react-native';

import QRCodeScanner from 'react-native-qrcode-scanner';
import axios from 'axios';

var socketUrl = '';
var roomNo = '';
var nonce = '';
var reqType = '';
var issuerURL = '';
export default class ScanScreen extends React.Component {
  

  onSuccess = e => {
    //e.data를 url로 이용
    LogBox.ignoreAllLogs(true)
    const {navigation} = this.props
    const userPassword = navigation.getParam('password',"passwordValue")
    axios.get('http://182.162.89.72:30600/rest/connector/' + e.data)
    .then(res => {
      var getQRdata = res.data.data.url + "/rest/qrdata/" + e.data;
      axios.get(getQRdata).then(response => {
        console.log(response.data.data)
        roomNo = response.data.data.no;
        socketUrl = response.data.data.websocketUrl;
        nonce = response.data.data.nonce;
        
        if(response.data.data.requestType == 'vp'){
          reqType = response.data.data.requestData[0].type;
          //TODO: 현재 테스트 상황에서 제외.
          //issuerURL = response.data.data.requestData[0].issuer[0].url;
          this.props.navigation.navigate('QRscreenVP',{roomNo:roomNo,socketUrl:socketUrl,userPW:userPassword,nonce:nonce,reqType:reqType,issuerURL:issuerURL});
        } else if(response.data.data.requestType == 'svp') {
          
          reqType = response.data.data.requestData[0].type;
          issuerURL = response.data.data.requestData[0].issuer[0].url;
          this.props.navigation.navigate('SVPscreen',{roomNo:roomNo,socketUrl:socketUrl,userPW:userPassword,nonce:nonce,reqType:reqType,issueURL:issueURL});
        } else if(response.data.data.requestType == 'sign') {
          
          reqType = response.data.data.requestData[0].type;
          issuerURL = response.data.data.requestData[0].issuer[0].url;
          this.props.navigation.navigate()

        } else {
        this.props.navigation.navigate('QRInfoScreen',{roomNo:roomNo,socketUrl:socketUrl,userPW:userPassword,nonce:nonce});
        }
      })
    })
    
  };
    
  



  render() {
    
    return (
      
      <QRCodeScanner
        onRead={this.onSuccess}
        topContent={
          <View>
          <Text style={styles.centerText}>
            
            <Text style={styles.textBold}>Smart ID Card</Text>
          </Text>
          
        </View>
        }
        bottomContent={
          <View>
          </View>
        }
      />
      
    )
  }
}

const styles = StyleSheet.create({
  centerText: {
    flex: 1,
    fontSize: 18,
    padding: 32,
    color: '#777'
  },
  textBold: {
    fontWeight: '500',
    color: '#000'
  },
  buttonText: {
    fontSize: 21,
    color: 'rgb(0,122,255)'
  },
});