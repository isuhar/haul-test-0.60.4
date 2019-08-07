package ru.megaplan.megaplan3app;

import com.facebook.react.PackageList;
import com.facebook.react.ReactNativeHost;
import cl.json.ShareApplication;
import com.facebook.react.ReactPackage;
import com.reactnativenavigation.NavigationApplication;
import com.reactnativenavigation.react.NavigationReactNativeHost;
import com.reactnativenavigation.react.ReactGateway;
import java.util.List;

public class MainApplication extends NavigationApplication implements ShareApplication {

    @Override
    public String getFileProviderAuthority() {
        return "ru.megaplan.megaplan3app.provider";
    }

    @Override
    protected ReactGateway createReactGateway() {
        ReactNativeHost host = new NavigationReactNativeHost(this, isDebug(), createAdditionalReactPackages()) {
            @Override
            protected String getJSMainModuleName() {
                return "index";
            }
        };
        return new ReactGateway(this, isDebug(), host);
    }

      @Override
      public boolean isDebug() {
           // Make sure you are using BuildConfig from your own application
           return BuildConfig.DEBUG;
      }

    protected List<ReactPackage> getPackages() {
        List<ReactPackage> packages = new PackageList(this).getPackages();

        return packages;
    }

   @Override
   public List<ReactPackage> createAdditionalReactPackages() {
        return getPackages();
   }
}
