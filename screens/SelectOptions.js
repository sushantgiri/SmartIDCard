import React from 'react';
import {StyleSheet, Text, View, Image, TouchableOpacity, 
        PermissionsAndroid, NativeModules, Platform} from 'react-native';
import axios from 'axios';
import jwt_decode from "jwt-decode"
import { BleManager } from 'react-native-ble-plx';
const { BNSModule } = NativeModules;

const bleModule = new BleManager();

export default class SelectOptions extends React.Component {
    state = {
        dummyView: false,
        terminals : [],
        otps : [],
        bleNotice : 'Beacon 스캔\n주변에 Beacon을 스캔하세요'
    }

    verifyTVP = (terminals, otp) => {
        const tvp = terminals.showData.tvp
        const shopName = terminals.showData.shopName
        const terminalDesc = terminals.showData.terminal_desc
        const deviceName = terminals.showData.device_name

        const VCform = jwt_decode(tvp);
        const decryptedData = jwt_decode(VCform.vp.verifiableCredential[0])
        
        /*
        console.log('showData-->', terminals.showData);
        console.log('TVP-->', tvp);
        console.log('Shop Name--->', shopName)
        console.log('Terminal Description--->', terminalDesc);
        console.log('VCForm-->!', VCform);
        console.log('VCCredentials--->', VCform.vp.verifiableCredential[0]);
        console.log('DecryptedData!', decryptedData);
        */

        this.props.navigation.push('VerificationScreen', 
        {
            decryptedData: decryptedData, 
            vcform: VCform, 
            shopName: shopName,
            terminalDescription: terminalDesc,
            deviceName : deviceName,
            otpData: otp,
            terminals: terminals,
            tvp: tvp
        })
    }

    setTerminals = (terminals, index) => {
        return(
            <TouchableOpacity style={optionsStyle.optionsContainer} onPress={() => { this.verifyTVP(terminals, this.state.otps[index]) }}>
                <Image source={require('../screens/assets/images/png/terminal_icon.png')} />
                <Text style={optionsStyle.optionLabelStyle}>
                    {
                        terminals.showData.shopName != "" && terminals.showData.shopName != null
                        ? terminals.showData.shopName + "\n" + terminals.showData.terminal_desc
                        : null
                    }
                    {
                        terminals.showData.device_name != "" && terminals.showData.device_name != null
                        ? terminals.showData.device_name + "\n"
                        : null
                    }
                </Text>
            </TouchableOpacity>
        )
    };

    // BLE 사용을 위한 OS 권한 확인
    bleOSAuthCheck = async () => {
        let check = true;

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

        return check;
    }
    // BLE 사용을 위한 OS 권한 확인

    // BLE 라이브러리 미사용
    bleScan = async () => {
        let check = await this.bleOSAuthCheck();
        if(!check) { alert("권한이 허용되지 않으면 BLE 수신이 불가능합니다."); return; }

        this.setState({ otps : [] });
        this.setState({ terminals: [] });
        this.setState({ bleNotice:'Beacon 스캔\n주변에 Beacon을 스캔하고 있습니다' });

        let bleDatas = [];
        bleModule.startDeviceScan(null, null, (error, device) => {
            if(error) { 
                console.log("Beacon Scan Fail", error); 
                this.setState({ bleNotice:'Beacon 스캔\n주변에 Beacon을 스캔하세요' });
                return;
            }
            
            let bleCheck = false;
            if(device.name === "oterminal-1") bleCheck = true;
            // 중복 제거
            bleDatas.map((bleData, index) => {
                let json = JSON.parse(bleData);
                if(device.id === json.id) bleCheck = false;
            });
            // 중복 제거

            if(bleCheck){
                let bleData = '';
                bleData += '{';
                bleData += '"id":"' + device.id + '",';
                bleData += '"name":"' + device.name + '",';
                bleData += '"manufacturerData":"' + device.manufacturerData + '",';
                bleData += '"serviceUUIDs":"' + device.serviceUUIDs + '"';
                bleData += '}';
                bleDatas.push(bleData);
            }
        })

        setTimeout(() => { 
            bleModule.stopDeviceScan();
            this.bnsData(bleDatas);
        }, 2000);
    }

    bnsData = (bleDatas) => {
        console.log("bleDatas", bleDatas);

        if(bleDatas.length == 0){ 
            console.log("Beacon Data Empty");
            this.setState({ bleNotice:'Beacon 스캔\n주변에 Beacon을 스캔하세요' });
            return;
        }

        var otps = [];
        var params = '{"list":[';

        bleDatas.map((bleData, index) => {
            let json = JSON.parse(bleData);
            const name = json.name;
            let uuid = json.serviceUUIDs.replace(/-/gi, "");

            const terminalID = uuid.substring(0, 18);
            const terminalOTP = uuid.substring(18, 24);
            
            params += '{"serviceName":"' + name + '","id":"' + terminalID + '"}';
            if(index < bleData.length - 1) params += ",";

            otps.push(terminalOTP);
        });

        params += ']}';
        params = encodeURIComponent(params);

        console.log("params", params);

        axios
        .get('http://dev.tis.openterminal.com:3100/tis/api/rest/client/terminal/terminals/' + params)
        .then((response) => {
            this.setState({ otps : otps });
            this.setState({ terminals: response.data.list });
            this.setState({ bleNotice:'Beacon 스캔\n주변에 Beacon을 스캔하세요' });
        })
        .catch(function (error) {
            console.log("BNS Error", error);
        });
    }
    // BLE 라이브러리 미사용

    // BLE 라이브러리 사용 (현재 안드로이드만 가능)
    bnsCall = async () => {
        let check = await this.bleOSAuthCheck();
        if(!check) { alert("권한이 허용되지 않으면 BLE 수신이 불가능합니다."); return; }

        this.setState({ otps : [] });
        this.setState({ terminals: [] });
        this.setState({ bleNotice:'Beacon 스캔\n주변에 Beacon을 스캔하고 있습니다' });

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
                this.setState({ otps : otps });
                this.setState({ terminals: response.data.list });
                this.setState({ bleNotice:'Beacon 스캔\n주변에 Beacon을 스캔하세요' });
            })
            .catch(function (error) {
                console.log(error);
            });
        }, (error) => {
            console.log("BNS Error", error);
        });
    };
    // BLE 라이브러리 사용 (현재 안드로이드만 가능)

    render(){
        return(
            <View>
                <View style={optionsStyle.headerContainer}>
                    <Text style={optionsStyle.headerLabel}>사용처 선택</Text>
                    <TouchableOpacity onPress={() => this.props.navigation.pop()}>
                        <Image source={require('../screens/assets/images/png/close_scanner.png')} />
                    </TouchableOpacity>                    
                </View>
                <View style={optionsStyle.barContainer}>
                    <Text style={optionsStyle.barLabel}>사용처를 선택해주세요 ✨</Text>
                </View>
                <TouchableOpacity onPress={() => { this.props.navigation.pop(); this.props.navigation.push('ScanScreen'); }}>
                    <View style={optionsStyle.optionsContainer}>
                        <Image source={require('../screens/assets/images/png/primary.png')} />
                        <Text xt style={optionsStyle.optionLabelStyle}>QR 스캔{"\n"}Beacon이 없으면 QR을 스캔하세요</Text>
                    </View>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => { this.bnsCall(); }}>
                    <View style={optionsStyle.optionsContainer}>
                        <Image source={require('../screens/assets/images/png/ble_icon.png')} />
                        <Text xt style={optionsStyle.optionLabelStyle}>{ this.state.bleNotice }</Text>
                    </View>
                </TouchableOpacity>
                { this.state.terminals.map((terminals, index) => this.setTerminals(terminals, index)) }
            </View>    
        )
    }

    componentDidMount(){  }
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