package com.backup;


import androidx.annotation.NonNull;

import com.facebook.react.bridge.NativeModule;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;

import java.util.List;

import io.estorm.android.ndualauth.nowirecore.OWHmacAlgo;
import io.estorm.android.ndualauth.nowirecore.OWOtpGenInfo;
import io.estorm.android.ndualauth.nowirecore.OWProxy;
import io.estorm.android.ndualauth.nowirecore.OWResultInitialize;
import io.estorm.android.ndualauth.nowirecore.OWResultTerminalsData;
import kotlin.Unit;

public class BNSModule extends ReactContextBaseJavaModule {

    private OWResultInitialize result;
    private OWProxy mOWProxy;
    private ReactApplicationContext context;

    BNSModule(ReactApplicationContext context) {
        super(context);
        this.context = context;
    }

    @NonNull
    @Override
    public String getName() {
        return "BNSModule";
    }

    @ReactMethod
    public void initialize(){
        OWOtpGenInfo otpGenInfo = new OWOtpGenInfo(6, OWHmacAlgo.SHA1, 60);
        mOWProxy = new OWProxy(otpGenInfo, context, true);
        result = mOWProxy.initialize();
    }

    @ReactMethod
    public void getTerminals(){
        mOWProxy.getTerminals("oterminal-1", 4, (result) -> {
            System.out.println("Result.getResult(): " + result.getResult());

            if(result.getResult()){
                List<OWResultTerminalsData> terminalsDataList = result.getList();
                System.out.println("terminalsDataList.size() " + terminalsDataList.size());

                for ( int i=0 ; i<terminalsDataList.size() ; i++ ) {
                    String otpId = terminalsDataList.get(i).getOtpId();
                    String otp = terminalsDataList.get(i).getOtp();
                    System.out.println("OtpId: " + otpId + ".    Otp: " + otp);
//                            TerminalInfo info = new TerminalInfo(Common.BLE_SCAN_SERVICENAME, otpId, otp);
//                            mReqTerminalList.add(info);
                }
            }
            return Unit.INSTANCE;
        });
    }


}
