import React from 'react';
import {StyleSheet, Text, View, Image, TouchableOpacity, 
        PermissionsAndroid, NativeModules, Platform} from 'react-native';
import axios from 'axios';
import jwt_decode from "jwt-decode"


const { BNSModule } = NativeModules;

export default class SelectOptions extends React.Component {
    state = {
        dummyView: false,
        terminals : [],
        otps : []
    }

    verifyTVP = (terminals, otp) => {
        const tvp = terminals.showData.tvp
        const shopName = terminals.showData.shopName
        const terminalDesc = terminals.showData.terminal_desc
        console.log('TVP-->', tvp);
        console.log('Shop Name--->', shopName)
        console.log('Terminal Description--->', terminalDesc);

        const VCform = jwt_decode(tvp);
        console.log('VCForm-->!', VCform);
        console.log('VCCredentials--->', VCform.vp.verifiableCredential[0]);

        const decryptedData = jwt_decode(VCform.vp.verifiableCredential[0])
        console.log('DecryptedData!', decryptedData);
        // this.props.navigation.push('VPREQ_VCsend',{BLE: 'BLE'})
        this.props.navigation.push('VerificationScreen', 
        {decryptedData: decryptedData, 
            vcform: VCform, 
            shopName: shopName,
            terminalDescription: terminalDesc,
            otpData: otp,
            terminals: this.state.terminals,
            tvp: tvp
             })


        

        

        // const decodedVC = JSON.stringify(tvp).substring(28,JSON.stringify(tvp).length-2)
        // console.log('DecodedVC', decodedVC);


		// const VCform = jwt_decode(decodedVC);
        // const decodedVCForm = jwt_decode(VCform);


        // console.log('TVP', tvp);
        // console.log('DecodedVC', decodedVC);
        // console.log('VCForm', VCform);
        // console.log('DecodedVCForm', decodedVCForm);
    }

    setTerminals = (terminals, index) => {
        return(
            <TouchableOpacity style={optionsStyle.optionsContainer} onPress={() => { this.verifyTVP(terminals, this.state.otps[index]) }}>
                <Image source={require('../screens/assets/images/png/secondary.png')} />
                <Text style={optionsStyle.optionLabelStyle}>
                    {terminals.showData.shopName}{"\n"}{terminals.showData.terminal_desc}
                </Text>
            </TouchableOpacity>
        )
    };

    bnsCall = async () => {
        try { 
            let check = true;

            // 권한 확인
            if (Platform.OS === "android") {
                const granted = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION);
                if (granted !== PermissionsAndroid.RESULTS.GRANTED) check = false;
                /*
                await PermissionsAndroid.requestMultiple([
                    PermissionsAndroid.PERMISSIONS.BLUETOOTH,
                    PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
                    PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
                ]).then((result)=>{
                    if (!result['android.permission.BLUETOOTH'] === "granted") check = false;
                    if (!result['android.permission.BLUETOOTH_SCAN'] === "granted") check = false;
                    if (!result['android.permission.ACCESS_FINE_LOCATION'] === "granted") check = false;                
                });
                */
            }else{
                
            } 
            // 권한 확인

            // BNS SDK 연동
            if(check){
                BNSModule.initialize();
                BNSModule.getTerminals((data) => {
                    var otps = [];
                    var params = '{"list":[';
                    for(var i = 0; i < data.length; i++){
                        params += '{"serviceName":"oterminal-1","id":"' + data[i].OtpId + '"}';
                        if(i < data.length - 1) params += ",";
                        otps.push(data[i].Otp);
                    }
                    params += ']}';
                    params = encodeURIComponent(params);

                    axios
                    .get('http://dev.tis.openterminal.com:3100/tis/api/rest/client/terminal/terminals/' + params)
                    .then((response) => {
                        console.log(response.data);
                        console.log(response.data.list);

                        console.log('Otps Data', otps);
                        console.log('Terminals Data',response.data.list);
                        
                        this.setState({ otps : otps });
                        this.setState({ terminals: response.data.list });
                    })
                    .catch(function (error) {
                        console.log(error);
                    });

                }, (error) => {
                    console.log(error);
                });
            }else{
                alert("권한이 허용되지 않으면 BLE 수신이 불가능합니다.");
            }
            // BNS SDK 연동
        } catch (err) {
            console.warn(err);
        }
    };

    render(){
        return(
            <View>

                <View style={optionsStyle.headerContainer}>

                    <Text style={optionsStyle.headerLabel}>사용처 선택</Text>
                    <TouchableOpacity  onPress={() => this.props.navigation.pop()}>

                    <Image source={require('../screens/assets/images/png/close_scanner.png')} />
                    </TouchableOpacity>
                    
                </View>

                <View style={optionsStyle.barContainer}>
                    <Text style={optionsStyle.barLabel}>사용처를 선택해주세요 ✨</Text>
                </View>

                <TouchableOpacity onPress={() => { this.props.navigation.pop(); this.props.navigation.push('ScanScreen'); }}>
                    <View style={optionsStyle.optionsContainer}>
                        <Image source={require('../screens/assets/images/png/primary.png')} />
                        <Text xt style={optionsStyle.optionLabelStyle}>주변에 비콘이 없을 땐{"\n"}QR로 스캔하세요</Text>
                    </View>
                </TouchableOpacity>
                
                { this.state.terminals.map((terminals, index) => this.setTerminals(terminals, index)) }
            </View>    
        )
    }

    componentDidMount(){
        this.bnsCall(); // BNS SDK 연동
    }
}

const optionsStyle = StyleSheet.create({

    rootContainer: {
        flex : 1,
        
    },

    headerContainer: {
      marginTop:50,
      marginBottom: 18,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginStart: 24,
      marginEnd: 24,
      
    },

    barContainer: {
        flexDirection: 'row',
        marginStart: 24,
        marginEnd: 24,
        borderRadius: 8,
        backgroundColor: '#42528B',
        paddingStart: 16,
        paddingEnd: 16,
        paddingTop: 12,
        paddingBottom: 12,
        justifyContent:'space-between',
        alignItems:'center',
        marginBottom: 33,
    },

    barLabel:{
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600'
    },

    optionsContainer: {
        marginStart: 24,
        marginEnd: 24,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#E5EBED',
        flexDirection: 'row',
        padding: 15,
        marginBottom: 16,
    },

    optionLabelStyle: {
        marginStart: 22,
        fontSize: 16,
        color:'rgba(26, 36, 51, 0.9)'
    },

    secondaryLabelStyle: {
        fontSize: 16,
        color: 'rgba(26, 36, 51, 0.9)',
        fontWeight: '500'
    },


    headerLabel: {
        color: '#1A2433',
        fontSize: 16,
        fontWeight: '600',
        justifyContent: 'center',
        flex: 1,
        textAlign: 'center'
    },
    headerImageStyle: {
        
    }
})