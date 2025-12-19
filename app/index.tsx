import React, {useEffect, useState} from "react"
import {
    SafeAreaView,
    Text,
    TouchableOpacity,
    View,
    StyleSheet,
    Modal,
    Platform,
    useWindowDimensions
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {useRouter} from "expo-router";
import * as Progress from "react-native-progress";



export default function Index() {
    const router = useRouter();
    const [step, setStep] = useState<number | null>(null); // null = noch prüfen
    const width = useWindowDimensions();

    useEffect(() => {
        const checkLogin = async () => {
            const role = await AsyncStorage.getItem("role");
            if (role === "student") {
                router.replace("/student/home");
            } else if (role === "teacher") {
                router.replace("/teacher/home")
            }
            else {
                setStep(1);
            }
        };

        checkLogin();
    }, []);

    const student = async () => {
        await AsyncStorage.setItem("role", "student");
        router.replace("/student/home");
    };

    const teacher  = async () => {
        await AsyncStorage.setItem("role", "teacher");
        router.replace("/teacher/home")
    }


    if (step === null) {
        return <SafeAreaView style={styles.container} />;
    }

    return (
        <SafeAreaView style={styles.container}>
            {/* Info Page 1 */}
            { step === 1 && (
                <SafeAreaView style={styles.page}>
                    <View style={styles.progressView}>
                        <Progress.Bar
                            progress={0.25}
                            color={"#22c55e"}
                            unfilledColor={"#0d1d1f"}
                            width={width.width * 0.8}
                            height={10}
                            borderRadius={15}
                        />
                    </View>
                    <Text style={styles.heading}>👋 Welcome to Splan</Text>
                    <Text style={styles.text}>
                        Splan helps you organize your schoolday.
                    </Text>
                    <TouchableOpacity style={styles.button} onPress={() => setStep(2)}>
                        <Text style={styles.buText}>Next</Text>
                    </TouchableOpacity>
                </SafeAreaView>
            )}



            {/* Info Page 2 */}

            { step === 2 && (
                <SafeAreaView style={styles.page}>
                    <View style={styles.progressView}>
                        <Progress.Bar
                            progress={0.5}
                            color={"#22c55e"}
                            unfilledColor={"#0d1d1f"}
                            width={width.width * 0.8}
                            height={10}
                            borderRadius={15}
                        />
                    </View>
                    <Text style={styles.heading}>🎓 Splan for Students</Text>
                    <Text style={styles.text}>
                        Students can track subjects, exams and dates.
                    </Text>
                    <TouchableOpacity style={styles.button} onPress={() => setStep(3)}>
                        <Text style={styles.buText}>Next</Text>
                    </TouchableOpacity>
                </SafeAreaView>
            )}


            {/* Info Page 3 */}

            { step === 3 && (
                <SafeAreaView style={styles.page}>
                    <View style={styles.progressView }>
                        <Progress.Bar
                            progress={0.75}
                            color={"#22c55e"}
                            unfilledColor={"#0d1d1f"}
                            width={width.width * 0.8}
                            height={10}
                            borderRadius={15}
                        />
                    </View>
                    <Text style={styles.heading}>👨‍🏫 Splan for Teachers</Text>
                    <Text style={styles.text}>
                        Teachers can manage classes, students and exams.
                    </Text>
                    <TouchableOpacity style={styles.button} onPress={() => setStep(4)}>
                        <Text style={styles.buText}>Next</Text>
                    </TouchableOpacity>
                </SafeAreaView>
            )}


            {/* Login Page */}
            { step === 4 && (
                <SafeAreaView style={styles.page}>
                    <View style={styles.progressView}>
                        <Progress.Bar
                            progress={1}
                            color={"#22c55e"}
                            unfilledColor={"#0d1d1f"}
                            width={width.width * 0.8}
                            height={10}
                            borderRadius={15}
                        />
                    </View>
                    <Text style={styles.heading}>Splan</Text>
                    <Text style={styles.text}>Please choose your role</Text>
                    <View style={styles.buttonContainer}>
                        <TouchableOpacity style={styles.chooseButton} onPress={student}>
                            <Text style={styles.buText}>🎓 Student</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.chooseButton} onPress={teacher}>
                            <Text style={styles.buText}>👨‍🏫 Teacher</Text>
                        </TouchableOpacity>
                    </View>
                </SafeAreaView>
            )}

        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#0d1d1f" ,
        padding: 16,
    },
    page: {
        flex: 1,
        backgroundColor: "#0d1d1f",
        justifyContent: "center",
        alignItems: "center",
        padding: 24,
    },
    heading: {
        fontSize: 35,
        fontWeight: "bold",
        color: "#22c55e",
        marginBottom: 16,
        textAlign: "center",
    },
    text: {
        marginTop: 10,
        fontSize: 25,
        color: "#e5e5e5",
        textAlign: "center",
        lineHeight: 24,
        marginHorizontal: 10,
    },
    buText: {
        fontSize: 20,
        color: "#ffffff",
        fontWeight: "600",
        textAlign: "center",
    },
    button: {
        marginTop: 60,
        backgroundColor: "#22c55e",
        borderRadius: 15,
        paddingVertical: 12,
        paddingHorizontal: 24,
    },

    buttonContainer: {
        flexDirection: "row",
        marginTop: 30,
        gap: 10,
    },
    chooseButton: {
        marginTop: 10,
        backgroundColor: "#22c55e",
        borderRadius: 15,
        paddingVertical: 12,
        paddingHorizontal: 24,
    },

    progressView: {
        position: "absolute",
        top: 0,
        alignItems: "center",
        justifyContent: "center",
        alignSelf: "center",
        paddingTop: 20,
    },
});
