import React, {useState} from "react"
import {FlatList, SafeAreaView, StyleSheet, Text, TouchableOpacity, View} from "react-native";

export default function TeacherHome() {

    const [avrGes, setAvrGes] = useState("--")
    const [classList, setClassList] = useState([{class: "10b"}])

    const renderItem = ({item}: any) => {
        return(
            <View style={styles.itemContainer}>
                <TouchableOpacity style={styles.border}>
                    <Text style={styles.text}>{item.class}</Text>
                </TouchableOpacity>

            </View>
        )
    }

    return (
        <SafeAreaView style={styles.container}>
            <Text style={styles.heading}>Splan for Teachers</Text>
            <Text style={styles.avrText}>{"Ø "} {avrGes}</Text>
            <FlatList
                style={styles.classList}
                data={classList}
                renderItem={renderItem}
                keyExtractor={(item) => item.class}/>

            <TouchableOpacity style={styles.addFab}>
                <Text style={styles.fabText}>+</Text>
            </TouchableOpacity>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#000000",
        alignItems: "center",
        padding: 16,
    },

    heading: {
        fontSize: 26,
        color: "#22c55e",
        fontWeight: "bold",
        marginTop: 20,
    },

    avrText: {
        fontSize: 25,
        color: "#ffffff",
        marginTop: 20,
    },

    itemContainer: {
        flex: 1,
        justifyContent: "center",
    },

    border: {
        width: "90%",
        height: 60,
        borderWidth: 2,
        borderColor: "#22c55e",
        borderRadius: 30,
        alignItems: "center",
        justifyContent: "center",
        marginHorizontal: 20,
    },

    text: {
        fontSize: 25,
        color: "#22c55e",
    },

    classList: {
        marginTop: 20,
        width: "100%",
    },

    addFab: {
        position: "absolute",
        right: 30,
        bottom: 110,
        height: 60,
        width: 60,
        borderRadius: 30,
        backgroundColor: "#22c55e",
        alignItems: "center",
        justifyContent: "center",
    },

    fabText: {
        fontSize: 22,
        color: "#fff"
    },
})