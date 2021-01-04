import {DualDID} from '@estorm/dual-did';
const didJWT = require('did-jwt')
const Web3 = require('web3')
const web3 = new Web3('http://182.162.89.51:4313')
import React from 'react'
import { StyleSheet, View,Text, Button,TextInput, TouchableOpacity, TouchableHighlight, Modal, LogBox} from 'react-native'
import CryptoJS from 'react-native-crypto-js';
import SecureStorage from 'react-native-secure-storage'

var AES = require("react-native-crypto-js").AES;
var socketRoom ='';
var socketURL = '';
var passwordInMobile = '';
var nonce = '';
var ws = '';
var arr = '';
var arrChecked= [];

function VC({vc}){
    return (
    <View>
      <View>
              <Text style={styles.vcText}>인증서</Text>
              <Text>이름 : {vc.vc.credentialSubject.name}</Text>
              <Text>Email: {vc.vc.credentialSubject.email}</Text>
              <Text>생일 : {vc.vc.credentialSubject.birthday}</Text>
              <Text>성별 : {vc.vc.credentialSubject.gender}</Text>
              <Text>Phone: {vc.vc.credentialSubject.phone}</Text>
      </View>
    </View>

    

    )
}
function createDualSigner (jwtSigner, ethAccount) {
  return { jwtSigner, ethAccount }
}
export default class QRscreenVP extends React.Component {
  state = {
    password: '',
    dataKey: '',
    address: '',
    privateKey:'',
    mnemonic:'',
    VCarray:[],
    VCjwtArray:[],
    showingData: '',
    checkedArray:[],
    confirmCheckPassword:'',
    modalVisible: false
  }
  handleConfirmPWchange = confirmCheckPassword => {
    this.setState({ confirmCheckPassword })
  }

  getDidData = async () => {
      await SecureStorage.getItem(passwordInMobile).then((docKey) => {
        this.setState({dataKey: docKey}, async function() {
            await SecureStorage.getItem(this.state.dataKey).then((userData) => {
            //console.log(JSON.stringify(userData))
            if( userData != null){
              let bytes  = CryptoJS.AES.decrypt(userData, this.state.dataKey);
              //console.log(bytes)
              let originalText = bytes.toString(CryptoJS.enc.Utf8);
              //console.log(originalText)
              this.setState(JSON.parse(originalText))
              this.settingCheckArray();
            }
            })

        })
      })
      

  }

  receiveVC = () => {
    this.setState({checkedArray:[]})
    ws = new WebSocket(socketURL);
    ws.onopen = () => {
      ws.send('{"type":"authm", "no":"'+socketRoom+'"}');
      ws.onmessage = (e) => {
        
        
      }

    }
  }
  settingCheckArray = () => {
    arrChecked = [];
    for (var i = 1; i<=this.state.VCarray.length;i++){
      arrChecked = arrChecked.concat([{"checked" : false}])
      
      
    } 
    this.setState({
      checkedArray: arrChecked
    })
  }
  
  close = () => {
    this.props.navigation.navigate('VCselect',{password:this.state.password});
  }
  checkboxClicked = index => {
    this.state.checkedArray[index].checked = !this.state.checkedArray[index].checked
    arrChecked = this.state.checkedArray
    this.setState({checkedArray: this.state.checkedArray})
  }
  VCclick = e =>{
    
    for (var i=0;this.state.VCarray.length;i++){
      
      if(e == this.state.VCarray[i]){
        this.checkboxClicked(i)
        
        //this.next(i)
        return
      }
    }
  
  }
  pickVCinArray = () => {
    var vcSubmitArr = [];
    for(var i = 0; i<this.state.VCjwtArray.length;i++){
      if(this.state.checkedArray[i].checked == true){
        var jwtString = this.state.VCjwtArray[i].split(',')[1].split(':')[1]
        vcSubmitArr = vcSubmitArr.concat([jwtString.substring(1,jwtString.length-2)])
      }
    }
    this.next(vcSubmitArr)


  }
  passwordModal = () => {
    this.setState({ modalVisible: true})
  }
  passwordCheck = () => {
    if(this.state.confirmCheckPassword == this.state.password){
     
      this.setState({modalVisible:false}, function(){
        this.pickVCinArray()
      })
     
    } else {
      alert('비밀번호 불일치')
    }
  }


  next = async (i) => {
    const privateKey = this.state.privateKey;
    const ethAccount = web3.eth.accounts.privateKeyToAccount(privateKey)
    const dualSigner = createDualSigner(didJWT.SimpleSigner(privateKey.replace('0x','')), ethAccount)
    
    
    const dualDid = new DualDID(dualSigner, 'Issuer(change later)', 'Dualauth.com(change later)',web3,'0x3CF0CB3cD457b959F6027676dF79200C8EF19907')
    const vp = await dualDid.createVP(i,nonce)
    //console.log(vp)
    ws.send('{"type":"vp", "data":"'+vp+'"}')
    ws.onmessage = (e) => {
            
            
    }
    
    this.close()
  }

  cardStyle = bool => {
    
    if(this.state.checkedArray[bool] != null){
      if(this.state.checkedArray[bool].checked == true){    
        return{
          backgroundColor:'#8FF',
          borderRadius:12,
          width:300,
          margin:10,
          padding:10
        }
      } else {
        return{
          backgroundColor:'#eff',
          borderRadius:12,
          width:300,
          margin:10,
          padding:10
        }
      }
    }
  }

  render() {
    const { confirmCheckPassword, modalVisible} = this.state
    const {navigation} = this.props
    const userRoom = navigation.getParam('roomNo',"value")
    const userSocket = navigation.getParam('socketUrl',"Url")
    const userPW = navigation.getParam('userPW',"passwordValue")
    const userNonce = navigation.getParam('nonce',"nonceVal")
    socketRoom = userRoom;
    socketURL = userSocket;
    nonce = userNonce;
    passwordInMobile = userPW;
    return ( 

      <View style={styles.container}>
        <Modal animationType="slide" transparent={true} visible={modalVisible}>
          <View style={styles.centeredView}>
            <View style={styles.modalView}>
              <Text style={{fontWeight:"bold",fontSize:25}}> 비밀번호를 입력해주세요 </Text>
              <TextInput
                name='confirmCheckPassword'
                value={confirmCheckPassword}
                placeholder='비밀번호'
                secureTextEntry
                onChangeText={this.handleConfirmPWchange}
                style={styles.inputText}
              />
              <TouchableHighlight
                style={styles.modalButton}
                onPress={this.passwordCheck}
                >
                <Text style={styles.textStyle}>다음</Text>
              </TouchableHighlight>
            </View>
          </View>
        </Modal>
        <Text>{userNonce.split(':')[3]}</Text>
        
        <Text>VC를 선택해주세요</Text>
        
        <View>{this.state.VCarray.map((vc,index) => {return(
          <View>
          <TouchableOpacity  style={this.cardStyle(index)} onPress={() => this.VCclick(vc)}><VC vc={vc} key={vc.exp}/>
          </TouchableOpacity>   
          </View>
        )
        })}
        
        </View>
        <View style={{ flexDirection:"row"}}>
        <TouchableOpacity style={styles.bottomLeftButton} onPress={this.passwordModal}><Text style={styles.buttonLeftText}>VP 생성 및 제출</Text></TouchableOpacity>
        <TouchableOpacity style={styles.bottomButton} onPress={this.close}><Text style={styles.buttonText}>취소</Text></TouchableOpacity>
        </View>
      </View>
    )
    
  }
  componentDidMount() {
    this.getDidData();
    this.receiveVC();
    
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center'
  },
  textMarginer: {
    margin:20
  },
  certificateCard:{
    borderRadius:12,
    width:300,
    backgroundColor: '#DFF',
    margin:10,
    padding:10
  },
  certificateCardClicked:{
    borderRadius:12,
    width:300,
    backgroundColor: '#AAA',
    margin:10,
    padding:10
  },
  modalButton: {
    backgroundColor: '#316BFF',
    padding: 15,
    margin: 50,
    borderRadius: 12,
    width:300,
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
    elevation: 5
  },
  openButton: {
    backgroundColor: "#F194FF",
    borderRadius: 20,
    padding: 10,
    elevation: 2
  },
  textStyle: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center"
  },
  modalText: {
    marginBottom: 15,
    textAlign: "center"
  },
  bottomLeftButton:{
    backgroundColor: '#c3d4ff',
    paddingTop:10,
    paddingBottom:10,
    height:50,
    marginRight:5,

    borderRadius: 12,
    width:'40%',
    alignItems:'center'
  },
  buttonLeftText: {
    color: '#316BFF',
    fontWeight:'bold'
  },
  bottomButton: {
    backgroundColor: '#316BFF',
    paddingTop:10,
    paddingBottom:10,
    marginLeft:5,
    marginBottom:20,
    height:50,
    borderRadius: 12,
    width:'40%',
    alignItems:'center'
  },
})
