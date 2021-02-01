import React from 'react'
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Modal, TouchableHighlight} from 'react-native'
// Crypto JS 모듈
import CryptoJS from 'react-native-crypto-js';
var AES = require("react-native-crypto-js").AES;

// SecureStorage 모듈
import SecureStorage from 'react-native-secure-storage'
// Clipboard 모듈 
import Clipboard from '@react-native-community/clipboard'

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
 * 
 * 
 * 
*/
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
  didprivatekey = wallet.privateKey;
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
    confirmPassword:'',
    password: '',
    address: '',
    privateKey:'',
    mnemonic:'',
    dataKey:'',
    VCarray:[],
    VCjwtArray:[],
    modalVisible: false
  }
  
  // Password 와 confirm password 의 state control functions.
  handlePasswordChange = password => {
    this.setState({ password })
  }
  handleConfirmPWchange = confirmPassword => {
    this.setState({ confirmPassword })
  }


  stateSet = () =>{
    if(this.state.password == this.state.confirmPassword){
      // did 생성
      did();

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
        
        // Modal 표시
        this.setState({ modalVisible: true })
      });

    } else {
      alert("비밀번호 불일치")
    }

  }

  // 사용자가 Modal 에서 '다음'을 눌렀을때
  // Modal 을 내리고, 현재 password를 userToken을 키로 지정하여 사용될 수 있도록 저장
  agree = async () => {
    this.setState({ modalVisible: false})
    // password 를 userToken으로 저장
    await SecureStorage.setItem('userToken', this.state.password)
    this.props.navigation.navigate('App')
  }
  
  
  render() {
      const { password, confirmPassword, modalVisible } = this.state
    return (
      <View style={styles.container}>
      <Modal animationType="slide" transparent={true} visible={modalVisible}>
        <View style={styles.centeredView}>

          <View style={styles.modalView}>

            <Text style={{fontWeight:"bold",fontSize:25}}>시드가 생성되었습니다</Text>

            <Text style={styles.modalText}>{this.state.mnemonic}</Text>
                
            <Text style={styles.modalText}>24 단어 시드를 안전한 곳에 저장하여 주시기 바랍니다.</Text>
            <Text>24 단어 형태의 시드는 앱을 재설치하거나 새로운 기기에
            현재의 계정을 옮기기 위해 이용됩니다. </Text>
            <Text>이후에도 프로필 화면에서 확인하실 수 있습니다.</Text>
            
            <TouchableOpacity onPress={()=>Clipboard.setString(this.state.mnemonic)}>
              <Text style={{backgroundColor:'grey'}}>클립보드에 복사</Text>
            </TouchableOpacity>

            <TouchableHighlight style={styles.modalButton} onPress={this.agree}>
              <Text style={styles.textStyle}>다음</Text>
            </TouchableHighlight>
            
          </View>

        </View>
      </Modal>

        <Text style={styles.textUpper}>비밀번호 설정</Text>

        <View style={{ margin: 10 }}>
          <TextInput
            name='password'
            value={password}
            placeholder='비밀번호'
            secureTextEntry
            onChangeText={this.handlePasswordChange}
            style={styles.inputText}
          />
          <TextInput
            name='confirmPassword'
            placeholder='비밀번호 확인'
            secureTextEntry
            value={confirmPassword}
            onChangeText={this.handleConfirmPWchange}
            style={styles.inputText}
          />
        </View>

        <View>
          <Text style={styles.textContext}>최초 앱을 생성하기 위한 비밀번호를 설정해 주시기 바랍니다.</Text>
          <Text style={styles.textContext}>이후 비밀번호는 VC를 제출하거나 계정을 복구하는데 사용됩니다.</Text>
        </View>

        <View >
          <TouchableOpacity style={styles.bottomButton} onPress={this.stateSet}><Text style={styles.buttonText}>확인</Text></TouchableOpacity>
        </View>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center'
  },
  textUpper: {
    color: 'black',
    fontSize: 20,
    fontWeight: 'bold',
    textAlign:'left',
    width:'70%'
  },
  textContext: {
    color: 'black',
    fontSize: 17,
    textAlign:'left',
    width:380,
    margin:10
  },
  inputText: {
    backgroundColor:'white',
    width: 370,
    padding:15,
    margin:20,
    borderRadius:12,
    borderColor:'black',
    borderWidth:1
  },
  bottomButton: {
    backgroundColor: '#316BFF',
    padding: 15,
    margin: 50,
    borderRadius: 12,
    width:380,
  },
  
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    alignContent:"center",
    textAlign:"center"
  },
  modalView: {
    margin: 20,
    backgroundColor: "white",
    borderRadius: 20,
    padding: 35,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    height:450
  },
  modalButton: {
    backgroundColor: '#316BFF',
    padding: 15,
    margin: 50,
    borderRadius: 12,
    width:300,
  },
  
  modalText: {
    marginBottom: 15,
    marginTop:10
  }
})
