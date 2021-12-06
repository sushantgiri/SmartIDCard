import React from 'react';
import {Text, View, StyleSheet, Image, Dimensions, Switch} from 'react-native';
import PropTypes from 'prop-types';

var contactsIcon = require('../screens/assets/images/png/contact_icon.png')
var rightIcon = require('../screens/assets/images/png/right_icon.png')
var headSetIcon = require('../screens/assets/images/png/headset.png')
var announceIcon = require('../screens/assets/images/png/announce.png')
var newCircleIcon = require('../screens/assets/images/png/new_circle.png')
var cardStackIcon = require('../screens/assets/images/png/cardStack.png')
var refreshIcon = require('../screens/assets/images/png/refresh.png')

export default class SettingsScreen extends React.Component {

    renderCardItem = (entry) => {
        return(
            <View style={listStyle.cardItemHolder}>
              <View style={listStyle.card} /> 
              <Text style={listStyle.cardItemLabel}>{entry}</Text>
            </View>
        )
    }

    toggleSwitch = () => {
        this.setState({
            isBiometricEnabled: !this.state.isBiometricEnabled,
        })
        this.setState({
            isPasswordEnabled: !this.state.isBiometricEnabled ? false: true
        })
        // this.togglePasswordSwitch()
    }

    togglePasswordSwitch = () => {
        this.setState({
            isPasswordEnabled: !this.state.isPasswordEnabled,
        })

        this.setState({
            isBiometricEnabled: !this.state.isPasswordEnabled ? false : true
        })
        // this.toggleSwitch()
    }


    state = {
        cardArray: ['이용안내', '서비스 소개', '문의'],
        isBiometricEnabled: true,
        isPasswordEnabled: false,
    
    }

    render(){
        return(
            <View style={settingsScreenStyle.rootContainer}>

                <View style={settingsScreenStyle.firstContainer}>

                <Text style={settingsScreenStyle.headerlabel}>설정</Text>

                <View style={settingsScreenStyle.addressContainer}>
                    <View style={settingsScreenStyle.addressHeaderContainer}>
                        <View style={settingsScreenStyle.dummyContainer}>
                             <Image source={contactsIcon} />
                              <Text style={settingsScreenStyle.addressHeaderLabel}>홍길동님</Text>
                        </View>      
                             <Image source={rightIcon} />
                    </View>

                    <View style={settingsScreenStyle.actualAddressContainer}>
                        <Text style={settingsScreenStyle.addressLabel}>{this.props.address}</Text>
                    </View>

                </View>


            <View>
                <View style={settingsOptions.mainContainer}>

                    <View style={settingsOptions.mainSubContainer}>
                        <View style={settingsOptions.item_square}/>
                        <Text style={settingsOptions.item_title}>얼굴인식</Text>
                    </View>

                
                    <Switch
                        style={settingsOptions.switchStyle}
                        trackColor={{ false: "#E6EBF3", true: "#EEFCF8" }}
                        thumbColor={this.state.isBiometricEnabled ? "#109D77" : "#f4f3f4"}
                        ios_backgroundColor="#3e3e3e"
                        onValueChange={this.toggleSwitch}
                        value={this.state.isBiometricEnabled} />

                </View>

                <View style={settingsOptions.mainContainer}>

                    <View style={settingsOptions.mainSubContainer}>
                        <View style={settingsOptions.item_square}/>
                        <Text style={settingsOptions.item_title}>지문</Text>
                    </View>

                
                    <Switch
                        style={settingsOptions.switchStyle}
                        trackColor={{ false: "#E6EBF3", true: "#EEFCF8" }}
                        thumbColor={this.state.isPasswordEnabled ? "#109D77" : "#f4f3f4"}
                        ios_backgroundColor="#3e3e3e"
                        onValueChange={this.togglePasswordSwitch}
                        value={this.state.isPasswordEnabled} />

                </View>


                </View>

                </View>


                <View style={settingsScreenStyle.secondContainer}>


                    <View style={settingsScreenStyle.headSetRowContainer}>
                        <Image source={headSetIcon} />
                        <Text style={settingsScreenStyle.headsetLabel}>고객센터</Text>
                    </View>

                    <View style={listStyle.cardContainer}>
                        {this.state.cardArray.map((entry, index)=>{
							return(
								this.renderCardItem(entry)
							)
					})}
                    </View>


                    <View style={listStyle.lineStyle} />

                    <View style={infoSection.infoContainer}>

                        <View style={infoSection.announceContainer}>

                        <View style={infoSection.infoFlex}>
                            <Image source={announceIcon} />
                            <Text style={infoSection.announceLabelStyle}>공지사항</Text>
                            
                            <Image  source={newCircleIcon} />
                        </View>


                            <Image source={rightIcon} />

                        </View>


                        <View style={infoSection.bottomAnnounceContainer}>

                            <View style={infoSection.infoFlex}>
                                 <Image source={cardStackIcon} />
                                     <Text style={infoSection.announceLabelStyle}>앱 버전</Text>

                            </View>


                            <Text style={infoSection.versionStyle}>1.1.2</Text>

                        </View>

                    </View>

                    <View style={listStyle.lineStyle} />

                    <View style={refreshSection.refreshContainer}>

                        <View style={infoSection.infoFlex}>
                            <Image source={refreshIcon} />
                            <Text style={refreshSection.refreshLabel}>초기화</Text>
                        </View>


                        <Image source={rightIcon} />

                    </View>




                </View>

            </View>
        )
    }
}

SettingsScreen.propTypes = {
	address: PropTypes.string.isRequired
};

const settingsOptions = StyleSheet.create({
    mainContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent:'space-between',
        padding: 8,
        marginBottom: 12,
    },

    mainSubContainer: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    item_square: {
        borderRadius: 4,
        padding: 12,
        marginEnd: 14,
        backgroundColor: '#C5C8CB'
    },

    item_title: {
        color: '#1A2433',
        fontSize: 16,
    },

    switchStyle: {
        justifyContent: 'flex-end'
    }
})

const refreshSection = StyleSheet.create({

        refreshContainer: {
            flexDirection: 'row',
            alignItems: 'center',
            padding: 12,
            marginTop: 24,
            // marginStart: 30
        },

        refreshLabel: {
            color: '#F44D3E',
            fontSize:16,
            fontWeight: '600',
            marginStart: 12,
        }
})

const infoSection = StyleSheet.create( {

    infoContainer: {
        // marginStart: 24,
        // marginEnd: 24,

    },

    announceContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        // marginStart:24,
        marginTop: 24,
    },

    bottomAnnounceContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 24,        
        // marginStart:24,
        marginBottom: 24,
    },

    announceLabelStyle: {
        fontSize: 16,
        color: 'rgba(26, 36, 51, 0.9)',
        marginStart: 12,
        marginEnd: 8
    },
    newIconStyle: {
        flex: 1,
    },
    infoFlex: {
        flex: 1,
        flexDirection: 'row'
    },
    versionStyle: {
        fontSize: 16,
        color: '#7D848F',
    }
})

const listStyle = StyleSheet.create({

    cardContainer: {
        flexDirection: 'row',
        // marginStart: 24,
    },

    cardItemHolder: {

    },

    card: {
        backgroundColor: '#F7F7F7',
        width: 96,
        height: 86,
        borderRadius: 8,
        marginEnd: 20
    },

    cardItemLabel: {
        color: 'rgba(26, 36, 51, 0.9)',
        fontSize: 15,
        fontWeight: '600',
        textAlign: 'center',
        marginEnd: 20,
        marginTop: 12,
        marginBottom: 24,
    },

    lineStyle: {
        width: Dimensions.get('window').width + 48,
        height: 1,
        backgroundColor: '#EAEDF0'
    }
})

const settingsScreenStyle = StyleSheet.create({

    rootContainer: {
        backgroundColor: '#EEF0F5',
        flex: 1,
        // marginTop: 20,
    },

    firstContainer: {
        backgroundColor: '#ffffff'
    },

    secondContainer: {
        marginTop: 12,
        backgroundColor: '#ffffff',
        // paddingEnd: 24,
        paddingTop: 24,
        flex: 1,
    },

    headerlabel: {
        color: '#44424A',
        fontSize: 24,
        fontWeight: '600',
        // marginStart: 24,
        marginTop: 16,
    },

    addressContainer: {
        // marginStart: 24,
        // marginEnd: 24,
        marginTop:28,
    },

    addressHeaderContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between'
    },

    addressHeaderLabel: {
        color: 'rgba(26, 36, 51, 0.9)',
        fontSize: 16,
        fontWeight: '600',
        marginStart: 8,
    },

    dummyContainer: {
        flexDirection: 'row'
    },

    actualAddressContainer: {
        borderRadius: 8,
        backgroundColor: '#EEFCF8',
        marginTop: 17,
        marginBottom: 32
    },

    addressLabel: {
        marginTop: 8,
        marginBottom: 8,
        marginStart:12,
        marginEnd: 12,
        color: '#109D77',
        fontSize: 14,
    },

    headSetRowContainer: {
        flexDirection: 'row',
        marginBottom: 17,
        // marginStart: 24,
    },

    headsetLabel: {
        fontSize: 16,
        color: 'rgba(26, 36, 51, 0.9)',
        fontWeight: '600',
        marginStart: 12
    },

    roundedRectangle: {
        backgroundColor: '#F7F7F7',
        borderRadius: 8,
    },

    

})