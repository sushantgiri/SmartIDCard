import React from 'react'

import {StyleSheet, View, Text, Image, Dimensions, Modal, 
        TouchableOpacity, ScrollView, ToastAndroid, Platform, AlertIOS} from 'react-native'
import {format} from "date-fns" // Date Format

// Clipboard 모듈 
// import Clipboard from '@react-native-community/clipboard'
import SecureStorage from 'react-native-secure-storage'
// const Web3Utils = require('web3-utils');

// var Aes = NativeModules.Aes

// TTA TEMP
// var CryptoJS = require("crypto-js");
import CryptoJS from 'react-native-crypto-js';
const Web3Utils = require('web3-utils');
import Clipboard from '@react-native-community/clipboard'
// TTA TEMP
import QRCode from 'react-native-qrcode-svg';

import {DualDID} from '@estorm/dual-did';
import TimerCountdown from './TimerCountdown';
const didJWT = require('did-jwt')
const Web3 = require('web3')
const web3 = new Web3('http://182.162.89.51:4313')

var closeIcon = require('../screens/assets/images/png/close_scanner.png')

function createDualSigner (jwtSigner, ethAccount) {
    return { jwtSigner, ethAccount }
}

function notifyMessage(msg) {
    if (Platform.OS === 'android') {
      ToastAndroid.show(msg, ToastAndroid.SHORT)
    } else {
      AlertIOS.alert(msg);
    }
}

export default class HappyCitizenship extends React.Component {

    state =  {
        isQrScanning: false,
        password: '',
        dataKey: '',
		dataKey: '',
        cipherData: '',
        qrValue:'',
        privateKey:'',
        itemVCArray: [],
        nonce: '',
        vp:''

    }

    getUserInfoFromToken = async () => {
        await SecureStorage.getItem('userToken').then((res) => {
          this.setState({password: res}, async function() {
            this.getDidData();
          })
        })
      }

    getDidData = async () => {
        await SecureStorage.getItem(this.state.password).then((docKey) => {
          this.setState({dataKey: docKey}, async function() {
              await SecureStorage.getItem(this.state.dataKey).then((userData) => {
              if( userData != null){
                let bytes  = CryptoJS.AES.decrypt(userData, this.state.dataKey);
                let originalText = bytes.toString(CryptoJS.enc.Utf8);
                this.setState(JSON.parse(originalText))
              }
              })
          })
        })
    }

    constructor(props){
        super(props)
    }

    showQRScan = () => {
        this.setState({
            isQrScanning: true
        })
    }

    hideQRScan = () => {
        this.setState({
            isQrScanning: false
        })
    }

    renderQRScanView = () => {
        return(
                <Modal
                    animationType="slide"
                    transparent={true}
                    visible={this.state.isQrScanning}>


                    <View style={qrTimer.qrContainer}>
                        <View style={qrTimer.qrChildContainer}>
                                <Text style={qrTimer.headerTitle}>QR코드</Text>
                                <TimerCountdown 
                                onCountDownFinished={() => {
                                    console.log('Count Down Finished');
                                    this.createVP(this.state.itemVCArray).then(data =>{
                                        console.log('Data', data);
                                        this.setState({qrValue: data})
                                    });
                                }}
                                    />
                               
                                {this.state.qrValue && (
                                    <QRCode
                                    value={'SmartIDCard'+JSON.stringify(this.state.qrValue)}
                                    size={200}
                                    />
                                )}

                                

                                {/* <Image source={require('../screens/assets/images/png/qr_timer.png')} /> */}

                                <View style={qrTimer.bottomSection}>

                                    <Text>인증서</Text>

                                </View>

                       
                         </View>

                         <TouchableOpacity
                            onPress={() => {
                                this.hideQRScan()
                            }}>
                                <Image source={closeIcon} style={qrTimer.closeIconStyle}/>
                        </TouchableOpacity>
                    </View>

                </Modal>
        )
    }
    
    // TTA TEMP
    randomString = (length) => {
        var randomChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        var result = '';
        for ( var i = 0; i < length; i++ ) {
            result += randomChars.charAt(Math.floor(Math.random() * randomChars.length));
        }
        console.log(result);
        return result;
    }

    notifyMessage = (msg) => {
        if (Platform.OS === 'android') {
            ToastAndroid.show(msg, ToastAndroid.SHORT)
        } else {
            AlertIOS.alert(msg);
        }
    }
    // TTA TEMP

    componentDidMount(){

        const vc = this.props.navigation.getParam('vc');
        console.log('ItemVCArray-->!', vc);

        this.setState({ itemVCArray:vc }); // Set password
        this.setStateData();

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

    createNonce() {
        var date = new Date();
        console.log('Date', formattedDate);

        var formattedDate = format(date, "yyyyMMddHHmmssSSS");
        console.log('FormattedDate', formattedDate);

        var seq = (Math.floor(Math.random() * 10000) + 10000).toString().substring(1);
        console.log(seq);

        var nonce = formattedDate + seq
        console.log('Nonce', nonce);
        this.setState({nonce: nonce})
    }  

    createVP = async(vc) => {

        var date = new Date();
        console.log('Date', formattedDate);

        var formattedDate = format(date, "yyyyMMddHHmmssSSS");
        console.log('FormattedDate', formattedDate);

        var seq = (Math.floor(Math.random() * 10000) + 10000).toString().substring(1);
        console.log(seq);

        var nonce = formattedDate + seq
        console.log('Nonce', nonce);

        // const nonce = time + commonUtil.setKeyRand("", 1, 4, false);
        const privateKey = this.state.privateKey;
		const ethAccount = web3.eth.accounts.privateKeyToAccount(privateKey)
		const dualSigner = createDualSigner(didJWT.SimpleSigner(privateKey.replace('0x','')), ethAccount)
		const dualDid = new DualDID(dualSigner, 'Issuer(change later)', 'Dualauth.com(change later)',web3,'0x76A2dd4228ed65129C4455769a0f09eA8E4EA9Ae')
		
		const vp = await dualDid.createVP(vc,nonce)

        // this.setState({vp: vp})
        var data= {nonce: nonce, vp: vp};
        return data;

    }

    render() {

        const vc = this.props.navigation.getParam('vc');
        const itemVCArray= this.props.navigation.getParam('item');

        console.log('Item---->', itemVCArray);

        // TTA TEMP
        const { randomBytes } = require("crypto");

        const inData = JSON.stringify(vc);
        const inKey = CryptoJS.enc.Utf8.parse(this.randomString(32));
        const inIv = CryptoJS.enc.Utf8.parse(this.randomString(16));
        const outData = CryptoJS.AES.encrypt(inData, inKey, {iv:inIv}).toString();

        console.log("inData : " + inData);
        console.log("inKey : " + inKey);
        console.log("inIv : " + inIv);
        console.log("outData : " + outData);
        // TTA TEMP

        // var toDate = vc.exp * 1000
		// var expDate = format(new Date(toDate), "yyyy-MM-dd")

        return(
            <View style={styles.container}>
                <View style={styles.header_background}>
                    
                
                <TouchableOpacity  
                onPress={() => {
                     this.props.navigation.pop();
                    }}>
                    <Image style={styles.backButtonStyle} source={require('../screens/assets/images/png/back_icon.png')} />

                </TouchableOpacity>
                    <Text style={styles.headerTitleStyle}>인증서</Text>

                <TouchableOpacity
                    onPress= {() => {
                        this.createVP(this.state.itemVCArray).then(data =>{
                            console.log('Data', data);
                            this.setState({qrValue: data})
                            this.showQRScan()
                        });
                    }}>   
                    <Image source={require('../screens/assets/images/png/qr_scan_icon.png')} />
                </TouchableOpacity>

                </View>

                <ScrollView>
                <View style={styles.contentsContainer}>
                    <View style={styles.contentsHeaderSection}>
                        <Text style={styles.contentsHeaderTitleStyle}>정보 제공 설정</Text>
                        <Image source={require('../screens/assets/images/png/ico_menu_right.png')} />

                    </View>

                    <View style={styles.contentsContentContainer}>

                        <View style={styles.contentsChildSection}>
                            <Text style={styles.contentsLabel}>이름 :</Text>
                            <Text style={styles.contentsValue}>{vc.credentialSubject.name}</Text>
                        </View>

                        <View style={styles.contentsChildSection}>
                            <Text style={styles.contentsLabel}>생년월일 :</Text>
                            <Text style={styles.contentsValue}>{vc.credentialSubject.birthday}</Text>
                        </View>

                        <View style={styles.contentsChildSection}>
                            <Text style={styles.contentsLabel}>성별 :</Text>
                            <Text style={styles.contentsValue}>{vc.credentialSubject.gender}</Text>
                        </View>

                        <View style={styles.contentsChildSection}>
                            <Text style={styles.contentsLabel}>휴대폰번호 :</Text>
                            <Text style={styles.contentsValue}>{vc.credentialSubject.phone}</Text>
                        </View>

                        <View style={styles.contentsChildSection}>
                            <Text style={styles.contentsLabel}>이메일주소 :</Text>
                            <Text style={styles.contentsValue}>{vc.credentialSubject.email}</Text>
                        </View>

                    </View>
                </View>

                <TouchableOpacity style={styles.searchContainer} onPress={() => {this.props.navigation.navigate('VPInfo',  {cardKey: itemVCArray})}}>
                    <Image source={require('../screens/assets/images/png/happy_citizen_search.png')} />
                    <Text style={styles.searchTextStyle}>정보 제공 내역</Text>
                </TouchableOpacity>
                
                <View>
                    <TouchableOpacity style={styles.searchContainer} activeOpacity={0.8} 
                                      onPress={()=>{
                                        Clipboard.setString(inKey.toString());
                                        this.notifyMessage('KEY copied to clipboard');
                                      }
                    }>
                        <Text selectable={true}>KEY : {inKey.toString()}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.searchContainer} activeOpacity={0.8} 
                                      onPress={()=>{
                                        Clipboard.setString(inIv.toString());
                                        this.notifyMessage('IV copied to clipboard');
                                      }
                    }>
                        <Text>IV : {inIv.toString()}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.searchContainer} activeOpacity={0.8} 
                                      onPress={()=>{
                                        Clipboard.setString(outData);
                                        this.notifyMessage('outData copied to clipboard');
                                      }
                    }>
                        <Text>DATA : {outData}</Text>
                    </TouchableOpacity>
                </View>
                </ScrollView>

                {this.renderQRScanView()}
            </View>

        )
    }
}


const qrTimer = StyleSheet.create({

    qrContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: 'rgba(0,0,0,0.5)'
    },

    qrChildContainer: {
       flexWrap:'wrap',
       backgroundColor: '#ffffff',
       padding: 20,
       alignItems:'center',
       borderRadius: 8,
    },

    headerTitle: {
        fontSize: 20,
        color: '#1A2433',
        fontWeight: '600',
        marginTop: 24,
    },

    timer: {
        fontSize: 15,
        color:'#1ECB9C',
        fontWeight:'600',
        marginTop: 16,
        marginBottom: 16,
    },

    bottomSection: {
        borderRadius: 8,
        alignItems: 'center',
        backgroundColor: 'rgba(30, 203, 156, 0.16)',
        padding: 18,
        marginTop: 12,
        width: 180
    },

    closeIconStyle: {
        marginTop: 28
    }
    
})



const styles = StyleSheet.create({


    bBox : { padding: 20,
        marginTop: 18,
        marginStart: 21,
        marginEnd: 21,
        borderRadius:8,         backgroundColor:'#F6F8FA',
        marginBottom:30, },
    bBoxText : { fontSize:18, color:'#FFFFFF', marginStart: 30, marginEnd: 30, textAlign: 'center' },
    bBoxButton : { 
        width: '50%', marginTop:20, padding:10, alignItems:'center',
        borderWidth:1, borderColor:'#1ECB9C', borderRadius:8, 
        alignSelf: 'center',
    },
    bBoxButtonText : { color:'#1ECB9C', fontWeight:'bold', },

    container: {
        flex: 1,
        backgroundColor: '#fff',
      },

     header_background: {
        backgroundColor: '#0083FF',
        height: 226,
        marginBottom: 28,
     },
    backButtonStyle: {
        marginStart: 24,
        marginTop: 38,
        marginBottom: 22,
    },
    headerTitleStyle: {
        marginStart: 24,
        marginBottom: 24,
        fontSize: 22,
        color:'#ffffff',
    },

    contentsContainer: {
        marginStart: 24,
        marginTop: 44,
    },

    contentsHeaderSection:{
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginStart: 24,
        marginEnd: 24,
    },

    contentsHeaderTitleStyle: {
        fontSize: 18,
        color: '#44424A',
        fontWeight:'600'
    },

    contentsContentContainer: {
        borderRadius:8,
        backgroundColor:'#F6F8FA',
        marginTop: 12,
        // marginStart: 24,
        marginEnd: 24,
        paddingBottom: 16,
    },

    contentsChildSection: {
        flexDirection: 'row',
        justifyContent:'space-between',
        marginStart: 20,
        marginEnd: 20,
        marginTop: 16,
    },

    contentsLabel: {
       fontSize: 14,
       color: '#44424A', 
    },

    contentsValue: {
        fontWeight: '500',
    },

    searchContainer: {
        borderRadius: 4,
        backgroundColor:'#DBF6EF',
        flexDirection: 'row',
        justifyContent:'center',
        marginTop: 12,
        marginStart:24,
        marginEnd: 24,
        padding:12,

    },

    vpInfoContainer: {
        borderRadius: 4,
        backgroundColor:'#DBF6EF',
        flexDirection: 'row',
        justifyContent:'center',
        marginTop: 12,
        marginStart:24,
        marginEnd: 24,
        padding:12,
    },

    searchTextStyle: {
        color:'#1ECB9C',
        fontWeight:'600',
        fontSize:16,
    }

    
})