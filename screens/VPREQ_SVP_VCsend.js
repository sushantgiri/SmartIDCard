import React from 'react'
import { 
	StyleSheet, View, Text, Image, TextInput, ScrollView,
	TouchableOpacity, TouchableHighlight, LogBox, Animated, Easing
} from 'react-native'

import CryptoJS from 'react-native-crypto-js';
import SecureStorage from 'react-native-secure-storage'

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

var socketRoom ='';
var socketURL = '';
var passwordInMobile = '';
var nonce = '';
var ws = '';
var reqTypeOnUse = '';
var issuerDIDOnUse = '';
var issuerURLOnUse = '';
var encryptionKeyOnUse ='';
var challenger = String(Math.floor(Math.random() * 10000) + 1);

function createDualSigner (jwtSigner, ethAccount) {
  	return { jwtSigner, ethAccount }
}

function Card({vc}){
    return (
		<View style={page.card}>
			<Image style={page.cardImage} source={imgCard}></Image>
			<Text style={page.cardText}>{vc.vc.type[1]}</Text>
		</View>
	)
}

function Info({svc}){
	return (
		<ScrollView style={page.information}>
			<View style={page.informationBlock}>
				<View style={page.informationTitle}>
					<Image source={imageCheck}></Image>
					<Text style={page.informationTitleText}>도메인명</Text>
				</View>
				<View style={page.informationContent}>
					<Text style={page.informationContentText}>{svc.domain}</Text>
				</View>
			</View>
			<View style={page.informationBlock}>
				<View style={page.informationTitle}>
					<Image source={imageCheck}></Image>
					<Text style={page.informationTitleText}>사업자명</Text>
				</View>
				<View style={page.informationContent}>
					<Text style={page.informationContentText}>{svc.company}</Text>
				</View>
			</View>
			<View style={page.informationBlock}>
				<View style={page.informationTitle}>
					<Image source={imageCheck}></Image>
					<Text style={page.informationTitleText}>대표자명</Text>
				</View>
				<View style={page.informationContent}>
					<Text style={page.informationContentText}>{svc.ceo}</Text>
				</View>
			</View>
			<View style={page.informationBlock}>
				<View style={page.informationTitle}>
					<Image source={imageCheck}></Image>
					<Text style={page.informationTitleText}>사업자 주소</Text>
				</View>
				<View style={page.informationContent}>
					<Text style={page.informationContentText}>{svc.address}</Text>
				</View>
			</View>
			<View style={page.informationBlock}>
				<View style={page.informationTitle}>
					<Image source={imageCheck}></Image>
					<Text style={page.informationTitleText}>사업자 전화번호</Text>
				</View>
				<View style={page.informationContent}>
					<Text style={page.informationContentText}>{svc.phone}</Text>
				</View>
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
		spinValue : new Animated.Value(0),
	}
  
  	//비밀번호 확인 input control
	handleConfirmPWchange = confirmCheckPassword => {
		this.setState({ confirmCheckPassword })
	}

	// Cancel
	cancel = () => { 
    	ws.send('{"type":"exit"}')
    	this.props.navigation.navigate('VCselect',{password:this.state.password});
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
		ws = new WebSocket(socketURL);
		ws.onopen = () => { ws.send('{"type":"authm", "no":"'+socketRoom+'"}'); }
		ws.onmessage = (e) => { console.log(e); this.sendChallenger(); }
  	}

	// SVP Function
	sendChallenger = async () => {
      ws.send('{"type":"challenger","data":"'+challenger+'"}');
      ws.onmessage = (e) => {
          	const json = JSON.parse(e.data);
          	if(json.type == "vp") this.verifyVP(json.data);
     	}
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
		const code = result.code;
		const data = result.data;
		const msg = result.msg;
		const success = result.success;

		if(code == "000.0" && success) {
			const svcs = result.data.verifiablePresentation.verifiableCredential;
			
			let svca = [];
			let svc = null;

			for(let i = 0; i < svcs.length; i++){
				svc = svcs[i].credentialSubject;
				svca.push(svc);
			}
			
			console.log(svca);
			this.setState({ ViewMode:1, SVCArray:svca });
		}
    }

	nextPage = () => {
		this.setState({ ViewMode:2 });
	}
	// SVP Function

	// Card Function
	cardStyle = index => {
    	if(this.state.checkedArray[index] != null){
      		if(this.state.checkedArray[index].checked == true){
        		return{
		 			borderWidth:1, borderColor:'#1ECB9C', 
					padding:20, marginBottom:15
       			}
			} else {
				return{
					borderWidth:1, borderColor:'#333333', 
					padding:20, marginBottom:15
				}	
			}		
    	}
  	}
	
	cardSelect = e =>{
		for (var i = 0; this.state.VCarray.length; i++){
			if(e == this.state.VCarray[i]){
				this.state.checkedArray[i].checked = !this.state.checkedArray[i].checked
    			//arrChecked = this.state.checkedArray
    			this.setState({checkedArray: this.state.checkedArray})
				return
			}
		}
	}

	cardSend = () => {
		var cardSelected = false;
		for(var i = 0; i< this.state.checkedArray.length; i++){
			if(this.state.checkedArray[i].checked == true){ cardSelected = true; break; }
		}

		if(!cardSelected) {	alert("VC를 선택해 주세요") } 
		else { this.setModalShow() }
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
		var vcSubmitArr = [];
		for(var i = 0; i<this.state.VCjwtArray.length;i++){
			if(this.state.checkedArray[i].checked == true){
				var jwtString = this.state.VCjwtArray[i].split(',')[1].split(':')[1]
				vcSubmitArr = vcSubmitArr.concat([jwtString.substring(1,jwtString.length-2)])
			}
		}
		
		this.makeVPJWT(vcSubmitArr)
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
	
		ws.send('{"type":"vp", "data":"'+cipherText+'"}')
		ws.onmessage = (e) => { console.log(e) }
		
		this.successVPsubmit();
	}

	successVPsubmit = () => {
		ws.send('{"type":"exit"}')
		this.props.navigation.push('VCselect',{password:this.state.password});
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
		
		if(ViewMode == 0){
			return (
				<View style={common.wrap}>
					<CHeader />
					<View style={common.contents}>
						<View style={page.header}>
							<Text style={page.title}>서비스 제공자의 정보를{'\n'}검증 중입니다.</Text>
							<View style={page.animation}>
								<Animated.Image
									style={{transform:[{rotate:spin}]}}
									source={imageChain}
								/>
								<Text style={page.animationText}>검증 중</Text>
							</View>
						</View>
						<View style={page.information}>
							<View style={page.informationEmpty}>
								<Animated.Image
									style={{transform:[{rotate:spin}]}}
									source={imageChain}
								/>
							</View>
						</View>
					</View>
					<View style={common.footer}>
						<View style={page.buttonView}>
							<TouchableOpacity 
								style={[page.button, page.buttonLeft]} 
								activeOpacity={0.8} 
								onPress={this.nextPage}
							>
								<Text style={common.buttonText}>다음</Text>
							</TouchableOpacity>
							<TouchableOpacity 
								style={[page.button, page.buttonRight]} 
								activeOpacity={0.8} 
								onPress={this.cancel}
							>
								<Text style={common.buttonText}>취소</Text>
							</TouchableOpacity>
						</View>
					</View>
				</View>
			)
		}
		if(ViewMode == 1){
			return (
				<View style={common.wrap}>
					<CHeader />
					<View style={common.contents}>
						<View style={page.header}>
							<Text style={page.title}>검증된 서비스 제공자의{'\n'}정보입니다.</Text>
							<View style={page.animation}>
								<Animated.Image
									style={{transform:[{rotate:spin}]}}
									source={imageChain}
								/>
								<Text style={page.animationText}>검증 완료</Text>
							</View>
						</View>
						{this.state.SVCArray.map((svc,index) => {
							return (
								<Info svc={svc} key={index}/>
							)
						})}
					</View>
					<View style={common.footer}>
						<View style={page.buttonView}>
							<TouchableOpacity 
								style={[page.button, page.buttonLeft]} 
								activeOpacity={0.8} 
								onPress={this.nextPage}
							>
								<Text style={common.buttonText}>다음</Text>
							</TouchableOpacity>
							<TouchableOpacity 
								style={[page.button, page.buttonRight]} 
								activeOpacity={0.8} 
								onPress={this.cancel}
							>
								<Text style={common.buttonText}>취소</Text>
							</TouchableOpacity>
						</View>
					</View>
				</View>
			)
		}
		if(ViewMode == 2){
			return (
				<View style={common.wrap}>
					<CHeader />
					<ScrollView style={common.contents}>
						<View>
							{this.state.VCarray.map((vc,index) => {
								return ( 
									<TouchableOpacity style={this.cardStyle(index)} onPress={() => this.cardSelect(vc)}>
										<Card vc={vc} key={vc.exp}/>
									</TouchableOpacity>   
								)
							})}
						</View>
					</ScrollView>
					<View style={common.footer}>
						<View style={page.buttonView}>
							<TouchableOpacity 
								style={[page.button, page.buttonLeft]} 
								activeOpacity={0.8} 
								onPress={this.cardSend}
							>
								<Text style={common.buttonText}>제출</Text>
							</TouchableOpacity>
							<TouchableOpacity 
								style={[page.button, page.buttonRight]} 
								activeOpacity={0.8} 
								onPress={this.cancel}
							>
								<Text style={common.buttonText}>취소</Text>
							</TouchableOpacity>
						</View>
					</View>
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
								onPress={this.passwordCheck}
							>
								<Text style={modal.buttonText}>확인</Text>
							</TouchableOpacity>
						</View>
					</Modal>
				</View>
			)
		}
	}
  
  	componentDidMount(){
   		this.setStateData();
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
	animationText : { padding:8, paddingRight:0, fontSize:18, fontWeight:'bold', }
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
        width:'100%', fontSize:20, marginBottom:8,
        paddingTop:15, paddingBottom:15, paddingLeft:12, paddingRight:12, 
        borderWidth:2, borderRadius:8, borderColor:'#CED2D4',
    },
    title : { 
		letterSpacing:-0.6, fontSize:22, marginBottom:20, fontWeight:'bold', 
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
        width:'100%', backgroundColor:'#ffffff', 
        padding:0, paddingTop:20, paddingBottom:20, 
        borderWidth:1, borderColor:'#333333', borderRadius:8,
        flexDirection:'row', justifyContent:'center', alignItems:'center', 
    },
    buttonText : { color:'#333333', fontWeight:'bold', fontSize:22, paddingLeft:10, },
});