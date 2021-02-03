import { createStackNavigator } from 'react-navigation-stack'
import ChangePW from '../screens/ChangePW'
import CompleteSubmit from '../screens/CompleteSubmit'
import Home from '../screens/Home'
import QRInfoScreen from '../screens/QRInfoScreen'
import QRscreenVP from '../screens/QRscreenVP'
import ScanScreen from '../screens/ScanScreen'
import Setting from '../screens/Setting'
import VCREQSVPDIDsend from '../screens/VCREQSVPDIDsend'
import VCREQSVPVCsend from '../screens/VCREQSVPVCsend'
import VCselect from '../screens/VCselect'
import VCverify from '../screens/VCverify'
import WebRequest from '../screens/WebRequest';
const AppNavigation = createStackNavigator(
  {
    VCcontrol: { screen: Home,
                  navigationOptions: {
                    headerTitle: 'VCcontrol'
                  },
                  path: 'VCcontrol' },
    ScanScreen: { screen: ScanScreen},
    VCREQSVPDIDsend: { screen: VCREQSVPDIDsend},
    VCREQSVPVCsend: {screen: VCREQSVPVCsend},
    VCverify: { screen: VCverify},
    QRInfoScreen: { screen: QRInfoScreen},
    QRscreenVP: {screen: QRscreenVP},
    CompleteSubmit: { screen: CompleteSubmit},
    VCselect: {screen: VCselect},
    Setting: {screen: Setting},
    ChangePW: {screen: ChangePW},
    WebRequest: {screen: WebRequest,
                  navigationOptions: {
                    headerTitle: 'WebRequest'
                  },
                path: 'WebRequest'}
  },
  {
    initialRouteName: 'VCcontrol',
    headerMode: 'none'
  }
)

export default AppNavigation
