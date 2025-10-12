import React from "react"
import {StyleSheet, SafeAreaView, Text, TouchableOpacity} from "react-native";
import {useLocalSearchParams} from "expo-router";

export default function Students() {

    const heading: any = useLocalSearchParams()

    return(
        <SafeAreaView style={styles.container}>
            <Text style={styles.heading}>{heading.subject}</Text>
            <TouchableOpacity style={styles.addFab} onPress={() => alert("comming soon!")}>
                <Text style={styles.fabText}>+</Text>
            </TouchableOpacity>
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

    heading: {
        fontSize: 26,
        color: "#22c55e",
        fontWeight: "bold",
        marginTop: 20,
    },

    addFab: {
        position: "absolute",
        right: 30,
        bottom: 30,
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