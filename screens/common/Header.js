import React from 'react'
import { StyleSheet, Image, TouchableOpacity} from 'react-native'
import { Header } from 'react-native-elements';

var imageMenu = require('../../screens/assets/images/png/ic_btn_menu.png')
var imageSearch = require('../../screens/assets/images/png/ic_btn_srch.png')

export default class CHeader extends React.Component {
    goMenu = () => {
		alert('Menu')
	}

    goSearch = () => {
		alert('Search')
	}

    render() {
        return (
            <Header
            placement="center"
            // leftComponent={
            //     <TouchableOpacity activeOpacity={0.8} onPress={this.goMenu}>
            //         <Image source={imageMenu}></Image>
            //     </TouchableOpacity>
            // }
            centerComponent={''}
            rightComponent={
                <TouchableOpacity activeOpacity={0.8} onPress={this.goSearch}>
                    {/* <Image source={imageSearch}></Image> */}
                </TouchableOpacity>
            }
            containerStyle={{
                backgroundColor: '#FFFFFF',
                borderWidth:1,
            }}
            />
        )
    }
}

/*
class Container extends React.Component {
    render() {
        return (
            <Header
            placement="center"
            leftComponent={
                <TouchableOpacity activeOpacity={0.8} onPress={''}>
                    <Image source={imageMenu}></Image>
                </TouchableOpacity>
            }
            centerComponent={''}
            rightComponent={
                <TouchableOpacity activeOpacity={0.8} onPress={''}>
                    <Image source={imageSearch}></Image>
                </TouchableOpacity>
            }
            containerStyle={{
                backgroundColor: '#FFFFFF',
            }}
            />
        )
    }
}
*/

const header = StyleSheet.create({
    
});