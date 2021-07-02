import React, { useEffect } from 'react'
import { BackHandler, Alert } from 'react-native'
import AppContainer from './navigation'

export default function App(){
    // 뒤로가기 이벤트 처리
    useEffect(() => {
        const backAction = () => {
            Alert.alert("", "앱을 종료하시겠습니까?", [
                { text: "취소", onPress: () => null, },
                { text: "확인", onPress: () => BackHandler.exitApp() }
            ]);
            return true;
        };

        const backHandler = BackHandler.addEventListener(
            "hardwareBackPress",
            backAction
        );

        return () => backHandler.remove();
    }, []);
    // 뒤로가기 이벤트 처리

    return <AppContainer/>
}