import React from 'react'
import { TabView, TabBar, SceneMap } from 'react-native-tab-view';
import Carousel from 'react-native-snap-carousel';

import {
	LogBox, ScrollView, StyleSheet, Text, View, 
	Image, TouchableOpacity, TextInput, StatusBar,Dimensions,
	NativeModules, ToastAndroid, Platform,Alert, KeyboardAvoidingView
} from 'react-native'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import Swiper from 'react-native-swiper'
import jwt_decode from "jwt-decode"
import CryptoJS from 'react-native-crypto-js'
import SecureStorage from 'react-native-secure-storage'
import {format} from "date-fns" // Date Format
import Modal from 'react-native-modal' // Modal

import CLoader from './common/Loader'; // Loader
import CHeader from './common/Header'; // Header
import {Linking} from 'react-native'
import { COUPON_ENTRIES } from './static/couponEntries';
import SettingsScreen from './SettingsScreen';
import ReactNativeBiometrics from 'react-native-biometrics'
import TouchID from 'react-native-touch-id'


var AES = require("react-native-crypto-js").AES;

var imgNoData = require('../screens/assets/images/png/card_issue.png')
var imgQRL = require('../screens/assets/images/png/ic_qr_large.png')
var imgQRS = require('../screens/assets/images/png/ic_qr_small.png')
var imgSearch = require('../screens/assets/images/png/ic_btn_detail.png')
var imgClose = require('../screens/assets/images/png/ic_btn_cls.png')
var imgScan = require('../screens/assets/images/png/ic_btn_scan.png')
var imgCard = require('../screens/assets/images/png/ic_issue.png')
var myCertificateUnselectedIcon = require('../screens/assets/images/png/clip_unselected.png')
var myCertificateSelectedIcon = require('../screens/assets/images/png/clip_selected.png')
var settingsUnselectedIcon = require('../screens/assets/images/png/profile_unselected.png')
var settingsSelectedIcon = require('../screens/assets/images/png/profile_selected.png')
var scanIcon = require('../screens/assets/images/png/scanner.png')
var scanningIcon = require('../screens/assets/images/png/scanning_image.png')

const { width: viewportWidth } = Dimensions.get('window');

var target = []; //삭제 선택된 VC

function wp (percentage) {
    const value = (percentage * viewportWidth) / 100;
    return Math.round(value);
}

const slideWidth = wp(65);
const itemHorizontalMargin = wp(0);

console.log(itemHorizontalMargin);

const itemWidth = slideWidth + itemHorizontalMargin * 2;


export default class Home extends React.Component {

	state = {
		password: '',
		dataKey: '',
		address: '',
		privateKey:'',
		mnemonic:'',
		VCarray:[],
		VCjwtArray:[],
		
		ViewMode : 0,
		ModalShow : false,
		//ModalMode : 0,
		detailArray : [],
		confirmCheckPassword:'',

		index: 0,
		routes: [
		  { key: 'first', title: 'ID' },
		  { key: 'second', title: '쿠폰' },
		],

		idSelection: true,
		isSettingsSelected: false,



	}


	//비밀번호 확인 input control
	handleConfirmPWchange = confirmCheckPassword => {
		this.setState({ confirmCheckPassword })
	}

	biometricAuthentication = () =>{
		if(Platform.OS === 'ios'){
			// var TouchID = require('react-native-touch-id');
			const optionalConfigObject = {
				unifiedErrors: false,
				passcodeFallback: true,
			  }
			TouchID.authenticate('Authenticate using Smart ID Card', optionalConfigObject)
			.then(success => {
				console.log('success', success);
			  // Success code
			})
			.catch(error => {
			  // Failure code
			  console.log('failure', error);
			});
			return;
		}
		ReactNativeBiometrics.isSensorAvailable()
		.then((resultObject) => {
			const { available, biometryType,error } = resultObject;
			console.log('Available', available);
			console.log('BiometricType', biometryType);
			console.log('Biometric Error', error);
			if (available && biometryType === ReactNativeBiometrics.TouchID) {
				console.log('TouchID');
				this.createSimplePrompt()
			} else if (available && biometryType === ReactNativeBiometrics.FaceID) {
				console.log('FaceID');
				this.createSimplePrompt()
			} else if (available && biometryType === ReactNativeBiometrics.Biometrics) {
				console.log('Biometrics');
				this.createSimplePrompt()
			} else {
			console.log('Biometrics not supported')
			}
		})
	}

	showMessage = (message) => {
		if (Platform.OS === 'android') {
			ToastAndroid.show(message, ToastAndroid.SHORT)
		} else {
			Alert.alert('Alert', message);
			// AlertIOS.alert(message);
		}
	}

	createSimplePrompt = () => {
		ReactNativeBiometrics.simplePrompt({promptMessage: 'Authenticate your Smart ID Card'})
		.then((resultObject) => {
			const { success } = resultObject
			if (success) {
				//this.showMessage("Authentication Successful")
			} else {
				this.showMessage("User cancelled")
			}
		})
		.catch(() => {
			this.showMessage("Biometrics failed")
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

	 Generate_key = () => {
		var key = "";
		var hex = "0123456789abcdef";
	
		for (var i = 0; i < 64; i++) {
			key += hex.charAt(Math.floor(Math.random() * 16));
			//Initially this was charAt(chance.integer({min: 0, max: 15}));
		}
		return key;
	}

	
	setStateData = async() => {
		// Get password
		await SecureStorage.getItem('userToken').then((pw) => {
			this.setState({password: pw}); // Set password
		})

		// Get dataKey
		let pw = this.state.password;
		await SecureStorage.getItem(pw).then((dk) => {
			this.setState({dataKey: dk}); // Set dataKey
		})
		
		// Get userData
		let dk = this.state.dataKey;
		await SecureStorage.getItem(dk).then((ud) => {
			if(ud != null) {
				// Set state
				let bytes = CryptoJS.AES.decrypt(ud, dk);
				let originalText = bytes.toString(CryptoJS.enc.Utf8);
				this.setState(JSON.parse(originalText))

			}
		})

		




		// VC Check
		const {navigation} = this.props
		const receivedVC = navigation.getParam('VCdata',"VCvalue")

		LogBox.ignoreAllLogs(true)

		if(receivedVC != "VCvalue"){
			console.log('Test Pass')
			const decodedVC = JSON.stringify(receivedVC).substring(28,JSON.stringify(receivedVC).length-2)
			const VCform = jwt_decode(decodedVC)

			var key = "6Le0DgMTAAAAANokdEEial"; //length=22
			var iv  = "mHGFxENnZLbienLyANoi.e";	

			// var key = CryptoJS.enc.Hex.parse("000102030405060708090a0b0c0d0e0f");
			// var iv = CryptoJS.enc.Hex.parse("101112131415161718191a1b1c1d1e1f");
			// var encrypted = CryptoJS.AES.encrypt("Message", key, { iv: iv });

			key = CryptoJS.enc.Base64.parse(key); // length=16 bytes
			iv = CryptoJS.enc.Base64.parse(iv); // length=16 bytes

			var encrypted = CryptoJS.AES.encrypt(JSON.stringify(VCform), key, { iv: iv });

			/*
			console.log('Key--------->!', key.toString());
			console.log('IV--------->!', iv.toString());
			console.log('Encrypted Value', encrypted.toString());
			*/

			this.setState(
				{
					VCarray: this.state.VCarray.concat([VCform]),
					VCjwtArray: this.state.VCjwtArray.concat([receivedVC])
				},
				async function(){
					let cipherData = CryptoJS.AES.encrypt(JSON.stringify(this.state), this.state.dataKey).toString();
					await SecureStorage.setItem(this.state.dataKey, cipherData);  
				}
			)
			
			/*
			console.log('Test Pass')
			console.log('VCForm', VCform);

			console.log('VCarray', this.state.VCarray);
			console.log('VCjwtArray', this.state.VCjwtArray);
			*/
		}

		if(this.state.VCarray.length > 0){
			this.setState(prevState => ({
				VCarray: [...prevState.VCarray, "new value"]
			  }))
		}
		

		// VC Reverse
		this.setState({ 
			VCarray:this.state.VCarray.reverse(),
			VCjwtArray:this.state.VCjwtArray.reverse()
		})

		// Set detailArray
		var detailArray = [];
		for (var i = 1; i <= this.state.VCarray.length; i++){
			detailArray = detailArray.concat([{'mode':0}])
		} 
		this.setState({ detailArray : detailArray })

		// Set ViewMode
		if(this.state.VCarray.length == 0) this.setState({ViewMode:1})
		else{
			// if(this.state.VCarray[0] !== 'dummy'){
			// 	var updatedArray = this.state.VCarray.splice(0, 0, 'dummy');
			// 	this.setState({
			// 		VCarray:updatedArray
			// 	})
			// }
			this.setState({ViewMode:2})
		} 

		// Reset confirmCheckPassword
		this.setState({confirmCheckPassword:''})
	}

	// Card Function
	cardDetail = (vc) =>{
		for (var i = 0; this.state.VCarray.length; i++){
			if(vc == this.state.VCarray[i]){
				if(this.state.detailArray[i].mode == 1) this.state.detailArray[i].mode = 0;
				else this.state.detailArray[i].mode = 1;
    			this.setState({detailArray: this.state.detailArray})
				return
			}
		}
	}

	cardConfirm = (vc) => {
		for (var i = 0; this.state.VCarray.length; i++){
			if(vc == this.state.VCarray[i]){
				if(this.state.detailArray[i].mode == 2) this.state.detailArray[i].mode = 1;
				else this.state.detailArray[i].mode = 2;
    			this.setState({detailArray: this.state.detailArray})
				return
			}
		}
	}

	cardDelete = (vc) => {
		if(this.state.confirmCheckPassword == this.state.password){
			this.setState(this.state.VCjwtArray.splice(this.state.VCarray.indexOf(vc),1))
        	this.setState(this.state.VCarray.splice(this.state.VCarray.indexOf(vc),1))

			// Set detailArray
			var detailArray = [];
			for (var i = 1; i <= this.state.VCarray.length; i++){
				detailArray = detailArray.concat([{"mode" : 0}])
			} 
			this.setState({ detailArray : detailArray })

			let cipherData = CryptoJS.AES.encrypt(JSON.stringify(this.state), this.state.dataKey).toString();
        	SecureStorage.setItem(this.state.dataKey, cipherData);

			this.setStateData()
   		} else {
      		alert('비밀번호가 일치하지 않습니다.')
    	}
	}

	singleItem = (title, icon) => {
		return (
			<View>

				<View>
					<Image source={icon}></Image>
					<Text>{title}</Text>
			     </View>

			</View>
		)
	}

	couponView = (imageSource, title, secondarySource) => {
		return (
				<View style={coupon.container}>
					<Image source={imageSource}></Image>
					<Text style={coupon.title}>{title}</Text>
					{secondarySource == "" ? 
					
					<View style={coupon.issuedButton}>
						<Image source={require('../screens/assets/images/png/tick_mark.png')}></Image>
						<Text style={coupon.issuedText}>발급</Text>
					</View> : 
					
					<Image source={secondarySource}></Image> }
				</View>
		);
	}

	goToCardDetail = () => this.props.navigation.navigate('AnimatedLoading')

	// goToCardDetail = () => this.props.navigation.navigate('VPInfo')


	setNewCard = ({item, index}) => {
		if(index  == 0){
			return (	
				<View style={cards.cardContainer}>
					{/*
					<View style={cards.indicatorWrapper}>
						<Image style={cards.addNewStyle} source={require('../screens/assets/images/png/add_new.png')} />
						<Text style={cards.lineStyle}> | </Text>
						<Text style={cards.totalCountStyle}>{this.state.VCarray.length - 1}</Text>
					</View>
					*/}
					<View style={common.contents}>
						<TouchableOpacity style={cards.noIDContainer} onPress={this.goScan}>
							<Image source={require('../screens/assets/images/png/no_card_contact.png')}></Image>
							<Text style={cards.noIDTextPrimary}>발급받기</Text>
						</TouchableOpacity>						
						{/* <Text style={cards.noIDTextSecondary}>아직 발급받은 ID가 없습니다. {"\n"}ID를 발급받아 주세요.</Text> */}
					</View>
				</View>				
			)
		}

		// 사원증, 고용계약서
		if(item.vc.type[1] === "사원증"){
			const company = item.vc.credentialSubject.회사명.substring(0, item.vc.credentialSubject.회사명.length - 2);
			let photo = item.vc.credentialSubject.사진.substring(0, item.vc.credentialSubject.사진.length - 2);
			let matadata = [];
			Object.keys(item.vc.credentialSubject).map((key) => {
				const matadataKey = [key];
				const matadataVal = item.vc.credentialSubject[key].substring(0, item.vc.credentialSubject[key].length - 2);
				const frontCheck = item.vc.credentialSubject[key].slice(-1);
				
				if(matadataKey != '회사명' && matadataKey != '사진' && frontCheck === "Y") {
					matadata.push(<Text style={cards.idcardContent}>{matadataVal}</Text>);
				}
			});

			return (
				<TouchableOpacity onPress={() => {
					this.props.navigation.push('HappyCitizenship', {vc: item.vc, item: item});
				}} style={cards.cardContainer}>
					<View style={cards.cardContainer}>		
						{/*	
						<View style={cards.indicatorWrapper}>
							<Text style={cards.currentIndexStyle}>{index}</Text>
							<Text style={cards.lineStyle}> | </Text>
							<Text style={cards.totalCountStyle}>{this.state.VCarray.length - 1}</Text>
						</View>
						*/}
						<View style={cards.idcardFilledContainer}>
							<View style={cards.cardHeaderSection}>
								<Text style={cards.idcardTitle}>{company}</Text>
							</View>
							<View style={cards.dummySpaceArea} />
							{/*
							<View style={cards.idcardPhotoArea}>
								<Image source={{uri:photo}} style={cards.idcardPhoto} />
							</View>
							*/}
							<View style={cards.idcardContentArea}>
								{matadata}
							</View>
						</View>
						<View style={cards.indicatorWrapper}>
							<Text style={cards.cardtype}>{item.vc.type[1]}</Text>
						</View>
					</View>
				</TouchableOpacity>
			)
		}else if(item.vc.type[1] === "고용계약서"){
			const title = item.vc.credentialSubject.고용계약서명;
			let matadata = [];
			Object.keys(item.vc.credentialSubject).map((key) => {
				const matadataKey = [key];
				const matadataVal = item.vc.credentialSubject[key];

				let frontShow = true;
				if(matadataKey == '고용계약서명') frontShow = false;
				if(matadataKey == '고용계약서식별번호') frontShow = false;
				if(matadataKey == '고용계약서내용') frontShow = false;
				if(matadataKey == '고용계약서서명') frontShow = false;
				
				if(frontShow) matadata.push(<Text style={cards.idcardContent}>{matadataVal}</Text>);
			});

			return (
				<TouchableOpacity onPress={() => {
					this.props.navigation.push('HappyCitizenship', {vc: item.vc, item: item});
				}} style={cards.cardContainer}>
					<View style={cards.cardContainer}>		
						{/*	
						<View style={cards.indicatorWrapper}>
							<Text style={cards.currentIndexStyle}>{index}</Text>
							<Text style={cards.lineStyle}> | </Text>
							<Text style={cards.totalCountStyle}>{this.state.VCarray.length - 1}</Text>
						</View>
						*/}
						<View style={cards.contractFilledContainer}>
							<View style={cards.cardHeaderSection}>
								<Text style={cards.contractTitle}>{title}</Text>
							</View>
							<View style={cards.dummySpaceArea} />
							{/*
							<View style={cards.contractImageArea}>
								<Image style={cards.idcardPhoto} />
							</View>
							*/}
							<View style={cards.contractContentArea}>
								{matadata}
							</View>
						</View>
						<View style={cards.indicatorWrapper}>
							<Text style={cards.cardtype}>{item.vc.type[1]}</Text>
						</View>
					</View>
				</TouchableOpacity>
			)
		}else{		
			return (
				<TouchableOpacity onPress={() => {
					this.props.navigation.push('HappyCitizenship', {vc: item.vc, item: item});
				}} style={cards.cardContainer}>
					<View style={cards.cardContainer}>
						{/*
						<View style={cards.indicatorWrapper}>
							<Text style={cards.currentIndexStyle}>{index}</Text>
							<Text style={cards.lineStyle}> | </Text>
							<Text style={cards.totalCountStyle}>{this.state.VCarray.length - 1}</Text>
						</View>
						*/}
						<View style={cards.filledContainer}>
							<View style={cards.cardHeaderSection}>
								<Text style={cards.cardTitle}>{item.vc.credentialSubject.name}</Text>
							</View>
							<View style={cards.dummySpaceArea} />
							<View style={cards.contractContentArea}>
								<Text style={cards.idcardContent}>{item.vc.credentialSubject.email}</Text>
								<Text style={cards.idcardContent}>{item.vc.credentialSubject.phone}</Text>
							</View>
						</View>
						<View style={cards.indicatorWrapper}>
							<Text style={cards.cardtype}>{item.vc.type[1]}</Text>
						</View>
					</View>
				</TouchableOpacity>
			)
		}
		// 사원증, 고용계약서
	}
	

	setCard = (vc, index) => {
		var toDate = vc.exp * 1000
		var expDate = format(new Date(toDate), "yyyy-MM-dd")
		var detailShow = false;
		var confirmShow = false;
		var confirmCheckPassword = this.state.confirmCheckPassword;

		if(this.state.detailArray[index].mode == 1) detailShow = true;
		if(this.state.detailArray[index].mode == 2) confirmShow = true;

		return (
			<View style={home.cardItem} key={index}>
				<View style={home.cardLine}></View>
				<Text style={home.cardTitle}>{vc.vc.type[1]}</Text>
				<Image source={imgQRS}></Image>
				<View style={home.cardContent}>
					<TouchableOpacity 
					style={home.cardNameSearch} 
					activeOpacity={0.8}
					onPress={() => this.cardDetail(vc)}
					>
						<Text style={home.cardName}>{vc.vc.credentialSubject.name}</Text>
						<Image style={home.cardSearch} source={imgSearch}></Image>
					</TouchableOpacity>
					<Text style={home.cardExpdate}>{expDate}</Text>
				</View>
				<Modal
				style={modal.wrap}
				animationIn={'slideInUp'}
				backdropOpacity={0.5}
				isVisible={detailShow}
				>
					<View style={modal.header}>
						<TouchableOpacity 
						style={modal.close} 
						activeOpacity={0.8}
						onPress={() => this.cardDetail(vc)}
						>
							<Image source={imgClose}></Image>
						</TouchableOpacity>
					</View>
					<View style={modal.contents}>
						<Text style={modal.title}>{vc.vc.type[1]}</Text>
						<ScrollView style={modal.cards}>
							<Text style={modal.text}>이름 : {vc.vc.credentialSubject.name}</Text>
							<Text style={modal.text}>생년월일 : {vc.vc.credentialSubject.birthday}</Text>
							<Text style={modal.text}>성별 : {vc.vc.credentialSubject.gender}</Text>
							<Text style={modal.text}>휴대폰번호 : {vc.vc.credentialSubject.phone}</Text>
							<Text style={modal.text}>이메일주소 : {vc.vc.credentialSubject.email}</Text>
							<Text style={modal.text}>주소 : {vc.vc.credentialSubject.address}</Text>
							<Text style={modal.text}>만료일 : {expDate}</Text>
						</ScrollView>
						<TouchableOpacity 
						style={modal.scan} 
						activeOpacity={0.8}
						onPress={() => this.cardConfirm(vc)}
						>
							<Text style={modal.scanText}>삭제</Text>
						</TouchableOpacity>
					</View>
				</Modal>
				<Modal
					style={modal.wrap}
					animationIn={'slideInUp'}
					backdropOpacity={0.5}
					isVisible={confirmShow}
				>
					<View style={modal.header}>
						<TouchableOpacity 
							style={modal.close} 
							activeOpacity={0.8} 
							onPress={() => this.cardConfirm(vc)}
						>
							<Image source={imgClose}></Image>
						</TouchableOpacity>
					</View>
					<KeyboardAvoidingView style={modal.contents}>
						<Text style={modal.title}>비밀번호를 입력하세요.</Text>
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
							onPress={() => this.cardDelete(vc)}
						>
							<Text style={modal.buttonText}>확인</Text>
						</TouchableOpacity>
					</KeyboardAvoidingView>
				</Modal>
			</View>
		)
	}
	// Card Function

	setSettingsShow = (isSettingsSelected) => {
		this.setState({
			isSettingsSelected:  isSettingsSelected
		})
	}
	// Modal Function
	setModalShow = () => {
		this.setState({ModalShow:!this.state.ModalShow})
	}
	// Modal Function

	goScan = () => {
		this.setState({ModalShow:false}) // Modal Hide
		this.props.navigation.push('SelectOptions')
		// this.props.navigation.push('CardScanningTest')
		// this.props.navigation.push('AnimatedLoading')
		// this.props.navigation.push('CertificateSelectAndSubmit')
		// this.props.navigation.push('CardScanning')
		// this.props.navigation.push('SettingsScreen')
		// this.props.navigation.push('ScanScreen', {password:this.state.password}) // Scan Move
	}

	linktest = () => {
		Linking.getInitialURL().then(url => { console.log(url) })  
	}

  	render() {
		const {ViewMode, ModalShow, idSelection, isSettingsSelected} = this.state

		if(ViewMode == 0){
			return (
				<View style={common.wrap}>
					<CHeader />
					<View style={common.contents}>
						<CLoader title={'발급된 ID를 확인하고 있습니다.'} />
					</View>
				</View>
			)
		}

		
		if(ViewMode == 1){
			return (
				<View style={common.wrap}>
					{!isSettingsSelected  && (
					<CHeader />
					)}

						{!isSettingsSelected && (
							<View style={home.topBarContainer}>
											
											<TouchableOpacity
												onPress={() => { this.setState({idSelection:true})}}>
													<View style= {this.state.idSelection ? home.firstLineStyle: home.firstLineStyleUnselected}>
															<Text style={this.state.idSelection ? home.firstTabItem: home.firstTabItemUnselected}>ID</Text>	
													</View>
											</TouchableOpacity>

										
											<TouchableOpacity
												onPress={() => { this.setState({idSelection:false})}}>
													<View style= {!this.state.idSelection ? home.secondLineStyle: home.secondLineStyleUnselected}>
														<Text style={ !this.state.idSelection ? home.secondTabItem: home.secondTabItemUnselected}>쿠폰</Text>
													</View>
											</TouchableOpacity>
											
										</View>
						)}
					


				{!isSettingsSelected && idSelection && (
					<View style={common.contents}>						
						<TouchableOpacity style={cards.noIDContainer} onPress={this.goScan}>
							<Image source={require('../screens/assets/images/png/no_card_contact.png')}></Image>
							<Text style={cards.noIDTextPrimary}>발급받기</Text>
						</TouchableOpacity>
						<Text style={cards.noIDTextSecondary}>아직 발급받은 ID가 없습니다. {"\n"}ID를 발급받아 주세요.</Text>
					</View>
				)}

				{!isSettingsSelected && idSelection && (

		<Modal
		style={modal.wrap}
		animationIn={'slideInUp'}
		backdropOpacity={0.5}
		isVisible={true}
		>

<KeyboardAwareScrollView enableOnAndroid={true} style={{height:"100%"}}
            enableAutoAutomaticScroll={(Platform.OS === 'ios')} extraHeight={130} extraScrollHeight={130}>
   
                      {/* <KeyboardAvoidingView behavior={"padding"} >
						  <View>
						  <ScrollView> */}
				<View>
				<TextInput
					name='confirmCheckPassword'
					// value={confirmCheckPassword}
					placeholder='비밀번호'
					secureTextEntry
					scrollEnabled={true}
					// onChangeText={this.handleConfirmPWchange}
					style={modal.textInput}
						/>
				
				</View>
				{/* </ScrollView>
				</View>
				</KeyboardAvoidingView> */}
			 </KeyboardAwareScrollView>
				
				</Modal>
				)}
				

				{!isSettingsSelected && !idSelection && (
					<View style={common.contents}>
						<View style={home.couponContent}>
							<Image source={require('../screens/assets/images/png/coupon.png')} style={home.couponImage}></Image>
							<Text style={home.couponText}>준비중입니다.</Text>
						</View>
					</View>
				)}

				{isSettingsSelected && (
					<View style={common.contents}>
						<SettingsScreen address={this.state.address}/>
					</View>	
				)}
					
					

					<View style={home.container}>
					<TouchableOpacity
					style={home.certificateContainer}
						onPress={() => this.setSettingsShow(false)}>	
							<View style={home.certificateContainer}>
								<Image source={this.state.isSettingsSelected ?myCertificateUnselectedIcon : myCertificateSelectedIcon}></Image>
								<Text>{this.state.isSettingsSelected ? "인증서" : "인증서"}</Text>
							</View>
					</TouchableOpacity>

					<TouchableOpacity onPress={this.goScan} style={home.touchableContainer}>
							<View style={home.scannerContainer}>
							<Image source={!this.state.isSettingsSelected ? scanningIcon: scanningIcon}></Image>
							</View>

					</TouchableOpacity>
					   
				<TouchableOpacity
				style={home.profileContainer}
						onPress={() => this.setSettingsShow(true)}>	
						<View style={home.profileContainer}>
							<Image source={this.state.isSettingsSelected ? settingsSelectedIcon : settingsUnselectedIcon}></Image>
							<Text>{!this.state.isSettingsSelected ? "설정" : "설정" }</Text>
			   		</View>
				</TouchableOpacity>

				</View>
					{/* <View style={common.footer}>
						<View style={home.buttonView}>
							<TouchableOpacity 
								style={[home.button, home.buttonInline]} 
								activeOpacity={0.8} 
								onPress={this.setModalShow}
							>
								<Text style={common.buttonText}>발급</Text>
							</TouchableOpacity>
						</View>
                    </View> */}
					{/* TO BE : Common 모듈로 분리 */}
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
						<View style={modal.contents}>
							<Text style={modal.title}>발급할 신분증을 선택하세요.</Text>
							<ScrollView style={modal.cards}>
								<TouchableOpacity 
									style={modal.card}
									activeOpacity={0.8} 
									//onPress={() => Linking.openURL('http://issuer.smartidcard.com/')}
								>
									<Text style={modal.cardText}>행복시 시민증</Text>
								</TouchableOpacity>
								<TouchableOpacity 
									style={modal.card}
									activeOpacity={0.8} 
									//onPress={() => Linking.openURL('http://issuer.smartidcard.com/')}
								>
									<Text style={modal.cardText}>행복대학교 학생증</Text>
								</TouchableOpacity>
							</ScrollView>
							<TouchableOpacity 
								style={modal.scan} 
								activeOpacity={0.8} 
								onPress={this.goScan}
							>
								<Image source={imgScan}></Image>
								<Text style={modal.scanText}>QR SCAN</Text>
							</TouchableOpacity>
						</View>
					</Modal>
					{/* TO BE : Common 모듈로 분리 */}
				</View>
			)
		}


		
		if(ViewMode == 2){
			return (
				<View style={common.wrap}>
					{!isSettingsSelected  && (
					<CHeader />
					)}
					{!isSettingsSelected && (

							<View style={home.topBarContainer}>

												
							<TouchableOpacity
								onPress={() => { this.setState({idSelection:true})}}>
									<View style= {this.state.idSelection ? home.firstLineStyle: home.firstLineStyleUnselected}>
										<Text style={this.state.idSelection ? home.firstTabItem: home.firstTabItemUnselected}>ID</Text>	
									</View>
							</TouchableOpacity>


							<TouchableOpacity
								onPress={() => { this.setState({idSelection:false})}}>
									<View style= {!this.state.idSelection ? home.secondLineStyle: home.secondLineStyleUnselected}>
										<Text style={ !this.state.idSelection ? home.secondTabItem: home.secondTabItemUnselected}>쿠폰</Text>
									</View>
							</TouchableOpacity>

							</View>	
					)}
					

				{!isSettingsSelected && !idSelection && (
					<View style={home.couponContent}>
						<Image source={require('../screens/assets/images/png/coupon.png')} style={home.couponImage}></Image>
						<Text style={home.couponText}>준비중입니다.</Text>
					</View>
				)}

				{
					!isSettingsSelected && idSelection && (
						<View style={cards.cardContainer}>
							<Carousel
								data={this.state.VCarray}
								renderItem = {this.setNewCard}
								itemWidth = {itemWidth}
								sliderWidth = {viewportWidth}
								containerCustomStyle={carousalStyle.slider}
							/>
						</View>
					)
				}
					{isSettingsSelected && (
					<View style={common.contents}>
						<SettingsScreen address={this.state.address}/>
					</View>	
				)}

					{/* <ScrollView style={common.contents}>
						<Swiper 
						style={home.cardArea} 
						loop={false} 
						activeDotColor={'#1ECB9C'}
						>
							{ this.state.VCarray.map((vc, index) => this.setCard(vc, index)) }
						</Swiper>
					</ScrollView> */}
				
				<View style={home.container}>
				<TouchableOpacity
					style={home.certificateContainer}
						onPress={() => this.setSettingsShow(false)}>	
							<View style={home.certificateContainer}>
								<Image source={this.state.isSettingsSelected ?  myCertificateUnselectedIcon : myCertificateSelectedIcon}></Image>
								<Text>{this.state.isSettingsSelected ? "인증서" : "인증서"}</Text>
							</View>
					</TouchableOpacity>

					<TouchableOpacity onPress={this.goScan} style={home.touchableContainer}>
							<View style={home.scannerContainer}>
							<Image source={!this.state.isSettingsSelected ? scanningIcon: scanningIcon}></Image>
							</View>

					</TouchableOpacity>
					   
				<TouchableOpacity
				style={home.profileContainer}
						onPress={() => this.setSettingsShow(true)}>	
						<View style={home.profileContainer}>
							<Image source={this.state.isSettingsSelected ? settingsSelectedIcon : settingsUnselectedIcon}></Image>
							<Text>{this.state.isSettingsSelected ? "설정" : "설정" }</Text>
			   		</View>
				</TouchableOpacity>

				</View>
					{/* TO BE : Common 모듈로 분리 */}
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
						<View style={modal.contents}>
							<Text style={modal.title}>제출할 서비스제공자를 선택하세요.</Text>
							<ScrollView style={modal.cards}>
								<TouchableOpacity style={modal.card} activeOpacity={0.8}>
									<Text style={modal.cardText}>행복시청</Text>
								</TouchableOpacity>
								<TouchableOpacity style={modal.card} activeOpacity={0.8}>
									<Text style={modal.cardText}>행복대학교</Text>
								</TouchableOpacity>
							</ScrollView>
							<TouchableOpacity 
								style={modal.scan} 
								activeOpacity={0.8} 
								onPress={this.goScan}
							>
								<Image source={imgScan}></Image>
								<Text style={modal.scanText}>QR SCAN</Text>
							</TouchableOpacity>
						</View>
					</Modal>
					{/* TO BE : Common 모듈로 분리 */}
				</View>
			)
		}
  	}

 	componentDidMount(){
		this.linktest();
		this.setStateData();

		// SecureStorage.removeItem('svca');
		// this.props.navigation.push('CardScanning')
		// this.biometricAuthentication()
  	}
}




const common = StyleSheet.create({
    wrap : { flex:1, position:'relative', backgroundColor:'#FFFFFF' },
    header : { padding:20, paddingBottom:0, },
    contents : { flex:1, position:'relative', padding:10, },
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

const home = StyleSheet.create({
	image : { width:'100%', alignItems:'center', paddingTop:30, paddingBottom:30, height:'100%' },
	info : { width:'100%', marginTop:40, alignItems:'center', },
	span : { fontSize:20, },
	strong : { fontSize:22, fontWeight:'bold', },
	buttonView : { width:'100%', flexDirection:'row', alignItems:'center', },
	button : { 
        alignItems:'center', color:'#FFFFFF',
        padding:30, borderWidth:0, borderRadius:0,
    },
	buttonInline : { width:'100%', backgroundColor:'#41528B', },
	buttonLeft : { width:'50%', backgroundColor:'#1ECB9C', },
	buttonRight : { width:'50%', backgroundColor:'#41528B', },

	cardArea : { height:460, },
	cardItem : { 
		width:'80%', height:400, backgroundColor:'#1ECB9C',
    	borderRadius:12, position:'relative', marginLeft:'10%', marginRight:'10%',
		paddingTop:20, paddingBottom:20, paddingLeft:30, paddingRight:30,
	},
	cardLine : { 
		position:'absolute', right:20, width:35, 
		height:400, backgroundColor:'#7edbc2', 
	},
	cardTitle : { fontSize:24, paddingBottom:20, fontWeight:'bold', color:'#ffffff', },
	cardContent : { position:'absolute', left:30, bottom:20, },
	cardNameSearch : { display:'flex', flexDirection:'row', },
	cardName : { fontSize:22, fontWeight:'bold', paddingRight:8, color:'#ffffff', },
	cardExpdate : { fontSize:20, color:'#ffffff', },

	container: {
		 flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center',
		 marginBottom: 10, backgroundColor: '#ffffff'
	},

	topBarContainer: {
		 flexDirection: 'row', flexWrap: "wrap" 
	},

	firstLineStyle: {
		borderBottomWidth: 1, borderColor: '#000000' , marginStart: 43
	},

	firstLineStyleUnselected: {
		borderBottomWidth: 0, borderColor: '#ffffff' , marginStart: 43
	},

	secondLineStyle: {
		borderBottomWidth: 1, borderColor: '#000000' , marginStart: 20,
	},

	secondLineStyleUnselected: {
		borderBottomWidth: 0, borderColor: '#ffffff' , marginStart: 20,
	},

	firstTabItem: {
		fontSize: 22, color:'#1A2433', textAlign:'center', padding: 8, fontWeight: 'bold'
	},

	firstTabItemUnselected: {
		fontSize: 22, color:'#7D848FB2', textAlign:'center', padding: 8, fontWeight: 'bold'
	},

	secondTabItem: {
		fontSize: 22, color:'#1A2433', textAlign:'center', marginStart: 20, padding: 8,
	},

	secondTabItemUnselected: {
		fontSize: 22, color:'#7D848FB2', textAlign:'center', marginStart: 20, padding: 8,
	},

	mainContainer: {
		flex: 1, flexDirection: 'column', backgroundColor: '#000000'
	},

	subContainer:{
		// alignSelf: 'center',	
		justifyContent: 'center',
	}, 

	certificateContainer:{
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
	}, 

	scannerContainer: {
		// flex: 1,
		// justifyContent: 'center',
		// alignItems: 'center',
	},

	touchableContainer:{
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
	},

	profileContainer: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
	},
	  scene: {
		// flex: 1,
		// alignItems: 'center',
		// justifyContent: 'center',
	  },
	
	// ADD
	couponContent : { flex:1, position:'relative', padding:10, alignItems:'center', justifyContent: 'center', },
	couponImage : { paddingLeft:20, paddingRight:20, },
	couponText : { fontSize:20, fontWeight:'bold', textAlign:'center', marginTop:30 }
	// ADD
});

const carousalStyle = StyleSheet.create({
	slider:{
		marginTop: 100,
		marginBottom: 100,
		overflow: 'visible'
	},

	sliderContentContainer: {
        paddingVertical: 10, // for custom animation
		paddingHorizontal: 50,
    },
})

const cards =  StyleSheet.create({

	cardContainer: {
		flex: 1,
		flexDirection:'column'
	},

	indicatorWrapper: {
		flexDirection: 'row',
	},

	cardtype : {
		flex: 1,
		textAlign:'center',
		fontSize: 16,
	},

	addNewStyle:{
		alignSelf:'center'
	},

	currentIndexStyle: {
		color: '#1A2433E5',
		fontSize: 16,
	},
	totalCountStyle: {
		fontSize: 16,
		color: '#7D848F',
	},
	lineStyle: {
		borderStartColor: 'rgba(125, 132, 143, 0.7)',
		borderStartWidth: 1
	},
	noIDContainer: {
		borderColor: '#1ECB9C',
		borderWidth: 1,
		backgroundColor: '#EEFCF8',
		flex: 1,
		borderRadius: 4,
		margin: 20,
		
		alignItems: 'center',
		justifyContent: 'center'
	},

	filledContainer: {
		backgroundColor: '#1ECB9C',
		borderRadius: 4,
		flex: 1,
		margin: 20,
		// flexDirection:'row'
		// alignItems: 'center',
		// justifyContent: 'center'
	},

	cardHeaderSection: {
		flexDirection: 'row'
	},

	cardTitle: {
		fontSize:20, color:'#FFFFFF', marginTop:20, marginStart:20
	},

	cardBottomTitle: {
		fontSize: 18,
		color: '#ffffff',
		marginStart: 20,
		marginBottom: 20,
		alignSelf:'flex-start',
	},

	// add
	idcardFilledContainer : { backgroundColor:'#3562D5', borderRadius:4, flex:1, margin:20 },
	idcardTitle : { fontSize:20, color:'#FFFFFF', marginTop:20, marginStart:20 },
	idcardPhotoArea : { justifyContent:'center', alignItems:'center', marginTop:50, marginBottom:50, marginStart:20, marginRight:20 },
	idcardPhoto : { width:200, height:220 },
	idcardContentArea: { marginStart:20, marginBottom:20 },
	idcardContent: { fontSize:18, color:'#ffffff', alignSelf:'flex-start' },

	contractFilledContainer : { backgroundColor:'#2699CA', borderRadius:4, flex:1, margin:20 },
	contractTitle : { fontSize:20, color:'#FFFFFF', marginTop:20, marginStart:20 },
	contractImageArea : { justifyContent:'center', alignItems:'center', marginTop:50, marginBottom:50, marginStart:20, marginRight:20 },
	contractImage : { width:200, height:220 },
	contractContentArea: { marginStart:20, marginBottom:20 },
	contractContent: { fontSize:18, color:'#ffffff', alignSelf:'flex-start' },
	// add

	dummySpaceArea:{
		flex: 1,
	},

	cardImageStyle: {
		marginTop: 21,
		marginStart: 20,
		marginEnd: 7
	},

	noIDTextPrimary: {
		fontSize: 18,
		fontWeight:'600',
		marginTop: 12,
	},

	noIDTextSecondary: {
		color: '#7D848F', marginTop: 32, fontSize: 14, alignSelf: 'center', textAlign: 'center',marginBottom: 30
	},


})

const coupon = StyleSheet.create({
	container:{
		flexDirection: 'row',
		borderWidth: 1,
		borderRadius: 8,
		padding: 24,
		borderColor:'#E5EBED',
		marginBottom: 12,
	},
	title: {
		fontSize: 15,
		color: '#1A2433E5',
		marginStart: 16,
		flex: 1,
	},

	issuedButton: {
		flexDirection: 'row',
		backgroundColor: '#0FD59E',
		borderRadius: 4,
		alignItems: 'center',
		padding:8,
		paddingStart: 4,
		paddingEnd: 4,
	},

	issuedText: {
		color: '#FFFFFF',
		fontSize:13,
	}
	

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
    title : { letterSpacing:-0.6, fontSize:22, marginBottom:20, fontWeight:'bold', },
	text : { letterSpacing:-0.6, fontSize:20, marginBottom:20, },
	textInput : {
        width:'100%', fontSize:20, marginBottom:8,
        paddingTop:15, paddingBottom:15, paddingLeft:12, paddingRight:12, 
        borderWidth:2, borderRadius:8, borderColor:'#CED2D4',
    },
	cards : {  },
	card : { 
		width:'100%', borderWidth:1, borderColor:'#333333', borderRadius:8,
		padding:20, flexDirection:'row', marginBottom:20,
	},
	cardImage : { marginRight:10 },
	cardText : { color:'#333333', fontSize:20, fontWeight:'bold', textAlign:'center' },
    scan : { 
        width:'100%', backgroundColor:'#ffffff', 
        padding:0, paddingTop:20, paddingBottom:20, 
        borderWidth:1, borderColor:'#333333', borderRadius:8,
        flexDirection:'row', justifyContent:'center', alignItems:'center', 
    },
    scanText : { color:'#333333', fontWeight:'bold', fontSize:22, paddingLeft:10, },
	button : { 
        width:'100%', backgroundColor:'#ffffff', 
        padding:0, paddingTop:20, paddingBottom:20, 
        borderWidth:1, borderColor:'#333333', borderRadius:8,
        flexDirection:'row', justifyContent:'center', alignItems:'center', 
    },
    buttonText : { color:'#333333', fontWeight:'bold', fontSize:22, paddingLeft:10, },
});