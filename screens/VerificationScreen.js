import React from 'react'
import { 
	StyleSheet, View, Text, Image, TextInput, ScrollView,
	TouchableOpacity, TouchableHighlight, LogBox, Animated, Easing,
	ToastAndroid, Platform, Dimensions, Alert, KeyboardAvoidingView
} from 'react-native'

import ReactNativeBiometrics from 'react-native-biometrics'
import TouchID from 'react-native-touch-id'

import CryptoJS from 'react-native-crypto-js';
import SecureStorage from 'react-native-secure-storage'
import {format} from "date-fns" // Date Format
import axios from 'axios';
import jwt_decode from "jwt-decode"


import Modal from 'react-native-modal' // Modal
import CLoader from './common/Loader'; // Loader
import CHeader from './common/Header'; // Header

var AES = require("react-native-crypto-js").AES;
import {DualDID} from '@estorm/dual-did';
const didJWT = require('did-jwt')
const Web3 = require('web3')
const web3 = new Web3('http://182.162.89.51:4313')

var imgCard = require('../screens/assets/images/png/ic_issue.png')
var imgClose = require('../screens/assets/images/png/ic_btn_cls.png')
var imageCheck = require('../screens/assets/images/png/ic_chk.png')
var imageChain = require('../screens/assets/images/png/ic_chain.png')
var verifyingLoader = require('../screens/assets/images/png/verifying_loader.png')

var socketRoom ='';
var socketURL = '';
var passwordInMobile = '';
var nonce = '';
// var ws = '';
var reqTypeOnUse = '';
var issuerDIDOnUse = '';
var issuerURLOnUse = '';
var encryptionKeyOnUse ='';
var challenger = String(Math.floor(Math.random() * 10000) + 1);

var closeIcon = require('../screens/assets/images/png/close_scanner.png');
var loadingIcon = require('../screens/assets/images/png/refresh_loading.png');
var cardIcon = require('../screens/assets/images/png/secondary.png');
var verificationFailedIcon = require('../screens/assets/images/png/verification_failed.png');


var nonce = '';
var ws = '';
var reqTypeOnUse = '';
var issuerDIDOnUse = '';
var signDataOnUse = '';
var signTypeOnUse ='';

var resultCode = false;
var resultMsg = '';

function createDualSigner (jwtSigner, ethAccount) {
  	return { jwtSigner, ethAccount }
}

function Card({vc}){
    return (
		<View style={certificateStyles.itemActualContainer}>
						<Image source={cardIcon} />
						<Text style={certificateStyles.cardLabelStyle}>{vc.vc.type[1]}</Text>
		</View> 
			
	)
}



function Info({svc}){
	return (
		<ScrollView>
			<View style={providersStyle.detailContainer}>

							<Text style={providersStyle.labelStyle}>생년월일</Text>
							<Text style={providersStyle.valueStyle} >{svc.birthday}</Text>
	
							<Text style={providersStyle.labelStyle}>이메일주소</Text>
							<Text style={providersStyle.valueStyle}>{svc.email}</Text>
	
							<Text style={providersStyle.labelStyle}>성별</Text>
							<Text style={providersStyle.valueStyle}>{svc.gender}</Text>
	
							<Text style={providersStyle.labelStyle}>이름</Text>
							<Text style={providersStyle.valueStyle}>{svc.name}</Text>
	
							<Text style={providersStyle.labelStyle}>휴대폰번호</Text>
							<Text style={providersStyle.valueStyle}>{svc.phone}</Text>
			</View>
		</ScrollView>
	)
}

export default class VerificationScreen extends React.Component {
	state = {
		password: '',
		dataKey: '',
		address: '',
		privateKey:'',
		mnemonic:'',
		VCarray:[],
		VCjwtArray:[],

		checkedArray:[],
		confirmCheckPassword:'',
		ModalShow : false,
		ViewMode: 1,

		SVCArray:[],
		type: '',
		name:'',
		SVCTimeArray:[],
		spinValue : new Animated.Value(0),
		showPasswordModal: false,
		isBiometricEnabled: false,
		isFaceEnabled: false,
        isFingerPrintEnabled: false,
		selectedCard: [],
		bnsReceived: false,
		terminalDescription: '',
		shopName: '',
		deviceName : '',
		callbackURL: '',
		terminalID: '',
		terminals : {},
        otps : '',
		tvp: '',
		decryptedToBeSavedData: '',
		

	}
  
  	//비밀번호 확인 input control
	handleConfirmPWchange = confirmCheckPassword => {
		this.setState({ confirmCheckPassword })
	}

	 biometricAuthentication = () =>{



			ReactNativeBiometrics.isSensorAvailable()
				.then((resultObject) => {
					const { available, biometryType,error } = resultObject;

					console.log('Available', available);
					console.log('BiometricType', biometryType);
					console.log('Biometric Error', error);

					if(error){
						this.setModalShow();
						console.log('Biometric authentication failed to due to ', error);
						return;
					}

					if (available && biometryType === ReactNativeBiometrics.TouchID) {
						console.log('TouchID');
						this.createSimplePrompt();
					} else if (available && biometryType === ReactNativeBiometrics.FaceID) {
						console.log('FaceID');
						this.createSimplePrompt();
					} else if (available && biometryType === ReactNativeBiometrics.Biometrics) {
						this.createSimplePrompt();
						console.log('Biometrics');
					} else {
						this.setModalShow();
					}

					
				})
		
		
	}

	showMessage = (message) => {
		if (Platform.OS === 'android') {
			ToastAndroid.show(message, ToastAndroid.SHORT);
		  } else {
			Alert.alert('Alert', message);
			// AlertIOS.alert(message);
		  }
	}

	createSimplePrompt1 = () => {
		ReactNativeBiometrics.simplePrompt({promptMessage: 'Authenticate your Smart ID Card'})
				.then((resultObject) => {
					console.log('ResultObject', resultObject)
					this.showMessage("Authentication Successful")
					this.pickVCinArray()
				}).catch(()=>{
					this.setModalShow();
				})
	}

	createSimplePrompt = () => {
		ReactNativeBiometrics.simplePrompt({promptMessage: 'Authenticate your Smart ID Card'})
				.then((resultObject) => {
					const { success, error } = resultObject

						if (success) {
							this.showMessage("Authentication Successful")
							this.pickVCinArray()
						} 

						if(error){
							this.setModalShow();
						}
					

					
				})
				.catch(() => {
					console.log('Biometrics Failed')
					this.setModalShow()
				})
	}
	createSignatire = () => {
			let epochTimeSeconds = Math.round((new Date()).getTime() / 1000).toString()
			let payload = epochTimeSeconds + 'SMART_ID_CARD'

			ReactNativeBiometrics.createSignature({
				promptMessage: 'Authenticate your Smart ID Card',
				payload: payload
			})
			.then((resultObject) => {
				const { success, signature } = resultObject

				if (success) {

				}
			})
	}

	createKeys = () => {
		ReactNativeBiometrics.biometricKeysExist()
				.then((resultObject) => {
					const { keysExist } = resultObject

					if (keysExist) {

					} else {
					ReactNativeBiometrics.createKeys('Confirm fingerprint')
						.then((resultObject) => {
							const { publicKey } = resultObject
							console.log(publicKey)
							// sendPublicKeyToServer(publicKey)
						})
					}
				})
	}

	// Cancel
	cancel = () => { 
		this.props.navigation.push('VCselect', {password:this.state.password});
		
		/*
		if(this.state.bnsReceived) this.props.navigation.push('SelectOptions'); // BNS
		else this.props.navigation.push('VCselect', {password:this.state.password}); // QR Reading
		*/
  	}

  	setStateData = async() => {

		await SecureStorage.getItem('isBiometricsEnabled').then((isBio) => {
			this.setState({isBiometricEnabled: isBio === 'true'}); // Set Biometrics
		})

		await SecureStorage.getItem('isFaceEnabled').then((isFaceEnabled) => {
			console.log('Face Data', isFaceEnabled);
			this.setState({isFaceEnabled: isFaceEnabled === 'true'}); // Set Biometrics
		})

		await SecureStorage.getItem('isFingerPrintEnabled').then((isFingerPrintEnabled) => {
			console.log('FingerPrint Data', isFingerPrintEnabled);
			this.setState({isFingerPrintEnabled: isFingerPrintEnabled === 'true'}); // Set Biometrics
		})
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

		// VC Reverse
		this.setState({ 
			VCarray:this.state.VCarray.reverse(),
			VCjwtArray:this.state.VCjwtArray.reverse()
		})

		// Set checkedArray
		// 체크된 array를 따로 구분하기 위한 arrChecked[] 를 state에 포함시킴
		// 현재 VC의 개수와 같은 길이의 array를 만들고, checked attribute를 false로 포함함
		arrChecked = [];
		for (var i = 1; i <= this.state.VCarray.length; i++){
			arrChecked = arrChecked.concat([{"checked" : false}])
		} 
		this.setState({ checkedArray: arrChecked })

		// Reset confirmCheckPassword
		this.setState({confirmCheckPassword:''})
		this.setState({selectedCard:[]})


		// 애니메이션 설정
		Animated.loop(
			Animated.timing(
				this.state.spinValue,
				{
					toValue: 1,
					duration: 3000,
					easing: Easing.linear,
					useNativeDriver: true,
				}
			)
		).start()
		
		// WebSocket Connection
		//TODO ://
		// ws = new WebSocket(socketURL);
		// ws.onopen = () => { ws.send('{"type":"authm", "no":"'+socketRoom+'"}'); }
		// ws.onmessage = (e) => { this.sendChallenger(); }
		// ws.onerror = (e) => { this.setState({ViewMode: 3}); };
		// ws.onclose = (e) => { this.setState({ViewMode: 3}); };
		// WebSocket Connection
  	}

	// SVP Function
	sendChallenger = async () => {
      	// ws.send('{"type":"challenger","data":"'+challenger+'"}');
      	// ws.onmessage = (e) => {
		// 	const json = JSON.parse(e.data);
		// 	if(json.type == "vp") this.verifyVP(json.data);
		// 	if(json.type == "exit") this.setState({ViewMode: 3});
     	// }
		// ws.onerror = (e) => { this.setState({ViewMode: 3}); };
		// ws.onclose = (e) => { this.setState({ViewMode: 3}); };
  	}

	verifyVP = async (vp) => {
		// TTA TEMP : T2 - Submitted time
		const sDatetime = format(new Date(), "yyyy-MM-dd HH:mm:ss.sss");
		// TTA TEMP : T2 - Submitted time

		const key = CryptoJS.enc.Hex.parse(encryptionKeyOnUse);
		const dec = CryptoJS.AES.decrypt(vp,key,{iv:key}).toString(CryptoJS.enc.Utf8);
		const json = JSON.parse(dec);
		const vpJwt = json.data;
		
		const privateKey = this.state.privateKey;
		const ethAccount = web3.eth.accounts.privateKeyToAccount(privateKey)
		const dualSigner = createDualSigner(didJWT.SimpleSigner(privateKey.replace('0x','')), ethAccount)
		const dualDid = new DualDID(dualSigner, 'Issuer(change later)', 'Dualauth.com(change later)',web3,'0x76A2dd4228ed65129C4455769a0f09eA8E4EA9Ae')

		const result = await dualDid.verifyVP(vpJwt, challenger);
		console.log('Result---->', result)
		const code = result.code;
		const data = result.data;
		const msg = result.msg;
		const success = result.success;
		const isTrusted = result.isTrusted;

		if(code == "000.0" && success) {
			console.log('Type---->', result.data.verifiablePresentation)
			const svcs = result.data.verifiablePresentation.verifiableCredential;
			console.log('CEO---->', svcs[0].credentialSubject.ceo)
			let svca = [];
			let svc = null;

			for(let i = 0; i < svcs.length; i++){
				svc = svcs[i].credentialSubject;
				svca.push(svc);
			}
			
			console.log('SVCAArray----->', svca);
			this.setState({ ViewMode:1, SVCArray:svca});

			// TTA TEMP : T2 - Verified time
			const vDatetime = format(new Date(), "yyyy-MM-dd HH:mm:ss.sss");
			alert("Submitted time : " + sDatetime + "\nVerified time : " + vDatetime);
			// TTA TEMP : T2 - Verified time
		}else{
			console.log('Error Here');
			this.setState({ViewMode: 3})

			// TTA TEMP : T2 - Verified time
			const vDatetime = format(new Date(), "yyyy-MM-dd HH:mm:ss.sss");
			alert("Submitted time : " + sDatetime + "\nVerified time : " + vDatetime);
			// TTA TEMP : T2 - Verified time
		}
    }

	nextPage = () => {
		if(this.state.bnsReceived) this.setState({ ViewMode:2 }); // BNS
		else this.props.navigation.push('VCselect', {password:this.state.password}); // QR Reading
	}
	// SVP Function

	// TVP Function
	verifyTVP = (tvp, nonce) => {
		// TODO : TVP 블록체인 검증 필요
		const tvpDecode = jwt_decode(tvp);
        const tvcDecode = jwt_decode(tvpDecode.vp.verifiableCredential[0]);
		const tvcCS = tvcDecode.vc.credentialSubject;
		
		let matadata = [];
		Object.keys(tvcCS).map((key) => {
			let matadataKey = [key];
			let matadataVal = tvcCS[key];

			// 오픈터미널 예외처리
			if(matadataKey == 'shopName') matadataKey = '상점명';
			if(matadataKey == 'terminalOwner') matadataKey = '터미널소유자';
			// 오픈터미널 예외처리

			let frontShow = true;
			if(matadataKey == 'callbackUrl') frontShow = false;
			if(matadataKey == 'terminalId') frontShow = false;
			
			if(frontShow) {
				matadata.push(<Text style={providersStyle.labelStyle}>{matadataKey}</Text>);
				matadata.push(<Text style={providersStyle.valueStyle}>{matadataVal}</Text>);
			}
		});

		return (
			<View style={providersStyle.detailContainer}>{matadata}</View>
		)
    }
	// TVP Function

	// Card Function
	cardStyle = index => {
    	if(this.state.checkedArray[index] != null){
      		if(this.state.checkedArray[index].checked == true){
        		return{

					borderRadius:8,
					borderWidth:1,
					borderColor: '#1ECB9C',
					paddingTop: 15,
					paddingBottom: 15,
					paddingStart:20,
					paddingEnd: 20,
					flexDirection: 'row',
					marginStart: 21,
					marginEnd: 21,
					alignItems: 'center',
					marginBottom: 21,

		 			// borderWidth:1, borderColor:'#1ECB9C', 
					// padding:20, marginBottom:15
       			}
			} else {
				return{

					borderRadius:8,
					borderWidth:1,
					borderColor: '#E5EBED',
					paddingTop: 15,
					paddingBottom: 15,
					paddingStart:20,
					paddingEnd: 20,
					flexDirection: 'row',
					marginStart: 21,
					marginEnd: 21,
					alignItems: 'center',
					marginBottom: 21,

					// borderWidth:1, borderColor:'#333333', 
					// padding:20, marginBottom:15
				}	
			}		
    	}
  	}
	
	cardSelect = e =>{
		// 현재 선택된 VC 개수 확인
		var selectedCount = 0;
		for (var i = 0; i < this.state.checkedArray.length; i++){
			if(this.state.checkedArray[i].checked == true) selectedCount += 1;
		}		
		// 현재 선택된 VC 개수 확인

		for (var i = 0; this.state.VCarray.length; i++){
			if(e == this.state.VCarray[i]){
				if(!this.state.checkedArray[i].checked == true && selectedCount > 0) {
					alert("제출할 ID는 하나만 선택 하실 수 있습니다.");
				} else {
					this.state.checkedArray[i].checked = !this.state.checkedArray[i].checked
    				//arrChecked = this.state.checkedArray
    				this.setState({checkedArray: this.state.checkedArray})
				}
				return
			}
		}
	}

	createVP = async(vc) => {

		console.log('VCCCCC', vc);


        const privateKey = this.state.privateKey;
		const ethAccount = web3.eth.accounts.privateKeyToAccount(privateKey)
		const dualSigner = createDualSigner(didJWT.SimpleSigner(privateKey.replace('0x','')), ethAccount)
		const dualDid = new DualDID(dualSigner, 'Issuer(change later)', 'Dualauth.com(change later)',web3,'0x76A2dd4228ed65129C4455769a0f09eA8E4EA9Ae')
		
		const signObj = {"data" : vc};

		
		// const signVC = await dualDid.createVC("http://www.smartidcard.com/vc/mobileSign",['VerifiableCredential', 'mobileSign'],"holderSign",signObj,{"type":"none"},parseInt(new Date().getTime()/1000) + 60 * 5,
		// new Date().toISOString());

		console.log('TVP Here', this.state.tvp)
		console.log('Otps', this.state.otps);
		console.log('TVP', this.state.tvp);
	
		const vp = await dualDid.createVP(vc,this.state.otps)
		console.log('VP----->1217',vp);

		this.sendDataToCallbackURL(vp);
    }


	cardSend = () => {
		var cardSelected = false;
		var checkedCard = [];
		for(var i = 0; i< this.state.checkedArray.length; i++){
			if(this.state.checkedArray[i].checked == true){
				 cardSelected = true; 
				 this.state.selectedCard = this.state.VCarray[i];
				 checkedCard = this.state.VCarray[i];
				 break; 
			}
		}

		console.log('Checked card', this.state.selectedCard);


		if(!cardSelected) {
			alert("VC를 선택해 주세요") 
		}else {
			this.state.isFaceEnabled ? this.biometricAuthentication(): this.setModalShow()

			/*
			if(this.state.bnsReceived){
				const vc= JSON.parse(JSON.stringify(this.state.selectedCard)).vc
				this.createVP(vc);
			}else{
				this.state.isFaceEnabled ? this.biometricAuthentication(): this.setModalShow()
			}
			*/
	 	}
	}
	// Card Function

	// Modal Function
	setModalShow = () => {
		this.setState({ModalShow:!this.state.ModalShow})
	}

	passwordCheck = () => {
    	if(this.state.confirmCheckPassword == this.state.password){
			this.setModalShow()
			this.pickVCinArray()
   		} else {
      		alert('비밀번호가 일치하지 않습니다.')
    	}
  	}

   	// pickVCinArray
   	// 현재 제출해야 하는 VC를 VCjwtArray에서 가져와 jwt로 제출할 수 있도록
   	// vcSubmitArr[] 에 포함시킨다.
   	// 생성된 vcSubmitArr[]를 makeVCJWTandSign()로 보낸다
	pickVCinArray = () => {
		if(this.state.bnsReceived){
			const vc = JSON.parse(JSON.stringify(this.state.selectedCard)).vc
			console.log('Pick VC in Array-!', this.state.VCjwtArray);
			var vcSubmitArr = [];
			for(var i = 0; i<this.state.VCjwtArray.length;i++){
			if(this.state.checkedArray[i].checked == true){
				this.setState({name:  this.state.VCarray[i].vc.credentialSubject.name}) // 스캐닝 화면에서 필요한 변수
				this.setState({type: this.state.VCarray[i].vc.type[1]}) // 스캐닝 화면에서 필요한 변수

				var jwtString = this.state.VCjwtArray[i].split(',')[1].split(':')[1]
				vcSubmitArr = vcSubmitArr.concat([jwtString.substring(1,jwtString.length-2)])
			}
	  		console.log('Picked VC---->', vcSubmitArr);
    	}

			this.createVP(vcSubmitArr);
			console.log('VCArray',this.state.VCjwtArray);
		}

		
		
		// var vcSubmitArr = [];
		// for(var i = 0; i<this.state.VCjwtArray.length;i++){
		// 	if(this.state.checkedArray[i].checked == true){
		// 		console.log('Name ====>', this.state.VCarray[i].vc.credentialSubject.name);
		// 		console.log('Name ====>', this.state.VCarray[i].vc.type[1]);

		// 	this.setState({name:  this.state.VCarray[i].vc.credentialSubject.name})
		// 	this.setState({type: this.state.VCarray[i].vc.type[1]})

		// 		var jwtString = this.state.VCjwtArray[i].split(',')[1].split(':')[1]
		// 		vcSubmitArr = vcSubmitArr.concat([jwtString.substring(1,jwtString.length-2)])
		// 	}
		// }
		
		// this.makeVPJWT(vcSubmitArr)
		
	}

	// makeVPJWT
	//pickVCinArray에서 전달받은 VC의 JWT를 VP로 만들어 제출
	// @param { pickVCinArray 로부터 전달받은 VCjwt의 array} vcjwtArray
	makeVPJWT = async (vcjwtArray) => {
		const privateKey = this.state.privateKey;
		const ethAccount = web3.eth.accounts.privateKeyToAccount(privateKey)
		const dualSigner = createDualSigner(didJWT.SimpleSigner(privateKey.replace('0x','')), ethAccount)
		const dualDid = new DualDID(dualSigner, 'Issuer(change later)', 'Dualauth.com(change later)',web3,'0x76A2dd4228ed65129C4455769a0f09eA8E4EA9Ae')
		
		const vp = await dualDid.createVP(vcjwtArray,nonce)
		var key = CryptoJS.enc.Hex.parse(encryptionKeyOnUse)
		var cipherText = CryptoJS.AES.encrypt(vp,key,{iv:key}).toString();

		console.log('CipherText', cipherText);
		console.log('Key', key);
		console.log('IV', key);

		// ws.send('{"type":"vp", "data":"'+cipherText+'"}');
		// ws.onmessage = (e) => {};
		// ws.onerror = (e) => {};
		// ws.onclose = (e) => {};
		
		this.successVPsubmit();
	}

	successVPsubmit = () => {
		console.log('SVC Array', this.state.SVCArray);
		// this.saveSVCLocally();
		this.saveVerifiedData();
		// WebSocket Close
		// ws.close();
		// ws.onmessage = (e) => {};
		// ws.onerror = (e) => {};
		// ws.onclose = (e) => {};
		// WebSocket Close

		this.props.navigation.push('CardScanningTest',{name: this.state.name, type: this.state.type});
		// this.props.navigation.push('VCselect',{password:this.state.password});
	}

	updateItemInStorage = async(response, verifiedJSON, keyJSON) => {

		var localDataArray = JSON.parse(response);
		var newData= {[new Date().toLocaleDateString()] : verifiedJSON};
		var updatedDataArray  = localDataArray.concat(newData);
		console.log('UpdatedDataArray-->', JSON.stringify(updatedDataArray));
		
		await SecureStorage.setItem(keyJSON, JSON.stringify(updatedDataArray));
		const got = await SecureStorage.getItem(keyJSON)
		console.log('Old --->',got)
	}

	addNewItemInStorage = async(dataArray, keyJSON) => {

		SecureStorage.setItem(keyJSON, JSON.stringify(dataArray));
		const got = await SecureStorage.getItem(keyJSON)
		console.log('New --->', got)
	}


	 saveVerifiedData = async() =>{
		var dataArray = [];
		var today = new Date().toLocaleDateString()
		var keyJSON = JSON.stringify(this.state.selectedCard);
		var verifiedJSON = '';
		if(this.state.bnsReceived){
			verifiedJSON = JSON.stringify(this.state.decryptedToBeSavedData);
		}else{
			verifiedJSON = JSON.stringify(this.state.SVCArray);
		}
	

		//Data Array
		var data = today + "SmartIDCard" + verifiedJSON;
		dataArray.push({[new Date().toLocaleDateString()] : verifiedJSON});
		 
		console.log('Data', data);
		console.log('KeyJSON', keyJSON);
		console.log('DataArray', dataArray);

		await SecureStorage.getItem(keyJSON)
		.then((response) => {
			if(response != null){
				this.updateItemInStorage(response, verifiedJSON, keyJSON);
			}else{
				this.addNewItemInStorage(dataArray, keyJSON);
			}

		})
		
	}

	mockLocal = async() => {
		let today = '1/27/2022';
		console.log('Today', today);


		var SVCTimeArrayLocal = await SecureStorage.getItem('svca');
		if(SVCTimeArrayLocal){
			console.log('First Local...',SVCTimeArrayLocal);
			var isPresent = false;
			JSON.parse(SVCTimeArrayLocal).map((timeStamp,index) => {
				if(timeStamp[today] != null && timeStamp[today] != 'undefined'){
					isPresent = true;
				}
			});

			if(!isPresent){
				var object = {};
                object[today] = this.state.SVCArray;
				this.setState(
                    {
                        SVCTimeArray: SVCTimeArrayLocal.concat(object),
                    },
                )				
				console.log('First Date Time....', this.state.SVCTimeArray);


			}
		}

	}

	saveSVCLocally = async() => {

			var today = new Date().toLocaleDateString()
		     today = '1/25/2022';
			console.log('Today===>',today);
	
			var SVCTimeArrayLocal = await SecureStorage.getItem('svca');
			if(SVCTimeArrayLocal){
				var isPresent = false;
				JSON.parse(SVCTimeArrayLocal).map((timeStamp,index) => {
					if(timeStamp[today] != null && timeStamp[today] != 'undefined'){
						isPresent = true;
					}
				});
				if(!isPresent){
					var object = {};
					object[today] = this.state.SVCArray;
					console.log('Object--->',object);
			
					this.setState({
						SVCTimeArray: SVCTimeArrayLocal
					})
					console.log('Before State', this.state.SVCTimeArray);

					// JSON.parse(SVCTimeArrayLocal).push(object);

					this.setState({
						SVCTimeArray: JSON.stringify(this.state.SVCTimeArray).slice(0,-2)+
						","+{
							today : this.state.SVCArray
						}
						+"]"
					})
					console.log('After State', this.state.SVCTimeArray);

		
					console.log('First Time in SVC Array....', this.state.SVCTimeArray);
	
					// SecureStorage.setItem('svca', JSON.stringify(this.state.SVCTimeArray));

					return;
				}
				JSON.parse(SVCTimeArrayLocal).map((timeStamp, index) =>{
					console.log('TimeStamp', timeStamp);
					if(timeStamp[today] != null && timeStamp[today] != 'undefined'){
						var data = timeStamp[today];
						var newData = data.concat(this.state.SVCArray[0]);
	
						var object = {};
						object[today] = newData;
					   
						this.state.SVCTimeArray[index] = object;

						console.log('TimeStampArray', this.state.SVCTimeArray);
	
						this.setState({});
	
						console.log('Repeating Time....', this.state.SVCTimeArray);
						SecureStorage.setItem('svca', JSON.stringify(this.state.SVCTimeArray));


						console.log('Time Array', this.state.SVCTimeArray);
						console.log('Data', newData);
					 
					}
				})


			}else{
				var object = {};
                object[today] = this.state.SVCArray;
				this.setState(
                    {
                        SVCTimeArray: this.state.SVCTimeArray.concat(object),
                    },
                )				
				console.log('First Time....', this.state.SVCTimeArray);

				SecureStorage.setItem('svca', JSON.stringify(this.state.SVCTimeArray));

			}
	}

	sendDataToCallbackURL = async(VP) => {
		/*
		console.log('TerminalID', this.state.terminalID);
		console.log('VP', VP);
		console.log('TerminalOTP', this.state.otps);
		console.log('CallbackURL', this.state.callbackURL);
		*/

		//this.setState({ callbackURL:"http://idcard.namusoft.co.kr/deviceApi/verify" }) // TEMP

		this.setState({ViewMode: 4});

		let params = "?TerminalID=" + this.state.terminalID.replace("\n", "") + "&TerminalOTP=" + this.state.otps + "&VP=" + VP;
		const headers = { 'Content-type': 'application/json; charset=UTF-8' }
		const response = await axios.get(this.state.callbackURL + params, {headers});
		
		console.log('Response.data', response.data);

		if(response) {
			this.setState({ViewMode: 5});
			setTimeout(() => { this.props.navigation.push('VCselect',{password:this.state.password}); }, 2500)
		}

		/*
		if(response.data.resultCode != undefined) { if(response.data.resultCode === "ok") resultCode = true; }
		if(response.data.result != undefined) resultCode = response.data.result;

		if(response.data.resultMsg != undefined) resultMsg = response.data.resultMsg;
		if(response.data.msg != undefined) resultMsg = response.data.msg;

		let error = false;
		if(!resultCode) { error = true; console.log('OT ERROR', resultMsg); }
		if(error) {
			this.setState({ViewMode: 6});
		}else{
			this.saveVerifiedData();
			this.setState({ViewMode: 5});
			//this.props.navigation.push('CardScanningTest',{name: this.state.name, type: this.state.type});
			//this.props.navigation.push('VCselect',{password:this.state.password});
		}
		*/		
	}

	hidePasswordModal = () => {
        this.setState({
            showPasswordModal: false
        })
    }

    showPasswordModal = () => {
        this.setState({
            showPasswordModal: true
        })
    }

	// Modal Function  	

  	render() {
		LogBox.ignoreAllLogs(true)
		
		encryptionKeyOnUse = encryptionKey;
		
		const { confirmCheckPassword, ModalShow, ViewMode, SVPValue } = this.state

		// 애니메이션 수행
		const spin = this.state.spinValue.interpolate({
			inputRange: [0, 1],
			outputRange: ['0deg', '360deg'],
		});
		// 애니메이션 수행

		const {navigation} = this.props
		const BLE = navigation.getParam('BLE', 'null')
        
		if(BLE !== 'null' && BLE === 'BLE'){
			console.log('BLE Entered');	
		}
		const userRoom = navigation.getParam('roomNo',"value")
		const userSocket = navigation.getParam('socketUrl',"Url")
		const userPW = navigation.getParam('userPW',"passwordValue")
		const userNonce = navigation.getParam('nonce',"nonceVal")
		const issuerReqType = navigation.getParam('reqType',"reqTypeVal")
		const issuerDID = navigation.getParam('issuerDID',"issuerDIDVal")
		const issuerURL = navigation.getParam('issuerURL',"issuerURLVal")
		const encryptionKey = navigation.getParam('encryptKey',"encryptKeyVal")

		socketRoom = userRoom;
		socketURL = userSocket;
		nonce = userNonce;
		reqTypeOnUse = issuerReqType;
		issuerDIDOnUse = issuerDID;
		issuerURLOnUse = issuerURL;
		passwordInMobile = userPW;
		encryptionKeyOnUse = encryptionKey;

		console.log(spin);
		
		if(ViewMode == 2){
			return(
				<View style={certificateStyles.rootContainer}>
					<TouchableOpacity  onPress={this.cancel}>
						<View style={certificateStyles.closeContainer}>
							<Image source={closeIcon} />
						</View>
					</TouchableOpacity>
					<Text style={certificateStyles.headerStyle}>ID를 선택하시고 제출하세요.</Text>
						<View style={certificateStyles.listWrapper}>
							{this.state.VCarray.map((vc, index)=>{
								var vcShow = false;

								if(vc.vc.type[1] === '사원증'){ vcShow = true; }
								if(vc.vc.type[1] === '인증서'){
									vcShow = true;
									if(this.state.terminalID === "000003000000000001") vcShow = false;
									if(this.state.terminalID === "000003000000000002") vcShow = false;
								}

								if(vcShow){
									return(
										<TouchableOpacity style={this.cardStyle(index)} onPress={() => this.cardSelect(vc)}>
											<Card vc={vc} key={vc.exp}/>
										</TouchableOpacity>
									)
								}
							})}
						</View>
						<TouchableOpacity onPress={() => {
							console.log('FaceEnabled', this.state.isFaceEnabled)
							this.cardSend()
						}}>
						<View style={certificateStyles.buttonContainer}>
							<Text style={certificateStyles.buttonLabelStyle}>제출</Text>
						</View>
					</TouchableOpacity>
					<Modal
						style={modal.wrap}
						animationIn={'slideInUp'}
						backdropOpacity={0.5}
						isVisible={ModalShow}
					>
						<View style={modal.header}>
							<TouchableOpacity 
								style={modal.close} 
								activeOpacity={0.8} 
								onPress={this.setModalShow}
							>
								<Image source={imgClose}></Image>
							</TouchableOpacity>
						</View>
						<KeyboardAvoidingView style={modal.contents}>
							<Text style={modal.title}>비밀번호를 입력하세요</Text>
							<TextInput
								name='confirmCheckPassword'
								value={confirmCheckPassword}
								placeholder='비밀번호'
								secureTextEntry
								onChangeText={this.handleConfirmPWchange}
								style={modal.textInput}
							/>
							<TouchableOpacity 
								style={modal.button} 
								activeOpacity={0.8} 
								onPress={this.passwordCheck}
							>
								<Text style={modal.buttonText}>확인</Text>
							</TouchableOpacity>
						</KeyboardAvoidingView>
					</Modal>
				</View>
			)
		}

		if(ViewMode == 3) {
			return (
				<ScrollView style={providersStyle.scrollContainer}>
					<View style={providersStyle.rootContainer}>
						<TouchableOpacity onPress={this.cancel}>
							<View style={providersStyle.closeContainer}>
								<Image source={closeIcon} />
							</View>
						</TouchableOpacity>
						<Text style={providersStyle.headerStyle}>검증된 서비스 제공자의 정보입니다.</Text>
						<View style={providersStyle.errorStatusContainer}>
							<Text style={providersStyle.statusLabel}>검증여부 확인</Text>
							<View style={providersStyle.errorContainer}>
								<Text style={providersStyle.errorLabelStyle}>{'검증실패'} </Text>
							</View>
						</View>
						<View style={{flexDirection:'column',height: Dimensions.get('window').height/2, justifyContent:'center'}}>
							<Image source={verificationFailedIcon} style={providersStyle.failedImageStyle}/>
						</View>
						<TouchableOpacity onPress={this.cancel}>
							<View style={providersStyle.buttonContainer}>
								<Text style={providersStyle.buttonLabelStyle}>닫기</Text>
							</View>
						</TouchableOpacity>
					</View>
				</ScrollView>
			)
		}

		if(ViewMode == 4) {
			return (
				<View style={page.resultContent}>
					<Image source={require('../screens/assets/images/png/card_scan.png')} style={page.resultImage}></Image>
					<Text style={page.resultText}>ID를 제출하고 있습니다...</Text>
				</View>
			)		
		}

		if(ViewMode == 5) {
			return (
				<View style={page.resultContent}>
					<Image source={require('../screens/assets/images/png/submit_ok.png')} style={page.resultImage}></Image>
					<Text style={page.resultText}>ID 제출이 완료되었습니다.</Text>
				</View>
			)		
		}

		if(ViewMode == 6) {
			return (
				<View style={page.resultContent}>
					<Image source={require('../screens/assets/images/png/submit_fail.png')} style={page.resultImage}></Image>
					<Text style={page.resultText}>ID 제출이 실패하였습니다.</Text>
				</View>
			)
		}
				
		return (
			<ScrollView>
				<View style={providersStyle.rootContainer}>
					<TouchableOpacity onPress={this.cancel}>
						<View style={providersStyle.closeContainer}>
							<Image source={closeIcon} />
						</View>
					</TouchableOpacity>
					<Text style={providersStyle.headerStyle}>검증된 서비스 제공자의 정보입니다.</Text>
						<View style={providersStyle.verifiedNewStatusContainer}>
							<Text style={providersStyle.statusLabel}>검증여부 확인</Text>
							<View style={providersStyle.verifiedNewContainer}>
								<Text style={providersStyle.verifiedNewLabelStyle}>인증완료</Text>
							</View>
						</View>

						{
							this.state.bnsReceived
							? this.verifyTVP(this.state.tvp, this.state.terminalID)
							: null
						}

						{!this.state.bnsReceived && this.state.SVCArray.map((svc,index) => {
							return (
								<Info svc={svc} key={index}/>
							)
						})}

						<TouchableOpacity onPress={this.nextPage}>
							<View style={providersStyle.buttonContainer}>
								<Text style={providersStyle.buttonLabelStyle}>
									{ this.state.bnsReceived == true ? "다음" : "확인" }
								</Text>
							</View>
						</TouchableOpacity>
						<View>
					</View>
				</View>
			</ScrollView>
		)
	}
  
  	componentDidMount(){
   		this.setStateData();
        
		const resultData = this.props.navigation.getParam('resultData', null);
		const decryptedData = this.props.navigation.getParam('decryptedData', null);
		const VCForm = this.props.navigation.getParam('vcform', null);
		const shopName = this.props.navigation.getParam('shopName', null);
		const terminalDescription = this.props.navigation.getParam('terminalDescription',null);
		const deviceName = this.props.navigation.getParam('deviceName',null);
		const tvp = this.props.navigation.getParam('tvp', null);
		const otpData = this.props.navigation.getParam('otpData', null);
		const terminals= this.props.navigation.getParam('terminals', null);

		if(decryptedData && VCForm){
			/*
			console.log('DecryptedData--->', decryptedData);
			console.log('terminals--->', terminals);
			console.log('CallbackURL--->', decryptedData.vc.credentialSubject.callbackUrl)
			console.log('TerminalID---->',decryptedData.vc.credentialSubject.terminalId)
			console.log('TVP--->!!!!!', tvp);
			console.log('VCForm---->', VCForm);
			console.log('SelectedOtp--->', otpData);
			console.log('SelectedTerminal--->', terminals);
			*/

			this.setState({decryptedToBeSavedData: terminals});
			this.setState({callbackURL: decryptedData.vc.credentialSubject.callbackUrl})
			this.setState({terminalID: decryptedData.vc.credentialSubject.terminalId})
			this.setState({tvp: tvp});
			this.setState({bnsReceived:true})
			if(shopName !=null && terminalDescription != null){ this.setState({shopName: shopName, terminalDescription: terminalDescription}); }
			if(deviceName != null){ this.setState({ deviceName : deviceName }); }
			if(otpData != null && terminals != null){ this.setState({otps: otpData, terminals: terminals}) }
			
			return;
		}

		if(resultData){
			/*
			console.log('Result Data', resultData);
			console.log('VerifiablePresentation--->', resultData.verifiablePresentation);
			console.log('VerifiableCredential--->', svcs);
			console.log('CredentialSubject--->', svcs[0].credentialSubject)
			console.log('SVCAArray----->', svca);
			*/

			const svcs = resultData.verifiablePresentation.verifiableCredential;
		
			let svca = [];
			let svc = null;

			for(let i = 0; i < svcs.length; i++){
				svc = svcs[i].credentialSubject;
				svca.push(svc);
			}

			this.setState({ ViewMode:1, SVCArray:svca});

			// TTA TEMP : T2 - Verified time
			const vDatetime = format(new Date(), "yyyy-MM-dd HH:mm:ss.sss");
			// alert("Submitted time : " + sDatetime + "\nVerified time : " + vDatetime);
			// return;
		}   
		console.log("Triggered1");
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

const page = StyleSheet.create({
	buttonView : { width:'100%', flexDirection:'row', alignItems:'center', },
	button : { 
        width:'50%', alignItems:'center', color:'#FFFFFF',
        padding:30, borderWidth:0, borderRadius:0,
    },
	buttonLeft : { backgroundColor:'#1ECB9C', },
	buttonRight : { backgroundColor:'#999999', },
	card : { 
		alignItems:'center', flexDirection:'row'
	},
	cardFirst : { marginRight:10 },
	cardSecond : { },
	cardImage : { marginRight:10, },
	cardText : { color:'#333333', fontSize:20, fontWeight:'bold', },
	header : { flexDirection:'row', }, 
	title : { fontSize:22, fontWeight:'bold', marginBottom:22, },
	information : { 
		borderRadius:8, paddingTop:14, paddingBottom:14, 
		paddingLeft:24, paddingRight:24, backgroundColor:'#F5F8FB',	
	},
	informationEmpty : { width:'100%', height:'100%', flexDirection:'row', justifyContent:'center', alignItems:'center', },
	informationBlock : { paddingTop:10, paddingBottom:10, },
	informationTitle : { flexDirection:'row', },
	informationTitleText : { marginLeft:5, fontSize:20, fontWeight:'bold', },
	informationContent : { flexDirection:'row', },
	informationContentText : { fontSize:18, color:'#7D848F', marginTop:5, marginLeft:23, flex:1, flexWrap:'wrap', },
	animation : {
		flexDirection:'row', borderRadius:8, right:0, position:'absolute', padding:10, 
		backgroundColor:'#7ae4ff', justifyContent:'center', alignItems:'center', 
		/*
		background:linear-gradient(132deg, '#dcfff6', '#7ae4ff', '#defff0');
		backgroundSize:300% 300%, animation: AnimationName 1.5s ease infinite,
		*/
	},
	animationText : { padding:8, paddingRight:0, fontSize:18, fontWeight:'bold', },

	// ADD
	resultContent : { flex:1, padding:10, alignItems:'center', justifyContent: 'center', },
	resultImage : { paddingLeft:20, paddingRight:20, },
	resultText : { fontSize:20, fontWeight:'bold', textAlign:'center', marginTop:30, color:'#333333' }
	// ADD
});

const modal = StyleSheet.create({
    wrap : {
        position:'absolute', width:'100%', height:'auto', zIndex:20, 
        backgroundColor:'#FFFFFF', padding:20, margin:0, bottom: 0, 
        borderTopRightRadius:16, borderTopLeftRadius:16,
    },
    header : { position:'relative', height:50, },
	close : { position:'absolute', right:0 },
    contents : {},
	textInput : {
        // width:'100%', fontSize:20, marginBottom:8,
        // paddingTop:15, paddingBottom:15, paddingLeft:12, paddingRight:12, 
        // borderWidth:2, borderRadius:8, borderColor:'#CED2D4',

		fontSize:16, marginBottom:8,
        paddingTop:15, paddingBottom:15, paddingLeft:12, paddingRight:12, 
        borderWidth:1, borderRadius:6, borderColor:'#CED2D5',marginTop: 24,
		// marginStart: 24, marginEnd: 24
    },
    title : { 
		color:'#1A2433',
		fontSize: 18,
		// marginStart: 24,
		// letterSpacing:-0.6, fontSize:22, marginBottom:20, fontWeight:'bold', 
	},
	cards : { 
		width:'100%', marginBottom:20, 
		flex:1, flexDirection:'row', justifyContent:'flex-start',
	},
	card : { 
		flex:0.5, borderWidth:1, borderColor:'#333333', borderRadius:8,
		paddingTop:20, paddingBottom:20, alignItems:'center',
	},
	cardFirst : { marginRight:10 },
	cardSecond : { },
	cardImage : { marginBottom:10 },
	cardText : { color:'#333333', fontSize:20, fontWeight:'bold', textAlign:'center' },
    button : { 
        // width:'100%', backgroundColor:'#ffffff', 
        // padding:0, paddingTop:20, paddingBottom:20, 
        // borderWidth:1, borderColor:'#333333', borderRadius:8,
        // flexDirection:'row', justifyContent:'center', alignItems:'center',
		
		backgroundColor: '#1ECB9C',
        borderRadius: 8,
        paddingTop: 15,
        paddingBottom:15,
        paddingStart: 32,
        paddingEnd:32,
        marginBottom: 20,
        // marginStart: 24,
        // marginEnd: 24,
        marginTop: 24,
    },
    buttonText : {
		//  color:'#333333', fontWeight:'bold', fontSize:22, paddingLeft:10,

		 color: '#FFFFFF',
        fontWeight:'600',
        fontSize: 18,
        alignSelf: 'center'
		
		},
});


const providersStyle = StyleSheet.create({

	scrollContainer: {
		backgroundColor: '#ffffff',
        flexGrow: 1,
		flexDirection: 'column'

	},

    rootContainer: {
        backgroundColor: '#ffffff',
        flexGrow: 1,
		flexDirection: 'column'
    },

    closeContainer: {
        flexDirection:'row',
        marginTop: 20,
        padding: 20,
        marginBottom: 20,
        justifyContent: 'flex-end',
    },

    headerStyle:{
        color: '#1A2433',
        fontSize: 18,
        marginStart: 24,
        marginBottom: 22,
    },

	loadingStyle: {
		
	},

	verifiedStatusContainer:{
		borderRadius: 8,
        backgroundColor:'#FEF2EF',
        marginStart: 24,
        marginEnd: 24,
        padding: 16,
        flexDirection: 'row',
        alignItems:'center',
        justifyContent:'space-between'
	},

	verifiedNewStatusContainer:{
		borderRadius: 8,
        backgroundColor:'#EFF8FF',
        marginStart: 24,
        marginEnd: 24,
        padding: 16,
        flexDirection: 'row',
        alignItems:'center',
        justifyContent:'space-between'
	},

	errorStatusContainer:{
		borderRadius: 8,
        backgroundColor:'#FEF2EF',
        marginStart: 24,
        marginEnd: 24,
        padding: 16,
        flexDirection: 'row',
        alignItems:'center',
        justifyContent:'space-between'
	},


    statusContainer: {
        borderRadius: 8,
        backgroundColor:'#EEFCF8',
        marginStart: 24,
        marginEnd: 24,
        padding: 16,
        flexDirection: 'row',
         alignItems:'center',
         justifyContent:'space-between'
    },

    statusLabel: {
        color: '#44424A',
        fontWeight: '600',
        fontSize: 16,
    },

	errorLabel: {
        color: '#E1451A',
        fontWeight: '600',
        fontSize: 16,
    },

	verifiedContainer: {
		borderRadius: 20,
		backgroundColor: '#F7AF9B'
	},

	verifiedNewContainer: {
		borderRadius: 20,
		backgroundColor: '#C8E7FF'
	},



	verifiedLabelStyle: {
		color: '#E1451A',
        fontSize: 16,
        fontWeight: '600',
        paddingStart: 12,
        paddingEnd: 12,
        paddingTop: 8,
        paddingBottom: 8,
	},

	verifiedNewLabelStyle: {
		color: '#0083FF',
        fontSize: 16,
        fontWeight: '600',
        paddingStart: 12,
        paddingEnd: 12,
        paddingTop: 8,
        paddingBottom: 8,
	},

	errorLabelStyle: {
		color: '#E1451A',
        fontSize: 16,
        fontWeight: '600',
        paddingStart: 12,
        paddingEnd: 12,
        paddingTop: 8,
        paddingBottom: 8,
	},

	failedImageStyle: {
		alignSelf: 'center',
	},
    loadingContainer: {
        borderRadius: 20,
        backgroundColor: '#BAEEE1',
    },

	errorContainer: {
		borderRadius: 20,
        backgroundColor: '#F7AF9B',
	},

    loadingLabelStyle: {
        color: '#0083FF',
        fontSize: 16,
        fontWeight: '600',
        paddingStart: 12,
        paddingEnd: 12,
        paddingTop: 8,
        paddingBottom: 8,
    },

	loadingNewLabelStyle: {
        color: '#1ECB9C',
        fontSize: 16,
        fontWeight: '600',
        paddingStart: 12,
        paddingEnd: 12,
        paddingTop: 8,
        paddingBottom: 8,
    },

	errorLabelStyle: {
        color: '#E1451A',
        fontSize: 16,
        fontWeight: '600',
        paddingStart: 12,
        paddingEnd: 12,
        paddingTop: 8,
        paddingBottom: 8,
    },

    detailContainer: {
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#E5EBED',
        marginStart: 27,
        marginEnd: 27,
        padding: 18,
        marginTop: 21,

    },

	refreshStyle: {
		marginTop:20,
		marginBottom: 20,
	},

    labelStyle: {
        color: 'rgba(26, 36, 51, 0.9)',
        fontWeight: '600',
        fontSize:16,
        marginBottom: 8,

    },

    valueStyle: {
        color: 'rgba(153, 153, 153, 0.9)',
        fontSize: 15,
        fontWeight: '500',
        marginBottom: 18,
    },

    buttonContainer: {
        backgroundColor: '#1ECB9C',
        borderRadius: 8,
        paddingTop: 15,
        paddingBottom:15,
        paddingStart: 32,
        paddingEnd:32,
        marginBottom: 20,
        marginStart: 24,
        marginEnd: 24,
        marginTop: 24,
    },

    buttonLabelStyle: {
        color: '#FFFFFF',
        fontWeight:'600',
        fontSize: 18,
        alignSelf: 'center'
    },

	
})

const certificateStyles = StyleSheet.create({

    rootContainer: {
        backgroundColor: '#ffffff',
        flex: 1,
    },

    closeContainer: {
        flexDirection:'row',
        marginTop: 20,
        padding: 20,
        marginBottom: 20,
        justifyContent: 'flex-end',

    },

    headerStyle:{
        color: '#1A2433',
        fontSize: 18,
        marginStart: 24,
        marginBottom: 22,

    },

	itemActualContainer: {
		flexDirection: 'row',
		alignItems: 'center',
	},

    itemContainer: {
        borderRadius:8,
        borderWidth:1,
        borderColor: '#E5EBED',
        paddingTop: 15,
        paddingBottom: 15,
        paddingStart:20,
        paddingEnd: 20,
        flexDirection: 'row',
        marginStart: 21,
        marginEnd: 21,
        alignItems: 'center',
        marginBottom: 21,
    },

    cardLabelStyle: {
        color: 'rgba(26, 36, 51, 0.9)',
        fontSize: 16,
        fontWeight: '500',
        marginStart: 35,

    },
    listWrapper: {
        flex: 1,
    },

    buttonContainer: {
        backgroundColor: '#1ECB9C',
        borderRadius: 8,
        paddingTop: 15,
        paddingBottom:15,
        paddingStart: 32,
        paddingEnd:32,
        marginBottom: 20,
        marginStart: 24,
        marginEnd: 24,
        marginTop: 24,
    },

    buttonLabelStyle: {
        color: '#FFFFFF',
        fontWeight:'600',
        fontSize: 18,
        alignSelf: 'center'
    },

    cardItem : { 
		width:'80%', height:400, backgroundColor:'#1ECB9C',
    	borderRadius:12, position:'relative', marginLeft:'10%', marginRight:'10%',
		paddingTop:20, paddingBottom:20, paddingLeft:30, paddingRight:30,
	},

})