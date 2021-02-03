'use strict';
import React from 'react';
import {View, StyleSheet, Text, LogBox} from 'react-native';

import QRCodeScanner from 'react-native-qrcode-scanner';
import axios from 'axios';

// global variables : 웹소켓 url, 웹소켓 room number, nonce, request type, issuer 의 url
var socketUrl = '';
var roomNo = '';
var nonce = '';
var reqType = '';
var issuerURL = '';

export default class ScanScreen extends React.Component {
  
  /**
   *  onSuccess :
   *      QR 인식이 성공했을 경우. 
   *      
   *      
   */
  onSuccess = e => {
    //e.data를 url로 이용
    LogBox.ignoreAllLogs(true)
    const {navigation} = this.props
    const userPassword = navigation.getParam('password',"passwordValue")
    axios.get('http://182.162.89.79:30600/rest/connector/' + e.data)
    .then(res => {
      var getQRdata = res.data.data.url + "/rest/qrdata/" + e.data;
      axios.get(getQRdata).then(response => {
        roomNo = response.data.data.no;
        socketUrl = response.data.data.websocketUrl;
        nonce = response.data.data.nonce;
        
        console.log(response.data.data)
        if(response.data.data.requestType == 'vp'){

          reqType = response.data.data.requestData[0].type;
          //TODO: 현재 테스트 상황에서 제외.
          //issuerURL = response.data.data.requestData[0].issuer[0].url;
          this.props.navigation.navigate('QRscreenVP',{roomNo:roomNo,socketUrl:socketUrl,userPW:userPassword,nonce:nonce,reqType:reqType,issuerURL:issuerURL});
        } else if(response.data.data.requestType == 'vc') {
          console.log('VC request')

          if(response.data.data.useSvp == true) {
            console.log("svc 사용")
            if(response.data.data.requestData == null){
                // VC req / SVP 사용 / VC 요청(X)
                console.log("VC req / SVP 사용 / VC 요청(X)")
                this.props.navigation.navigate('SVPDIDsend',{roomNo:roomNo,socketUrl:socketUrl,userPW:userPassword,nonce:nonce})

            } else {
                // VC req / SVP 사용 / VC 요청(O)
                console.log("VC req / SVP 사용 / VC 요청(O)")
                this.props.navigation.navigate('SVPVCsend',{roomNo:roomNo,socketUrl:socketUrl,userPW:userPassword,nonce:nonce})
            }

          }
         

        } else {
        this.props.navigation.navigate('QRInfoScreen',{roomNo:roomNo,socketUrl:socketUrl,userPW:userPassword,nonce:nonce});
        }
      })
    })
    
  };
    
  
// reqType = response.data.data.requestData[0].type;
// issuerURL = response.data.data.requestData[0].issuer[0].url;


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