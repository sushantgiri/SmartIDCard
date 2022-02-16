import React from 'react'
import {StyleSheet, View, Text, Image, Dimensions, Modal, TouchableOpacity, ScrollView, ToastAndroid,
    NativeModules,
    Platform,
    AlertIOS} from 'react-native'
import {format} from "date-fns" // Date Format
import CryptoJS from 'react-native-crypto-js';
// Clipboard 모듈 
import Clipboard from '@react-native-community/clipboard'
import SecureStorage from 'react-native-secure-storage'
const Web3Utils = require('web3-utils');

// var Aes = NativeModules.Aes

var closeIcon = require('../screens/assets/images/png/close_scanner.png')

const { randomBytes } = require("crypto");

function notifyMessage(msg) {
    if (Platform.OS === 'android') {
      ToastAndroid.show(msg, ToastAndroid.SHORT)
    } else {
      AlertIOS.alert(msg);
    }
  }

//   const generateKey = (password, salt, cost, length) => Aes.pbkdf2(password, salt, cost, length)


//   const encryptData = (text, key) => {
//     return Aes.randomKey(16).then((iv) => {
//         return Aes.encrypt(text, key, iv).then((cipher) => ({
//             cipher,
//             iv,
//         }))
//     })
// }

// const encryptDataIV = (text, key, iv) => {
//   return Aes.encrypt(text, key, iv).then((cipher) => ({
//     cipher,
//     iv,
//   }))      
// }

// const decryptData = (encryptedData: { cipher, iv }, key) => Aes.decrypt(encryptedData.cipher, key, encryptedData.iv)
// const iv_string = '0123456789abcdef0123456789abcdef';

// let encrypt_key = "";
// let encrypt_string = "";
// let plain_string = "1234567890";
// let encrypt_iv = "";

//  AESKey = () => {
//     try {
//       generateKey('nixstory@gmail.com', 'SALT', 1000, 256).then((key: any) => {
//         encrypt_key = key;
//       })
//     } catch (e) {
//         console.error(e)
//     }    
//   }

//   AESEncrypt =  () => {
//     const key = encrypt_key;

//     try {
//       encryptDataIV(plain_string, key, iv_string).then(({ cipher, iv }) => {
//         encrypt_iv = iv;
//         encrypt_string = cipher;
//       }).catch((error: any) => {})
//     } catch (e) {
//         console.error(e)
//     }
//   }


export default class HappyCitizenship extends React.Component {

    state =  {
        isQrScanning: false,
        password: '',
		dataKey: '',
        cipherData: '',
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
                                <Text style={qrTimer.timer}>15</Text>
                                <Image source={require('../screens/assets/images/png/qr_timer.png')} />

                                <View style={qrTimer.bottomSection}>

                                    <Text>행복 시민증</Text>

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

    componentDidMount(){
        this.setStateData();
    }


    setStateData = async() => {
            // Get password
            await SecureStorage.getItem('userToken').then((pw) => {
                this.setState({password: pw}); // Set password
            })

            // Get dataKey
            let pw = this.state.password;
            await SecureStorage.getItem(pw).then((dk) => {
                this.setState({dataKey: dk});
                console.log('Bytes-->', Web3Utils.hexToNumberString(dk)) // Set dataKey
            })

            	
		// Get userData
		let dk = this.state.dataKey;
		await SecureStorage.getItem(dk).then((ud) => {
			if(ud != null) {
                this.setState({cipherData: ud});

			}
		})


    }

   
   

    render() {

        const vc = this.props.navigation.getParam('vc');

        // let cipherData = CryptoJS.AES.encrypt(JSON.stringify(vc), this.state.dataKey).toString();
        

        console.log('Cipher Data', this.state.cipherData);
        console.log('Data Key', this.state.dataKey);


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
                    <Text style={styles.headerTitleStyle}>행복 시민증</Text>

                <TouchableOpacity
                    onPress= {() => {
                            this.showQRScan()
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

                        <View style={styles.contentsChildSection}>
                            <Text style={styles.contentsLabel}>주소 :</Text>
                            <Text style={styles.contentsValue}>{vc.credentialSubject.address}</Text>
                        </View>


                    </View>
                </View>

                <TouchableOpacity 
                    style={styles.searchContainer}
                    onPress={() => {this.props.navigation.navigate('VPInfo')}}
                    >
                    <Image source={require('../screens/assets/images/png/happy_citizen_search.png')} />
                    <Text style={styles.searchTextStyle}>정보 제공 내역</Text>
                </TouchableOpacity>


                <View style={styles.bBox}>
                            <Text >{'VC: ' + this.state.cipherData}</Text>
                            <Text >{'Data Key: ' + this.state.dataKey}</Text>

                            <TouchableOpacity style={styles.bBoxButton} activeOpacity={0.8} onPress={()=>{
                                Clipboard.setString('VC: ' + this.state.cipherData + '\n' + 'Data Key: ' + this.state.dataKey);
                                notifyMessage('Text copied to clipboard\n' + 'VC: ' + this.state.cipherData + '\n' + 'Data Key: ' + this.state.dataKey)
                            }
                               
                                
                                }>
                                <Text selectable={true} style={styles.bBoxButtonText}>복구코드 복사하기</Text>
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