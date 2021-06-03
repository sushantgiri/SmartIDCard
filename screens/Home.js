import React from 'react'
import {
	LogBox, ScrollView, StyleSheet, Text, View, 
	Image, TouchableOpacity, TextInput
} from 'react-native'
import Swiper from 'react-native-swiper'
import jwt_decode from "jwt-decode"
import CryptoJS from 'react-native-crypto-js'
import SecureStorage from 'react-native-secure-storage'
import {format} from "date-fns" // Date Format
import Modal from 'react-native-modal' // Modal

import CLoader from './common/Loader'; // Loader
import CHeader from './common/Header'; // Header
import {Linking} from 'react-native'

var AES = require("react-native-crypto-js").AES;

var imgNoData = require('../screens/assets/images/png/card_issue.png')
var imgQRL = require('../screens/assets/images/png/ic_qr_large.png')
var imgQRS = require('../screens/assets/images/png/ic_qr_small.png')
var imgSearch = require('../screens/assets/images/png/ic_btn_detail.png')
var imgClose = require('../screens/assets/images/png/ic_btn_cls.png')
var imgScan = require('../screens/assets/images/png/ic_btn_scan.png')
var imgCard = require('../screens/assets/images/png/ic_issue.png')

var target = []; //삭제 선택된 VC

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
	}

	//비밀번호 확인 input control
	handleConfirmPWchange = confirmCheckPassword => {
		this.setState({ confirmCheckPassword })
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
			const decodedVC = JSON.stringify(receivedVC).substring(28,JSON.stringify(receivedVC).length-2)
			const VCform = jwt_decode(decodedVC)

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
		else this.setState({ViewMode:2})

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
							onPress={() => this.cardDelete(vc)}
						>
							<Text style={modal.buttonText}>확인</Text>
						</TouchableOpacity>
					</View>
				</Modal>
			</View>
		)
	}
	// Card Function

	// Modal Function
	setModalShow = () => {
		this.setState({ModalShow:!this.state.ModalShow})
	}
	// Modal Function

	goScan = () => {
		this.setState({ModalShow:false}) // Modal Hide
		this.props.navigation.push('ScanScreen', {password:this.state.password}) // Scan Move
	}

	linktest = () => {
		Linking.getInitialURL().then(url => { console.log(url) })  
	}
	
  	render() {
		const {ViewMode, ModalShow} = this.state

		if(ViewMode == 0){
			return (
				<View style={common.wrap}>
					<CHeader />
					<View style={common.contents}>
						<CLoader title={'발급된 인증서를 확인하고 있습니다.'} />
					</View>
				</View>
			)
		}
		
		if(ViewMode == 1){
			return (
				<View style={common.wrap}>
					<CHeader />
					<View style={common.contents}>
						<View style={home.image}>
							<Image source={imgNoData}></Image>
						</View>
						<View style={home.info}>
							<Text style={home.span}>발급받은 인증서가 없습니다</Text>
							<Text style={home.strong}>인증서를 발급해주세요 👀👇</Text>
						</View>
					</View>
					<View style={common.footer}>
						<View style={home.buttonView}>
							<TouchableOpacity 
								style={[home.button, home.buttonInline]} 
								activeOpacity={0.8} 
								onPress={this.setModalShow}
							>
								<Text style={common.buttonText}>발급</Text>
							</TouchableOpacity>
						</View>
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
					<CHeader />
					<ScrollView style={common.contents}>
						<Swiper 
						style={home.cardArea} 
						loop={false} 
						activeDotColor={'#1ECB9C'}
						>
							{ this.state.VCarray.map((vc, index) => this.setCard(vc, index)) }
						</Swiper>
					</ScrollView>
					<View style={common.footer}>
						<View style={home.buttonView}>
							<TouchableOpacity 
								style={[home.button, home.buttonInline]} 
								activeOpacity={0.8} 
								onPress={this.setModalShow}
							>
								<Text style={common.buttonText}>사용</Text>
							</TouchableOpacity>
							{/*
							<TouchableOpacity 
								style={[home.button, home.buttonRight]} 
								activeOpacity={0.8} 
								onPress={this.setModalShow}
							>
								<Text style={common.buttonText}>발급</Text>
							</TouchableOpacity>
							*/}
						</View>
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

const home = StyleSheet.create({
	image : { width:'100%', alignItems:'center', paddingTop:30, paddingBottom:30, },
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