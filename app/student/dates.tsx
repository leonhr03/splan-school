import React from "react"
import {StyleSheet, SafeAreaView, Text} from "react-native";

export default function Dates() {
    return(
        <SafeAreaView style={styles.container}>
            <Text style={styles.heading}>Dates</Text>

            {/*Flatlist mit Datum, fach und inhalt*/}
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: "center",
        padding: 16,
        backgroundColor: "#000",
    },

    heading: {
        fontSize: 25,
        marginTop: 20,
        color: "#22c55e",
        fontWeight: "bold",
    }


})
