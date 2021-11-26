import React from 'react';
import ReactNativeBiometrics from 'react-native-biometrics'
import {Platform} from 'react-native';
import { exp } from 'react-native-reanimated';


const { biometryType } = await ReactNativeBiometrics.isSensorAvailable()

export function isTouchIdAvailable() {
    return biometryType === ReactNativeBiometrics.TouchID
}

export function isFaceIdAvailable(){
    const { biometryType } = await ReactNativeBiometrics.isSensorAvailable()
    return biometryType === ReactNativeBiometrics.FaceID
}

export function isBiometricAuthenticationAvailable() {

    ReactNativeBiometrics.isSensorAvailable()
            .then((resultObject) => {
                const { available, biometryType } = resultObject
                if (available && biometryType === ReactNativeBiometrics.TouchID) {
                console.log('TouchID is supported')
                } else if (available && biometryType === ReactNativeBiometrics.FaceID) {
                console.log('FaceID is supported')
                } else if (available && biometryType === ReactNativeBiometrics.Biometrics) {
                console.log('Biometrics is supported')
                } else {
                console.log('Biometrics not supported')
                }
            })

}

export function createKeys(){
    ReactNativeBiometrics.createKeys('Confirm fingerprint')
      .then((resultObject) => {
            const { publicKey } = resultObject
            console.log(publicKey)
    })
}

export default class BiometricAuthentication  {

   
}

