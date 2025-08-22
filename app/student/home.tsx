import React, { useEffect, useState } from "react";
import {
    StyleSheet,
    SafeAreaView,
    Text,
    FlatList,
    View,
    TouchableOpacity,
    Modal,
    TextInput,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";

export default function HomeStudent() {
    const router = useRouter();
    const [addAlert, setAddAlert] = useState(false);
    const [newSubject, setNewSubject] = useState("");
    const [subjects, setSubjects] = useState<{ subject: string; avr: string }[]>([]);
    const [overallAverage, setOverallAverage] = useState<string>("-");

    const calculateOverallAverage = (list: { avr: string }[]) => {
        const numericAvrs = list
            .map(s => parseFloat(s.avr))
            .filter(v => !isNaN(v));
        if (numericAvrs.length === 0) return "-";
        const sum = numericAvrs.reduce((acc, curr) => acc + curr, 0);
        return (sum / numericAvrs.length).toFixed(2);
    };

    useEffect(() => {
        const load = async () => {
            try {
                const storedSubjects = await AsyncStorage.getItem("subjects");
                if (storedSubjects) {
                    const parsed = JSON.parse(storedSubjects);
                    setSubjects(parsed);
                    setOverallAverage(calculateOverallAverage(parsed));
                }
            } catch (e) {
                console.error("Error loading subjects:", e);
            }
        };
        load();
    }, []);

    const addSubject = async (subject: string) => {
        if (!subject.trim()) return;

        const newSubjectsList = [...subjects, { subject, avr: "-" }];
        try {
            await AsyncStorage.setItem("subjects", JSON.stringify(newSubjectsList));
            setSubjects(newSubjectsList);
            setOverallAverage(calculateOverallAverage(newSubjectsList));
            setNewSubject("");
            setAddAlert(false);
        } catch (e) {
            console.error("Error saving subjects:", e);
        }
    };

    const renderItem = ({ item }: any) => {
        return (
            <TouchableOpacity
                style={styles.item}
                onPress={() =>
                    router.replace({
                        pathname: "/pagesstudent/exams",
                        params: { subject: item.subject },
                    })
                }
            >
                <View style={styles.itemLeft}>
                    <Text style={styles.buText}>{item.subject}</Text>
                </View>
                <View style={styles.itemRight}>
                    <Text style={styles.buText}>{item.avr}</Text>
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <Text style={styles.heading}>Splan for Students</Text>
            <Text style={styles.text}>{"Ø "} {overallAverage}</Text>

            <FlatList
                style={styles.list}
                data={subjects}
                renderItem={renderItem}
                keyExtractor={(_, index) => index.toString()}
            />
            <TouchableOpacity style={styles.button} onPress={() => setAddAlert(true)}>
                <Text style={styles.buText}>+</Text>
            </TouchableOpacity>

            <Modal transparent animationType="slide" visible={addAlert}>
                <TouchableOpacity
                    style={styles.sheetOverlay}
                    activeOpacity={1}
                    onPress={() => setAddAlert(false)}
                >
                    <TouchableOpacity
                        activeOpacity={1}
                        style={styles.sheetsContainer}
                        onPress={() => {}}
                    >
                        <Text style={styles.heading}>Add A Subject</Text>
                        <TextInput
                            value={newSubject}
                            onChangeText={setNewSubject}
                            style={styles.textInput}
                            placeholder="Subject"
                            placeholderTextColor="#fff"
                        />
                        <TouchableOpacity
                            style={styles.addButton}
                            onPress={() => addSubject(newSubject)}
                        >
                            <Text style={styles.addButtonText}>Add</Text>
                        </TouchableOpacity>
                    </TouchableOpacity>
                </TouchableOpacity>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 16, backgroundColor: "#000", alignItems: "center" },
    heading: { fontSize: 26, fontWeight: "bold", color: "#22c55e", marginTop: 20 },
    buText: { fontSize: 22, color: "#fff" },

    text: {
        marginVertical: 20,
        fontSize: 25,
        color: "#e5e5e5",
        textAlign: "center",
        lineHeight: 24,
    },

    item: {
        flexDirection: "row",
        justifyContent: "space-between",
        width: "100%",
        marginVertical: 10,
        paddingHorizontal: 16,
    },
    itemLeft: {
        flex: 1,
        backgroundColor: "#111",
        borderColor: "#22c55e",
        borderRadius: 12,
        borderWidth: 2,
        padding: 10,
        alignItems: "center",
    },
    itemRight: {
        backgroundColor: "#111",
        height: 50,
        width: 50,
        borderRadius: 25,
        borderWidth: 2,
        borderColor: "#22c55e",
        marginLeft: 10,
        alignItems: "center",
        justifyContent: "center",
    },
    button: {
        backgroundColor: "#22c55e",
        width: 60,
        height: 60,
        borderRadius: 30,
        position: "absolute",
        right: 30,
        bottom: 30,
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 80,
    },
    sheetOverlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.1)",
        alignItems: "center",
        justifyContent: "flex-end",
    },
    sheetsContainer: {
        backgroundColor: "#111",
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        width: "100%",
        height: "60%",
        alignItems: "center",
    },
    textInput: {
        marginTop: 50,
        backgroundColor: "#111",
        borderColor: "#22c55e",
        borderRadius: 15,
        borderWidth: 2,
        padding: 16,
        width: "80%",
        color: "#fff",
    },
    addButton: {
        marginTop: 40,
        backgroundColor: "#22c55e",
        borderRadius: 15,
        paddingVertical: 12,
        paddingHorizontal: 24,
        alignItems: "center",
    },
    addButtonText: { fontSize: 17, color: "#fff", fontWeight: "600" },
    list: { marginBottom: 80 },
});
