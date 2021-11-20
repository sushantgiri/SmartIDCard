import React from 'react';
import {Text, View, Modal, TouchableOpacity, StyleSheet, Image, TextInput} from 'react-native';


var imgClose = require('../screens/assets/images/png/ic_btn_cls.png')


export default class CheckPassword extends React.Component {

    state = {
        confirmShow: false,
        confirmCheckPassword: '',
        password: '',
		dataKey: '',
		address: '',
		privateKey:'',
		mnemonic:'',
		VCarray:[],
		VCjwtArray:[],
        ModalShow: true
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
		else{
			// if(this.state.VCarray[0] !== 'dummy'){
			// 	var updatedArray = this.state.VCarray.splice(0, 0, 'dummy');
			// 	this.setState({
			// 		VCarray:updatedArray
			// 	})
			// }
			this.setState({ViewMode:2})
		} 

		// Reset confirmCheckPassword
		this.setState({confirmCheckPassword:''})
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

    //비밀번호 확인 input control
	handleConfirmPWchange = confirmCheckPassword => {
		this.setState({ confirmCheckPassword })
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

    	// Modal Function
	setModalShow = () => {
		this.setState({ModalShow:!this.state.ModalShow})
	}

    render(){


        return(
			<Modal
			animationType="slide"
			transparent={true}
			visible={this.state.modalVisible}
			onRequestClose={() => {
			// this.closeButtonFunction()
		 }}>
		<View
			 style={{
			 height: '50%',
			marginTop: 'auto',
		}}>

		 <View>
				<Text>This is Half Modal</Text>
		</View>
		<TouchableOpacity
		onPress={() => {
			// this.modalCancel()
		}}>
		<Text>Close</Text>
		</TouchableOpacity>
</View>
</Modal>
        )

    }
  
}

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
    },

    cardItem : { 
		width:'80%', height:400, backgroundColor:'#1ECB9C',
    	borderRadius:12, position:'relative', marginLeft:'10%', marginRight:'10%',
		paddingTop:20, paddingBottom:20, paddingLeft:30, paddingRight:30,
	},
});