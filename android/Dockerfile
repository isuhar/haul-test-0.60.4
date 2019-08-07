FROM library/ubuntu:16.04

# set default build arguments
ARG ANDROID_TOOLS_VERSION=25.2.5
ARG BUCK_VERSION=v2018.02.16.01
ARG NDK_VERSION=10e
ARG NODE_VERSION=8.10.0
ARG WATCHMAN_VERSION=4.9.0

# set default environment variables
ENV ADB_INSTALL_TIMEOUT=10
ENV PATH=${PATH}:/opt/buck/bin/
ENV ANDROID_HOME=/opt/android
ENV ANDROID_SDK_HOME=${ANDROID_HOME}
ENV PATH=${PATH}:${ANDROID_HOME}/tools:${ANDROID_HOME}/tools/bin:${ANDROID_HOME}/platform-tools
ENV ANDROID_NDK=/opt/ndk/android-ndk-r$NDK_VERSION
ENV PATH=${PATH}:${ANDROID_NDK}

# install system dependencies
RUN apt-get update && apt-get install ant autoconf automake curl g++ gcc git libqt5widgets5 lib32z1 lib32stdc++6 make maven npm openjdk-8* python-dev python3-dev qml-module-qtquick-controls qtdeclarative5-dev unzip -y

# install node and configure npm
RUN curl -sL https://deb.nodesource.com/setup_8.x | bash -
RUN apt-get install -y nodejs
RUN npm config set progress=false
RUN npm i -g npm@5.7.1

# download and build buck
#RUN git clone https://github.com/facebook/buck.git /opt/buck --branch $BUCK_VERSION --depth=1
#WORKDIR /opt/buck
#RUN ant

# Full reference at https://dl.google.com/android/repository/repository2-1.xml
# download and unpack android
RUN mkdir /opt/android
WORKDIR /opt/android
RUN curl https://dl.google.com/android/repository/tools_r$ANDROID_TOOLS_VERSION-linux.zip > android.zip
RUN unzip android.zip
RUN rm android.zip

# download and unpack NDK
RUN mkdir /opt/ndk
WORKDIR /opt/ndk
RUN curl https://dl.google.com/android/repository/android-ndk-r$NDK_VERSION-linux-x86_64.zip > ndk.zip
RUN unzip ndk.zip

# cleanup NDK
RUN rm ndk.zip

# Add android SDK tools
RUN yes | sdkmanager "system-images;android-19;google_apis;armeabi-v7a"
RUN yes | sdkmanager "platforms;android-27"
RUN yes | sdkmanager "platforms;android-26"
RUN yes | sdkmanager "platforms;android-25"
RUN yes | sdkmanager "platforms;android-24"
RUN yes | sdkmanager "platforms;android-23"
RUN yes | sdkmanager "platforms;android-22"
RUN yes | sdkmanager "platforms;android-21"
RUN yes | sdkmanager "platforms;android-19"
RUN yes | sdkmanager "build-tools;27.0.1"
RUN yes | sdkmanager "build-tools;27.0.3"
RUN yes | sdkmanager "build-tools;27.0.0"
RUN yes | sdkmanager "build-tools;26.0.2"
RUN yes | sdkmanager "build-tools;26.0.1"
RUN yes | sdkmanager "build-tools;25.0.2"
RUN yes | sdkmanager "build-tools;25.0.1"
RUN yes | sdkmanager "build-tools;25.0.0"
RUN yes | sdkmanager "build-tools;23.0.2"
RUN yes | sdkmanager "build-tools;23.0.1"
RUN yes | sdkmanager "add-ons;addon-google_apis-google-23"
RUN yes | sdkmanager "extras;android;m2repository"
RUN yes | sdkmanager "extras;google;m2repository"
RUN yes | sdkmanager "platform-tools"

# Link adb executable
RUN ln -s /opt/android/platform-tools/adb /usr/bin/adb

# clean up unnecessary directories
RUN rm -rf /opt/android/system-images/android-19/default/x86

RUN mkdir /root/.gradle
VOLUME ["/root/.gradle"]

RUN mkdir /opt/android-build
COPY app/my-release-key.keystore /opt/android-build

# При запуске сборки надо сначала сделать cp /opt/android-build/my-release-key.store /opt/megaplan/front/android/app
