import {View, StyleSheet, TouchableOpacity, TextInput, SafeAreaView, Text} from "react-native";
import {useLocalSearchParams, useRouter} from "expo-router";
import {useEffect, useState} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function NoteDetail() {
    const router = useRouter();
    const studentData = useLocalSearchParams()
    const [heading, setHeading] = useState("");
    const [content, setContent] = useState("");
    const [edit, setEdit] = useState(false);


    useEffect(() => {
        if (studentData.heading){
            // @ts-ignore
            setHeading(studentData.heading)
            setEdit(true)
        }

        if (studentData.content){
            // @ts-ignore
            setContent(studentData.content)
            setEdit(true)
        }


    }, []);


    const addNote = async() => {
        const newNote = {heading: heading, content: content};

        if (edit){
            const stored: any = await AsyncStorage.getItem(`notesList/${studentData.student}/${studentData.subject}`);
            const parsed = stored ? JSON.parse(stored) : []
            const filtered = parsed.filter((item: any) => item.heading !== studentData.heading);
            const newList = [newNote, ...filtered];
            await AsyncStorage.setItem(`notesList/${studentData.student}/${studentData.subject}`, JSON.stringify(newList));
        } else {
            const stored: any = await AsyncStorage.getItem(`notesList/${studentData.student}/${studentData.subject}`);
            const parsed = stored ? JSON.parse(stored) : []
            const newList = [newNote, ...parsed]
            await AsyncStorage.setItem(`notesList/${studentData.student}/${studentData.subject}`, JSON.stringify(newList));
        }
        router.replace({pathname: "/pagesTeacher/notes", params: {student: studentData.student, subject: studentData.subject}})
    }


    return(
        <SafeAreaView style={styles.container}>
            <View style={styles.headerLayout}>
                <TextInput style={styles.titleInput} placeholder={"title..."} placeholderTextColor={"#777"} value={heading} onChangeText={setHeading} />
            </View>
            <TextInput style={styles.contentInput} placeholder={"Content..."} placeholderTextColor={"#777"} multiline={true} value={content} onChangeText={setContent}/>
            <View style={styles.bottomLayout}>
                <TouchableOpacity style={styles.backButton} onPress={() => router.replace({pathname: "/pagesTeacher/notes", params: {student: studentData.student, subject: studentData.subject}})}>
                    <Text style={styles.buttonText}>back</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.saveButton} onPress={addNote}>
                    <Text style={styles.buttonText}>Save</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#000000",
        padding: 16,
        alignItems: "center",
    },

    headerLayout: {
        width: "90%",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        marginTop: 20,
        marginBottom: 10,
    },

    titleInput: {
        flex: 1,
        fontSize: 25,
        color: "#fff",
        width: "90%",
        borderWidth: 2,
        padding:10,
        borderColor: "#1c1c1c",
        borderRadius: 15,
    },

    contentInput: {
        flex: 1,
        fontSize: 20,
        color: "#fff",
        width: "90%",
        borderWidth: 2,
        padding:10,
        borderColor: "#1c1c1c",
        borderRadius: 15,
    },

    bottomLayout: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        width: "90%",
        marginTop: 10,
        gap: 10,
    },

    saveButton: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#22c55e",
        padding: 16,
        borderRadius: 15,
    },

    backButton: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#777",
        padding: 16,
        borderRadius: 15,
    },

    buttonText: {
        color: "#fff",
        fontSize: 20,
    }
})