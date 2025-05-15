import { StyleSheet } from "react-native";

export default StyleSheet.create({
    container: { 
        flex: 1, 
        backgroundColor: "#046a38" 
    },
    icon: { 
        left: 75, 
        marginTop: 30 
    },
    header: { 
        flexDirection: "row", 
        backgroundColor: "#046a38", 
        padding: 10, 
        borderColor: "black", 
        borderWidth: 2 
    },
    addButton: { 
        padding: 10 
    },
    headerText: { 
        color: "white", 
        marginTop: 30, 
        fontSize: 18, 
        fontWeight: "bold", 
        flex: 1, 
        left: 85, 
        marginBottom: 10 
    },
    fileNameContainer: { 
        flexDirection: "row", 
        backgroundColor: "#027d43", 
        padding: 10, 
        alignItems: "center", 
        borderColor: "black", 
        borderWidth: 1 
    },
    fileName: { 
        color: "white", 
        fontSize: 16, 
        textDecorationLine: "underline" 
    },
    tabContainer: { 
        flexDirection: "row", 
        borderBottomWidth: 1, 
        borderColor: "#ccc" 
    },
    tab: { 
        flex: 1, 
        padding: 10, 
        alignItems: "center" 
    },
    activeTab: { 
        borderBottomWidth: 2, 
        borderColor: "#046a38" 
    },
    tabText: { 
        fontSize: 16, 
        fontWeight: "bold" 
    },
    contentContainer: { 
        flex: 1, 
        padding: 10 
    },
    codeInput: { 
        backgroundColor: "white", 
        padding: 10, borderRadius: 5, 
        minHeight: 300, fontSize: 14, 
        textAlignVertical: "top" 
    },
    outputText: { 
        color: "white", 
        fontSize: 16, 
        padding: 10, 
        backgroundColor: "#333", 
        borderRadius: 5 
    },
    runButton: { 
        position: "absolute", 
        bottom: 120, 
        left: 20, 
        backgroundColor: "#027d43", 
        paddingVertical: 12, 
        paddingHorizontal: 24, 
        borderRadius: 5 },
    runButtonText: { 
        color: "white", 
        fontSize: 16, 
        fontWeight: "bold" 
    },
  });