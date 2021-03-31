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
var issuerDID = '';
var issuerURL = '';
var signType = '';
var signData = '';
var encryptKey = '';
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
    var connectorUrl = '';
    const {navigation} = this.props
    const userPassword = navigation.getParam('password',"passwordValue")
    if(e.data[9] == "s") {
      
      connectorUrl = "https" + e.data.substring(10,e.data.length);
    } else {
      connectorUrl = "http" + e.data.substring(9,e.data.length)
    }
    
      axios.get(connectorUrl).then(response => {
        roomNo = response.data.data.no;
        socketUrl = response.data.data.websocketUrl;
        nonce = response.data.data.nonce;
        encryptKey = response.data.data.encryptionKey;
        if(response.data.data.requestType == 'vp'){

          if(response.data.data.useSvp == true ) {

            if(response.data.data.requestData == null) {
              if(response.data.data.sign == null) {
                // VP req / SVP 사용 / VC 요청(X) / Sign (X)
                this.props.navigation.navigate('VPREQ_SVP_NULLsend',{roomNo:roomNo,socketUrl:socketUrl,userPW:userPassword,nonce:nonce,reqType:reqType,issuerDID:issuerDID,issuerURL:issuerURL,encryptKey:encryptKey})
              } else {
                
                // VP req / SVP 사용 / VC 요청(X) / Sign (O)
                
                signData = response.data.data.sign.data
                signType = response.data.data.sign.type
                
                this.props.navigation.navigate('VPREQ_SVP_SIGN_NULLsend',{roomNo:roomNo,socketUrl:socketUrl,userPW:userPassword,nonce:nonce,signData:signData,signType:signType,encryptKey:encryptKey})
              }
            } else {
              if(response.data.data.sign == null) {
                // VP req / SVP 사용 / VC 요청(O) / Sign (X)
                reqType = response.data.data.requestData[0].type;
                issuerDID = response.data.data.requestData[0].issuer[0].did;
                issuerURL = response.data.data.requestData[0].issuer[0].url;

                this.props.navigation.navigate('VPREQ_SVP_VCsend',{roomNo:roomNo,socketUrl:socketUrl,userPW:userPassword,nonce:nonce,reqType:reqType,issuerDID:issuerDID,issuerURL:issuerURL,encryptKey:encryptKey})
              } else {
                
                // VP req / SVP 사용 / VC 요청(O) / Sign (O)

                reqType = response.data.data.requestData[0].type;
                issuerDID = response.data.data.requestData[0].issuer[0].did;
                issuerURL = response.data.data.requestData[0].issuer[0].url;
                
                signData = response.data.data.sign.data
                signType = response.data.data.sign.type
                
                this.props.navigation.navigate('VPREQ_SVP_SIGN_VCsend',{roomNo:roomNo,socketUrl:socketUrl,userPW:userPassword,nonce:nonce,reqType:reqType,issuerDID:issuerDID,issuerURL:issuerURL,signData:signData,signType:signType,encryptKey:encryptKey})
              }
            }
            // SVP 사용 
          } else if (response.data.data.useSvp == false){

            if(response.data.data.requestData == null) {
              if(response.data.data.sign == null) {
                // VP req / SVP 사용(X) / VC 요청(X) / Sign (X)
                this.props.navigation.navigate('VPREQ_NULLsend',{roomNo:roomNo,socketUrl:socketUrl,userPW:userPassword,nonce:nonce,reqType:reqType,issuerDID:issuerDID,encryptKey:encryptKey})
              } else {
                
                // VP req / SVP 사용(X) / VC 요청(X) / Sign (O)
                
                signData = response.data.data.sign.data
                signType = response.data.data.sign.type
                
                this.props.navigation.navigate('VPREQ_SIGN_NULLsend',{roomNo:roomNo,socketUrl:socketUrl,userPW:userPassword,nonce:nonce,signData:signData,signType:signType,encryptKey:encryptKey})
              }
            } else {
              if(response.data.data.sign == null) {
                // VP req / SVP 사용(X) / VC 요청(O) / Sign (X)
                reqType = response.data.data.requestData[0].type;
                issuerDID = response.data.data.requestData[0].issuer[0].did;
                issuerURL = response.data.data.requestData[0].issuer[0].url;

                this.props.navigation.navigate('VPREQ_VCsend',{roomNo:roomNo,socketUrl:socketUrl,userPW:userPassword,nonce:nonce,reqType:reqType,issuerDID:issuerDID,issuerURL:issuerURL,encryptKey:encryptKey})
              } else {
                
                // VP req / SVP 사용 / VC 요청(O) / Sign (O)

                reqType = response.data.data.requestData[0].type;
                issuerDID = response.data.data.requestData[0].issuer[0].did;
                issuerURL = response.data.data.requestData[0].issuer[0].url;
                
                signData = response.data.data.sign.data
                signType = response.data.data.sign.type
                
                this.props.navigation.navigate('VPREQ_SIGN_VCsend',{roomNo:roomNo,socketUrl:socketUrl,userPW:userPassword,nonce:nonce,reqType:reqType,issuerDID:issuerDID,issuerURL:issuerURL,signData:signData,signType:signType,encryptKey:encryptKey})
              }
            }
          }

          


        } else if(response.data.data.requestType == 'vc') {
          
          if(response.data.data.useSvp == true) {

            if(response.data.data.requestData == null){
                // VC req / SVP 사용 / VC 요청(X)
                this.props.navigation.navigate('VCREQ_SVP_DIDsend',{roomNo:roomNo,socketUrl:socketUrl,userPW:userPassword,nonce:nonce,encryptKey:encryptKey})
            } else {
                // VC req / SVP 사용 / VC 요청(O)
                reqType = response.data.data.requestData[0].type;
                issuerDID = response.data.data.requestData[0].issuer[0].did;
                issuerURL = response.data.data.requestData[0].issuer[0].url;

                this.props.navigation.navigate('VCREQ_SVP_VCsend',{roomNo:roomNo,socketUrl:socketUrl,userPW:userPassword,nonce:nonce,reqType:reqType,issuerDID:issuerDID,issuerURL:issuerURL,encryptKey:encryptKey})
            }
          } else {
            if(response.data.data.requestData == null){
              // VC req / SVP 사용안함 / VC 요청 (X)
                this.props.navigation.navigate('VCREQ_DIDsend',{roomNo:roomNo,socketUrl:socketUrl,userPW:userPassword,nonce:nonce,encryptKey:encryptKey})
            } else {
              // VC req / SVP 사용안함 / VC 요청 (O)
                reqType = response.data.data.requestData[0].type;
                issuerDID = response.data.data.requestData[0].issuer[0].did;
                issuerURL = response.data.data.requestData[0].issuer[0].url;

                this.props.navigation.navigate('VCREQ_VCsend',{roomNo:roomNo,socketUrl:socketUrl,userPW:userPassword,nonce:nonce,reqType:reqType,issuerDID:issuerDID,issuerURL:issuerURL,encryptKey:encryptKey})
            }
          }
         

        } else {
            alert("error")
        }
      }
    )
    
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