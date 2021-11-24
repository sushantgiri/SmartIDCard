import React from 'react'
import {StyleSheet, View, Text, Image, Dimensions, Modal, TouchableOpacity} from 'react-native'
import {format} from "date-fns" // Date Format

var closeIcon = require('../screens/assets/images/png/close_scanner.png')

export default class HappyCitizenship extends React.Component {

    state =  {
        isQrScanning: false,
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
   

    render() {

        const vc = this.props.navigation.getParam('vc');

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

                <View style={styles.searchContainer}>
                    <Image source={require('../screens/assets/images/png/happy_citizen_search.png')} />
                    <Text style={styles.searchTextStyle}>정보 제공 내역</Text>
                </View>

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

    container: {
        flex: 1,
        backgroundColor: '#fff',
      },

     header_background: {
        backgroundColor: '#0083FF',
        height: 226,
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

    searchTextStyle: {
        color:'#1ECB9C',
        fontWeight:'600',
        fontSize:16,
    }

    
})