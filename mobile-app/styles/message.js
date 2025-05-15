import {StyleSheet} from "react-native";

export default StyleSheet.create({
        container: { 
            flex: 1, 
            backgroundColor: "#046a38" },
        header: { 
            flexDirection: "row", 
            alignItems: "center", 
            justifyContent: "space-between", 
            padding: 10, 
            backgroundColor: "#046a38", 
            marginTop: 30 
        },
        headerText: { 
            color: "white", 
            fontSize: 18, 
            fontWeight: "bold" 
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
        messageList: { 
            flex: 1, 
            padding: 10 
        },
        messageItem: { 
            flexDirection: "row", 
            alignItems: "center", 
            backgroundColor: "white", 
            padding: 10, 
            borderRadius: 5, 
            marginBottom: 10 
        },
        avatar: { 
            width: 40, 
            height: 40, 
            borderRadius: 20,
             marginRight: 10 
            },
        messageTextContainer: { 
            flex: 1 
        },
        messageName: { 
            fontSize: 16, 
            fontWeight: "bold" 
        },
        messageText: {
            fontSize: 14, 
            color: "gray" 
        },
        messageTime: { 
            fontSize: 12, 
            color: "gray", 
            marginRight: 10 
        },
        noMessages: { 
            textAlign: "center", 
            marginTop: 20, 
            fontSize: 16, 
            color: "white" 
        },
        newContactContainer: { 
            flexDirection: "row", 
            padding: 10, 
            backgroundColor: "white", 
            alignItems: "center" 
        },
        newContactInput: { 
            flex: 1, 
            borderColor: "gray", 
            borderWidth: 1, 
            borderRadius: 5, 
            padding: 5, 
            marginRight: 10 
        },
        addButton: { 
            backgroundColor: "#046a38", 
            padding: 10, 
            borderRadius: 5 
        },
        addButtonText: { 
            color: "white", 
            fontWeight: "bold"
        }
      });
