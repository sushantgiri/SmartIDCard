import React from 'react';
import {Text, View, TouchableOpacity, StyleSheet, Dimensions, Image, Animated} from 'react-native'


var headerIcon = require('../screens/assets/images/png/card_icon.png')
var okIcon = require('../screens/assets/images/png/ok.png')

export default class CardScanning extends React.Component {

    state = {
        fadeAnimation:  new Animated.Value(0),
        slideAnimation: new Animated.Value(0),
    }

    componentDidMount(){
        // this.slideIn()
        this.fadeIn()
        
    }

    slideIn = () => {
        Animated.timing(this.state.slideAnimation, {
            toValue: 1,
            duration: 2000,
        }).start();
    }

    fadeIn = () => {
        Animated.timing(this.state.fadeAnimation, {
          toValue: 1,
          duration: 4000
        }).start(() => {
            this.props.navigation.push('VCselect',{password:this.state.password});

        });
      };

    render(){
        let {slideAnimation} = this.state;
        return (
            <View style={cardScanningStyles.rootContainer}>

        {/* <Animated.View
          style={{
            transform: [
              {
                translateY: slideAnimation.interpolate({
                  inputRange: [0, 1],
                  outputRange: [-600, 0]
                })
              }
            ],
            height: 1,
            width: 200,
            margin: 5,
            borderRadius: 12,
            backgroundColor: "#347a2a",
            justifyContent: "center"
          }}
        >

        </Animated.View > */}
                
            <View >

                <View style={cardScanningStyles.childContainer}>

                    <View style={cardScanningStyles.subChildContainer}>

                        <Image style={cardScanningStyles.iconStyle} source={headerIcon}  />

                        <View style={cardScanningStyles.dummyView} />

                        <Text style={cardScanningStyles.labelStyle}>제주 대학교</Text>

                    </View>

                </View>

            </View>

            <Text style={cardScanningStyles.loaderLabelStyle}>인증서를 스캔중입니다...</Text>

            <Animated.View
                        style={[
                            cardScanningStyles.fadingContainer,
                            {
                            opacity: this.state.fadeAnimation
                            }
                        ]}>
                            <Image source={okIcon} style={cardScanningStyles.fadingImage} />
                        <Text style={cardScanningStyles.fadingText}>인증이 완료되었습니다.</Text>
             </Animated.View>

            </View>
        )
    }
}

const cardScanningStyles = StyleSheet.create({

    fadingContainer: {
        paddingVertical: 24,
        paddingHorizontal: 24,
        borderRadius: 8,
        backgroundColor: '#ffffff',
        flexDirection: 'row',
        elevation: 8,
        margin: 20
      },

      fadingText: {
            fontSize: 16,
      },

      fadingImage: {
            marginEnd: 8,
      },

    rootContainer : {
        backgroundColor: '#ffffff',
        flex: 1,
        flexDirection: 'column',
        justifyContent: 'center'

    },

    childContainer: {
        borderRadius:4,
        borderWidth: 2,
        borderColor: '#2BECB8',
        width: Dimensions.get('window').width - 80,
        height: 428,
        alignSelf: 'center' 
    },

    subChildContainer: {
        width: Dimensions.get('window').width - 112,
        borderRadius:4,
        backgroundColor: 'linear-gradient(180deg, rgba(30, 203, 156, 0.6) 0%, rgba(30, 203, 156, 0) 100%);',
        height: 394,
        alignSelf: 'center',
        marginTop: 18,
    },

    iconStyle: {
        marginTop: 20,
        marginStart: 18,
    },

    dummyView: {
        flex: 1,
        flexDirection: 'column'
    },

    labelStyle: {
        fontSize: 18,
        color: '#FFFFFF',
        fontWeight: '600',
        marginStart: 20,
        marginBottom: 20,
        
    },

    loaderLabelStyle: {
        color: 'rgba(125, 132, 143, 0.7)',
        fontSize: 20,
        fontWeight: '600',
        marginTop: 40,
        alignSelf: 'center'
    },

    lineStyle: {
        height: 2,
        color: '#30E5BD',
        width: Dimensions.get('window').width - 55
    }
})