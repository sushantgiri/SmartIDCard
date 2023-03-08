'use strict';
import React from 'react';
import {View, StyleSheet, Text, TouchableOpacity, LogBox, Image, Dimensions} from 'react-native';

import QRCodeScanner from 'react-native-qrcode-scanner';
import axios from 'axios';
import { StackActions, NavigationActions } from 'react-navigation';
import jwt_decode from "jwt-decode"
import {DualDID} from '@estorm/dual-did';
import SecureStorage from 'react-native-secure-storage'
import CryptoJS from 'react-native-crypto-js';
// Web3 Configuration
import * as webConfig from './config/WebConfig'

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
const didJWT = require('did-jwt')
const web3 = webConfig.fetchWeb3()

function createDualSigner (jwtSigner, ethAccount) {
    return { jwtSigner, ethAccount }
}


export default class ScanScreen extends React.Component {
	// cancel
	cancel = () => { 
		this.props.navigation.pop();
    	this.props.navigation.navigate('VCselect');
  	}

	state = {
		isQrScanning: false,
        password: '',
        dataKey: '',
		dataKey: '',
        cipherData: '',
        qrValue:'',
        privateKey:'',
        itemVCArray: [],
	  }

	  


	verifyVP = async(vp, nonce) => {
		const privateKey = this.state.privateKey;
		const ethAccount = web3.eth.accounts.privateKeyToAccount(privateKey)
		const dualSigner = createDualSigner(didJWT.SimpleSigner(privateKey.replace('0x','')), ethAccount)
		const dualDid = new DualDID(dualSigner, webConfig.issuerName, webConfig.serviceEndPoint,web3,webConfig.contractAddress)

		const result = await dualDid.verifyVP(vp, nonce);
		console.log('Result---->', result)

		const code = result.code;
		const success = result.success;
		if(code == "000.0" && success) {
			console.log('Data---->', result.data)
			this.props.navigation.push('VerificationScreen',{resultData:result.data})
			return;
		}
	}

	/**
	 *  onSuccess :
	 *      QR 인식이 성공했을 경우.       
	 */
	
	onSuccess = e => {
		//e.data를 url로 이용
		LogBox.ignoreAllLogs(true)
		console.log('E.data', e);

		if(e.data.startsWith('SmartIDCard')){
			console.log('QR Reading success', JSON.stringify(e.data));
			var vc = e.data.slice(11);
			const vp = JSON.parse(vc).vp;
			const nonce = JSON.parse(vc).nonce;
			console.log('Got VP', vp);
			console.log('Nonce', nonce);
			try{ this.verifyVP(vp, nonce);} catch(e) { console.error(e); }
			
			return;
		}

		var connectorUrl = '';
		const {navigation} = this.props
		const userPassword = navigation.getParam('password',"passwordValue")
		
		if(e.data[9] == "s") {
			connectorUrl = "https" + e.data.substring(10,e.data.length);
		} else {
			connectorUrl = "http" + e.data.substring(9,e.data.length)
		}

		console.log('ConnectionURL:' + connectorUrl)
		
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
							console.log('VPREQ_SVP_NULLsend');
							this.props.navigation.navigate('VPREQ_SVP_NULLsend',{roomNo:roomNo,socketUrl:socketUrl,userPW:userPassword,nonce:nonce,reqType:reqType,issuerDID:issuerDID,issuerURL:issuerURL,encryptKey:encryptKey})
						} else {
							// VP req / SVP 사용 / VC 요청(X) / Sign (O)
							signData = response.data.data.sign.data
							signType = response.data.data.sign.type
							console.log('VPREQ_SVP_SIGN_NULLsend');
							this.props.navigation.navigate('VPREQ_SVP_SIGN_NULLsend',{roomNo:roomNo,socketUrl:socketUrl,userPW:userPassword,nonce:nonce,signData:signData,signType:signType,encryptKey:encryptKey})
						}
					} else {
						if(response.data.data.sign == null) {
							// VP req / SVP 사용 / VC 요청(O) / Sign (X)
							reqType = response.data.data.requestData[0].type;
							issuerDID = response.data.data.requestData[0].issuer[0].did;
							issuerURL = response.data.data.requestData[0].issuer[0].url;
							console.log('VPREQ_SVP_VCsend');

							const resetAction = StackActions.reset({
								index: 0,
								actions: [NavigationActions.navigate({  routeName: 'Home' })],
							   });
							   
							   this.props.navigation.dispatch(resetAction);

							this.props.navigation.navigate('VPREQ_SVP_VCsend',{roomNo:roomNo,socketUrl:socketUrl,userPW:userPassword,nonce:nonce,reqType:reqType,issuerDID:issuerDID,issuerURL:issuerURL,encryptKey:encryptKey})
						} else {
							// VP req / SVP 사용 / VC 요청(O) / Sign (O)
							reqType = response.data.data.requestData[0].type;
							issuerDID = response.data.data.requestData[0].issuer[0].did;
							issuerURL = response.data.data.requestData[0].issuer[0].url;
					
							signData = response.data.data.sign.data
							signType = response.data.data.sign.type
					
							console.log('VPREQ_SVP_SIGN_VCsend');
							this.props.navigation.push('VPREQ_SVP_SIGN_VCsend',{roomNo:roomNo,socketUrl:socketUrl,userPW:userPassword,nonce:nonce,reqType:reqType,issuerDID:issuerDID,issuerURL:issuerURL,signData:signData,signType:signType,encryptKey:encryptKey})
						}
					}
				} else if (response.data.data.useSvp == false){
					if(response.data.data.requestData == null) {
						if(response.data.data.sign == null) {
							// VP req / SVP 사용(X) / VC 요청(X) / Sign (X)
							console.log('VPREQ_NULLsend');

							this.props.navigation.navigate('VPREQ_NULLsend',{roomNo:roomNo,socketUrl:socketUrl,userPW:userPassword,nonce:nonce,reqType:reqType,issuerDID:issuerDID,encryptKey:encryptKey})
						} else {	
							// VP req / SVP 사용(X) / VC 요청(X) / Sign (O)
							signData = response.data.data.sign.data
							signType = response.data.data.sign.type
					
							console.log('VPREQ_SIGN_NULLsend');
							this.props.navigation.navigate('VPREQ_SIGN_NULLsend',{roomNo:roomNo,socketUrl:socketUrl,userPW:userPassword,nonce:nonce,signData:signData,signType:signType,encryptKey:encryptKey})
						}
					} else {
						if(response.data.data.sign == null) {
							// VP req / SVP 사용(X) / VC 요청(O) / Sign (X)
							reqType = response.data.data.requestData[0].type;
							issuerDID = response.data.data.requestData[0].issuer[0].did;
							issuerURL = response.data.data.requestData[0].issuer[0].url;

							console.log('VPREQ_VCsend');
							this.props.navigation.push('VPREQ_VCsend',{roomNo:roomNo,socketUrl:socketUrl,userPW:userPassword,nonce:nonce,reqType:reqType,issuerDID:issuerDID,issuerURL:issuerURL,encryptKey:encryptKey})
						} else {
							// VP req / SVP 사용 / VC 요청(O) / Sign (O)
							reqType = response.data.data.requestData[0].type;
							issuerDID = response.data.data.requestData[0].issuer[0].did;
							issuerURL = response.data.data.requestData[0].issuer[0].url;
					
							signData = response.data.data.sign.data
							signType = response.data.data.sign.type
					
							console.log('VPREQ_SIGN_VCsend');
							this.props.navigation.navigate('VPREQ_SIGN_VCsend',{roomNo:roomNo,socketUrl:socketUrl,userPW:userPassword,nonce:nonce,reqType:reqType,issuerDID:issuerDID,issuerURL:issuerURL,signData:signData,signType:signType,encryptKey:encryptKey})
						}
					}
				}
			} else if(response.data.data.requestType == 'vc') {
				if(response.data.data.useSvp == true) {
					if(response.data.data.requestData == null){
						// VC req / SVP 사용 / VC 요청(X)
						console.log('VCREQ_SVP_DIDsend');
						this.props.navigation.navigate('VCREQ_SVP_DIDsend',{roomNo:roomNo,socketUrl:socketUrl,userPW:userPassword,nonce:nonce,encryptKey:encryptKey})
					} else {
						// VC req / SVP 사용 / VC 요청(O)
						reqType = response.data.data.requestData[0].type;
						issuerDID = response.data.data.requestData[0].issuer[0].did;
						issuerURL = response.data.data.requestData[0].issuer[0].url;
						this.props.navigation.pop();
						console.log('VCREQ_SVP_VCsend');
						this.props.navigation.navigate('VCREQ_SVP_VCsend',{roomNo:roomNo,socketUrl:socketUrl,userPW:userPassword,nonce:nonce,reqType:reqType,issuerDID:issuerDID,issuerURL:issuerURL,encryptKey:encryptKey})
					}
				} else {
					if(response.data.data.requestData == null){
						// VC req / SVP 사용안함 / VC 요청 (X)
						console.log('VCREQ_DIDsend');
						this.props.navigation.push('VCREQ_DIDsend',{roomNo:roomNo,socketUrl:socketUrl,userPW:userPassword,nonce:nonce,encryptKey:encryptKey})
					} else {
						// VC req / SVP 사용안함 / VC 요청 (O)
						reqType = response.data.data.requestData[0].type;
						issuerDID = response.data.data.requestData[0].issuer[0].did;
						issuerURL = response.data.data.requestData[0].issuer[0].url;
						console.log('VCREQ_VCsend');
						this.props.navigation.navigate('VCREQ_VCsend',{roomNo:roomNo,socketUrl:socketUrl,userPW:userPassword,nonce:nonce,reqType:reqType,issuerDID:issuerDID,issuerURL:issuerURL,encryptKey:encryptKey})
					}
				}
			} else {
				alert("error")
			}
		})
  	};

	customMarker = () => {

		return(
			<View style={scan.markerContainer}>


			</View>
		)
	}  
    
  	// reqType = response.data.data.requestData[0].type;
	// issuerURL = response.data.data.requestData[0].issuer[0].url;

  	render() {
		 
    	return (
			<View style={common.wrap}>

				<View style={scan.header}>
					<TouchableOpacity onPress={this.cancel}>
					<Image source={require('../screens/assets/images/png/close_scanner.png')}></Image>
					</TouchableOpacity>
				</View>
				<View style={scan.contents}>
					<QRCodeScanner 
                    showMarker={true}
					ref = {(node) => {this.scanner = node}}
					onRead={this.onSuccess}
					customMarker={this.customMarker}
					/>
					
				</View>
				
				{/* <View style={scan.footer}>
					<View style={common.buttonView}>
						<TouchableOpacity style={common.button} activeOpacity={0.8} onPress={this.cancel}>
							<Text style={common.buttonText}>취소</Text>
						</TouchableOpacity>
					</View>
				</View> */}
			</View>
    	)
  	}

	  setStateData = async() => {

					// Get password
				await SecureStorage.getItem('userToken').then((pw) => {
					this.setState({ password:pw }); // Set password
				})

			// Get dataKey
			let pw = this.state.password;
			await SecureStorage.getItem(pw).then((dk) => {
				this.setState({ dataKey:dk }); // Set dataKey
			})
	  
	  // Get userData
	  let dk = this.state.dataKey;
	  await SecureStorage.getItem(dk).then((ud) => {
		  if(ud != null) {
			  // Set state
			  let bytes = CryptoJS.AES.decrypt(ud, dk);
			  let originalText = bytes.toString(CryptoJS.enc.Utf8);
			  console.log(originalText);
			  this.setState(JSON.parse(originalText))

		  }
	  })



  
	}

	componentDidMount(){
		this.setStateData();
		this.scanner.enable()
		this.scanner.reactivate()
  	}
	  componentWillUnmount(){
		  this.scanner.disable()
	  }
}

const common = StyleSheet.create({
    wrap : { flex:1, position:'relative', backgroundColor:'#FFFFFF' },
    header : { padding:20, paddingBottom:0, },
    contents : { flex:1, position:'relative', padding:20, },
    footer : { padding:0, },
    title : { fontSize:22, fontWeight:'bold' },
    textInput : {
        width:'100%', fontSize:20, marginBottom:8,
        paddingTop:15, paddingBottom:15, paddingLeft:12, paddingRight:12, 
        borderWidth:2, borderRadius:8, borderColor:'#CED2D4',
    },
    buttonView : { width:'100%', alignItems:'center', },
    button : { 
        width:'100%', alignItems:'center', color:'#FFFFFF',
        padding:30, backgroundColor:'#1ECB9C', 
        borderWidth:0, borderRadius:0,
    },
    buttonText : { color:'#FFFFFF', fontSize:22, fontWeight:'bold' },
});

const scan = StyleSheet.create({
	header : { width:'100%', paddingTop:50, alignItems:'flex-end', paddingEnd: 16 },
	contents : { flex:1, position:'relative', },
	markerContainer: {borderRadius: 12, borderWidth: 2, borderColor: '#1ECB9C', 
	width: Dimensions.get('window').width/2, height: Dimensions.get('window').width/2},
	windowContainer: { flex: 1, position:'relative', backgroundColor: 'rgba(52, 52, 52, 0.8)'}
});



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