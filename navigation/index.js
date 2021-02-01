import {createAppContainer, createSwitchNavigator} from 'react-navigation'
import React from 'react';
import LoadingScreen from '../screens/LoadingScreen';

import AppNavigation from './AppNavigation';
import AuthNavigation from './AuthNavigation';

const AppNavigator = createSwitchNavigator(
  {
    App: AppNavigation,
    Auth: AuthNavigation,
    LoadingScreen: { screen: LoadingScreen }
  },
  {
    initialRouteName: 'LoadingScreen',
    headerMode: 'none'
  }
)

const AppContainer = createAppContainer(AppNavigator)

export default () => {
  const prefix = 'smartidcard://'
  return <AppContainer uriPrefix={prefix} />
}
