import React from 'react'
import { StyleSheet, Text, View, Button, TextInput, TouchableOpacity, Modal, TouchableHighlight} from 'react-native'
import CryptoJS from 'react-native-crypto-js';
var AES = require("react-native-crypto-js").AES;
import SecureStorage from 'react-native-secure-storage'

import Clipboard from '@react-native-community/clipboard'


const didJWT = require('did-jwt');
const { Resolver } = require('did-resolver');
const { getResolver } = require('@estorm/dual-did');
const Web3Utils = require('web3-utils');

const { DualDID } = require('@estorm/dual-did')
const Web3 = require('web3')
const web3 = new Web3('http://182.162.89.51:4313') // TODO: geth url
const smartContractAddress = '0x3CF0CB3cD457b959F6027676dF79200C8EF19907'

var userAddress = '';
var userMnemonic = '';
var userPK = '';
var dataKey ='';
var didprivatekey = '';
function address() {
  const { randomBytes } = require("crypto");
  
  const { Mnemonic, HDKey, EthereumAddress } = require("wallet.ts");
  const mnemonic = Mnemonic.generate(randomBytes(32));
  
  const phrase = mnemonic.phrase;
  userMnemonic = phrase;
  const seed = mnemonic.toSeed();
  const masterKey = HDKey.parseMasterSeed(seed);
  
  const extendedPrivateKey = masterKey.derive("m/44'/60'/0'/0").extendedPrivateKey;

  //generate key for use in mobile device data exchange
  //with 16 random bytes ( 128 bit long ) to store data in secure elements

  const mobileBytes = randomBytes(16);
  dataKey = Web3Utils.bytesToHex(mobileBytes);
  
  // Build mobile key end


  const childKey = HDKey.parseExtendedKey(extendedPrivateKey);
  const wallet = childKey.derive("0");
  didprivatekey = wallet.privateKey;
  userPK = Web3Utils.bytesToHex(wallet.privateKey);
  const address = EthereumAddress.from(wallet.publicKey).address;
  userAddress = "did:dual:"+address.toLowerCase();
  return {
    sampleAddress: address,
    sampleDID: `did:dual:${address.toLowerCase()}`,
    signer: didJWT.SimpleSigner(Web3Utils.bytesToHex(wallet.privateKey))
  }



}

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
  handlePasswordChange = password => {
    this.setState({ password })

  }
  handleConfirmPWchange = confirmPassword => {
    this.setState({ confirmPassword })
  }
  stateSet = () =>{
    if(this.state.password == this.state.confirmPassword){
      did();
      this.setState({ address: userAddress, privateKey: userPK, mnemonic: userMnemonic, dataKey: dataKey}, () => {
      let cipherData = CryptoJS.AES.encrypt(JSON.stringify(this.state), dataKey).toString();
      
      SecureStorage.setItem(this.state.dataKey, cipherData);
      SecureStorage.setItem(this.state.password,this.state.dataKey);
      this.setState({ modalVisible: true })
      
      });
    } else {
      alert("비밀번호 불일치")
    }
  }
  agree = async () => {
    this.setState({ modalVisible: false})
    await SecureStorage.setItem('userToken', this.state.password)
    console.log(this.state.password)
    this.props.navigation.navigate('App')
  }
  saveItem = async () => {

    
    let cipherData = CryptoJS.AES.encrypt(JSON.stringify(this.state), dataKey).toString();
    
    await SecureStorage.setItem(this.state.dataKey, cipherData);
    await SecureStorage.setItem(this.state.password,this.state.dataKey);
  }
  
  
  render() {
      const { password, confirmPassword, modalVisible } = this.state
    return (
      <View style={styles.container}>
      <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
        >
          <View style={styles.centeredView}>
            <View style={styles.modalView}>
              <Text style={{fontWeight:"bold",fontSize:25}}> 시드가 생성되었습니다 </Text>
              <Text style={styles.modalText}>{this.state.mnemonic}</Text>
                
              <Text style={styles.modalText}>24 단어 시드를 안전한 곳에 저장하여 주시기 바랍니다.</Text>
              <Text>24 단어 형태의 시드는 앱을 재설치하거나 새로운 기기에
              현재의 계정을 옮기기 위해 이용됩니다. </Text>
              <Text>이후에도 프로필 화면에서 확인하실 수 있습니다.</Text>
              <TouchableOpacity onPress={()=>Clipboard.setString(this.state.mnemonic)}>
                <Text style={{backgroundColor:'grey'}}>클립보드에 복사</Text>
              </TouchableOpacity>
              <TouchableHighlight
                style={styles.modalButton}
                onPress={this.agree}
              >
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
        <TouchableHighlight
          onPress={() => {
            this.setModalVisible(true);
          }}
          >
          <Text>제출</Text>
        </TouchableHighlight>
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
