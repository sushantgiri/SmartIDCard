package com.backup;


import androidx.annotation.NonNull;

import com.facebook.react.bridge.NativeModule;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.Callback;
import com.facebook.react.bridge.WritableArray;
import com.facebook.react.bridge.WritableNativeArray;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.bridge.WritableNativeMap;

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
    public void getTerminals(Callback successCallback, Callback errorCallback){
        mOWProxy.getTerminals("oterminal-1", 2, (result) -> {
            // WritableNativeArray, WritableNativeMap을 이용하면 객체로 전달 가능
            WritableArray terminals = new WritableNativeArray();

            if(result.getResult()){
                List<OWResultTerminalsData> terminalsDataList = result.getList();
                for (int i = 0; i < terminalsDataList.size(); i++) {
                    String otpId = terminalsDataList.get(i).getOtpId();
                    String otp = terminalsDataList.get(i).getOtp();

                    //System.out.println("OtpId: " + otpId + ", Otp: " + otp);

                    WritableMap terminal = new WritableNativeMap();
                    terminal.putString("OtpId", otpId);
                    terminal.putString("Otp", otp);
                    terminals.pushMap(terminal);
                }
            }

            successCallback.invoke(terminals);

            return Unit.INSTANCE;
        });
    }


}
