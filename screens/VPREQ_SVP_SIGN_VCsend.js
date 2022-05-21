import React from 'react'
import { 
	StyleSheet, View, Text, Image, TextInput, ScrollView,
	TouchableOpacity, TouchableHighlight, LogBox, Animated, Easing,
	ToastAndroid, Platform, Dimensions, Alert, SafeAreaView,
	KeyboardAvoidingView
} from 'react-native'

import ReactNativeBiometrics from 'react-native-biometrics'
import TouchID from 'react-native-touch-id'

import CryptoJS from 'react-native-crypto-js';
import SecureStorage from 'react-native-secure-storage'
import {format} from "date-fns" // Date Format
import { WebView } from 'react-native-webview';
import jwt_decode from "jwt-decode"

import Modal from 'react-native-modal' // Modal
import CLoader from './common/Loader'; // Loader
import CHeader from './common/Header'; // Header

var AES = require("react-native-crypto-js").AES;
import {DualDID} from '@estorm/dual-did';
import {createIconSetFromFontello} from 'react-native-vector-icons';
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
var ws = '';
var reqTypeOnUse = '';
var issuerDIDOnUse = '';
var issuerURLOnUse = '';
var signTypeOnUse = '';
var signDataOnUse = '';
var signDataHtml = '';
var encryptionKeyOnUse ='';
var challenger = String(Math.floor(Math.random() * 10000) + 1);

var closeIcon = require('../screens/assets/images/png/close_scanner.png');
var loadingIcon = require('../screens/assets/images/png/refresh_loading.png');
var cardIcon = require('../screens/assets/images/png/secondary.png');
var verificationFailedIcon = require('../screens/assets/images/png/verification_failed.png');

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
				<Text style={providersStyle.labelStyle}>도메인명</Text>
				<Text style={providersStyle.valueStyle} >{svc.domain}</Text>

				<Text style={providersStyle.labelStyle}>사업자명</Text>
				<Text style={providersStyle.valueStyle}>{svc.company}</Text>

				<Text style={providersStyle.labelStyle}>대표자명</Text>
				<Text style={providersStyle.valueStyle}>{svc.ceo}</Text>

				<Text style={providersStyle.labelStyle}>사업자주소</Text>
				<Text style={providersStyle.valueStyle}>{svc.address}</Text>

				<Text style={providersStyle.labelStyle}>사업자전화번호</Text>
				<Text style={providersStyle.valueStyle}>{svc.phone}</Text>
			</View>
		</ScrollView>
	)
}

export default class VPREQ_VCsend extends React.Component {
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
		ViewMode: 0,

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
				console.log('Biometrics');
				this.createSimplePrompt();
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

	// Cancel
	cancel = () => { 
		// WebSocket Exit
		ws.send('{"type":"exit"}');
		ws.onmessage = (e) => {};
		ws.onerror = (e) => {};
		ws.onclose = (e) => {};
		// WebSocket Exit

		// WebSocket Close
		ws.close();
		ws.onmessage = (e) => {};
		ws.onerror = (e) => {};
		ws.onclose = (e) => {};
		// WebSocket Close
		
    	this.props.navigation.push('VCselect',{password:this.state.password});
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
		ws = new WebSocket(socketURL);
		ws.onopen = () => { ws.send('{"type":"authm", "no":"'+socketRoom+'"}'); }
		ws.onmessage = (e) => { this.sendChallenger(); }
		ws.onerror = (e) => { this.setState({ViewMode: 3}); };
		ws.onclose = (e) => { this.setState({ViewMode: 3}); };
		// WebSocket Connection
  	}

	// SVP Function
	sendChallenger = async () => {
      	ws.send('{"type":"challenger","data":"'+challenger+'"}');
      	ws.onmessage = (e) => {
			const json = JSON.parse(e.data);
			if(json.type == "vp") this.verifyVP(json.data);
			if(json.type == "exit") this.setState({ViewMode: 3});
     	}
		ws.onerror = (e) => { this.setState({ViewMode: 3}); };
		ws.onclose = (e) => { this.setState({ViewMode: 3}); };
  	}

	verifyVP = async (vp) => {
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
		}else{
			console.log('Error Here');
			this.setState({ViewMode: 3})
		}
    }

	nextPage = () => {
		this.signDataParse()
		this.setState({ ViewMode:2 })
    	//this.state.isFaceEnabled ? this.biometricAuthentication(): this.setModalShow()
	}
	// SVP Function

	// Sign Function
	signDataParse = async () => {
		if(signTypeOnUse === "json"){
			//signDataOnUse = signDataOnUse.replace("localhost:8080", "192.168.200.55:8080"); // TEMP

			const json = JSON.parse(signDataOnUse);
			const key = json.key;
			const type = json.type;
			const data = json.data;
			const account = json.account;
			const name = json.name;
			const date = json.date;

			console.log("key", key);
			console.log("type", type);
			console.log("account", account);
			console.log("name", name);
			console.log("date", date);
			//console.log("data", data);

			signDataHtml = data;
		}
	}

	signDataClose = () => {
		this.setState({ ViewMode:1 });
	}

	signDataSubmit = () => {
		this.state.isFaceEnabled ? this.biometricAuthentication(): this.setModalShow()
	}
	

	signVCCreate = async () => {
		var vcSubmitArr = [];
		
		const privateKey = this.state.privateKey;
    	const ethAccount = web3.eth.accounts.privateKeyToAccount(privateKey)
    	const dualSigner = createDualSigner(didJWT.SimpleSigner(privateKey.replace('0x','')), ethAccount)
    	const dualDid = new DualDID(dualSigner, 'Issuer(change later)', 'Dualauth.com(change later)',web3,'0x3CF0CB3cD457b959F6027676dF79200C8EF19907')

		console.log(signDataOnUse);

		const vcID = "http://www.smartidcard.com/vc/mobileSign";
		const vcType = ['VerifiableCredential', 'mobileSign'];
		const holder = this.state.address;
		const credentialSubject = JSON.parse(signDataOnUse);
		const credentialStatus = {"type":"none"};
		const expDay = 365; // 만료일 : 1년
		const expirationDate = parseInt(new Date().getTime()/1000) + expDay * 24 * 60 * 60;
		const issuanceDate = new Date().toISOString();
    	const signVC = await dualDid.createVC(vcID, vcType, holder, credentialSubject, credentialStatus, expirationDate, issuanceDate);

    	vcSubmitArr = vcSubmitArr.concat([signVC.jwt]);
		
		this.makeVPJWT(vcSubmitArr)
	}
	// Sign Function

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
		this.signVCCreate();
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

		ws.send('{"type":"vp", "data":"'+cipherText+'"}');
		ws.onmessage = (e) => {};
		ws.onerror = (e) => {};
		ws.onclose = (e) => {};
		
		this.successVPsubmit();
	}

	successVPsubmit = () => {
		// WebSocket Close
		ws.close();
		ws.onmessage = (e) => {};
		ws.onerror = (e) => {};
		ws.onclose = (e) => {};
		// WebSocket Close

		this.setState({ViewMode: 5});
		setTimeout(() => { this.props.navigation.push('VCselect',{password:this.state.password}); }, 2000)

		// this.props.navigation.push('CardScanningTest',{name: this.state.name, type: this.state.type});
		// this.props.navigation.push('VCselect',{password:this.state.password});
	}

	hidePasswordModal = () => {
        this.setState({ showPasswordModal: false })
    }

    showPasswordModal = () => {
        this.setState({ showPasswordModal: true })
    }
	// Modal Function  

  	render() {
		LogBox.ignoreAllLogs(true)
		
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
			// return;
		}
		const userRoom = navigation.getParam('roomNo',"value")
		const userSocket = navigation.getParam('socketUrl',"Url")
		const userPW = navigation.getParam('userPW',"passwordValue")
		const userNonce = navigation.getParam('nonce',"nonceVal")
		const issuerReqType = navigation.getParam('reqType',"reqTypeVal")
		const issuerDID = navigation.getParam('issuerDID',"issuerDIDVal")
		const issuerURL = navigation.getParam('issuerURL',"issuerURLVal")
		const signData = navigation.getParam('signData',"signDataVal")
    	const signType = navigation.getParam('signType',"signTypeVal")
		const encryptionKey = navigation.getParam('encryptKey',"encryptKeyVal")

		socketRoom = userRoom;
		socketURL = userSocket;
		nonce = userNonce;
		reqTypeOnUse = issuerReqType;
		issuerDIDOnUse = issuerDID;
		issuerURLOnUse = issuerURL;
		passwordInMobile = userPW;
		signTypeOnUse = signType;
		signDataOnUse = signData;
		encryptionKeyOnUse = encryptionKey;

		console.log(spin);
		
		if(ViewMode == 0){
			return (
				<ScrollView style={providersStyle.scrollContainer}>
					<View style={providersStyle.rootContainer}>
						<TouchableOpacity
							onPress={this.cancel}>
						<View style={providersStyle.closeContainer}>
							<Image source={closeIcon} />
						</View>
						</TouchableOpacity>
						<Text style={providersStyle.headerStyle}>검증된 서비스 제공자의 정보입니다.</Text>
						<View style={providersStyle.statusContainer}>
							<Text style={providersStyle.statusLabel}>검증여부 확인</Text>
							<View style={providersStyle.loadingContainer}>
								<Text style={providersStyle.loadingNewLabelStyle}>{'진행중...'} </Text>
							</View>
						</View>
						<View style={providersStyle.detailContainer}>
							<Image source={verifyingLoader} style={providersStyle.refreshStyle} />
						</View>
					</View>
            	</ScrollView>
			)	
		}

		if(ViewMode == 1){
			return (
				<ScrollView>
					<View style={providersStyle.rootContainer}>
						<TouchableOpacity
							onPress={this.cancel}>
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
						
						{this.state.SVCArray.map((svc,index) => {
							return (
								<Info svc={svc} key={index}/>
							)
						})}
						
						<TouchableOpacity onPress={this.nextPage}>
							<View style={providersStyle.buttonContainer}>
								<Text style={providersStyle.buttonLabelStyle}>다음</Text>
							</View>
						</TouchableOpacity>
						<View></View>
					</View>
				</ScrollView>
			)
		}

		if(ViewMode == 2){
			return(
				<View style={providersStyle.rootContainer}>
					<TouchableOpacity onPress={this.signDataClose}>
						<View style={page.signDataClose}>
							<Image source={closeIcon} />
						</View>
					</TouchableOpacity>
					<SafeAreaView style={page.signDataMain}>
						<WebView 
							source={{ html : signDataHtml }}
							scalesPageToFit={(Platform.OS === 'ios') ? false : true}
						/>
					</SafeAreaView>
					<TouchableOpacity onPress={() => { this.signDataSubmit() }}>
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
	}
  
  	componentDidMount(){
   		this.setStateData();
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
	signDataMain : { 
		flex:1, 
		position:'relative', 
		backgroundColor:'#FFFFFF', 
	},
	signDataClose : {
		flexDirection:'row',
        marginTop: 20,
        padding: 20,
        justifyContent: 'flex-end',
	},

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
        flex: 1,
	},

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