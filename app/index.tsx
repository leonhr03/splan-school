import React, {useEffect, useState} from "react"
import {SafeAreaView, Text, TouchableOpacity, View, StyleSheet, Modal} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {useRouter} from "expo-router";

export default function Index() {
    const router = useRouter();
    const [step, setStep] = useState<number | null>(null); // null = noch prüfen

    useEffect(() => {
        const checkLogin = async () => {
            const role = await AsyncStorage.getItem("role");
            if (role === "student") {
                router.replace("/student/home");
            } else {
                // kein Login → bei Step 1 starten
                setStep(1);
            }
        };
        checkLogin();
    }, []);

    const student = async () => {
        await AsyncStorage.setItem("role", "student");
        router.replace("/student/home");
    };

    // während der Prüfung nichts anzeigen
    if (step === null) {
        return <SafeAreaView style={styles.container} />;
    }

    return (
        <SafeAreaView style={styles.container}>
            {/* Info Page 1 */}
            <Modal animationType="slide" visible={step === 1}>
                <SafeAreaView style={styles.page}>
                    <Text style={styles.heading}>👋 Welcome to Splan</Text>
                    <Text style={styles.text}>
                        Splan helps you organize your schoolday.
                    </Text>
                    <TouchableOpacity style={styles.button} onPress={() => setStep(2)}>
                        <Text style={styles.buText}>Next</Text>
                    </TouchableOpacity>
                </SafeAreaView>
            </Modal>

            {/* Info Page 2 */}
            <Modal animationType="slide" visible={step === 2}>
                <SafeAreaView style={styles.page}>
                    <Text style={styles.heading}>🎓 Splan for Students</Text>
                    <Text style={styles.text}>
                        Students can track subjects, exams and dates.
                    </Text>
                    <TouchableOpacity style={styles.button} onPress={() => setStep(3)}>
                        <Text style={styles.buText}>Next</Text>
                    </TouchableOpacity>
                </SafeAreaView>
            </Modal>

            {/* Info Page 3 */}
            <Modal animationType="slide" visible={step === 3}>
                <SafeAreaView style={styles.page}>
                    <Text style={styles.heading}>👨‍🏫 Splan for Teachers</Text>
                    <Text style={styles.text}>
                        Teachers can manage classes, students and exams.
                    </Text>
                    <TouchableOpacity style={styles.button} onPress={() => setStep(4)}>
                        <Text style={styles.buText}>Next</Text>
                    </TouchableOpacity>
                </SafeAreaView>
            </Modal>

            {/* Login Page */}
            <Modal animationType="slide" visible={step === 4}>
                <SafeAreaView style={styles.page}>
                    <Text style={styles.heading}>Splan</Text>
                    <Text style={styles.text}>Please choose your role</Text>
                    <View style={styles.buttonContainer}>
                        <TouchableOpacity style={styles.chooseButton} onPress={student}>
                            <Text style={styles.buText}>🎓 Student</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.chooseButton}>
                            <Text style={styles.buText}>👨‍🏫 Teacher</Text>
                        </TouchableOpacity>
                    </View>
                </SafeAreaView>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#0a0a0a",
    },
    page: {
        flex: 1,
        backgroundColor: "#0a0a0a",
        justifyContent: "center",
        alignItems: "center",
        padding: 24,
    },
    heading: {
        fontSize: 35,
        fontWeight: "bold",
        color: "#4ade80",
        marginBottom: 16,
        textAlign: "center",
    },
    text: {
        marginTop: 10,
        fontSize: 25,
        color: "#e5e5e5",
        textAlign: "center",
        lineHeight: 24,
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
        shadowColor: "#22c55e",
        shadowOpacity: 0.6,
        shadowRadius: 6,
        elevation: 6,
    },
    buttonContainer: {
        flexDirection: "row",
        marginTop: 30,
    },
    chooseButton: {
        backgroundColor: "#3b3b3b",
        marginHorizontal: 8,
        borderRadius: 15,
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderWidth: 1,
        borderColor: "#4ade80",
    },
});
