import React, { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, KeyboardAvoidingView, Image, SafeAreaView, Platform, Switch, Alert, FlatList } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { io } from "socket.io-client";

import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import NotificationPopup from './src/components/NotificationPopup';
import HistoryScreen from './src/components/HistoryScreen';
import LaneScreen from './src/components/LaneScreen';
import MenuScreen from './src/components/MenuScreen';
import ProfileScreen from './src/components/ProfileScreen';



// Ensure this IP and protocol match your Flask-SocketIO setup
const SOCKET_URL = "http://10.250.34.10:80";


// --- NOTIFICATION HANDLER SETUP ---
Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
    }),
});

// --- 1. LANGUAGE TRANSLATION DEFINITIONS (MALAY ADDED) ---
const translations = {
    en: {
        schoolName: "HELP INTERNATIONAL SCHOOL",
        systemTitle: "ANPR Vehicle Verification System",
        accessControl: "🔐 Enter Your School Email to Initialize the System.",
        enterPasscode: "Enter Passcode",
        authLaunch: "Login",
        incorrectPasscode: "❌ Incorrect Passcode. Try Again!",
        appSettings: "App Settings",
        darkMode: "Dark Mode",
        language: "Language",
        back: "< Back",
        dashboardTitle: "ANPR Live Dashboard",
        liveDetection: "LIVE DETECTION",
        laneId: "Lane ID",
        time: "Time",
        activityLog: "Activity Log",
        searchPlaceholder: "Search log by student name or lane...",
        noDetections: 'No recent detections found matching "{query}".',
        statusOnline: "ONLINE",
        statusOffline: "OFFLINE",
        scanning: "Scanning...",
        pending: "Pending...",
        unknown: "Unknown",
        noLaneDetected: "No Lane Detected",

        history: "History",
        success: "Success",
        entryAdded: "Entry Added Successfully",
        myStudentName: "Student Name (Optional)",
        filterPlaceholder: "Enter name to filter notifications...",
        userName: "Your Name",
        userEmail: "School Email",
        namePlaceholder: "e.g. John Doe",
        emailPlaceholder: "e.g. john@school.edu",
    },
    zh: {
        schoolName: "精英国际学校",
        systemTitle: "车牌识别车辆验证系统",
        accessControl: "🔐 访问控制: 输入安全通行码以初始化系统。",
        enterPasscode: "输入通行码",
        authLaunch: "认证并启动",
        incorrectPasscode: "❌ 通行码错误。请重试！",
        appSettings: "应用设置",
        darkMode: "深色模式",
        language: "语言",
        back: "返回",
        dashboardTitle: "车牌识别实时仪表盘",
        liveDetection: "实时检测",
        laneId: "车道 ID",
        time: "时间",
        activityLog: "活动日志",
        searchPlaceholder: "按学生姓名或车道搜索日志...",
        noDetections: '未找到与 "{query}" 匹配的近期检测记录。',
        statusOnline: "在线",
        statusOffline: "离线",
        scanning: "扫描中...",
        pending: "待定...",
        unknown: "未知",
        noLaneDetected: "未检测到车道",
        myprofile: "我的资料",
        history: "历史记录",
        success: "成功",
        entryAdded: "条目添加成功",
        myStudentName: "我的学生姓名 (可选)",
        filterPlaceholder: "输入姓名以过滤通知...",
        userName: "您的姓名",
        userEmail: "学校邮箱",
        namePlaceholder: "例如：张三",
        emailPlaceholder: "例如：zhangsan@school.edu"
    },
    ko: {
        schoolName: "도움 국제 학교",
        systemTitle: "ANPR 차량 확인 시스템",
        accessControl: "🔐 액세스 제어: 보안 통행 코드를 입력하여 시스템을 초기화하십시오.",
        enterPasscode: "통행 코드 입력",
        authLaunch: "인증 및 시작",
        incorrectPasscode: "❌ 잘못된 통행 코드입니다. 다시 시도하십시오!",
        appSettings: "앱 설정",
        darkMode: "다크 모드",
        language: "언어",
        back: "< 뒤로",
        dashboardTitle: "ANPR 실시간 대시보드",
        liveDetection: "실시간 감지",
        laneId: "차선 ID",
        time: "시간",
        activityLog: "활동 로그",
        searchPlaceholder: "학생 이름 또는 차선으로 로그 검색...",
        noDetections: '"{query}"와 일치하는 최근 감지 기록이 없습니다.',
        statusOnline: "온라인",
        statusOffline: "오프라인",
        scanning: "스캔 중...",
        pending: "대기 중...",
        unknown: "알 수 없음",
        noLaneDetected: "차선 감지 안됨",
        myprofile: "내 프로필",
        history: "기록",
        success: "성공",
        entryAdded: "항목이 성공적으로 추가되었습니다",
        myStudentName: "내 학생 이름 (선택 사항)",
        filterPlaceholder: "알림을 필터링할 이름을 입력하세요...",
        userName: "당신의 이름",
        userEmail: "학교 이메일",
        namePlaceholder: "예: 홍길동",
        emailPlaceholder: "예: hong@school.edu",
    },
    ms: {
        schoolName: "SEKOLAH ANTARABANGSA HELP",
        systemTitle: "Sistem Verifikasi Kenderaan ANPR",
        accessControl: "🔐 Kawalan Akses: Masukkan kod laluan selamat untuk memulakan sistem.",
        enterPasscode: "Masukkan Kod Laluan",
        authLaunch: "Sahkan & Lancarkan",
        incorrectPasscode: "❌ Kod Laluan Salah. Sila Cuba Lagi!",
        appSettings: "Tetapan Aplikasi",
        darkMode: "Mod Gelap",
        language: "Bahasa",
        back: "< Kembali",
        dashboardTitle: "Papan Pemuka Langsung ANPR",
        liveDetection: "PENGESANAN LANGSUNG",
        laneId: "ID Lorong",
        time: "Masa",
        activityLog: "Log Aktiviti",
        searchPlaceholder: "Cari log mengikut nama pelajar atau lorong...",
        noDetections: 'Tiada pengesanan terkini ditemui sepadan dengan "{query}".',
        statusOnline: "DALAM TALIAN",
        statusOffline: "LUAR TALIAN",
        scanning: "Mengimbas...",
        pending: "Menunggu...",
        unknown: "Tidak Diketahui",
        noLaneDetected: "Tiada Lorong Dikesan",
        myprofile: "Profil Saya",
        history: "Sejarah",
        success: "Berjaya",
        entryAdded: "Entri Berjaya Ditambah",
        myStudentName: "Nama Pelajar Saya (Pilihan)",
        filterPlaceholder: "Masukkan nama untuk menapis pemberitahuan...",
        userName: "Nama Anda",
        userEmail: "Emel Sekolah",
        namePlaceholder: "cth. Ahmad Albab",
        emailPlaceholder: "cth. ahmad@sekolah.edu",
    }
};

// --- 2. DARK MODE COLOR DEFINITIONS ---
const lightColors = {
    background: '#FFFFFF',
    card: '#FAFAFA',
    textPrimary: '#1A1A1A',
    textSecondary: '#666666',
    accent: '#00A389',
    error: '#FF3B30',
    border: '#EFEFEF',
    statusPillBg: '#E6F3F1',
    logoBorder: '#F0F0F0',
};

const darkColors = {
    background: '#121212',
    card: '#1E1E1E',
    textPrimary: '#FFFFFF',
    textSecondary: '#AAAAAA',
    accent: '#3CB48C',
    error: '#FF6347',
    border: '#333333',
    statusPillBg: '#004D40',
    logoBorder: '#333333',
};

// --- 3. DYNAMIC STYLES FUNCTION ---
const getStyles = (isDark) => {
    const colors = isDark ? darkColors : lightColors;

    const styleSheet = StyleSheet.create({
        // --- General & Auth Containers ---
        safeArea: {
            flex: 1,
            backgroundColor: colors.background,
        },
        authContainer: {
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
            padding: 24,
            backgroundColor: colors.background,
        },
        container: {
            alignItems: "center",
            paddingVertical: 20,
            paddingHorizontal: 15,
            backgroundColor: colors.background,
        },

        // --- Header & Login ---
        header: {
            alignItems: "center",
            marginBottom: 40,
        },
        schoolName: {
            fontSize: 20,
            fontWeight: "800",
            color: colors.textPrimary,
            textAlign: "center",
            marginBottom: 10,
        },
        banner: {
            width: 100,
            height: 100,
            marginBottom: 15,
            borderRadius: 50,
            borderWidth: 2,
            borderColor: colors.logoBorder,
        },
        subheading: {
            fontSize: 16,
            fontWeight: "500",
            color: colors.textSecondary,
            textAlign: "center",
        },
        instruction: {
            fontSize: 14,
            color: colors.textSecondary,
            textAlign: "center",
            marginBottom: 30,
            paddingHorizontal: 10,
        },
        input: {
            width: "85%",
            padding: 16,
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: 10,
            backgroundColor: colors.card,
            color: colors.textPrimary,
            textAlign: "center",
            fontSize: 18,
            marginBottom: 15,
            fontWeight: '500',
        },
        button: {
            backgroundColor: colors.accent,
            paddingVertical: 14,
            paddingHorizontal: 30,
            borderRadius: 10,
            marginTop: 15,
        },
        buttonText: {
            fontSize: 18,
            color: "#FFFFFF",
            fontWeight: "bold",
        },
        error: {
            color: colors.error,
            fontSize: 16,
            marginBottom: 10,
        },

        // --- Sleek Settings Icon Button on Dashboard ---
        settingsIcon: {
            position: 'absolute',
            top: Platform.OS === 'android' ? 15 : 35,
            right: 12,
            zIndex: 9999,
            padding: 8,
            borderRadius: 20,
            backgroundColor: colors.card,
            alignItems: 'center',
            justifyContent: 'center',
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.15,
            shadowRadius: 4,
            elevation: 4,
            borderWidth: 1,
            borderColor: colors.border,
        },
        settingsIconText: {
            fontSize: 16,
            color: colors.textSecondary,
        },

        // --- Dashboard Layout ---
        headerContainer: {
            width: '100%',
            marginBottom: 25,
            paddingHorizontal: 5,
            marginTop: Platform.OS === 'android' ? 0 : 25,
        },
        mainTitle: {
            fontSize: 26,
            fontWeight: "900",
            color: colors.textPrimary,
        },
        logHeaderContainer: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            width: '100%',
            marginBottom: 15,
        },
        statusPill: {
            paddingHorizontal: 10,
            paddingVertical: 5,
            borderRadius: 15,
            backgroundColor: colors.statusPillBg,
            marginLeft: 10,
        },
        statusText: {
            fontSize: 14,
            fontWeight: '700',
        },

        // --- Live Card ---
        liveCard: {
            backgroundColor: colors.card,
            width: "100%",
            padding: 25,
            borderRadius: 18,
            marginBottom: 30,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: isDark ? 0.2 : 0.05,
            shadowRadius: 4,
            elevation: 2,
        },
        liveLabel: {
            fontSize: 14,
            fontWeight: "600",
            color: colors.accent,
            textTransform: 'uppercase',
            letterSpacing: 1,
            marginBottom: 10,
        },
        mainValueRow: {
            paddingVertical: 15,
            borderBottomWidth: 1,
            borderBottomColor: colors.border,
            marginBottom: 20,
        },
        mainValue: {
            fontSize: 34,
            fontWeight: "900",
            color: colors.textPrimary,
        },
        metadataRow: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginTop: 10,
        },
        metadataItem: {
            flex: 1,
        },
        metadataLabel: {
            fontSize: 14,
            color: colors.textSecondary,
            marginBottom: 4,
        },
        metadataValue: {
            fontSize: 16,
            fontWeight: '600',
            color: colors.textPrimary,
        },

        // --- Activity Log Section ---
        sectionHeader: {
            fontSize: 18,
            fontWeight: '800',
            color: colors.textPrimary,
        },
        logHeaderRow: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            width: '100%',
            marginBottom: 15,
            paddingHorizontal: 5,
        },
        searchBar: {
            width: '100%',
            padding: 12,
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: 8,
            backgroundColor: colors.card,
            color: colors.textPrimary,
            fontSize: 16,
            marginBottom: 15,
        },
        logContainer: {
            width: "100%",
            backgroundColor: colors.card,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: colors.border,
            // ⚠️ Removed fixed padding and maxHeight from the container 
            // to allow the inner ScrollView to manage its size and padding
            marginBottom: 30,
        },
        // ⭐️ NEW STYLE for ScrollView content padding
        logContentContainer: {
            paddingHorizontal: 15,
            paddingBottom: 5, // Small padding at the bottom of the content
        },
        logItemRow: {
            flexDirection: 'row',
            justifyContent: 'flex-start',
            alignItems: 'center',
            paddingVertical: 12,
            borderBottomWidth: 1,
            borderBottomColor: colors.border,
        },
        logNameText: {
            fontSize: 16,
            color: colors.textPrimary,
            fontWeight: '500',
            marginRight: 8,
            flexShrink: 1,
        },
        logLaneText: {
            fontSize: 14,
            color: colors.textSecondary,
            fontWeight: '400',
        },
        logEmpty: {
            fontSize: 16,
            paddingVertical: 20,
            color: colors.textSecondary,
            textAlign: 'center',
        },

        // --- Settings Screen Specific Styles ---
        settingsTitle: {
            fontSize: 28,
            fontWeight: '900',
            color: colors.textPrimary,
            marginBottom: 30,
        },
        settingItem: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            width: '100%',
            paddingVertical: 20,
            paddingHorizontal: 15,
            backgroundColor: colors.card,
            borderRadius: 12,
            marginBottom: 10,
            borderWidth: 1,
            borderColor: colors.border,
        },
        settingText: {
            fontSize: 18,
            fontWeight: '600',
            color: colors.textPrimary,
        },
        // Language selection styles
        languageButtonContainer: {
            flex: 1,
            marginLeft: 10,
        },
        buttonScrollView: {
            flexDirection: 'row',
            alignItems: 'center',
            paddingRight: 15,
        },
        languageButton: {
            paddingVertical: 8,
            paddingHorizontal: 15,
            borderRadius: 8,
            borderWidth: 1,
            borderColor: colors.border,
            marginHorizontal: 3,
            marginBottom: 5,
            backgroundColor: colors.background,
        },
        languageButtonActive: {
            backgroundColor: colors.accent,
            borderColor: colors.accent,
        },
        languageButtonText: {
            fontSize: 16,
            fontWeight: '500',
            color: colors.textPrimary,
        },
        languageButtonTextActive: {
            color: '#FFFFFF',
        },
        backButton: {
            position: 'absolute',
            top: Platform.OS === 'android' ? 30 : 50,
            left: 15,
            zIndex: 10,
            padding: 8,
            backgroundColor: colors.card,
            borderRadius: 8,
            borderWidth: 1,
            borderColor: colors.border,
        },
        backButtonText: {
            fontSize: 18,
            color: colors.textPrimary,
            fontWeight: 'bold',
        },
    });

    // RETURN an object containing both the StyleSheet and the raw colors object
    return {
        styles: styleSheet,
        colors: {
            accent: colors.accent,
            textPrimary: colors.textPrimary,
            textSecondary: colors.textSecondary,
        }
    };
};


// --- 4. MODIFIED SETTINGS SCREEN COMPONENT (FINAL SCROLL FIX APPLIED) ---
const SettingsScreen = ({ isDarkMode, toggleDarkMode, currentLanguage, setLanguage, navigateBack, styles, switchColors, tr, studentFilter, setStudentFilter, userName, setUserName, userEmail, setUserEmail }) => {

    if (!switchColors || !switchColors.accent) {
        console.error("Missing switchColors prop in SettingsScreen.");
        return <Text style={{ color: 'red' }}>Error: Color settings unavailable.</Text>;
    }

    return (
        <SafeAreaView style={styles.safeArea}>
            <TouchableOpacity style={styles.backButton} onPress={navigateBack}>
                <Text style={styles.backButtonText}>{tr.back}</Text>
            </TouchableOpacity>

            <View style={[styles.container, { paddingTop: 100 }]}>
                <Text style={styles.settingsTitle}>{tr.appSettings}</Text>

                {/* Dark Mode Toggle Setting */}
                <View style={styles.settingItem}>
                    <Text style={styles.settingText}>{tr.darkMode}</Text>
                    <Switch
                        trackColor={{ false: switchColors.textSecondary, true: switchColors.accent }}
                        thumbColor={isDarkMode ? switchColors.textPrimary : '#FFFFFF'}
                        onValueChange={toggleDarkMode}
                        value={isDarkMode}
                    />
                </View>

                {/* Student Name Filter Setting */}
                <View style={[styles.settingItem, { flexDirection: 'column', alignItems: 'flex-start' }]}>
                    <Text style={[styles.settingText, { marginBottom: 10 }]}>{tr.myStudentName}</Text>
                    <TextInput
                        style={[styles.input, { width: '100%', marginBottom: 0 }]}
                        value={studentFilter}
                        onChangeText={setStudentFilter}
                        placeholder={tr.filterPlaceholder}
                        placeholderTextColor={isDarkMode ? switchColors.textSecondary : switchColors.textSecondary}
                    />
                </View>

                {/* Language Selection Setting */}
                <View style={styles.settingItem}>
                    <Text style={styles.settingText}>
                        {tr.language}
                    </Text>
                    <View style={styles.languageButtonContainer}>
                        {/* ⭐️ ScrollView added here */}
                        <ScrollView horizontal={true} showsHorizontalScrollIndicator={false} contentContainerStyle={styles.buttonScrollView}>

                            {/* English Button */}
                            <TouchableOpacity
                                style={[
                                    styles.languageButton,
                                    currentLanguage === 'en' && styles.languageButtonActive
                                ]}
                                onPress={() => setLanguage('en')}
                            >
                                <Text style={[
                                    styles.languageButtonText,
                                    currentLanguage === 'en' && styles.languageButtonTextActive
                                ]}>EN</Text>
                            </TouchableOpacity>

                            {/* Chinese Button */}
                            <TouchableOpacity
                                style={[
                                    styles.languageButton,
                                    currentLanguage === 'zh' && styles.languageButtonActive
                                ]}
                                onPress={() => setLanguage('zh')}
                            >
                                <Text style={[
                                    styles.languageButtonText,
                                    currentLanguage === 'zh' && styles.languageButtonTextActive
                                ]}>中文</Text>
                            </TouchableOpacity>

                            {/* Korean Button */}
                            <TouchableOpacity
                                style={[
                                    styles.languageButton,
                                    currentLanguage === 'ko' && styles.languageButtonActive
                                ]}
                                onPress={() => setLanguage('ko')}
                            >
                                <Text style={[
                                    styles.languageButtonText,
                                    currentLanguage === 'ko' && styles.languageButtonTextActive
                                ]}>한국어</Text>
                            </TouchableOpacity>

                            {/* Malay Button */}
                            <TouchableOpacity
                                style={[
                                    styles.languageButton,
                                    currentLanguage === 'ms' && styles.languageButtonActive
                                ]}
                                onPress={() => setLanguage('ms')}
                            >
                                <Text style={[
                                    styles.languageButtonText,
                                    currentLanguage === 'ms' && styles.languageButtonTextActive
                                ]}>BM</Text>
                            </TouchableOpacity>

                        </ScrollView>
                    </View>
                </View>

            </View>
        </SafeAreaView>
    );
};


const App = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [currentScreen, setCurrentScreen] = useState('Menu'); // Default to Menu after login
    const [previousScreen, setPreviousScreen] = useState('Menu'); // Track previous screen for Settings back button
    const [errorMessage, setErrorMessage] = useState("");
    const [lastDetectedTime, setLastDetectedTime] = useState("N/A");
    const [studentName, setStudentName] = useState("");
    const [lane, setLane] = useState("");
    const [recentList, setRecentList] = useState([]);
    const [socketConnected, setSocketConnected] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [notification, setNotification] = useState({ visible: false, message: '', type: 'info' });
    const [studentFilter, setStudentFilter] = useState("");
    const [userName, setUserName] = useState("");
    const [userEmail, setUserEmail] = useState("");

    // Language setting (default to English)
    const [currentLanguage, setCurrentLanguage] = useState('en');

    // Get the current translation object
    const tr = translations[currentLanguage];

    const toggleDarkMode = () => {
        setIsDarkMode(prev => !prev);
    };

    // Set language and store preference
    const setLanguage = async (lang) => {
        setCurrentLanguage(lang);
        await AsyncStorage.setItem("user_language", lang);
    };

    // Destructure the returned object from getStyles
    const { styles, colors: rawColors } = getStyles(isDarkMode);

    // --- Authentication and WebSocket Logic ---
    useEffect(() => {
        const checkAuthStatus = async () => {
            // Load stored language preference
            const storedLang = await AsyncStorage.getItem("user_language");
            if (storedLang) {
                setCurrentLanguage(storedLang);
            }

            const storedRegistration = await AsyncStorage.getItem("user_registration");
            if (storedRegistration) {
                try {
                    const data = JSON.parse(storedRegistration);
                    setUserName(data.name || "");
                    setUserEmail(data.email || "");
                } catch (e) {
                    console.error("Failed to parse registration data", e);
                }
            }

            const storedHistory = await AsyncStorage.getItem("user_history");
            const storedLastReset = await AsyncStorage.getItem("history_last_reset");

            // Check if we need to reset history (new day at midnight)
            const today = new Date();
            today.setHours(0, 0, 0, 0); // Set to midnight
            const todayTimestamp = today.getTime();

            if (storedLastReset) {
                const lastResetTimestamp = parseInt(storedLastReset);
                if (todayTimestamp > lastResetTimestamp) {
                    // It's a new day, reset the history
                    setRecentList([]);
                    await AsyncStorage.setItem("user_history", JSON.stringify([]));
                    await AsyncStorage.setItem("history_last_reset", todayTimestamp.toString());
                } else if (storedHistory) {
                    // Same day, load existing history
                    setRecentList(JSON.parse(storedHistory));
                }
            } else {
                // First time, set the reset timestamp and load history if exists
                await AsyncStorage.setItem("history_last_reset", todayTimestamp.toString());
                if (storedHistory) {
                    setRecentList(JSON.parse(storedHistory));
                }
            }

            const storedFilter = await AsyncStorage.getItem("user_student_filter");
            if (storedFilter) {
                setStudentFilter(storedFilter);
            }
        };
        checkAuthStatus();
    }, []);

    // Request Notification Permissions
    useEffect(() => {
        const registerForPushNotificationsAsync = async () => {
            if (Platform.OS === 'android') {
                await Notifications.setNotificationChannelAsync('default', {
                    name: 'default',
                    importance: Notifications.AndroidImportance.MAX,
                    vibrationPattern: [0, 250, 250, 250],
                    lightColor: '#FF231F7C',
                });
            }

            if (Device.isDevice) {
                const { status: existingStatus } = await Notifications.getPermissionsAsync();
                let finalStatus = existingStatus;
                if (existingStatus !== 'granted') {
                    const { status } = await Notifications.requestPermissionsAsync();
                    finalStatus = status;
                }
                if (finalStatus !== 'granted') {
                    console.log('Failed to get push token for push notification!');
                    return;
                }
            } else {
                console.log('Must use physical device for Push Notifications');
            }
        };
        registerForPushNotificationsAsync();
    }, []);

    // Helper: send push notification via Expo Push API to parent device(s)
    const sendPushNotification = async (expoPushToken, title, body) => {
        if (!expoPushToken) return;
        try {
            const message = {
                to: expoPushToken,
                sound: 'default',
                title: title,
                body: body,
                data: { student: studentName },
            };

            await fetch('https://exp.host/--/api/v2/push/send', {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    'Accept-encoding': 'gzip, deflate',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(message),
            });
        } catch (err) {
            console.error('Error sending push notification:', err);
        }
    };

    const showNotification = (message, type = 'info') => {
        setNotification({ visible: true, message, type });
    };

    const hideNotification = () => {
        setNotification(prev => ({ ...prev, visible: false }));
    };

    const handleSetStudentFilter = async (text) => {
        setStudentFilter(text);
        await AsyncStorage.setItem("user_student_filter", text);
    };

    const handleSetUserName = async (text) => {
        setUserName(text);
        // Update registration object
        const data = { name: text, email: userEmail, date: new Date().toISOString() };
        await AsyncStorage.setItem("user_registration", JSON.stringify(data));
    };

    const handleSetUserEmail = async (text) => {
        setUserEmail(text);
        // Update registration object
        const data = { name: userName, email: text, date: new Date().toISOString() };
        await AsyncStorage.setItem("user_registration", JSON.stringify(data));
    };

    // Initialize studentName and lane with translations after tr is available
    useEffect(() => {
        setStudentName(tr.scanning);
        setLane(tr.pending);
    }, [tr]);


const handleLogin = async () => {
    // Check email format
    if (!userEmail.endsWith("@kl.his.edu.my")) {
        setErrorMessage("Use school email only");
        showNotification("Use school email only", "error");
        return;
    }

    try {
        const response = await fetch("http://10.252.2.107:3000/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                email: userEmail,
            }),
        });

        const data = await response.json();

        if (response.ok) {
    // Save user info from database response
    setUserName(data.user.fullname || "");
    setUserEmail(data.user.email || "");
    
    // Save to AsyncStorage for next time
    await AsyncStorage.setItem("user_authenticated", "true");
    await AsyncStorage.setItem("user_registration", JSON.stringify({
        name: data.user.fullname,
        email: data.user.email,
    }));
    
    setIsAuthenticated(true);
    setCurrentScreen("Menu");
    showNotification("Login successful", "success");
    
        } else {
            setErrorMessage(data.message || "Login failed");
            showNotification(data.message || "Login failed", "error");
        }

    } catch (error) {
        console.error("Login error:", error);
        setErrorMessage("Cannot connect to server");
        showNotification("Cannot connect to server", "error");
    }
};

    useEffect(() => {
        if (!isAuthenticated) return;

        const socket = io(SOCKET_URL, {
            transports: ["websocket"],
            reconnection: true,
            reconnectionAttempts: 50,
            reconnectionDelay: 3000,
            timeout: 20000,
        });

        socket.on("connect", () => { setSocketConnected(true); });
        socket.on("disconnect", (reason) => { setSocketConnected(false); });
        socket.on("connect_error", (error) => { 
    // Silently ignore - students' Flask server may not be running
});

        socket.on("update_data", async (data) => {
            // Use translated defaults for live data
            setStudentName(data.studentname || tr.unknown);
            setLane(data.lane || tr.noLaneDetected);
            setLastDetectedTime(new Date().toLocaleTimeString());

            // Check if this is a new detection (not "Unknown" or scanning state)
            if (data.studentname && data.studentname !== "Unknown" && data.studentname !== tr.scanning) {
                // Create new entry
                const newEntry = `${data.studentname} - ${data.lane || tr.noLaneDetected}`;

                // Get current history from state and add new entry at the beginning
                setRecentList(prevList => {
                    // Check if this exact entry already exists at the top (prevent duplicates)
                    if (prevList.length > 0 && prevList[0] === newEntry) {
                        return prevList;
                    }

                    // Add new entry and limit to 30 items
                    const updatedList = [newEntry, ...prevList].slice(0, 30);

                    // Save to AsyncStorage
                    AsyncStorage.setItem("user_history", JSON.stringify(updatedList));

                    return updatedList;
                });
            }

            // Trigger notification for new detection
           if (data.studentname && data.studentname !== "Unknown") {
    const isStaff = userEmail && !userEmail.split('@')[0].match(/^\d/);
    const isStudent = userEmail && userEmail.split('@')[0].match(/^\d/);
    const detectedName = data.studentname.toLowerCase();
    const loggedInName = userName.toLowerCase();

    // Check if this notification is relevant to this user
    const shouldNotify = isStaff || (isStudent && detectedName.includes(loggedInName.split(' ')[0].toLowerCase()));

    if (shouldNotify) {
        // Different message for staff vs student
        let notifTitle = '';
        let notifBody = '';

        if (isStaff) {
            notifTitle = `🚗 Vehicle Detected`;
            notifBody = `${data.studentname} — Parent arrived at ${data.lane || 'pickup zone'}`;
        } else {
            notifTitle = `🚗 Your Parent Has Arrived!`;
            notifBody = `Please proceed to ${data.lane || 'the pickup zone'} now.`;
        }
// after change ^

        showNotification(notifBody, 'success');

        Notifications.scheduleNotificationAsync({
            content: {
                title: notifTitle,
                body: notifBody,
                sound: true,
            },
            trigger: null,
        });
    }
}

            // --- SECOND ROUND HANDLING ---
            // Detect second round via common keys: second_round, secondRound or round === 2
            const isSecondRound = data.second_round || data.secondRound || (data.round && parseInt(data.round, 10) === 2);
            if (isSecondRound) {
                // Parent push token(s) may be provided in the payload as `parentPushToken` (single)
                // or `parentPushTokens` (array). If none provided, we fallback to an in-app notice
                const tokens = [];
                if (data.parentPushToken) tokens.push(data.parentPushToken);
                if (data.parentPushTokens && Array.isArray(data.parentPushTokens)) tokens.push(...data.parentPushTokens);

                const title = `${tr.schoolName}`;
                const isStaff = userEmail && !userEmail.split('@')[0].match(/^\d/);
                const body = isStaff 
                ? `⚠️ Second round: ${data.studentname} has not been picked up yet!`
                :`⚠️ Please hurry! Your parent is waiting at ${data.lane || 'the pickup zone'}.`;

                if (tokens.length > 0) {
                    // Fire off push notifications (best-effort)
                    tokens.forEach(token => sendPushNotification(token, title, body));

                    // Inform the staff user in-app
                    showNotification(`Notified parent(s) for ${data.studentname} (2nd round)`, 'success');
                } else {
                    // No parent push token available — notify staff so they can act
                    showNotification(`${data.studentname} returned for 2nd round — no parent token available.`, 'info');
                }

                // Also schedule a local notification on the staff device so it is obvious
                Notifications.scheduleNotificationAsync({
                    content: {
                        title: title,
                        body: body,
                        sound: true,
                    },
                    trigger: null,
                });
           }

            // Show success when student is picked up (not second round)
            if (!isSecondRound && data.studentname && data.studentname !== "Unknown") {
                const isStaff = userEmail && !userEmail.split('@')[0].match(/^\d/);
                if (isStaff) {
                    showNotification(`✅ ${data.studentname} has been picked up successfully!`, 'success');
                }
            }
        });

        return () => { socket.disconnect(); };



    }, [isAuthenticated, tr]);

    const filteredRecentList = recentList.filter(item =>
        item.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // --- RENDERING LOGIC (Using the tr object for translation) ---

    // 1. Render Login Screen
    if (!isAuthenticated) {
        return (
        <KeyboardAvoidingView
            style={{ flex: 1}}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <ScrollView
                contentContainerStyle={{ flexGrow: 1}}
                keyboardShouldPersistTaps="handled"
                style={{backgroundColor: isDarkMode ? '#121212' : '#FFFFFF' }}
            >
            
            <View style={styles.authContainer}>

                <View style={styles.header}>
                    <Text style={styles.schoolName}>{tr.schoolName}</Text>
                    <Image source={require("./assets/icon.png")} style={styles.banner} />
                    <Text style={styles.subheading}>{tr.systemTitle}</Text>
                </View>

                <Text style={styles.instruction}>{tr.accessControl}</Text>

                <TextInput
                    style={styles.input}
                    value={userEmail}
                    onChangeText={setUserEmail}
                    placeholder="Enter school email"
                    autoCapitalize="none"
                    placeholderTextColor={isDarkMode ? darkColors.textSecondary : lightColors.textSecondary}
/>
    
                {errorMessage ? <Text style={styles.error}>{errorMessage}</Text> : null}
                <TouchableOpacity style={styles.button} onPress={handleLogin}>
                    <Text style={styles.buttonText}>{tr.authLaunch}</Text>
                </TouchableOpacity>
            </View>
            </ScrollView>
            </KeyboardAvoidingView>
        );
    }
    

    // 2. Render Settings Screen
    if (currentScreen === 'Settings') {
        return (
            <SettingsScreen
                isDarkMode={isDarkMode}
                toggleDarkMode={toggleDarkMode}
                currentLanguage={currentLanguage}
                setLanguage={setLanguage}
                navigateBack={() => setCurrentScreen(previousScreen)}
                styles={styles}
                switchColors={rawColors}
                tr={tr}
                studentFilter={studentFilter}
                setStudentFilter={handleSetStudentFilter}
                userName={userName}
                setUserName={handleSetUserName}
                userEmail={userEmail}
                setUserEmail={handleSetUserEmail}
            />
        );
    }

    // 3. Render History Screen
    // 2. Render Main App Screens based on currentScreen state

    if (currentScreen === 'Menu') {
        return (
            <MenuScreen
                onNavigate={async (screen) => {
                    if (screen === 'Logout') {
                        setIsAuthenticated(false);
setUserName("");
setUserEmail("");
await AsyncStorage.removeItem("user_authenticated");
await AsyncStorage.removeItem("user_registration");
                    } else {
                        // Track previous screen for proper back navigation
                        if (screen === 'History' || screen === 'Profile' || screen === 'Dashboard') {
                            setPreviousScreen('Menu');
                        }
                        setCurrentScreen(screen);
                    }
                }}
                styles={styles}
                colors={rawColors}
                tr={tr}
            />
        );
    }

    if (currentScreen === 'Profile') {
        return (
            <ProfileScreen
                userName={userName}
                userEmail={userEmail}
                onBack={() => setCurrentScreen('Menu')}
                onSettings={() => {
                    setPreviousScreen('Profile');
                    setCurrentScreen('Settings');
                }}
                styles={styles}
                colors={rawColors}
                tr={tr}
            />
        );
    }

    if (currentScreen === 'History') {
        return (
            <HistoryScreen
                recentList={recentList}
                onBack={() => setCurrentScreen(previousScreen === 'Dashboard' ? 'Dashboard' : 'Menu')}
                onSettings={() => {
                    setPreviousScreen('History');
                    setCurrentScreen('Settings');
                }}
                styles={styles}
                colors={rawColors}
                tr={tr}
            />
        );
    }

    if (currentScreen === 'LaneView') {
        return (
            <LaneScreen
                recentList={recentList}
                onBack={() => setCurrentScreen('Menu')}
                styles={styles}
                colors={rawColors}
                tr={tr}
            />
        );
    }

    // Default: Dashboard
    // Ensure we can navigate back to Menu from Dashboard
    const navigateToMenu = () => setCurrentScreen('Menu');

    // 4. Render Main Dashboard (currentScreen === 'Dashboard')
    return (
        <SafeAreaView style={styles.safeArea}>

            {/* Back Button - positioned higher */}
            <TouchableOpacity
                style={[styles.backButton, { top: Platform.OS === 'android' ? 15 : 50 }]}
                onPress={navigateToMenu}
            >
                <Text style={styles.backButtonText}>{tr.back}</Text>
            </TouchableOpacity>

            {/* Settings Icon Button - positioned higher */}
            <TouchableOpacity
                style={[styles.settingsIcon, { top: Platform.OS === 'android' ? 15 : 50 }]}
                onPress={() => {
                    setPreviousScreen('Dashboard');
                    setCurrentScreen('Settings');
                }}
                activeOpacity={0.6}
            >
                <Text style={styles.settingsIconText}>⚙️</Text>
            </TouchableOpacity>

            <ScrollView contentContainerStyle={[styles.container, { paddingTop: Platform.OS === 'android' ? 80 : 120 }]} nestedScrollEnabled={true}>

                {/* 1. Dashboard Header */}
                <View style={styles.headerContainer}>
                    <View style={{ alignItems: 'center', width: '100%' }}>
                        <Text style={styles.mainTitle}>{tr.dashboardTitle}</Text>
                    </View>
                </View>

                {/* 2. Live Detection Card (Main Focus) */}
                <View style={styles.liveCard}>
                    <Text style={styles.liveLabel}>{tr.liveDetection}</Text>

                    <Text style={styles.mainValue}>{studentName.toUpperCase()}</Text>
                </View>

                <View style={styles.metadataRow}>
                    <View style={styles.metadataItem}>
                        <Text style={styles.metadataLabel}>{tr.laneId}</Text>
                        <Text style={styles.metadataValue}>{lane.toUpperCase()}</Text>
                    </View>
                    <View style={styles.metadataItem}>
                        <Text style={styles.metadataLabel}>{tr.time}</Text>
                        <Text style={styles.metadataValue}>{lastDetectedTime}</Text>
                    </View>
                </View>

                {/* 2. Action Buttons */}
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginBottom: 25, marginTop: 20 }}>
                    <TouchableOpacity
                        style={[styles.button, { flex: 1, marginHorizontal: 5, marginTop: 0, backgroundColor: rawColors.card, borderWidth: 1, borderColor: rawColors.border }]}
                        onPress={() => {
                            setPreviousScreen('Dashboard');
                            setCurrentScreen('History');
                        }}
                    >
                        <Text style={[styles.buttonText, { color: rawColors.textPrimary }]}>{tr.history}</Text>
                    </TouchableOpacity>
                </View>

                {/* 3. Search and Activity Log */}
                <View style={styles.logHeaderContainer}>
                    <Text style={styles.sectionHeader}>{tr.activityLog} ({filteredRecentList.length})</Text>
                    <View style={styles.statusPill}>
                        <Text style={[
                            styles.statusText,
                            { color: socketConnected ? '#34C759' : '#FF3B30' }
                        ]}>
                            {/* Use translated status */}
                            {socketConnected ? tr.statusOnline : tr.statusOffline}
                        </Text>
                    </View>
                </View>

                <TextInput
                    style={styles.searchBar}
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    placeholder={tr.searchPlaceholder}
                    placeholderTextColor={isDarkMode ? darkColors.textSecondary : lightColors.textSecondary}
                />

                <View style={styles.logContainer}>
                    {/* ⭐️ ScrollView added here to allow scrolling within the log box */}
             {filteredRecentList.length === 0 ? (
    <Text style={styles.logEmpty}>{tr.noDetections.replace('{query}', searchQuery)}</Text>
) : (
    filteredRecentList.slice(0, 10).map((item, index) => {
        const parts = item.split(' - ');
        const name = parts[0] || 'Unknown Name';
        const lane = parts[1] || tr.noLaneDetected;
        return (
            <View key={index} style={styles.logItemRow}>
                <Text style={styles.logNameText}>• {name}</Text>
                <Text style={styles.logLaneText}>(Lane: {lane})</Text>
            </View>
        );
    })
)}
                </View>

            </ScrollView>


            <NotificationPopup
                visible={notification.visible}
                message={notification.message}
                type={notification.type}
                onHide={hideNotification}
                styles={styles}
                colors={rawColors}
            />
        </SafeAreaView>
    );
};

export default App;
