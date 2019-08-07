"use strict";

module.exports = function(input) {
    let output = {}
    let rootKeys = Object.keys(input)
    if (rootKeys.length !== 1) {
        throw new Error(
            "Wrong messages structure: messages should define only one " +
            "root key with namespace, but defined " + rootKeys.length
        )
    }
    let namespace = rootKeys[0]
    let messages = input[namespace]
    if ("object" !== typeof messages) {
        throw new Error(
            "Wring messages structure: messages should define one root key with nested object, " +
            "root key found but value is " + typeof messages
        )
    }
    if (null === messages) {
        return {};
    }
    Object.keys(messages).forEach(function(messageId) {
        let message = messages[messageId]
        let parsedMessage = {}
        if ("string" === typeof message) {
            parsedMessage = {
                "id": namespace + "." + messageId,
                "defaultMessage": message
            }
        } else if ("object" === typeof message) {
            if (message.id) {
                throw new Error(
                    "Message should not define it own id"
                )
            }
            if (!message.defaultMessage) {
                throw new Error(
                    "Message should define defaultMessage"
                )
            }
            parsedMessage = Object.assign({}, message, {
                "id": namespace + "." + messageId,
            })
        } else {
            throw new Error("Unexpected message type for " + messageId)
        }
        output[messageId] = parsedMessage
    })

    return output
}
