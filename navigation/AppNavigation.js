import { createStackNavigator } from 'react-navigation-stack'
import CompleteSubmit from '../screens/CompleteSubmit'
import Home from '../screens/Home'
import QRInfoScreen from '../screens/QRInfoScreen'
import QRscreenVP from '../screens/QRscreenVP'
import ScanScreen from '../screens/ScanScreen'
import VCselect from '../screens/VCselect'
import VCverify from '../screens/VCverify'
const AppNavigation = createStackNavigator(
  {
    VCcontrol: { screen: Home,
                  navigationOptions: {
                    headerTitle: 'VCcontrol'
                  },
                  path: 'VCcontrol' },
    ScanScreen: { screen: ScanScreen},
    VCverify: { screen: VCverify},
    QRInfoScreen: { screen: QRInfoScreen},
    QRscreenVP: {screen: QRscreenVP},
    CompleteSubmit: { screen: CompleteSubmit},
    VCselect: {screen: VCselect}
  },
  {
    initialRouteName: 'VCcontrol',
    headerMode: 'none'
  }
)

export default AppNavigation
