import { createStackNavigator } from 'react-navigation-stack'
import UICheck from '../screens/UICheck' // UI Check (TEMP)
import ChangePW from '../screens/ChangePW'
import HappyCitizenship from '../screens/HappyCitizenship'
import Home from '../screens/Home'
import ScanScreen from '../screens/ScanScreen'
import Setting from '../screens/Setting'
import VCselect from '../screens/VCselect'

import VCREQ_SVP_DIDsend from '../screens/VCREQ_SVP_DIDsend'
import VCREQ_SVP_VCsend from '../screens/VCREQ_SVP_VCsend'
import VCREQ_DIDsend from '../screens/VCREQ_DIDsend'
import VCREQ_VCsend from '../screens/VCREQ_VCsend'

import VPREQ_SIGN_NULLsend from '../screens/VPREQ_SIGN_NULLsend'
import VPREQ_SIGN_VCsend from '../screens/VPREQ_SIGN_VCsend'
import VPREQ_VCsend from '../screens/VPREQ_VCsend'
import VPREQ_NULLsend from '../screens/VPREQ_NULLsend'

import VPREQ_SVP_SIGN_NULLsend from '../screens/VPREQ_SVP_SIGN_NULLsend'
import VPREQ_SVP_SIGN_VCsend from '../screens/VPREQ_SVP_SIGN_VCsend'
import VPREQ_SVP_VCsend from '../screens/VPREQ_SVP_VCsend'
import VPREQ_SVP_NULLsend from '../screens/VPREQ_SVP_NULLsend'
import VCverify from '../screens/VCverify'
import VPInfo from '../screens/VPInfo'
import SelectOptions from '../screens/SelectOptions'
import VerifiedServiceProviders from '../screens/VerifiedServiceProviders'
import CertificateSelectAndSubmit from '../screens/CertificateSelectAndSubmit'
import CardScanning from '../screens/CardScanning'
import CardScanningTest from '../screens/CardScanningTest'
import SettingsScreen  from '../screens/SettingsScreen'
import AnimatedLoading from '../screens/AnimatedLoading'

const AppNavigation = createStackNavigator(
	{
		UICheck : { screen: UICheck }, // UI Check (TEMP)

		VCcontrol: { 
			screen: Home,
			navigationOptions: {
				headerTitle: 'VCcontrol'
			},
			path: 'VCcontrol' 
		},

		ScanScreen: { screen: ScanScreen},
		VCREQ_SVP_DIDsend: { screen: VCREQ_SVP_DIDsend},
		VCREQ_SVP_VCsend: {screen: VCREQ_SVP_VCsend},
		VCREQ_DIDsend: {screen: VCREQ_DIDsend},
		VCREQ_VCsend: {screen: VCREQ_VCsend},
		VCverify: { screen: VCverify},

		VPREQ_SIGN_NULLsend: { screen: VPREQ_SIGN_NULLsend},
		VPREQ_SIGN_VCsend: {screen: VPREQ_SIGN_VCsend},
		VPREQ_NULLsend: {screen: VPREQ_NULLsend},
		VPREQ_VCsend: {screen: VPREQ_VCsend},

		VPREQ_SVP_SIGN_NULLsend: { screen: VPREQ_SVP_SIGN_NULLsend},
		VPREQ_SVP_SIGN_VCsend: { screen: VPREQ_SVP_SIGN_VCsend},
		VPREQ_SVP_VCsend: { screen: VPREQ_SVP_VCsend},
		VPREQ_SVP_NULLsend: {screen: VPREQ_SVP_NULLsend},
		
		Home : { screen: Home },
		//VCselect: {screen: VCselect},
		VCselect: {screen: Home},
		Setting: {screen: Setting},
		ChangePW: {screen: ChangePW},
		HappyCitizenship:{screen: HappyCitizenship},
		VPInfo: {screen: VPInfo},
		SelectOptions: {screen: SelectOptions},
		VerifiedServiceProviders: {screen: VerifiedServiceProviders},
		CertificateSelectAndSubmit:{screen:CertificateSelectAndSubmit},
		CardScanning: {screen: CardScanning},
		CardScanningTest: {screen: CardScanningTest},
		SettingsScreen: {screen: SettingsScreen},
		AnimatedLoading: {screen: AnimatedLoading},
	},
	
	{
		initialRouteName: 'VCcontrol',
		headerMode: 'none'
	}
)

export default AppNavigation
