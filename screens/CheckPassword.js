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
			 <View style={{
				 backgroundColor: 'rgba(0, 0, 0, 0.8)',
				 height: '100%',
			 }}>


						<View
								style={{
								height: '40%',
								marginTop: 'auto',
								borderTopStartRadius: 24,
								borderTopEndRadius: 24,
								backgroundColor: '#ffffff'
							}}>

								<TouchableOpacity style= {modal.closeIconContainer} onPress={() => {

								}}>
									<Image source={imgClose} style={modal.closeIconStyle} />
								</TouchableOpacity>

								<Text style={modal.labelStyle}>비밀번호를 입력하세요</Text>

								<TextInput
									name='confirmCheckPassword'
									// value={confirmCheckPassword}
									placeholder='비밀번호'
									secureTextEntry
									onChangeText={this.handleConfirmPWchange}
									style={modal.textInput}
								/>

										<TouchableOpacity onPress={() => {

										}}>


										<View style={modal.buttonContainer}>
										<Text style={modal.buttonLabelStyle}>제출</Text>
										</View>

										</TouchableOpacity>
						</View>

				</View>			
			</Modal>
        )

    }
  
}

const modal = StyleSheet.create({

	closeIconContainer: {
		marginTop: 16,
		marginEnd: 24,
		marginBottom: 12,
	},
	closeIconStyle: {
		alignSelf: 'flex-end',
	},

	labelStyle: {
		color:'#1A2433',
		fontSize: 18,
		marginStart: 24,
	},

	textInput : {
        fontSize:16, marginBottom:8,
        paddingTop:15, paddingBottom:15, paddingLeft:12, paddingRight:12, 
        borderWidth:1, borderRadius:6, borderColor:'#CED2D5',marginTop: 24,
		marginStart: 24, marginEnd: 24
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
    },



	
});