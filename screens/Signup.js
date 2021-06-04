import React from 'react'
import { StyleSheet, Text, ScrollView, View, TextInput, TouchableOpacity, Modal, TouchableHighlight} from 'react-native'

// Crypto JS 모듈
import CryptoJS from 'react-native-crypto-js';
var AES = require("react-native-crypto-js").AES;

// SecureStorage 모듈
import SecureStorage from 'react-native-secure-storage'

// Clipboard 모듈 
import Clipboard from '@react-native-community/clipboard'

import CLoader from './common/Loader'; // Loader

// JWT / Web3 모듈 적용
const didJWT = require('did-jwt');
const Web3Utils = require('web3-utils');

const Web3 = require('web3')
const web3 = new Web3('http://182.162.89.51:4313')

// Core _ ethereum 모듈 ( 임도형 이사님 제공 )
const { DualDID } = require('@estorm/dual-did')

// 스마트 컨트랙트
const smartContractAddress = '0x3CF0CB3cD457b959F6027676dF79200C8EF19907'

// 유저 DID address 
var userAddress = '';

// 유저 Mnemonic 
var userMnemonic = '';

// 유저 private key 
var userPK = '';

// 데이터 암호화 key ( for TTA 모바일 DID 월렛 앱 )
var dataKey ='';

/**  address Function
 *  랜덤한 Bytes 를 생성하여, Mnemonic, Privatekey, DID address 를 생성
**/
function address() {
	const { randomBytes } = require("crypto");
	const { Mnemonic, HDKey, EthereumAddress } = require("wallet.ts");

	// 랜덤한 32바이트에서 Mnemonic을 생성하여, Global variable : userMnemonic 에 저장
	const mnemonic = Mnemonic.generate(randomBytes(32));
	const phrase = mnemonic.phrase;
	userMnemonic = phrase;

	// 유저 private 키를 만들어, Global variable : userPK 에 저장
	const seed = mnemonic.toSeed();
	const masterKey = HDKey.parseMasterSeed(seed);
	const extendedPrivateKey = masterKey.derive("m/44'/60'/0'/0").extendedPrivateKey;
	const childKey = HDKey.parseExtendedKey(extendedPrivateKey);
	const wallet = childKey.derive("0");
	userPK = Web3Utils.bytesToHex(wallet.privateKey);

	//generate key for use in mobile device data exchange
	//with 16 random bytes ( 128 bit long ) to store data in secure elements

	const mobileBytes = randomBytes(16);
	dataKey = Web3Utils.bytesToHex(mobileBytes);
	
	// Build mobile key end

	// public key를 이용해 did address 를 생성하여, global variable : userAddress 에 저장
	const address = EthereumAddress.from(wallet.publicKey).address;
	userAddress = "did:dual:"+address.toLowerCase();

	return {
		sampleAddress: address,
		sampleDID: `did:dual:${address.toLowerCase()}`,
		signer: didJWT.SimpleSigner(Web3Utils.bytesToHex(wallet.privateKey))
	}
}

// DID 생성 function
function createDualSigner (jwtSigner, ethAccount) {
  	return { jwtSigner, ethAccount }
}

async function did () {
	address()
	
	const privateKey = userPK;
	const ethAccount = web3.eth.accounts.privateKeyToAccount(privateKey)
	const dualSigner = createDualSigner(didJWT.SimpleSigner(privateKey.replace('0x','')), ethAccount)

	const dualDid = new DualDID(dualSigner, 'Issuer(change later)', 'Dualauth.com(change later)',web3,smartContractAddress)
	
	const did = await dualDid.createDid()

	console.log("<- JWT & signedTx ------------------------------->")
	console.log(did)
	console.log("<- verifyJWT ------------------------------->")
	console.log(JSON.stringify((await dualDid.verifyJWT(did.jwt)), null, 4))
}

export default class Signup extends React.Component {
    state = {
        password: '',
        confirmPassword:'',
        address: '',
        privateKey:'',
        mnemonic:'',
        dataKey:'',
        VCarray:[],
        VCjwtArray:[],

        ViewMode: 0
    }
  
    // Password 와 confirm password 의 state control functions.
    handlePasswordChange = password => {
        this.setState({ password })
    }

    handleConfirmPWchange = confirmPassword => {
        this.setState({ confirmPassword })
    }

    setStateData = () =>{
        let errorCode = 0;

        if(this.state.password != this.state.confirmPassword) errorCode = 3;
        //if(this.state.password.length < 10) errorCode = 2;
        if(this.state.password == '') errorCode = 1;

        switch(errorCode) {
            case 1:
                alert('비밀번호를 입력하세요.')
                break;
            case 2:
                alert('비밀번호 정책을 확인하세요.')
                break;
            case 3:
                alert('비밀번호가 일치하지 않습니다.')
                break;
        }
    
        if(errorCode == 0){
            //this.setState({ViewMode:1}) // Loader

            did(); // did 생성

            this.setState({ address: userAddress, privateKey: userPK, mnemonic: userMnemonic, dataKey: dataKey}, () => {
                let cipherData = CryptoJS.AES.encrypt(JSON.stringify(this.state), dataKey).toString();
            
                /** State data 를 Secure Storage에 저장
                 * 
                 *  State -> Cipher data 로 암호화 후 : Data key를 암호화 키로 지정하여 Secure storage 에 저장/
                 *  Datakey 를 user가 지정한 password를 키로 지정하여 Secure Storage에 저장
                 * 
                 */
                SecureStorage.setItem(this.state.dataKey, cipherData);
                SecureStorage.setItem(this.state.password,this.state.dataKey);

                this.setState({ViewMode:2}) // Compleate
            });
        }
    }

    // DID 생성 완료
    confirm = async () => {
        // 현재 password를 userToken을 키로 지정하여 사용될 수 있도록 저장
        await SecureStorage.setItem('userToken', this.state.password)
        this.props.navigation.navigate('App')
    }

    render() {
        const { password, confirmPassword, ViewMode } = this.state

        if(ViewMode == 0){
            return (
                <View style={common.wrap}>
                    <View style={common.header}>
                        <Text style={common.title}>지갑 암호 설정</Text>
                    </View>
                    <View style={common.contents}>
                        <View>
                            <TextInput
                            name='password'
                            value={password}
                            placeholder='비밀번호 (10자리 이상)'
                            secureTextEntry
                            onChangeText={this.handlePasswordChange}
                            style={common.textInput}
                            />
                            <TextInput
                            name='confirmPassword'
                            placeholder='비밀번호 재확인'
                            secureTextEntry
                            value={confirmPassword}
                            onChangeText={this.handleConfirmPWchange}
                            style={common.textInput}
                            />
                        </View>  
                    </View>
                    <View style={common.footer}>
                        <View style={common.buttonView}>
                            <TouchableOpacity style={common.button} activeOpacity={0.8} onPress={this.setStateData}>
                                <Text style={common.buttonText}>확인</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            )
        }

        if(ViewMode == 1){
			return (
				<View style={common.wrap}>
					<View style={common.contents}>
						<CLoader title={'지갑을 생성하고 있습니다.'} />
					</View>
				</View>
			)
		}

        if(ViewMode == 2){
            return (
                <View style={common.wrap}>
                    <View style={common.header}>
                        <Text style={common.title}>지갑이 생성되었습니다</Text>
                    </View>
                    <ScrollView style={common.contents}>
                        <View style={signup.aBox}>
                            <Text style={signup.aBoxText}>{this.state.address}</Text>
                        </View>
                        <View style={signup.bBox}>
                            <Text style={signup.bBoxText}>{this.state.mnemonic}</Text>
                            <TouchableOpacity style={signup.bBoxButton} activeOpacity={0.8} onPress={()=>Clipboard.setString(this.state.mnemonic)}>
                                <Text style={signup.bBoxButtonText}>복구코드 복사하기</Text>
                            </TouchableOpacity>
                        </View>
                        <View style={signup.cBox}>
                            <Text style={signup.cBoxText1}>주의</Text>
                            <Text style={signup.cBoxText2}>
                                12자리의 복구코드를 안전한 곳에 저장하여 주시기 바랍니다.
                            </Text>
                        </View>
                        <View style={signup.dBox}>
                            <Text style={signup.dBoxText1}>
                                ■ 복구코드는 앱을 재설치하거나 새로운 기기에 현재의 계정을 옮기기 위해 이용됩니다.
                            </Text>
                            <Text style={signup.dBoxText2}>
                                ■ 이후에도 프로필 화면에서 확인 하실 수 있습니다.
                            </Text>
                        </View>
                    </ScrollView>
                    <View style={common.footer}>
                        <View style={common.buttonView}>
                            <TouchableOpacity style={common.button} activeOpacity={0.8} onPress={this.confirm}>
                                <Text style={common.buttonText}>확인</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            )
        }
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
    buttonText : { color:'#FFFFFF', fontSize:22, fontWeight:'bold' }
});

const signup = StyleSheet.create({
    aBox : { padding:20, borderRadius:8, backgroundColor: '#E9EAEF', marginBottom:20, },
    aBoxText : { fontSize:18, color:'#7D848F', },

    bBox : { padding:20, borderRadius:8, backgroundColor: '#41528B', marginBottom:20, },
    bBoxText : { fontSize:18, color:'#FFFFFF', },
    bBoxButton : { 
        width:'100%', marginTop:20, padding:20, alignItems:'center',
        borderWidth:1, borderColor:'#1ECB9C', borderRadius:8, 
    },
    bBoxButtonText : { color:'#1ECB9C', fontWeight:'bold', },

    cBox : { flex:1, flexDirection:'row', alignItems:'flex-start', marginBottom:20, },
    cBoxText1 : { 
        backgroundColor:'#1ECB9C', borderRadius:4, color:'#FFFFFF',
        fontWeight:'bold', padding:12, fontSize:16,
    },
    cBoxText2 : { flex:1, fontSize:16, color:'#109D77', padding:0, marginLeft:10, },

    dBox : { padding:20, borderWidth:1, borderColor:'#DDDDDD', borderRadius:8, },
    dBoxText1 : { fontSize:15, paddingBottom:10, },
    dBoxText2 : { fontSize:15, },
});