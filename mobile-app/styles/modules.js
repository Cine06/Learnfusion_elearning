import { StyleSheet } from "react-native";

export default StyleSheet.create({
    container: { 
        flex: 1, 
        backgroundColor: "#046a38"
     },
    header: { 
        flexDirection: "row", 
        alignItems: "center", 
        backgroundColor: "#046a38", 
        padding: 10, 
        justifyContent: "center", 
        marginTop: 40 
    },
    logo: { 
        width: 40, 
        height: 40,
        marginRight: 10
    },
    headerText: { 
        fontSize: 14, 
        fontWeight: "bold", 
        color: "white" 
    },
    contentWrapper: { 
        flex: 1, 
        flexDirection: "row" 
    },
    sideTab: { 
        width: 60, 
        backgroundColor: "#034f2a", 
        alignItems: "center", 
        paddingTop: 20 
    },
    sideTabItem: { 
        padding: 15, 
        marginVertical: 10, 
        borderRadius: 5 
    },
    activeTab: { 
        backgroundColor: "#fff" 
    },
    sideTabText: { 
        fontSize: 20, 
        color: "white" 
    },
    mainContent: { 
        flex: 1, 
        padding: 20, 
        backgroundColor: "white" 
    },
    title: { 
        fontSize: 18, 
        fontWeight: "bold", 
        color: "black", 
        marginBottom: 10 
    },
    lessonButton: { 
        backgroundColor: "#fff", 
        padding: 10, 
        borderRadius: 5, 
        marginVertical: 5, 
        borderWidth: 1, 
        borderColor: "#046a38" 
    },
    lockedLesson: { 
        backgroundColor: "#d3d3d3" 
    }, 
    lessonText: { 
        fontSize: 16, 
        fontWeight: "bold", 
        color: "#046a38" 
    },
    lockIcon: { 
        position: "absolute", 
        right: 10, 
        top: 10 
    }, 
    dropdown: { 
        backgroundColor: "#ddd", 
        padding: 10, 
        borderRadius: 5, 
        marginLeft: 10, 
        marginBottom: 5 
    },
    dropdownItem: { 
        fontSize: 14, 
        paddingVertical: 5, 
        color: "#333" 
    },
    assignmentItem: { 
        backgroundColor: "#fff", 
        padding: 10, 
        borderRadius: 5, 
        marginVertical: 5, 
        borderWidth: 1, 
        borderColor: "#046a38" 
    },
    assignmentText: { 
        fontSize: 16, 
        color: "#046a38" 
    },
    downloadButton: { 
        marginTop: 10, 
        backgroundColor: "#046a38", 
        padding: 10, 
        borderRadius: 5, 
        alignItems: "center" 
    },
    downloadText: { 
        color: "white", 
        fontSize: 14, 
        fontWeight: "bold" 
    },
    quizItem: { 
        backgroundColor: "#fff", 
        padding: 10, 
        borderRadius: 5, 
        marginVertical: 5, 
        borderWidth: 1, 
        borderColor: "#046a38" 
    },
    quizText: { 
        fontSize: 16, 
        fontWeight: "bold", 
        color: "#046a38" 
    },
    subtitle: { 
        fontSize: 16, 
        fontWeight: "bold", 
        color: "#046a38", 
        marginTop: 10 
    },
    text: { 
        fontSize: 14, 
        color: "#333",
        marginVertical: 5 
    },
    analyticsContainer: { 
        backgroundColor: "#f8f8f8", 
        padding: 15, 
        borderRadius: 10, 
        marginTop: 10 
    },
    analyticsCard: { 
        backgroundColor: "#fff", 
        padding: 15, 
        borderRadius: 5, 
        marginVertical: 5, 
        shadowColor: "#000", 
        shadowOpacity: 0.1, 
        shadowRadius: 3, 
        elevation: 3 
    },
    analyticsTitle: { 
        fontSize: 16, 
        fontWeight: "bold", 
        color: "#046a38", 
        marginBottom: 5 
    },
    analyticsText: { 
        fontSize: 14, 
        color: "#333" 
    },
    performanceBar: { 
        height: 10, 
        backgroundColor: "#046a38", 
        borderRadius: 5,
        marginTop: 5 },
  });
  