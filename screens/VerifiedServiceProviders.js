import React from 'react';
import {StyleSheet, Text, View, Image, TouchableOpacity, ScrollView} from 'react-native';

var closeIcon = require('../screens/assets/images/png/close_scanner.png');


export default class VerifiedServiceProviders extends React.Component {

    state = {
        isVerified: false,

        password: '',
		dataKey: '',
		address: '',
		privateKey:'',
		mnemonic:'',

		VCarray:[],
		VCjwtArray:[],
		checkedArray:[],
        SVCArray:[],
		confirmCheckPassword:'',
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

      // VC Reverse
      this.setState({ 
          VCarray:this.state.VCarray.reverse(),
          VCjwtArray:this.state.VCjwtArray.reverse()
      })

      // Set checkedArray
      // 체크된 array를 따로 구분하기 위한 arrChecked[] 를 state에 포함시킴
      // 현재 VC의 개수와 같은 길이의 array를 만들고, checked attribute를 false로 포함함
      arrChecked = [];
      for (var i = 1; i <= this.state.VCarray.length; i++){
          arrChecked = arrChecked.concat([{"checked" : false}])
      } 
      this.setState({ checkedArray: arrChecked })

      // Reset confirmCheckPassword
      this.setState({confirmCheckPassword:''})

      // WebSocket Connection
      ws = new WebSocket(socketURL);
      ws.onopen = () => { ws.send('{"type":"authm", "no":"'+socketRoom+'"}'); }
      ws.onmessage = (e) => { console.log(e); this.sendChallenger(); }
    }


    	// Cancel
	cancel = () => { 
    	ws.send('{"type":"exit"}')
    	this.props.navigation.navigate('VCselect',{password:this.state.password});
  	}


	// SVP Function
	sendChallenger = async () => {
        ws.send('{"type":"challenger","data":"'+challenger+'"}');
        ws.onmessage = (e) => {
                const json = JSON.parse(e.data);
                if(json.type == "vp") this.verifyVP(json.data);
           }
    }

    verifyVP = async (vp) => {
		const key = CryptoJS.enc.Hex.parse(encryptionKeyOnUse);
		const dec = CryptoJS.AES.decrypt(vp,key,{iv:key}).toString(CryptoJS.enc.Utf8);
		const json = JSON.parse(dec);
		const vpJwt = json.data;
		
		const privateKey = this.state.privateKey;
		const ethAccount = web3.eth.accounts.privateKeyToAccount(privateKey)
		const dualSigner = createDualSigner(didJWT.SimpleSigner(privateKey.replace('0x','')), ethAccount)
		const dualDid = new DualDID(dualSigner, 'Issuer(change later)', 'Dualauth.com(change later)',web3,'0x76A2dd4228ed65129C4455769a0f09eA8E4EA9Ae')

		const result = await dualDid.verifyVP(vpJwt, challenger);
		const code = result.code;
		const data = result.data;
		const msg = result.msg;
		const success = result.success;

		if(code == "000.0" && success) {
			const svcs = result.data.verifiablePresentation.verifiableCredential;
			
			let svca = [];
			let svc = null;

			for(let i = 0; i < svcs.length; i++){
				svc = svcs[i].credentialSubject;
				svca.push(svc);
			}
			
			console.log(svca);
			this.setState({ ViewMode:1, SVCArray:svca });
		}
    }


    render(){
        return(
            <ScrollView>
                <View  style={providersStyle.rootContainer}>
                    <View style={providersStyle.closeContainer}>
                        <Image source={closeIcon} />
                    </View>

                    <Text style={providersStyle.headerStyle}>검증된 서비스 제공자의 정보입니다.</Text>

                    <View style={providersStyle.statusContainer}>

                        <Text style={providersStyle.statusLabel}>검증여부 확인</Text>
                        <View style={providersStyle.loadingContainer}>
                            <Text style={providersStyle.loadingLabelStyle}>{!this.stateisVerified ? '진행중...' : '검증완료'} </Text>
                        </View>
                    </View>

                    <View style={providersStyle.detailContainer}>

                        <Text style={providersStyle.labelStyle}>도메인명</Text>
                        <Text style={providersStyle.valueStyle} >http://www.naver.com</Text>

                        <Text style={providersStyle.labelStyle}>사업자명</Text>
                        <Text style={providersStyle.valueStyle}>이스톰</Text>

                        <Text style={providersStyle.labelStyle}>대표자명</Text>
                        <Text style={providersStyle.valueStyle}>최유선</Text>

                        <Text style={providersStyle.labelStyle}>사업자주소</Text>
                        <Text style={providersStyle.valueStyle}>경기도 안양시 동안구...</Text>

                        <Text style={providersStyle.labelStyle}>사업자전화번호</Text>
                        <Text style={providersStyle.valueStyle}>010 1114 1111</Text>


                    </View>
                        <TouchableOpacity onPress={() => {

                        }}>


                            <View style={providersStyle.buttonContainer}>
                                <Text style={providersStyle.buttonLabelStyle}>다음</Text>
                            </View>



                        </TouchableOpacity>
                    <View>


                    </View>

                </View>
            </ScrollView>
        )
    }
}

const providersStyle = StyleSheet.create({

    rootContainer: {
        backgroundColor: '#ffffff',
        flex: 1,
    },

    closeContainer: {
        flexDirection:'row',
        marginTop: 20,
        padding: 20,
        marginBottom: 20,
        justifyContent: 'flex-end',

    },

    headerStyle:{
        color: '#1A2433',
        fontSize: 18,
        marginStart: 24,
        marginBottom: 22,

    },

    statusContainer: {
        borderRadius: 8,
        backgroundColor:'#EFF8FF',
        marginStart: 24,
        marginEnd: 24,
        padding: 22,
        flexDirection: 'row',
         alignItems:'center',
         justifyContent:'space-between'
    },

    statusLabel: {
        color: '#44424A',
        fontWeight: '600',
        fontSize: 16,
    },

    loadingContainer: {
        borderRadius: 20,
        backgroundColor: '#C8E7FF',
    },

    loadingLabelStyle: {
        color: '#0083FF',
        fontSize: 16,
        fontWeight: '600',
        paddingStart: 20,
        paddingEnd: 20,
        paddingTop: 12,
        paddingBottom: 12,
    },

    detailContainer: {
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#E5EBED',
        marginStart: 27,
        marginEnd: 27,
        padding: 30,
        marginTop: 21,

    },

    labelStyle: {
        color: 'rgba(26, 36, 51, 0.9)',
        fontWeight: '600',
        fontSize:16,
        marginBottom: 8,

    },

    valueStyle: {
        color: 'rgba(153, 153, 153, 0.9)',
        fontSize: 15,
        fontWeight: '500',
        marginBottom: 26,
    },

    buttonContainer: {
        backgroundColor: '#1ECB9C',
        borderRadius: 8,
        paddingTop: 15,
        paddingBottom:15,
        paddingStart: 32,
        paddingEnd:32,
        marginBottom: 20,
        marginStart: 24,
        marginEnd: 24,
        marginTop: 24,
    },

    buttonLabelStyle: {
        color: '#FFFFFF',
        fontWeight:'600',
        fontSize: 18,
        alignSelf: 'center'
    }

   

})