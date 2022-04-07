import React from 'react';
import {StyleSheet, View, Text, Image, ScrollView, TouchableOpacity} from 'react-native';
import SecureStorage from 'react-native-secure-storage'
import CryptoJS from 'react-native-crypto-js'



export default class VPInfo extends React.Component {

    state = {
		password: '',
		dataKey: '',
		address: '',
		privateKey:'',
		mnemonic:'',
		VCarray:[],
		VCjwtArray:[],
        timeArray: [],
        detailViewArray: [],
        showDetailData: false,
        SVCTimeArray: [],
        cardKey: [],
        dataAvailable: false,
        localDataArray: []
	}

    setStateData = async() => {

        // Get password
		await SecureStorage.getItem('svca').then((svca) => {
            console.log('svca',JSON.parse(svca));
			this.setState({SVCTimeArray: JSON.parse(svca)}); // Set password
		})


        // Get password
		await SecureStorage.getItem('userToken').then((pw) => {
            console.log('Password',pw);
			this.setState({password: pw}); // Set password
		})

		// Get dataKey
		let pw = this.state.password;
		await SecureStorage.getItem(pw).then((dk) => {
			this.setState({dataKey: dk}); // Set dataKey
		})
		
		// Get userData
		let dk = this.state.dataKey;
		await SecureStorage.getItem(dk).then((ud) => {
			if(ud != null) {
				// Set state
				let bytes = CryptoJS.AES.decrypt(ud, dk);
				let originalText = bytes.toString(CryptoJS.enc.Utf8);
				this.setState(JSON.parse(originalText))
                this.renderTimeStampFormatData()
			}
		})

        this.renderDetails()
    }

    renderTimeStampFormatData = () => {
        console.log('VCArray==', this.state.VCarray)
        console.log('TimeArray==', this.state.timeArray)

        this.state.VCarray.map((vc, index)=>{
            var issuanceDate = vc.vc.issuanceDate
            var issuanceUpdatedDate = issuanceDate.split('T')[0].trim()

            var isPresent = false;

            this.state.timeArray.map((timeStamp, index) =>{
                console.log('TimeStamp==', timeStamp)
                console.log('issuanceUpdatedDate==', issuanceUpdatedDate)

                if(timeStamp[issuanceUpdatedDate] != null && timeStamp[issuanceUpdatedDate] != 'undefined'){
                    isPresent = true;
                    var data = timeStamp[issuanceUpdatedDate];
                    var newData = data.concat(vc.vc.credentialSubject);

                    var object = {};
                    object[issuanceUpdatedDate] = newData;
                   
                    this.state.timeArray[index] = object;

                    this.setState({});

                    console.log('Time Array', this.state.timeArray);
                    console.log('Data', newData);
                 
                }
            })

            if(!isPresent){
                var object = {};
                object[issuanceUpdatedDate] = [vc.vc.credentialSubject];
                this.setState(
                    {
                        timeArray: this.state.timeArray.concat(object),
                    },
                )
            }
        
           
        })
        
        this.setState({timeArray: this.state.timeArray.reverse(),
            showDetailData: true});


        console.log('FinalTimeArray', this.state.timeArray);

    
    }



    componentDidMount(){
        this.setStateData();
        const cardKey = this.props.navigation.getParam('cardKey');
        console.log('CardKey--->', cardKey);
        this.setState({cardKey: cardKey}); // Set password


    }


    renderDetails = async() => {
        console.log('Details', this.state.VCarray);
        await SecureStorage.getAllKeys()
                    .then((keys) => {
                        if(keys != null){
                            console.log('Keys', keys);
                        }else{
                            console.log('No Keys Available');
                        }
                    })
        console.log('Card key before storage', JSON.stringify(this.state.cardKey));
            
        await SecureStorage.getItem(JSON.stringify(this.state.cardKey))
        .then((response) => {
            if(response != null){
                console.log('Response', response);
                this.setState({dataAvailable: true})
                var localDataArray = JSON.parse(response);
                console.log('LocalDataArray', localDataArray);
                this.setState({localDataArray: localDataArray})
            }else{
                this.setState({dataAvailable: false})
                console.log('No Response');
            }
        })
    }

    processItem = () => {
        console.log('Time ARray--->',this.state.timeArray);

        for(var i = 0; i < this.state.timeArray.length; i++) {
            var obj = this.state.timeArray[i];
            for(var j in obj){
                return(
                    <View>
                     <Text style={itemStyle.title}>{j}</Text>

                    {obj[j].map((entry, index)=>{
                        
							return(
								this.processSubItem(entry)
							)
					})}



                    </View>

                )
                    
              }
        
        }
    }

    processSubItem = (vc) => {
        console.log('VC----->', vc);
        return(
            <View style={itemStyle.dataContainer}>


                    <View style={itemStyle.rowContainer}>

                        <Text style={itemStyle.listLabelStyle}>이름 :</Text>
                        <Text style={itemStyle.listDataItemStyle}>{vc.name}</Text>

                    </View>

                    <View style={itemStyle.rowContainer}>

                        <Text style={itemStyle.listLabelStyle}>생년월일 :</Text>
                        <Text style={itemStyle.listDataItemStyle}>{vc.birthday}</Text>

                    </View>
                    <View style={itemStyle.rowContainer}>

                    <Text style={itemStyle.listLabelStyle}>성별 :</Text>
                    <Text style={itemStyle.listDataItemStyle}>{vc.gender}</Text>

                    </View>

                    <View style={itemStyle.rowContainer}>

                        <Text style={itemStyle.listLabelStyle}>휴대폰번호 :</Text>
                        <Text style={itemStyle.listDataItemStyle}>{vc.phone}</Text>

                    </View>

                    <View style={itemStyle.rowContainer}>

                        <Text style={itemStyle.listLabelStyle}>이메일주소 :</Text>
                        <Text style={itemStyle.listDataItemStyle}>{vc.email}</Text>

                    </View>

                    <View style={itemStyle.rowContainer}>

                        <Text style={itemStyle.listLabelStyle}>주소 :</Text>
                        <Text style={itemStyle.listDataItemStyle}>{vc.address}</Text>

                    </View>

            </View>
        )
    }



    renderItemDetail = (entry) => {
        console.log('Entry',  entry);
        return(
            <View>
                    <Text style={itemStyle.title}>2021-02-02</Text>

                    <View style={itemStyle.dataContainer}>

                        <Text style={itemStyle.containerLabel}>This is the test.</Text>

                        <View style={itemStyle.rowContainer}>

                            <Text style={itemStyle.listLabelStyle}>방문일</Text>
                            <Text style={itemStyle.listDataItemStyle}>2021-07-27 12:01</Text>

                        </View>

                        <View style={itemStyle.rowContainer}>

                            <Text style={itemStyle.listLabelStyle}>방문일</Text>
                            <Text style={itemStyle.listDataItemStyle}>2021-07-27</Text>

</View>

                    </View>
            </View>


/* <View style={styles.contentsContentContainer}>

                <View style={styles.contentsChildSection}>
                    <Text style={styles.contentsLabel}>이름 :</Text>
                    <Text style={styles.contentsValue}>{vc.vc.credentialSubject.name}</Text>
                </View>

                <View style={styles.contentsChildSection}>
                    <Text style={styles.contentsLabel}>생년월일 :</Text>
                    <Text style={styles.contentsValue}>{vc.vc.credentialSubject.birthday}</Text>
                </View>

                <View style={styles.contentsChildSection}>
                    <Text style={styles.contentsLabel}>성별 :</Text>
                    <Text style={styles.contentsValue}>{vc.vc.credentialSubject.gender}</Text>
                </View>


                <View style={styles.contentsChildSection}>
                    <Text style={styles.contentsLabel}>휴대폰번호 :</Text>
                    <Text style={styles.contentsValue}>{vc.vc.credentialSubject.phone}</Text>
                </View>

                <View style={styles.contentsChildSection}>
                    <Text style={styles.contentsLabel}>이메일주소 :</Text>
                    <Text style={styles.contentsValue}>{vc.vc.credentialSubject.email}</Text>
                </View>

                <View style={styles.contentsChildSection}>
                    <Text style={styles.contentsLabel}>주소 :</Text>
                    <Text style={styles.contentsValue}>{vc.vc.credentialSubject.address}</Text>
                </View>


</View> */
        )
    }


    render(){
        // const cardKey = this.props.navigation.getParam('cardKey');
        // console.log('CardKey', cardKey);

        return(
            <ScrollView 
                    contentContainerStyle={itemStyle.scrollContainer}
                    style={itemStyle.scrollStyle} >
                <View style={vpStyle.container}>
                    <TouchableOpacity onPress={() => this.props.navigation.pop()}>
                        <Image style={vpStyle.backButton} source={require('../screens/assets/images/png/back_icon.png')} />
                    </TouchableOpacity>
                    <Text style={vpStyle.titleLabel}>정보 제공 내역</Text>

                    <View style={vpStyle.rowContainer}>


                        <View style={vpStyle.weekStyle}>
                            <Text style={vpStyle.weekLabel}>1주일</Text>
                        </View>

                        <View style={vpStyle.monthStyle}>
                            <Text style={vpStyle.monthLabel}>1개월</Text>
                        </View>

                        <View style={vpStyle.infoContainer}>

                            <Text style={vpStyle.infoLabel}>상세 조회</Text>
                            <Image source={require('../screens/assets/images/png/arrow_down.png')} />

                        </View>

                    </View>


                    <View style={vpStyle.line} />
                    

                        {!this.state.dataAvailable && (
                            <View style={itemStyle.noDataContainer}>
                                <Image style={itemStyle.noData} source={require('../screens/assets/images/png/no_data.png')} />
                                <Text style={itemStyle.noDataText}>정보 제공내역이 없습니다.</Text>
                            </View>
                        )}

                        {this.state.dataAvailable && this.state.localDataArray.length > 0 && this.state.localDataArray.map((item, index) => {
                           var keys = Object.keys(item);
                           var value = JSON.parse(Object.values(item));
                           console.log('Keys', keys);
                        //    console.log('Value@', value.vc.credentialSubject);
                           console.log('Value.VC-->', value.vc);
                           if(value.vc){
                               return(
                                   <View>
                                    <Text style={itemStyle.title}>{keys}</Text>

                                    <View style={itemStyle.dataContainer}>
                                    
                                    <View style={itemStyle.rowContainer}>

                                        <Text style={itemStyle.listLabelStyle}>대표자명 :</Text>
                                        <Text style={itemStyle.listDataItemStyle}>{value.vc.credentialSubject.shopName}</Text>

                                    </View>

                                    <View style={itemStyle.rowContainer}>

                                        <Text style={itemStyle.listLabelStyle}>사업자주소 :</Text>
                                        <Text style={itemStyle.listDataItemStyle}>{value.vc.credentialSubject.terminalOwner}</Text>

                                    </View>   
                                    </View>    

                                    </View>
                               )
                           }
                        //    console.log('Company', value[0].company);
                        //    console.log('Birthday', value[0].company);

                            return(
                                <View>
                                    <Text style={itemStyle.title}>{keys}</Text>

                                    <View style={itemStyle.dataContainer}>

                

                                        <View style={itemStyle.rowContainer}>

                                        

                                        <Text style={itemStyle.listLabelStyle}>사업자명 :</Text>
                                            <Text style={itemStyle.listDataItemStyle}>{value[0].company === 'undefined' ? value[0].birthday: value[0].company }</Text>
                                            {/* <Text style={itemStyle.listDataItemStyle}>{value[0].birthday}</Text> */}

                                        

                                        </View>  

                                        <View style={itemStyle.rowContainer}>

                                        <Text style={itemStyle.listLabelStyle}>대표자명 :</Text>
                                        <Text style={itemStyle.listDataItemStyle}>{value[0].ceo}</Text>

                                        </View>   

                                        <View style={itemStyle.rowContainer}>

                                            <Text style={itemStyle.listLabelStyle}>사업자주소 :</Text>
                                            <Text style={itemStyle.listDataItemStyle}>{value[0].address}</Text>

                                        </View>   

                                        <View style={itemStyle.rowContainer}>

                                            <Text style={itemStyle.listLabelStyle}>사업자전화번호 :</Text>
                                            <Text style={itemStyle.listDataItemStyle}>{value[0].phone}</Text>

                                        </View> 


                                        <View style={itemStyle.rowContainer}>

                                            <Text style={itemStyle.listLabelStyle}>도메인명 :</Text>
                                            <Text style={itemStyle.listDataItemStyle}>{value[0].domain}</Text>

                                        </View> 

                                    </View>    


                                </View>
                            )                          
                        })}



                </View>
                </ScrollView>

        )
    }
}


const itemStyle = StyleSheet.create({

    title: {
        color: '#1A2433',
        marginStart:18,
        fontSize: 18,
        fontWeight:'600',
        marginTop: 24,
    },

    dataContainer: {
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#E5EBED',
        marginStart: 18,
        marginTop: 16,
        paddingStart: 20,
        marginEnd: 20,
        paddingTop: 16,
        paddingBottom: 16,
    },

    containerLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: 'rgba(26, 36, 51, 0.9)',
        marginBottom: 12,
    },
    
    rowContainer: {
        flexDirection: 'row',
        paddingBottom: 8,
    },

    listLabelStyle: {
        paddingEnd: 8,
        color: 'rgba(18, 18, 29, 0.6)',
        fontSize: 14,

    },

    listDataItemStyle: {
        color: 'rgba(26, 36, 51, 0.9)',
        fontSize: 14,
    },

    scrollStyle: {
        marginBottom: 2,
    },

    noDataContainer: {
        flexDirection: 'column',
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },

    scrollContainer: {
        flex: 1,
        flexDirection: 'column'
    },

    noData: {
        justifyContent: 'center',
        alignItems: 'center'
    },

    noDataText:{
        color: '#7D848F',
        marginTop: 20
    }
})


const vpStyle= StyleSheet.create({

    container:{
        backgroundColor: '#ffffff',
        flex: 1,
        flexDirection: 'column',

    },

    backButton: {
        marginTop: 38,
        marginStart: 24,
        marginBottom: 22,
    },

    titleLabel: {
        color: '#44424A',
        marginStart: 24,
        marginBottom: 24,
        fontSize: 24,
        fontWeight: '600',
    },

    rowContainer: {
        flexDirection: 'row',
        alignItems: 'center',

    },

    infoContainer: {
        flex :1,
        flexDirection: 'row',
        alignItems: 'center' ,
        justifyContent: 'flex-end',
        marginEnd: 24,
    },

    weekStyle: {
        borderRadius: 8,
        backgroundColor: '#EEFCF8',
        borderWidth: 1,
        borderColor: '#1ECB9C',
        paddingStart: 16,
        paddingEnd: 16,
        paddingTop: 8,
        paddingBottom: 8,
        marginStart: 24,
        marginEnd: 8
    },

    weekLabel: {
        fontSize: 14,
        fontWeight: '500',
        color: '#109D77',
    },

    monthStyle: {
        borderRadius: 8,
        backgroundColor: '#E6EBF3',
        paddingStart: 16,
        paddingEnd: 16,
        paddingTop:8,
        paddingBottom: 8,

    },

    monthLabel: {
        color: '#1A2433',
        fontSize: 14,
        fontWeight: '500'
    },

    infoLabel: {
        fontWeight: '500',
        color: 'rgba(26, 36, 51, 0.9)',
        fontSize: 14,
        marginEnd: 8,

    },
    line: {
        marginTop: 24,
        borderColor: '#EAEDF0',
        borderWidth:1,        
    }
})