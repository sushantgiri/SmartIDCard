import React from 'react'
import {
	LogBox, ScrollView, StyleSheet, Text, View, 
	Image, TouchableOpacity
} from 'react-native'
import Swiper from 'react-native-swiper'
import jwt_decode from "jwt-decode"
import CryptoJS from 'react-native-crypto-js'
import SecureStorage from 'react-native-secure-storage'
import {format} from "date-fns" // Date Format
import Modal from 'react-native-modal' // Modal

import CLoader from './common/Loader'; // Loader
import CHeader from './common/Header'; // Header

var AES = require("react-native-crypto-js").AES;

var imgNoData = require('../screens/assets/images/png/card_issue.png')
var imgQRL = require('../screens/assets/images/png/ic_qr_large.png')
var imgQRS = require('../screens/assets/images/png/ic_qr_small.png')
var imgSearch = require('../screens/assets/images/png/ic_btn_detail.png')
var imgClose = require('../screens/assets/images/png/ic_btn_cls.png')
var imgScan = require('../screens/assets/images/png/ic_btn_scan.png')
var imgCard = require('../screens/assets/images/png/ic_issue.png')

var target = []; //삭제 선택된 VC

function Card({vc}){
  	var toDate = vc.exp * 1000
  	var expDate = new Date(toDate)
	expDate = format(expDate, "yyyy-MM-dd")
   	
	return (
      	<View style={home.cardItem}>
		  	<View style={home.cardLine}></View>
           	<Text style={home.cardTitle}>인증서</Text>
			<Image source={imgQRS}></Image>
			<View style={home.cardContent}>
				<TouchableOpacity 
					style={home.cardNameSearch} 
					activeOpacity={0.8}
					onPress={Home.goCardDetail}
				>
					<Text style={home.cardName}>{vc.vc.credentialSubject.name}</Text>
					<Image style={home.cardSearch} source={imgSearch}></Image>
				</TouchableOpacity>
				<Text style={home.cardExpdate}>{expDate}</Text>
			</View>
			{/*
			<Text>만료일 : {expDate.toString()}</Text>
           	<Text>이름 : {vc.vc.credentialSubject.name}</Text>
			<Text>Email: {vc.vc.credentialSubject.email}</Text>
			<Text>생일 : {vc.vc.credentialSubject.birthday}</Text>
			<Text>성별 : {vc.vc.credentialSubject.gender}</Text>
			<Text>Phone: {vc.vc.credentialSubject.phone}</Text>
			*/}
      	</View>
    )
}
  
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
		ModalShow : false
	}

	setStateData = async() => {
		console.log('setStateData')

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

			this.setState({
				VCarray: this.state.VCarray.concat([VCform]),
				VCjwtArray: this.state.VCjwtArray.concat([receivedVC])
				}, async function(){
				let cipherData = CryptoJS.AES.encrypt(JSON.stringify(this.state), this.state.dataKey).toString();
				await SecureStorage.setItem(this.state.dataKey, cipherData);  
			})
		}

		// VC Reverse
		this.setState({ 
			VCarray:this.state.VCarray.reverse(),
			VCjwtArray:this.state.VCjwtArray.reverse()
		})

		// Set ViewMode
		if(this.state.VCarray.length == 0) this.setState({ViewMode:1})
		else this.setState({ViewMode:2})
	}

	setModalShow = () => {
		this.setState({ModalShow:!this.state.ModalShow})
	}

	goScan = () => {
		this.setState({ModalShow:false}) // Modal Hide
		this.props.navigation.navigate('ScanScreen', {password:this.state.password}) // Scan Move
	}

	goCardDetail = () => {
		alert('Card Detail')
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
                        <View style={common.buttonView}>
                            <TouchableOpacity 
								style={home.button} 
								activeOpacity={0.8} 
								onPress={this.setModalShow}
							>
                                <Text style={common.buttonText}>발급하기</Text>
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
							<Text style={modal.title}>발급할 인증서를{'\n'}선택하세요.</Text>
							<View style={modal.cards}>
								<View style={[modal.card, modal.cardFirst]}>
									<Image style={modal.cardImage} source={imgCard}></Image>
									<Text style={modal.cardText}>행복시{'\n'}시민증</Text>
								</View>
								<View style={[modal.card, modal.cardSecond]}>
									<Image style={modal.cardImage} source={imgCard}></Image>
									<Text style={modal.cardText}>행복대학교{'\n'}학생증</Text>
								</View>
							</View>
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
							{this.state.VCarray.map((vc)=>
								<Card vc={vc} key={vc.exp}></Card>
							)}
						</Swiper>
					</ScrollView>
					<View style={common.footer}>
                        <View style={common.buttonView}>
                            <TouchableOpacity 
								style={home.button} 
								activeOpacity={0.8} 
								onPress={this.setModalShow}
							>
                                <Text style={common.buttonText}>사용하기</Text>
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
							<Text style={modal.title}>제출할 인증서를{'\n'}선택하세요.</Text>
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

const home = StyleSheet.create({
	image : { width:'100%', alignItems:'center', paddingTop:30, paddingBottom:30, },
	info : { width:'100%', marginTop:40, alignItems:'center', },
	span : { fontSize:20, },
	strong : { fontSize:22, fontWeight:'bold', },
	button : { 
        width:'100%', alignItems:'center', color:'#FFFFFF',
        padding:30, backgroundColor:'#41528B', 
        borderWidth:0, borderRadius:0,
    },
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
    title : { 
		letterSpacing:-0.6, fontSize:22, marginBottom:20, fontWeight:'bold', 
	},
	cards : { 
		width:'100%', marginBottom:20, 
		flex:1, flexDirection:'row', justifyContent:'flex-start',
	},
	card : { 
		flex:0.5, borderWidth:1, borderColor:'#E5EBED', 
		paddingTop:20, paddingBottom:20, alignItems:'center',
	},
	cardFirst : { marginRight:10 },
	cardSecond : { },
	cardImage : { marginBottom:10 },
	cardText : { color:'#333333', fontSize:20, fontWeight:'bold', textAlign:'center' },
    scan : { 
        width:'100%', backgroundColor:'#ffffff', 
        padding:0, paddingTop:20, paddingBottom:20, 
        borderWidth:1, borderColor:'#E5EBED', 
        flexDirection:'row', justifyContent:'center',
        alignItems:'center',
    },
    scanText : { color:'#333333', fontWeight:'bold', fontSize:22, paddingLeft:10, },
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    alignItems:'center'
  },
  profileCardSaveButton:{
    textAlign:'center',
    alignItems:'center',
    alignContent:'center',
    backgroundColor:'white',
    width:"30%",
    justifyContent:'center',
    right:"-10%",
    padding:5,
    marginTop:15,
    borderRadius:10
  },
  scrollCard:{
    height:'75%',
    marginLeft:'5%'
  },
  profileTitle:{
    textAlign:"center",
    fontSize:15,
    fontWeight:"bold",
    marginBottom:30
  },
  qrText: {
    color:'white',
    fontWeight:'bold'
  },
  floatButton:{
    position:'absolute',
  },
  QRbutton:{
    textAlign:"center",
    alignItems:"center",
    alignContent:'center',
    textAlign: 'center',
    justifyContent: 'center',
    width:'90%',
    marginLeft:'5%',
    marginBottom: '5%',
    backgroundColor:'#316BFF',
    height:40,
    borderRadius:12
  },
  bannerButton: {
    width:'90%',
    textAlign:"center",
    alignItems:"center",
    alignContent:'center',
    textAlign: 'center',
    justifyContent: 'center',
    backgroundColor:'#AAA',
    paddingTop:'2%',
    paddingBottom:'2%',
    borderBottomLeftRadius:12,
    borderBottomRightRadius:12,
    
    alignContent:'center',
    justifyContent:'center',
    textAlign:'center'
  },
  profileCard:{
    width:'95%',
    marginTop:'5%',
    padding:15,
    backgroundColor:'#f7f7f7',
    borderRadius:12,
    alignContent:'center',
    justifyContent:'center',
    textAlign:'center',

  },
  textTop: {
    color: 'black',
    fontSize:30,
    fontWeight: 'bold',
    textAlign:"center",
    width:'70%',
    marginTop: 20
  },
  bottomButton:{
    padding:15
  },
  bottomNav: {
    alignItems:"center",
    alignContent:'center',
    textAlign: 'center',
    justifyContent: 'center',
    flexDirection: "row",
    color:'white',
    backgroundColor:'white',
    height:50,  
  },
  bottomFix: {
    zIndex:0,
    width: '100%',
    position: 'absolute',
    bottom:0,
  },
  inputProfileText: {
    backgroundColor:'white',
    width:'90%',
    borderRadius:12,
    textAlign:"center",
    margin:20,
    marginTop:5,
    padding:0,
    marginBottom:5,
    
    alignContent:'center',
    justifyContent:'center',
    textAlign:'center'
  }
})
