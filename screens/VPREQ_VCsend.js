import React from 'react'
import { 
	StyleSheet, View, Text, Image, TextInput, ScrollView,
	TouchableOpacity, TouchableHighlight, LogBox, 
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

var socketRoom ='';
var socketURL = '';
var passwordInMobile = '';
var nonce = '';
var ws = '';
var reqTypeOnUse = '';
var issuerDIDOnUse = '';
var issuerURLOnUse = '';
var encryptionKeyOnUse ='';
var challenger = Math.floor(Math.random() *10000) + 1;

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
		ModalShow : false
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

		// WebSocket Connection
		ws = new WebSocket(socketURL);
		ws.onopen = () => { ws.send('{"type":"authm", "no":"'+socketRoom+'"}'); }
		ws.onmessage = (e) => { console.log(e) }
  	}

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
		
		this.makeVCJWT(vcSubmitArr)
	}

	// makeVCJWT
	//pickVCinArray에서 전달받은 VC의 JWT를 VP로 만들어 제출
	// @param { pickVCinArray 로부터 전달받은 VCjwt의 array} vcjwtArray
	makeVCJWT = async (vcjwtArray) => {
		const privateKey = this.state.privateKey;
		const ethAccount = web3.eth.accounts.privateKeyToAccount(privateKey)
		const dualSigner = createDualSigner(didJWT.SimpleSigner(privateKey.replace('0x','')), ethAccount)
		const dualDid = new DualDID(dualSigner, 'Issuer(change later)', 'Dualauth.com(change later)',web3,'0x3CF0CB3cD457b959F6027676dF79200C8EF19907')
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
		
		const { confirmCheckPassword, modalVisible, ModalShow} = this.state

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
		
		return (
			<View style={common.wrap}>
				<CHeader />
				<ScrollView style={common.contents}>
					<View>
						{this.state.VCarray.map((vc,index) => {
							return(
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
  
  	componentDidMount(){
   		this.setStateData();
  	}
}

const common = StyleSheet.create({
    wrap : { flex:1, position:'relative', backgroundColor:'#FFFFFF' },
    header : { padding:20, paddingBottom:0, backgroundColor:'red' },
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