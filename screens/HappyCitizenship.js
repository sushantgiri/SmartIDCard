import React from 'react'

import {
    StyleSheet, View, Text, Image, Dimensions,  
    TouchableOpacity, ScrollView, ToastAndroid, Platform, 
    AlertIOS, SafeAreaView, TextInput, TouchableHighlight,
    KeyboardAvoidingView
} from 'react-native'
import Modal from 'react-native-modal' // Modal
import {format} from "date-fns" // Date Format
import jwt_decode from "jwt-decode";
import { WebView } from 'react-native-webview';
import SecureStorage from 'react-native-secure-storage'
import QRCode from 'react-native-qrcode-svg';
import {DualDID} from '@estorm/dual-did';
import TimerCountdown from './TimerCountdown';
// Web3 Configuration
import * as webConfig from './config/WebConfig'
const didJWT = require('did-jwt')


const web3 = webConfig.fetchWeb3()

// TTA TEMP
import CryptoJS from 'react-native-crypto-js';
const Web3Utils = require('web3-utils');
import Clipboard from '@react-native-community/clipboard'
// TTA TEMP

var closeIcon = require('../screens/assets/images/png/close_scanner.png')
var imgClose = require('../screens/assets/images/png/ic_btn_cls.png')

var contractHTML = ""; // 고용계약서 원본
var passwordInMobile = ''; //사용자 패스워드
var target = []; //삭제 선택된 VC

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
        password: '',
        dataKey: '',
        cipherData: '',
        qrValue:'',
        privateKey:'',
        itemVCArray: [],
        nonce: '',
        vp:'',
        ViewMode:0,
        QRModalShow : false,
        PWModalShow : false,
        confirmCheckPassword:'',
        deleteVC: false,
        VCarray:[],
    }

    /*
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
    */

    constructor(props){
        super(props)
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
				this.setState(JSON.parse(originalText))
			}
		})

        console.log("itemVCArray", this.state.itemVCArray);
  	}

    // Delete Function
    setPWModalShow = () => {
		this.setState({ PWModalShow:!this.state.PWModalShow })
	}

     deleteVC = async(vc) => {
        console.log('VC',vc)
        console.log('VCArray', this.state.VCarray)

        var selectedVC = this.state.VCarray.filter(function(localVC){
            console.log('Local VC ID',  localVC.vc.issuanceDate)
            console.log('Selected ID', vc.issuanceDate)
            return localVC.vc.issuanceDate != vc.issuanceDate
        })
        this.state.VCarray = selectedVC
        // console.log('Selected VC', selectedVC)
        // this.state.VCarray = selectedVC

        let cipherData = CryptoJS.AES.encrypt(JSON.stringify(this.state), this.state.dataKey).toString();
        await SecureStorage.setItem(this.state.dataKey, cipherData); 

        setTimeout(this.navigateBackToHome, 800);
        // this.props.route.params.onGoBack();
       
    }

    navigateBackToHome = () => {
        this.props.navigation.getParam('onGoBack')
        this.props.navigation.pop();
    }


    

    renderPWModal = () => {
        console.log("PWModalShow", this.state.PWModalShow);

        return (
            <Modal
                style={modal.wrap}
                animationIn={'slideInUp'}
                backdropOpacity={0.5}
                isVisible={this.state.PWModalShow}>
                <View style={modal.header}>
                    <TouchableOpacity 
                        style={modal.close} 
                        activeOpacity={0.8} 
                        onPress={this.setPWModalShow}>
                        <Image source={imgClose}></Image>
                    </TouchableOpacity>
                </View>
                <KeyboardAvoidingView style={modal.contents}>
                    <Text style={modal.title}>비밀번호를 입력하세요</Text>
                    <TextInput
                        name='confirmCheckPassword'
                        value={this.state.confirmCheckPassword}
                        placeholder='비밀번호'
                        secureTextEntry
                        onChangeText={this.handleConfirmPWchange}
                        style={modal.textInput}/>
                    <TouchableOpacity 
                        style={modal.button} 
                        activeOpacity={0.8} 
                        onPress={this.passwordCheck}>
                        <Text style={modal.buttonText}>확인</Text>
                    </TouchableOpacity>
                </KeyboardAvoidingView>
            </Modal>
        )
    }

    handleConfirmPWchange = confirmCheckPassword => {
		this.setState({ confirmCheckPassword })
	}

	passwordCheck = () => {
    	if(this.state.confirmCheckPassword == this.state.password){

            this.setPWModalShow()

            console.log("itemVCArray", this.state.itemVCArray);

            this.setState(this.state.VCjwtArray.splice(this.state.VCarray.indexOf(this.state.itemVCArray),1))
            this.setState(this.state.VCarray.splice(this.state.VCarray.indexOf(this.state.itemVCArray),1))
            this.setState({confirmCheckPassword:""})
            
            let cipherData = CryptoJS.AES.encrypt(JSON.stringify(this.state), this.state.dataKey).toString();
            SecureStorage.setItem(this.state.dataKey, cipherData);

            this.props.navigation.push('VCselect', {password:this.state.password});
   		} else {
      		alert('비밀번호가 일치하지 않습니다.')
    	}
  	}
    // Delete Function

    // QR Function
    showQRScan = () => {
        this.setState({ QRModalShow:true })
    }

    hideQRScan = () => {
        this.setState({ QRModalShow:false })
    }

    renderQRScanView = () => {
        console.log("QRModalShow", this.state.QRModalShow);
        
        return(
            <Modal
                animationType="slide"
                transparent={true}
                visible={this.state.QRModalShow}>
                <View style={qrTimer.qrContainer}>
                    <View style={qrTimer.qrChildContainer}>
                        <Text style={qrTimer.headerTitle}>QR코드</Text>
                        <TimerCountdown onCountDownFinished={() => {
                                this.createVP(this.state.itemVCArray).then(data =>{ 
                                    console.log('QR Value', data)
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
                        <View style={qrTimer.bottomSection}>
                            <Text>인증서</Text>
                        </View>                       
                    </View>
                    <TouchableOpacity onPress={() => { this.hideQRScan() }}>
                        <Image source={closeIcon} style={qrTimer.closeIconStyle}/>
                    </TouchableOpacity>
                </View>
            </Modal>
        )
    }
    // QR Function

    // VP Function
    createVP = async(vc) => {
        var date = new Date();
        var formattedDate = format(date, "yyyyMMddHHmmssSSS");
        var seq = (Math.floor(Math.random() * 10000) + 10000).toString().substring(1);
        var nonce = formattedDate + seq

        /*
        console.log('Date', formattedDate);
        console.log('FormattedDate', formattedDate);
        console.log(seq);
        console.log('Nonce', nonce);
        */

        // const nonce = time + commonUtil.setKeyRand("", 1, 4, false);
        const privateKey = this.state.privateKey;
		const ethAccount = web3.eth.accounts.privateKeyToAccount(privateKey)
		const dualSigner = createDualSigner(didJWT.SimpleSigner(privateKey.replace('0x','')), ethAccount)
		const dualDid = new DualDID(dualSigner, webConfig.issuerName, webConfig.serviceEndPoint,web3,webConfig.contractAddress)	
		const vp = await dualDid.createVP(vc,nonce)

        var data = {nonce: nonce, vp: vp};

        return data;
    }
    // VP Function

    // Contract Function
    contractClose = () => {
		this.setState({ ViewMode:0 });
	}

    contractView = (vc) => {
        const credentialSubject = vc.credentialSubject;
        let contractContent = credentialSubject.고용계약서내용;
        const contractSign = credentialSubject.고용계약서서명;

        for(let i = 0; i < contractSign.length; i++){
            const signDecode = jwt_decode(contractSign[i]);
            const signCS = signDecode.vc.credentialSubject;
            const signName = signCS.name;
            const signDate = signCS.date;

            // 사인 표시 추가
            let ceoBeforeData = "<span class=\"companyCEO\">" + signName + "</span><span class=\"stamp-ceo\"></span>";
            let ceoAfterData = "";
            ceoAfterData += "<span class=\"companyCEO\">" + signName + "</span>";
            ceoAfterData += "<span class=\"stamp-ceo\">";
            ceoAfterData += "<span class=\"stamp\">";
            ceoAfterData += "<svg viewBox=\"-1 1 100 100\" width=\"60\" height=\"60\">";
            ceoAfterData += "<defs><path id=\"circle\" d=\"M 50, 50m -37, 0a 37,37 0 1,1 74,0a 37,37 0 1,1 -74,0\" /></defs>";
            ceoAfterData += "<text style=\"font-weight: 800; letter-spacing: 5px; font-size: 12px;\">";
            ceoAfterData += "<textPath xlink:href=\"#circle\">" + signDate + " 서명완료</textPath>";
            ceoAfterData += "</text>";
            ceoAfterData += "</svg>";
            ceoAfterData += "<span>" + signName + "</span>";
            ceoAfterData += "</span>";
            ceoAfterData += "</span>";
            contractContent = contractContent.replace(ceoBeforeData, ceoAfterData);

            let workerBeforeData = "<span class=\"workerName\">" + signName + "</span><span class=\"stamp-worker\"></span>";
            let workerAfterData = "";
            workerAfterData += "<span class=\"workerName\">" + signName + "</span>";
            workerAfterData += "<span class=\"stamp-worker\">";
            workerAfterData += "<span class=\"stamp\">";
            workerAfterData += "<svg viewBox=\"-1 1 100 100\" width=\"60\" height=\"60\">";
            workerAfterData += "<defs><path id=\"circle\" d=\"M 50, 50m -37, 0a 37,37 0 1,1 74,0a 37,37 0 1,1 -74,0\" /></defs>";
            workerAfterData += "<text style=\"font-weight: 800; letter-spacing: 5px; font-size: 12px;\">";
            workerAfterData += "<textPath xlink:href=\"#circle\">" + signDate + " 서명완료</textPath>";
            workerAfterData += "</text>";
            workerAfterData += "</svg>";
            workerAfterData += "<span>" + signName + "</span>";
            workerAfterData += "</span>";
            workerAfterData += "</span>";
            contractContent = contractContent.replace(workerBeforeData, workerAfterData);
            // 사인 표시 추가
        }

        contractContent = contractContent.replace("localhost:8080", "192.168.200.55:8080"); // TEMP
        contractHTML = contractContent;

        this.setState({ ViewMode:1 });
    }
    // Contract Function

    render() {
        const { ViewMode } = this.state;

        const vc = this.props.navigation.getParam('vc');
        const itemVCArray= this.props.navigation.getParam('item');

        // TTA TEMP
        /*
        const { randomBytes } = require("crypto");

        const inData = JSON.stringify(vc);
        const inKey = CryptoJS.enc.Utf8.parse(this.randomString(32));
        const inIv = CryptoJS.enc.Utf8.parse(this.randomString(16));
        const outData = CryptoJS.AES.encrypt(inData, inKey, {iv:inIv}).toString();

        console.log("inData : " + inData);
        console.log("inKey : " + inKey);
        console.log("inIv : " + inIv);
        console.log("outData : " + outData);
        */
        // TTA TEMP

        // 메타데이터
        let matadata = [];
        if(vc.type[1] === "사원증"){
			Object.keys(vc.credentialSubject).map((key) => {
				const matadataKey = [key];
				const matadataVal = vc.credentialSubject[key].substring(0, vc.credentialSubject[key].length - 2);

                let detailShow = true;
                if(matadataKey == '사진') detailShow = false;

                if(detailShow) {
                    matadata.push(
                        <View style={styles.contentsChildSection}>
                            <Text style={styles.contentsLabel}>{matadataKey} : </Text>
                            <Text style={styles.contentsValue}>{matadataVal}</Text>
                        </View> 
                    )
                }
			});
        }else if(vc.type[1] === "고용계약서"){
            Object.keys(vc.credentialSubject).map((key) => {
				const matadataKey = [key];
				const matadataVal = vc.credentialSubject[key];

                let detailShow = true;
				//if(matadataKey == '고용계약서명') detailShow = false;
				if(matadataKey == '고용계약서식별번호') detailShow = false;
				if(matadataKey == '고용계약서내용') detailShow = false;
				if(matadataKey == '고용계약서서명') detailShow = false;

                if(detailShow) {
                    matadata.push(
                        <View style={styles.contentsChildSection}>
                            <Text style={styles.contentsLabel}>{matadataKey} : </Text>
                            <Text style={styles.contentsValue}>{matadataVal}</Text>
                        </View> 
                    )
                }
			});
        }else{
            Object.keys(vc.credentialSubject).map((key) => {
				let matadataKey = [key];
				let matadataVal = vc.credentialSubject[key];

				if(matadataKey == 'name') matadataKey = '이름';
				if(matadataKey == 'birthday') matadataKey = '생년월일';
				if(matadataKey == 'gender') matadataKey = '성별';
                if(matadataKey == 'phone') matadataKey = '휴대폰번호';
                if(matadataKey == 'email') matadataKey = '이메일주소';
                if(matadataKey == 'adult') matadataKey = '성년여부';

                let detailShow = true;

                if(detailShow) {
                    matadata.push(
                        <View style={styles.contentsChildSection}>
                            <Text style={styles.contentsLabel}>{matadataKey} : </Text>
                            <Text style={styles.contentsValue}>{matadataVal}</Text>
                        </View> 
                    )
                }
			});
        }
        // 메타데이터

        if(ViewMode == 0){
            return(
                <View style={styles.container}>
                    <View style={styles.header_background}>
                        <TouchableOpacity onPress={() => { this.props.navigation.goBack(); }}>
                            <Image style={styles.backButtonStyle} source={require('../screens/assets/images/png/back_icon.png')} />
                        </TouchableOpacity>
                        <Text style={styles.headerTitleStyle}>{vc.type[1]}</Text>
                    </View>
                    <ScrollView>
                        <View style={styles.contentsContainer}>
                            {/*
                            <View style={styles.contentsHeaderSection}>
                                <Text style={styles.contentsHeaderTitleStyle}>정보 제공 설정</Text>
                                <Image source={require('../screens/assets/images/png/ico_menu_right.png')} />
                            </View>
                            */}
                            <View style={styles.contentsContentContainer}>{matadata}</View>
                        </View>
                        {
                            vc.type[1] === "고용계약서"
                            ? 
                            <TouchableOpacity style={styles.searchContainer} onPress={() => { this.contractView(vc) }}>
                                <Text style={styles.searchTextStyle}>고용계약서 보기</Text>
                            </TouchableOpacity>
                            : null
                        }
                        {
                            vc.type[1] === "인증서"
                            ? 
                            <TouchableOpacity style={styles.searchContainer} 
                                onPress= {() => {
                                    this.createVP(this.state.itemVCArray).then(data =>{
                                        console.log('Data', data);
                                        this.setState({qrValue: data})
                                        this.showQRScan()
                                    });
                                }}>
                                <Text style={styles.searchTextStyle}>QR 코드 생성</Text>
                            </TouchableOpacity>
                            : null
                        }

                        {
                            <TouchableOpacity
                            style={styles.searchContainer}
                            onPress={() => {
                                console.log("Deletion done")
                                this.setState({deleteVC: true})
                                this.deleteVC(vc)
                            }}
                               >
                                <Text style={styles.searchTextStyle}>삭제</Text>
                               </TouchableOpacity>
                        }

                        {/*
                        <TouchableOpacity style={styles.searchContainer} onPress={() => {this.props.navigation.navigate('VPInfo', {cardKey: itemVCArray})}}>
                            <Text style={styles.searchTextStyle}>정보 제공 내역</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.searchContainer} onPress={() => {this.setPWModalShow()}}>
                            <Text style={styles.searchTextStyle}>삭제</Text>
                        </TouchableOpacity>
                        */}
                        
                    </ScrollView>
                    { this.renderQRScanView() }
                </View>
            )
        }

        if(ViewMode == 1){
            return(
                <View style={contract.root}>
                    <TouchableOpacity onPress={this.contractClose}>
                        <View style={contract.close}>
                            <Image source={closeIcon} />
                        </View>
                    </TouchableOpacity>
                    <SafeAreaView style={contract.content}>
                        <WebView 
                            source={{ html : contractHTML }}
                            scalesPageToFit={(Platform.OS === 'ios') ? false : true}
                        />
                    </SafeAreaView>
                </View>
            )
        }
    }

    componentDidMount(){
        const vc = this.props.navigation.getParam('vc');

        console.log('ItemVCArray', vc);

        this.setStateData();
        this.setState({ itemVCArray:vc });
    }
}

const contract = StyleSheet.create({
    root : {
        backgroundColor: '#ffffff',
        flex: 1,
    },

    close : {
        flexDirection:'row',
        marginTop: 30,
        padding: 20,
        justifyContent: 'flex-end',
    },

    content : { 
		flex:1, 
		position:'relative', 
		backgroundColor:'#FFFFFF', 
	},
})


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
        position:'relative',
    },

     header_background: {
        backgroundColor: '#0083FF',
        height: 160,
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
        marginTop: 20,
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
    },
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
		color:'#1A2433', fontSize: 18,
		// marginStart: 24,
		// letterSpacing:-0.6, fontSize:22, marginBottom:20, fontWeight:'bold', 
	},
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
		color: '#FFFFFF', fontWeight:'600', fontSize: 18, alignSelf: 'center'
    },
});