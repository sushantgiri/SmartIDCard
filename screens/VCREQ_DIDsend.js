import React from 'react'
import { StyleSheet, View } from 'react-native'

import CryptoJS from 'react-native-crypto-js';
import SecureStorage from 'react-native-secure-storage'

import CLoader from './common/Loader'; // Loader
import CHeader from './common/Header'; // Header

var AES = require("react-native-crypto-js").AES;

// global variables
var socketRoom ='';
var socketURL = '';
var passwordInMobile = '';
var nonce = '';
var ws = '';
var reqTypeOnUse = '';
var issuerURLOnUse = '';
var encryptionKeyOnUse ='';

export default class VCREQ_DIDsend extends React.Component {
	state = {
		password: '',
		dataKey: '',
		address: '',
		privateKey:'',
		mnemonic:'',
		VCarray:[],
		VCjwtArray:[],
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

		// WebSocket Connection
		var key = CryptoJS.enc.Hex.parse(encryptionKeyOnUse)
		var cipherText = CryptoJS.AES.encrypt(this.state.address,key,{iv:key}).toString();

		ws = new WebSocket(socketURL);
		ws.onopen = () => { ws.send('{"type":"authm", "no":"'+socketRoom+'"}'); };
		ws.onmessage = (e) => { 
			ws.send('{"type":"did","data":"'+cipherText+'"}');
			ws.onmessage = (e) => {
				var dataToDec = e.data.substring(21,e.data.length-2);
				var vcjwtdata = CryptoJS.AES.decrypt(dataToDec,key,{iv:key}).toString(CryptoJS.enc.Utf8);

				ws.send('{"type":"exit"}')
				ws.onmessage = (e) => { 
					//this.props.navigation.navigate('VCverify',{VCdata:vcjwtdata,password:this.state.password}); 
					this.props.navigation.push('VCselect',{VCdata:vcjwtdata,password:this.state.password})
				}
			}
		}
		//ws.onerror = (e) => { console.log('ws onerror'); }
		//ws.onclose = (e) => { console.log('ws onclose'); }
	}

	render() {
		const {navigation} = this.props
		const userRoom = navigation.getParam('roomNo',"value")
		const userSocket = navigation.getParam('socketUrl',"Url")
		const userPW = navigation.getParam('userPW',"passwordValue")
		const userNonce = navigation.getParam('nonce',"nonceVal")
		const issuerReqType = navigation.getParam('reqType',"reqTypeVal")
		const issuerURL = navigation.getParam('issuerURL',"issuerURLVal")
		const encryptionKey = navigation.getParam('encryptKey',"encryptKeyVal")
		
		socketRoom = userRoom;
		socketURL = userSocket;
		nonce = userNonce;
		reqTypeOnUse = issuerReqType;
		issuerURLOnUse = issuerURL;
		passwordInMobile = userPW;
		encryptionKeyOnUse = encryptionKey;

		return (
			<View style={common.wrap}>
				<CHeader />
				<View style={common.contents}>
					<CLoader title={'신분증 발급이 진행중입니다.'} />
				</View>
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
