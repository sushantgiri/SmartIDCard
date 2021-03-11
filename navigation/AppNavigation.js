import { createStackNavigator } from 'react-navigation-stack'
import ChangePW from '../screens/ChangePW'
import Home from '../screens/Home'
import ScanScreen from '../screens/ScanScreen'
import Setting from '../screens/Setting'
import VCselect from '../screens/VCselect'

import VCREQ_SVP_DIDsend from '../screens/VCREQ_SVP_DIDsend'
import VCREQ_SVP_VCsend from '../screens/VCREQ_SVP_VCsend'
import VCREQ_DIDsend from '../screens/VCREQ_DIDsend'
import VCREQ_VCsend from '../screens/VCREQ_VCsend'

import VPREQ_SVP_SIGN_NULLsend from '../screens/VPREQ_SVP_SIGN_NULLsend'
import VPREQ_SVP_SIGN_VCsend from '../screens/VPREQ_SVP_SIGN_VCsend'
import VPREQ_SVP_VCsend from '../screens/VPREQ_SVP_VCsend'
import VPREQ_SVP_NULLsend from '../screens/VPREQ_SVP_NULLsend'
import VCverify from '../screens/VCverify'
const AppNavigation = createStackNavigator(
  {
    VCcontrol: { screen: Home,
                  navigationOptions: {
                    headerTitle: 'VCcontrol'
                  },
                  path: 'VCcontrol' },

    ScanScreen: { screen: ScanScreen},
    VCREQ_SVP_DIDsend: { screen: VCREQ_SVP_DIDsend},
    VCREQ_SVP_VCsend: {screen: VCREQ_SVP_VCsend},
    VCREQ_DIDsend: {screen: VCREQ_DIDsend},
    VCREQ_VCsend: {screen: VCREQ_VCsend},
    VCverify: { screen: VCverify},

    VPREQ_SVP_SIGN_NULLsend: { screen: VPREQ_SVP_SIGN_NULLsend},
    VPREQ_SVP_SIGN_VCsend: { screen: VPREQ_SVP_SIGN_VCsend},
    VPREQ_SVP_VCsend: { screen: VPREQ_SVP_VCsend},
    VPREQ_SVP_NULLsend: {screen: VPREQ_SVP_NULLsend},
    VCselect: {screen: VCselect},
    Setting: {screen: Setting},
    ChangePW: {screen: ChangePW},
  },
  {
    initialRouteName: 'VCcontrol',
    headerMode: 'none'
  }
)

export default AppNavigation
